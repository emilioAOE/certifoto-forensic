/**
 * Endpoint de analisis de fotografia con vision IA (Claude Haiku 4.5).
 *
 * Recibe: foto en base64 + contexto del ambiente (nombre y tipo).
 * Devuelve: descripcion objetiva del estado, elementos visibles, posibles
 * hallazgos (danos) y una evaluacion de calidad de la imagen. El formato
 * coincide con AIPhotoAnalysis (sin id/analyzedAt/modelVersion, que el
 * cliente completa).
 *
 * Principio clave: la IA DESCRIBE de forma objetiva, nunca atribuye culpas
 * ni responsabilidades. Es asistencia, no reemplazo del criterio humano.
 *
 * Requiere ANTHROPIC_API_KEY. Si no esta, retorna 503 y el cliente cae al
 * stub determinista (lib/ai-stub.ts) para no romper el flujo.
 *
 * Prompt caching: el system prompt se cachea para que multiples fotos del
 * mismo lote reusen el prefijo y bajen el costo.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

interface RequestBody {
  imageBase64: string;
  imageMime: string;
  roomName?: string;
  roomType?: string;
}

interface DamageFindingOut {
  type: string;
  severity: string;
  description: string;
  confidence: number;
  needsHumanReview: boolean;
}

interface AnalysisOut {
  caption: string;
  visibleItems: string[];
  conditionSummary: string;
  damageFindings: DamageFindingOut[];
  quality: { isBlurry: boolean; isDark: boolean; qualityScore: number };
  tags: string[];
  needsHumanReview: boolean;
}

interface AnalyzePhotoResponse {
  ok: boolean;
  analysis?: AnalysisOut;
  error?: string;
  cacheStats?: { cacheCreated: number; cacheRead: number };
}

const SUPPORTED_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BASE64_BYTES = 6 * 1024 * 1024; // ~4.5 MB descomprimido

const DAMAGE_TYPES = [
  "scratch",
  "crack",
  "stain",
  "humidity",
  "broken_item",
  "missing_item",
  "dirt",
  "paint_damage",
  "floor_damage",
  "glass_damage",
  "furniture_damage",
  "other",
];

const SEVERITIES = ["minor", "moderate", "severe", "review_required"];

export async function POST(
  req: NextRequest
): Promise<NextResponse<AnalyzePhotoResponse>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "AI vision no configurada (falta ANTHROPIC_API_KEY en el servidor).",
      },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON inválido" },
      { status: 400 }
    );
  }

  if (!body.imageBase64 || !body.imageMime) {
    return NextResponse.json(
      { ok: false, error: "Faltan campos requeridos (imageBase64, imageMime)" },
      { status: 400 }
    );
  }

  if (!SUPPORTED_MIMES.has(body.imageMime)) {
    return NextResponse.json(
      { ok: false, error: `MIME no soportado: ${body.imageMime}` },
      { status: 400 }
    );
  }

  if (body.imageBase64.length > MAX_BASE64_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Imagen muy grande (máx 4.5 MB descomprimida)" },
      { status: 413 }
    );
  }

  const contextLine =
    body.roomName || body.roomType
      ? `Contexto: la foto corresponde al ambiente "${body.roomName ?? body.roomType}"${
          body.roomType ? ` (tipo ${body.roomType})` : ""
        }.`
      : "Contexto: ambiente de un inmueble residencial.";

  const systemPrompt = `Eres un asistente experto en documentar el estado de inmuebles para actas de inspeccion en Chile (entrega o devolucion de arriendo, inventario, o recepcion de una compraventa).

Tu tarea: observar la fotografia y describir de forma OBJETIVA lo que se ve, identificando elementos visibles y posibles hallazgos de estado (danos, manchas, suciedad, deterioro). Tu salida es referencial: ayuda a las partes a documentar, no las reemplaza.

Reglas estrictas:
- Describe SOLO lo que es visible en la imagen. No inventes elementos que no aparecen.
- NUNCA atribuyas culpas ni responsabilidades. Prohibido decir quien causo un dano o cuando ocurrio. Usa lenguaje neutro: "se observa", "se aprecia", "presenta".
- Cada hallazgo (damageFinding) debe tener:
  * type: uno de [${DAMAGE_TYPES.join(", ")}].
  * severity: "minor" (cosmetico leve), "moderate" (visible, requiere atencion), "severe" (dano relevante), o "review_required" (no se puede determinar bien desde la foto).
  * description: frase corta y objetiva en espanol.
  * confidence: numero entre 0 y 1 segun que tan claro se ve el hallazgo.
  * needsHumanReview: true si la foto no permite confirmar el hallazgo con certeza.
- Si NO hay hallazgos visibles, devuelve damageFindings como lista vacia y conditionSummary positivo (ej: "Buen estado general aparente").
- quality: evalua la imagen. isBlurry (borrosa/desenfocada), isDark (subexpuesta/oscura), qualityScore entre 0 y 1 (1 = nitida y bien iluminada).
- visibleItems: lista corta de elementos concretos visibles (ej: "muros", "piso ceramico", "ventana", "lavaplatos", "closet").
- tags: 3 a 6 etiquetas cortas en minuscula para indexar la foto.
- caption: una frase que resuma objetivamente la escena.
- needsHumanReview (nivel foto): true si algun hallazgo lo requiere o si la calidad es baja.
- Responde SIEMPRE en espanol.`;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 700,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
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
            {
              type: "text",
              text: `${contextLine}\n\nAnaliza el estado del inmueble en esta fotografia.`,
            },
          ],
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              caption: { type: "string" },
              visibleItems: { type: "array", items: { type: "string" } },
              conditionSummary: { type: "string" },
              damageFindings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: DAMAGE_TYPES },
                    severity: { type: "string", enum: SEVERITIES },
                    description: { type: "string" },
                    confidence: { type: "number" },
                    needsHumanReview: { type: "boolean" },
                  },
                  required: [
                    "type",
                    "severity",
                    "description",
                    "confidence",
                    "needsHumanReview",
                  ],
                  additionalProperties: false,
                },
              },
              quality: {
                type: "object",
                properties: {
                  isBlurry: { type: "boolean" },
                  isDark: { type: "boolean" },
                  qualityScore: { type: "number" },
                },
                required: ["isBlurry", "isDark", "qualityScore"],
                additionalProperties: false,
              },
              tags: { type: "array", items: { type: "string" } },
              needsHumanReview: { type: "boolean" },
            },
            required: [
              "caption",
              "visibleItems",
              "conditionSummary",
              "damageFindings",
              "quality",
              "tags",
              "needsHumanReview",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { ok: false, error: "Respuesta vacía del modelo" },
        { status: 502 }
      );
    }

    let parsed: AnalysisOut;
    try {
      parsed = JSON.parse(textBlock.text) as AnalysisOut;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Respuesta de IA no es JSON válido" },
        { status: 502 }
      );
    }

    // Defensa: normalizar/sanear el output del modelo.
    const clamp01 = (n: number) =>
      Math.max(0, Math.min(1, typeof n === "number" && !isNaN(n) ? n : 0.5));

    const damageFindings: DamageFindingOut[] = Array.isArray(
      parsed.damageFindings
    )
      ? parsed.damageFindings
          .filter((d) => d && DAMAGE_TYPES.includes(d.type))
          .map((d) => ({
            type: d.type,
            severity: SEVERITIES.includes(d.severity) ? d.severity : "review_required",
            description: String(d.description ?? "").slice(0, 400),
            confidence: clamp01(d.confidence),
            needsHumanReview: Boolean(d.needsHumanReview),
          }))
      : [];

    const analysis: AnalysisOut = {
      caption: String(parsed.caption ?? "").slice(0, 600),
      visibleItems: Array.isArray(parsed.visibleItems)
        ? parsed.visibleItems.map((s) => String(s)).slice(0, 20)
        : [],
      conditionSummary: String(parsed.conditionSummary ?? "").slice(0, 400),
      damageFindings,
      quality: {
        isBlurry: Boolean(parsed.quality?.isBlurry),
        isDark: Boolean(parsed.quality?.isDark),
        qualityScore: clamp01(parsed.quality?.qualityScore ?? 0.7),
      },
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((s) => String(s)).slice(0, 8)
        : [],
      needsHumanReview:
        Boolean(parsed.needsHumanReview) ||
        damageFindings.some((d) => d.needsHumanReview),
    };

    return NextResponse.json({
      ok: true,
      analysis,
      cacheStats: {
        cacheCreated: response.usage.cache_creation_input_tokens ?? 0,
        cacheRead: response.usage.cache_read_input_tokens ?? 0,
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { ok: false, error: "Rate limit excedido. Reintenta en un momento." },
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
