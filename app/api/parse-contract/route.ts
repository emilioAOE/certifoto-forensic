/**
 * Endpoint de parseo de texto de contrato de arriendo con Claude Haiku 4.5.
 *
 * Recibe el texto crudo extraido de un PDF/imagen y devuelve los campos
 * estructurados que normalmente cubre la heuristica regex de
 * lib/contract-parser.ts. La diferencia: Claude entiende contratos en
 * formato real (parrafos largos, RUTs en cualquier formato, montos en
 * letras o numeros, fechas con palabras o digitos) — la heuristica falla
 * en muchos contratos chilenos reales.
 *
 * Si ANTHROPIC_API_KEY no esta seteada, retorna 503 y el cliente cae a
 * la heuristica regex.
 *
 * Prompt caching: el system prompt se cachea para que reintentos o
 * multiples contratos sucesivos reusen el prefijo.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ImagePayload {
  base64: string;
  mime: string;
}

interface RequestBody {
  /** PDF en base64 — preferido cuando cabe en el body cap (< 3MB).
   * Claude lee texto + estructura visual nativamente. */
  pdfBase64?: string;
  /** Array de imagenes (primeras N paginas renderizadas como JPEG).
   * Mejor para PDFs grandes — el cliente renderiza con PDF.js a JPEG
   * comprimido y manda solo lo que cabe. */
  imageBase64s?: ImagePayload[];
  /** Imagen unica (contrato fotografiado o single-page). Compat con
   * el formato anterior. */
  imageBase64?: string;
  /** MIME de la imagen (jpeg/png/webp/etc.) */
  imageMime?: string;
  /** Texto crudo — fallback de ultimo recurso. */
  rawText?: string;
}

interface ParsedContract {
  property: {
    address: string | null;
    unit: string | null;
    commune: string | null;
    city: string | null;
  };
  landlord: {
    name: string | null;
    rut: string | null;
  };
  tenant: {
    name: string | null;
    rut: string | null;
  };
  contract: {
    monthlyAmount: number | null;
    startDate: string | null;
    endDate: string | null;
    deposit: number | null;
    depositKind: "months" | "amount" | null;
  };
  notes: string | null;
}

interface ParseResponse {
  ok: boolean;
  data?: ParsedContract;
  error?: string;
  cacheStats?: { cacheCreated: number; cacheRead: number };
}

// Limite generoso del texto enviado a Claude. Contratos > 30K chars
// suelen incluir reglamento de copropiedad — truncamos antes de enviar.
const MAX_TEXT_CHARS = 30_000;
// Vercel tiene limite de ~4.5MB en body de requests. Limitamos base64 a 4MB
// para tener margen para el resto del payload (rooms, etc.).
const MAX_BASE64_BYTES = 4 * 1024 * 1024;

