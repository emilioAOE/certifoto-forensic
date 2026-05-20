/**
 * Cliente para analizar una foto con vision IA real (Claude, via
 * /api/analyze-photo). Si la IA no esta configurada (503), hay un error de
 * red, o la respuesta es invalida, cae automaticamente al stub determinista
 * (lib/ai-stub.ts) para que el flujo nunca se rompa.
 *
 * Devuelve siempre un AIPhotoAnalysis completo, listo para guardar en la
 * PhotoEvidence. El campo modelVersion permite distinguir si el analisis
 * vino de la IA real o del stub.
 */

import type { AIPhotoAnalysis, RoomType, DamageFinding } from "./acta-types";
import { generateId } from "./storage";
import { analyzePhotoWithAI as analyzePhotoStub } from "./ai-stub";

interface AnalysisOut {
  caption: string;
  visibleItems: string[];
  conditionSummary: string;
  damageFindings: {
    type: string;
    severity: string;
    description: string;
    confidence: number;
    needsHumanReview: boolean;
  }[];
  quality: { isBlurry: boolean; isDark: boolean; qualityScore: number };
  tags: string[];
  needsHumanReview: boolean;
}

/** Convierte un dataUrl ("data:image/jpeg;base64,...") a { mime, base64 }. */
function dataUrlToParts(
  dataUrl: string
): { mime: string; base64: string } | null {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

/**
 * Analiza una foto con IA real. Cae al stub si la IA no esta disponible.
 *
 * @param dataUrl  imagen como data URL (ya comprimida en el upload).
 * @param roomName nombre del ambiente (contexto para el modelo).
 * @param roomType tipo del ambiente (para el fallback del stub).
 */
export async function analyzePhotoVision(
  dataUrl: string,
  roomName: string,
  roomType: RoomType,
  meta: { fileName: string; fileSize: number; width: number | null; height: number | null },
  signal?: AbortSignal
): Promise<AIPhotoAnalysis> {
  const parts = dataUrlToParts(dataUrl);

  if (parts) {
    try {
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: parts.base64,
          imageMime: parts.mime,
          roomName,
          roomType,
        }),
        signal,
      });

      // 503 = IA no configurada en el servidor -> fallback al stub.
      if (res.status !== 503) {
        const data = (await res.json()) as {
          ok?: boolean;
          analysis?: AnalysisOut;
          error?: string;
        };

        if (res.ok && data.ok && data.analysis) {
          return toAIPhotoAnalysis(data.analysis, roomType);
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err; // cancelacion explicita: propagar
      }
      // cualquier otro error -> fallback al stub
    }
  }

  // Fallback determinista.
  return analyzePhotoStub(
    meta.fileName,
    meta.fileSize,
    meta.width,
    meta.height,
    roomType
  );
}

/** Mapea el output saneado del endpoint al tipo AIPhotoAnalysis del dominio. */
function toAIPhotoAnalysis(
  out: AnalysisOut,
  roomType: RoomType
): AIPhotoAnalysis {
  const damageFindings: DamageFinding[] = out.damageFindings.map((d) => ({
    id: generateId("damage"),
    type: d.type as DamageFinding["type"],
    severity: d.severity as DamageFinding["severity"],
    description: d.description,
    confidence: d.confidence,
    needsHumanReview: d.needsHumanReview,
  }));

  return {
    detectedRoom: roomType,
    caption: out.caption,
    visibleItems: out.visibleItems,
    conditionSummary: out.conditionSummary,
    damageFindings,
    quality: out.quality,
    tags: out.tags,
    needsHumanReview: out.needsHumanReview,
    analyzedAt: new Date().toISOString(),
    modelVersion: "claude-haiku-4-5",
  };
}
