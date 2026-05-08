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

interface RequestBody {
  rawText: string;
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

  if (!body.rawText || typeof body.rawText !== "string") {
    return NextResponse.json(
      { ok: false, error: "Falta rawText" },
      { status: 400 }
    );
  }

  const truncated = body.rawText.slice(0, MAX_TEXT_CHARS);
  const wasTruncated = body.rawText.length > MAX_TEXT_CHARS;

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
          content: `Extrae los datos estructurados del siguiente texto de contrato${
            wasTruncated ? " (texto truncado a 30K caracteres)" : ""
          }:\n\n----- INICIO DEL CONTRATO -----\n${truncated}\n----- FIN DEL CONTRATO -----`,
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
