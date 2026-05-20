/**
 * Cliente para llamar al endpoint /api/classify-room (Claude vision).
 *
 * Maneja errores comunes (sin API key, rate limit, timeout) devolviendo
 * un resultado tipado en vez de tirar excepcion. Asi el caller puede
 * caer al heuristico de nombre de archivo sin romper el flujo.
 */

export interface ClassifyResult {
  ok: boolean;
  roomId: string | null;
  confidence: "alta" | "media" | "baja";
  reasoning: string;
  source: "ai" | "unavailable" | "error";
  errorMessage?: string;
}

interface RoomInfo {
  id: string;
  name: string;
  type: string;
}

/**
 * Convierte un dataUrl ("data:image/jpeg;base64,...") a { mime, base64 }.
 */
function dataUrlToParts(
  dataUrl: string
): { mime: string; base64: string } | null {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

export async function classifyRoomWithAI(
  dataUrl: string,
  rooms: RoomInfo[],
  signal?: AbortSignal
): Promise<ClassifyResult> {
  const parts = dataUrlToParts(dataUrl);
  if (!parts) {
    return {
      ok: false,
      roomId: null,
      confidence: "baja",
      reasoning: "DataURL inválido",
      source: "error",
      errorMessage: "DataURL inválido",
    };
  }

  try {
    const res = await fetch("/api/classify-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: parts.base64,
        imageMime: parts.mime,
        rooms,
      }),
      signal,
    });
    const data = (await res.json()) as {
      ok?: boolean;
      roomId?: string | null;
      confidence?: "alta" | "media" | "baja";
      reasoning?: string;
      error?: string;
    };

    if (res.status === 503) {
      return {
        ok: false,
        roomId: null,
        confidence: "baja",
        reasoning: "AI no configurada en el servidor",
        source: "unavailable",
        errorMessage: data.error,
      };
    }

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        roomId: null,
        confidence: "baja",
        reasoning: data.error ?? "Error en clasificación",
        source: "error",
        errorMessage: data.error,
      };
    }

    return {
      ok: true,
      roomId: data.roomId ?? null,
      confidence: data.confidence ?? "baja",
      reasoning: data.reasoning ?? "",
      source: "ai",
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        roomId: null,
        confidence: "baja",
        reasoning: "Cancelado",
        source: "error",
        errorMessage: "aborted",
      };
    }
    return {
      ok: false,
      roomId: null,
      confidence: "baja",
      reasoning: err instanceof Error ? err.message : "Error desconocido",
      source: "error",
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}
