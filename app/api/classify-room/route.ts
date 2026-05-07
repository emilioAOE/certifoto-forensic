/**
 * Endpoint de clasificacion de ambiente con vision IA (Claude Haiku 4.5).
 *
 * Recibe: foto en base64 + lista de ambientes disponibles del acta.
 * Devuelve: roomId sugerido + confianza + razonamiento corto.
 *
 * Si la foto no corresponde a ningun ambiente o es ambigua, devuelve
 * roomId=null para que el usuario asigne manualmente.
 *
 * Requiere ANTHROPIC_API_KEY en variables de entorno. Si no esta seteada,
 * retorna 503 y el cliente cae a heuristica de nombre de archivo.
 *
 * Prompt caching: el system prompt + lista de ambientes se cachea para que
 * multiples fotos del mismo lote reusen el prefijo y bajen el costo.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

interface RoomInfo {
  id: string;
  name: string;
  type: string;
}

interface RequestBody {
  imageBase64: string;
  imageMime: string;
  rooms: RoomInfo[];
}

interface ClassifyResponse {
  ok: boolean;
  roomId?: string | null;
  confidence?: "alta" | "media" | "baja";
  reasoning?: string;
  error?: string;
  /** Stats de prompt caching para debugging */
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

export async function POST(
  req: NextRequest
): Promise<NextResponse<ClassifyResponse>> {
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
      { ok: false, error: "JSON invalido" },
      { status: 400 }
    );
  }

  if (
    !body.imageBase64 ||
    !body.imageMime ||
    !Array.isArray(body.rooms) ||
    body.rooms.length === 0
  ) {
    return NextResponse.json(
      { ok: false, error: "Faltan campos requeridos o lista de ambientes vacia" },
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
      { ok: false, error: "Imagen muy grande (max 4.5 MB descomprimida)" },
      { status: 413 }
    );
  }

  const roomList = body.rooms
    .map((r) => `- id "${r.id}": ${r.name} (tipo ${r.type})`)
    .join("\n");

  const systemPrompt = `Eres un experto clasificando fotografias de inmuebles residenciales para actas de inspeccion de arriendo en Chile.

Tu tarea: identificar a cual de los ambientes listados pertenece la fotografia que se te muestra. Mira el contenido visual (muebles, accesorios, materiales, ventanas, sanitarios, etc.) para decidir.

Ambientes disponibles para esta acta:
${roomList}

Reglas:
- Devuelve el "id" exacto (entre comillas en la lista de arriba) del ambiente que mejor corresponda.
- Si la foto no muestra ninguno de los ambientes listados, esta borrosa, es irrelevante (ej: una persona, un papel, una mascota), o es ambigua, devuelve roomId: null. NO fuerces una asignacion.
- "confidence" debe ser:
  * "alta" si la foto muestra elementos distintivos del ambiente (cocina con cubierta+lavaplatos, baño con WC+lavamanos, dormitorio con cama).
  * "media" si la asignacion es razonable pero podria confundirse con otro ambiente (dormitorio principal vs secundario).
  * "baja" si la asignacion es incierta o el ambiente es generico.
- "reasoning" debe ser una frase corta en espanol (max 15 palabras) describiendo el elemento clave que viste.

Recuerda: es mejor devolver null que asignar mal. El usuario revisa antes de guardar.`;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
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
            { type: "text", text: "Clasifica esta fotografia." },
          ],
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              roomId: { type: ["string", "null"] },
              confidence: {
                type: "string",
                enum: ["alta", "media", "baja"],
              },
              reasoning: { type: "string" },
            },
            required: ["roomId", "confidence", "reasoning"],
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

    let parsed: { roomId: string | null; confidence: string; reasoning: string };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Respuesta de IA no es JSON valido",
        },
        { status: 502 }
      );
    }

    // Defensa: validar que el roomId existe en la lista (alucinacion = null)
    let finalRoomId = parsed.roomId;
    let finalConfidence = parsed.confidence as "alta" | "media" | "baja";
    if (
      finalRoomId !== null &&
      !body.rooms.some((r) => r.id === finalRoomId)
    ) {
      finalRoomId = null;
      finalConfidence = "baja";
    }
    if (!["alta", "media", "baja"].includes(finalConfidence)) {
      finalConfidence = "baja";
    }

    return NextResponse.json({
      ok: true,
      roomId: finalRoomId,
      confidence: finalConfidence,
      reasoning: parsed.reasoning,
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