const SUPPORTED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const SYSTEM_PROMPT = `Eres un experto en contratos de arrendamiento chilenos. Tu tarea es extraer datos estructurados del texto de un contrato.

Datos a extraer (devolver null si no esta presente o no estas seguro):

PROPIEDAD:
- address: direccion completa de la propiedad arrendada (calle + numero). Sin comuna ni ciudad.
- unit: numero de departamento, oficina, casa, etc. (ej: "Depto 501", "Casa 12", "Oficina 803")
- commune: comuna (ej: "Las Condes", "Providencia", "Vitacura")
- city: ciudad (generalmente "Santiago")

ARRENDADOR (el dueno o quien entrega el inmueble en arriendo):
- name: nombre completo
- rut: RUT en formato chileno con puntos y guion (ej: "12.345.678-9"). NO inventes RUTs.

ARRENDATARIO (quien recibe el inmueble en arriendo):
- name: nombre completo
- rut: RUT en formato chileno con puntos y guion

CONTRATO:
- monthlyAmount: monto mensual del arriendo en pesos chilenos. Solo el numero (ej: 450000 para "$450.000"). Si esta en UF, devuelve null y menciona en notes.
- startDate: fecha de inicio del contrato en formato YYYY-MM-DD.
- endDate: fecha de termino del contrato en formato YYYY-MM-DD. Si dice "1 ano" calcula desde startDate. Si es "indefinido", null.
- deposit: numero — puede ser cantidad de meses (ej: 1, 2) O monto en pesos.
- depositKind: "months" si deposit es cantidad de meses, "amount" si es un monto en pesos. null si no detectaste deposito.

notes: cualquier observacion relevante en una frase corta (ej: "monto en UF", "contrato indefinido", "incluye gastos comunes"). Maximo 100 caracteres.

REGLAS:
- Si no estas SEGURO de un dato, devuelve null. Es mejor que el usuario lo llene a mano que un dato incorrecto.
- Para fechas en palabras ("quince de enero de dos mil veintiseis") conviertelas a YYYY-MM-DD.
- Si hay multiples partes (varios arrendadores o arrendatarios), usa el primero/principal.
- RUTs: el ultimo caracter puede ser digito o "K" (ej: "12.345.678-K"). Si el texto tiene espacios o esta sin puntos, normaliza a formato con puntos.`;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ParseResponse>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: "AI no configurada (falta ANTHROPIC_API_KEY en el servidor).",
      },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON invalido" },
      { status: 400 }
    );
  }

  // Construir el contenido del mensaje segun lo que el cliente envio.
  // Prioridad: PDF nativo > imagen > texto crudo (fallback).
  let userContent:
    | string
    | Array<
        | { type: "text"; text: string }
        | {
            type: "image";
            source: {
              type: "base64";
              media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
              data: string;
            };
          }
        | {
            type: "document";
            source: {
              type: "base64";
              media_type: "application/pdf";
              data: string;
            };
          }
      >;

  const promptInstruction =
    "Lee este contrato de arrendamiento chileno y extrae los datos estructurados segun el schema definido. Si algun dato no aparece o no estas seguro, devuelve null para ese campo.";

  if (body.imageBase64s && Array.isArray(body.imageBase64s) && body.imageBase64s.length > 0) {
    // Validar tamano total y MIMEs
    const totalBytes = body.imageBase64s.reduce(
      (acc, img) => acc + (img.base64?.length ?? 0),
      0
    );
    if (totalBytes > MAX_BASE64_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Imagenes muy grandes (max ~3 MB total)" },
        { status: 413 }
      );
    }
    for (const img of body.imageBase64s) {
      if (!SUPPORTED_IMAGE_MIMES.has(img.mime)) {
        return NextResponse.json(
          { ok: false, error: `MIME no soportado: ${img.mime}` },
          { status: 400 }
        );
      }
    }
    userContent = [
      ...body.imageBase64s.map((img) => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: img.mime as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/gif",
          data: img.base64,
        },
      })),
      {
        type: "text",
        text: `${promptInstruction}\n\nNota: las imagenes son las primeras ${body.imageBase64s.length} paginas del contrato, donde suelen estar los datos clave (partes, propiedad, monto, fechas, garantia).`,
      },
    ];
  } else if (body.pdfBase64) {
    if (body.pdfBase64.length > MAX_BASE64_BYTES) {
      return NextResponse.json(
        { ok: false, error: "PDF muy grande (max ~3 MB)" },
        { status: 413 }
      );
    }
    userContent = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: body.pdfBase64,
        },
      },
      { type: "text", text: promptInstruction },
    ];
  } else if (body.imageBase64 && body.imageMime) {
    if (!SUPPORTED_IMAGE_MIMES.has(body.imageMime)) {
      return NextResponse.json(
        { ok: false, error: `MIME no soportado: ${body.imageMime}` },
        { status: 400 }
      );
    }
    if (body.imageBase64.length > MAX_BASE64_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Imagen muy grande (max ~3 MB)" },
        { status: 413 }
      );
    }
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: body.imageMime as
            | "image/jpeg"
            | "image/png"
            | "image/webp"
            | "image/gif",
          data: body.imageBase64,
        },
      },
      { type: "text", text: promptInstruction },
    ];
  } else if (body.rawText) {
    const truncated = body.rawText.slice(0, MAX_TEXT_CHARS);
    const wasTruncated = body.rawText.length > MAX_TEXT_CHARS;
    userContent = `${promptInstruction}\n\n----- INICIO DEL CONTRATO${
      wasTruncated ? " (truncado a 30K chars)" : ""
    } -----\n${truncated}\n----- FIN DEL CONTRATO -----`;
  } else {
    return NextResponse.json(
      {
        ok: false,
        error: "Falta pdfBase64, imageBase64, o rawText",
      },
      { status: 400 }
    );
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              property: {
                type: "object",
                properties: {
                  address: { type: ["string", "null"] },
                  unit: { type: ["string", "null"] },
                  commune: { type: ["string", "null"] },
                  city: { type: ["string", "null"] },
                },
                required: ["address", "unit", "commune", "city"],
                additionalProperties: false,
              },
              landlord: {
                type: "object",
                properties: {
                  name: { type: ["string", "null"] },
                  rut: { type: ["string", "null"] },
                },
                required: ["name", "rut"],
                additionalProperties: false,
              },
              tenant: {
                type: "object",
                properties: {
                  name: { type: ["string", "null"] },
                  rut: { type: ["string", "null"] },
                },
                required: ["name", "rut"],
                additionalProperties: false,
              },
              contract: {
                type: "object",
                properties: {
                  monthlyAmount: { type: ["number", "null"] },
                  startDate: { type: ["string", "null"] },
                  endDate: { type: ["string", "null"] },
                  deposit: { type: ["number", "null"] },
                  depositKind: {
                    anyOf: [
                      { type: "string", enum: ["months", "amount"] },
                      { type: "null" },
                    ],
                  },
                },
                required: [
                  "monthlyAmount",
                  "startDate",
                  "endDate",
                  "deposit",
                  "depositKind",
                ],
                additionalProperties: false,
              },
              notes: { type: ["string", "null"] },
            },
            required: ["property", "landlord", "tenant", "contract", "notes"],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { ok: false, error: "Respuesta vacia del modelo" },
        { status: 502 }
      );
    }

    let parsed: ParsedContract;
    try {
      parsed = JSON.parse(textBlock.text) as ParsedContract;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Respuesta de IA no es JSON valido" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: parsed,
      cacheStats: {
        cacheCreated: response.usage.cache_creation_input_tokens ?? 0,
        cacheRead: response.usage.cache_read_input_tokens ?? 0,
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { ok: false, error: "Rate limit excedido" },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { ok: false, error: `Error de IA: ${err.message}` },
        { status: err.status ?? 500 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
