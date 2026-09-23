/**
 * Cliente para analizar una foto con vision IA real (Claude, via
 * /api/analyze-photo).
 *
 * Si la IA falla (429, 5xx, red, respuesta invalida) reintenta con espera
 * creciente y, si igual falla, LANZA: el caller marca la foto con
 * aiStatus "error" y queda sin descripcion. Antes caia al stub de
 * lib/ai-stub.ts, que inventa texto (y a veces un daño al azar) que terminaba
 * impreso en un acta certificada. El stub solo se usa fuera de produccion
 * cuando no hay API key (503), para poder desarrollar sin gastar tokens.
 *
 * Como mucho MAX_CONCURRENTES llamadas a la vez en toda la app: el asistente
 * lanzaba una por foto (40 fotos = 40 llamadas juntas) y eso provocaba 429.
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

const MAX_CONCURRENTES = 4;
const REINTENTOS = 3;
let enCurso = 0;
const espera: (() => void)[] = [];

async function turno(): Promise<() => void> {
  if (enCurso >= MAX_CONCURRENTES) {
    await new Promise<void>((resolve) => espera.push(resolve));
  }
  enCurso++;
  return () => {
    enCurso--;
    espera.shift()?.();
  };
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Convierte un dataUrl ("data:image/jpeg;base64,...") a { mime, base64 }. */
function dataUrlToParts(
  dataUrl: string
): { mime: string; base64: string } | null {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

/**
 * Analiza una foto con IA real. Lanza si no se pudo (ver cabecera).
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
  if (!parts) throw new Error("Foto sin datos de imagen");

  const liberar = await turno();
  try {
    let ultimoError = "sin respuesta";
    for (let intento = 0; intento < REINTENTOS; intento++) {
      if (intento > 0) await dormir(1000 * 3 ** (intento - 1)); // 1 s, 3 s
      let res: Response;
      try {
        res = await fetch("/api/analyze-photo", {
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
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        ultimoError = "red";
        continue; // error de red: reintentar
      }

      // 503 = IA no configurada: solo en desarrollo se usa el stub.
      if (res.status === 503 && process.env.NODE_ENV !== "production") {
        return analyzePhotoStub(meta.fileName, meta.fileSize, meta.width, meta.height, roomType);
      }

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        analysis?: AnalysisOut;
        error?: string;
      };
      if (res.ok && data.ok && data.analysis) {
        return toAIPhotoAnalysis(data.analysis, roomType);
      }
      ultimoError = `HTTP ${res.status}${data.error ? `: ${data.error}` : ""}`;
      // 4xx que no sea 429 (foto invalida, muy grande): reintentar no sirve.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
    }
    throw new Error(`No se pudo analizar la foto (${ultimoError})`);
  } finally {
    liberar();
  }
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
