/**
 * Stub de analisis IA.
 *
 * En produccion esto seria una llamada a Claude/OpenAI con vision.
 * Para el MVP genera analisis estructurados pseudo-realistas basados en
 * el tipo de ambiente y caracteristicas del archivo.
 *
 * El formato JSON devuelto coincide exactamente con AIPhotoAnalysis,
 * por lo que el swap a IA real solo requiere cambiar la implementacion
 * de analyzePhotoWithAI() — ningun consumidor cambia.
 */

import type { AIPhotoAnalysis, RoomType, DamageFinding } from "./acta-types";
import { generateId } from "./storage";

const ROOM_DESCRIPTIONS: Partial<Record<RoomType, string[]>> = {
  living: [
    "Se observa living con muros en buen estado general aparente.",
    "El espacio se aprecia ordenado, con piso visible sin daños evidentes.",
    "No se aprecian humedades ni manchas significativas en las superficies visibles.",
  ],
  cocina: [
    "Se observa cocina con muebles y cubierta visibles.",
    "La superficie de trabajo se aprecia limpia.",
    "Los electrodomesticos visibles no muestran daños evidentes en la imagen.",
  ],
  bano_principal: [
    "Se observa baño con sanitarios y griferia visibles.",
    "La griferia se aprecia en su lugar.",
    "No se aprecian filtraciones evidentes en la imagen.",
  ],
  dormitorio_principal: [
    "Se observa dormitorio con muros y piso visibles.",
    "El espacio se aprecia despejado.",
    "No se aprecian manchas significativas en la imagen.",
  ],
  dormitorio_secundario: [
    "Se observa dormitorio con muros y piso visibles.",
    "El espacio se aprecia ordenado.",
  ],
  comedor: [
    "Se observa comedor con piso y muros visibles.",
    "El espacio se aprecia limpio en la imagen.",
  ],
  bano_secundario: [
    "Se observa baño con sanitarios visibles.",
    "No se aprecian daños evidentes en la imagen.",
  ],
  terraza: [
    "Se observa terraza con piso y baranda visibles.",
    "Las superficies se aprecian en estado regular aparente.",
  ],
  logia: [
    "Se observa logia con conexiones visibles.",
    "El espacio se aprecia funcional.",
  ],
  estacionamiento: ["Se observa estacionamiento con piso visible."],
  bodega: ["Se observa bodega con espacio interior visible."],
  medidores: [
    "Se observan medidores en la imagen.",
    "Las lecturas y numeracion son visibles parcialmente.",
  ],
};

const COMMON_TAGS_BY_ROOM: Partial<Record<RoomType, string[]>> = {
  living: ["living", "muros", "piso", "estado_general"],
  cocina: ["cocina", "cubierta", "muebles", "lavaplatos"],
  bano_principal: ["bano", "sanitario", "griferia"],
  dormitorio_principal: ["dormitorio", "muros", "piso"],
};

const VISIBLE_ITEMS_BY_ROOM: Partial<Record<RoomType, string[]>> = {
  living: ["muros", "piso", "ventana", "techo"],
  cocina: ["muebles de cocina", "cubierta", "lavaplatos", "griferia"],
  bano_principal: ["wc", "lavamanos", "ducha", "griferia", "espejo"],
  bano_secundario: ["wc", "lavamanos", "griferia"],
  dormitorio_principal: ["muros", "piso", "ventana", "closet"],
  dormitorio_secundario: ["muros", "piso", "ventana"],
  comedor: ["muros", "piso", "ventana"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shouldGenerateDamage(): boolean {
  // 25% de probabilidad de detectar algun hallazgo
  return Math.random() < 0.25;
}

function generateDamageFinding(): DamageFinding {
  const types = ["scratch", "stain", "dirt", "paint_damage"] as const;
  const severities = ["minor", "moderate", "review_required"] as const;
  const type = pick([...types]);
  const severity = pick([...severities]);

  const descriptions: Record<typeof type, string> = {
    scratch: "Se aprecia una rayadura superficial en la zona visible.",
    stain: "Se observa una posible mancha en una zona localizada.",
    dirt: "Se aprecia suciedad acumulada en una zona puntual.",
    paint_damage: "Se observa una zona con la pintura levemente saltada.",
  };

  return {
    id: generateId("damage"),
    type,
    severity,
    description: descriptions[type] + " Requiere revision humana para confirmar relevancia.",
    confidence: 0.55 + Math.random() * 0.3,
    needsHumanReview: severity === "review_required" || Math.random() < 0.5,
  };
}

/**
 * Analiza una foto. En produccion seria una llamada async a un modelo de vision.
 * Aqui simulamos delay y devolvemos JSON estructurado.
 */
export async function analyzePhotoWithAI(
  fileName: string,
  fileSize: number,
  width: number | null,
  height: number | null,
  roomType: RoomType
): Promise<AIPhotoAnalysis> {
  // Simular latencia de red/modelo (300-800ms)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  const descriptions = ROOM_DESCRIPTIONS[roomType] ?? [
    "Se observa el ambiente con elementos visibles.",
  ];
  const tags = COMMON_TAGS_BY_ROOM[roomType] ?? ["ambiente"];
  const visibleItems = VISIBLE_ITEMS_BY_ROOM[roomType] ?? ["muros", "piso"];

  const caption = pick(descriptions);

  const damageFindings: DamageFinding[] = [];
  if (shouldGenerateDamage()) {
    damageFindings.push(generateDamageFinding());
  }

  // Calidad basada en dimensiones y tamaño
  const isBlurry = fileSize < 100_000; // < 100KB: probablemente comprimida/borrosa
  const isDark = false; // sin analisis real de pixel
  const isSmall = (width ?? 0) < 800 || (height ?? 0) < 600;
  const qualityScore = isBlurry ? 0.4 : isSmall ? 0.6 : 0.85;

  const needsHumanReview =
    damageFindings.some((d) => d.needsHumanReview) || qualityScore < 0.5;

  const conditionSummary =
    damageFindings.length === 0
      ? "Buen estado general aparente"
      : damageFindings.some((d) => d.severity === "severe")
      ? "Daños relevantes detectados"
      : "Posibles hallazgos menores detectados";

  return {
    detectedRoom: roomType,
    caption,
    visibleItems,
    conditionSummary,
    damageFindings,
    quality: {
      isBlurry,
      isDark,
      qualityScore,
    },
    tags,
    needsHumanReview,
    analyzedAt: new Date().toISOString(),
    modelVersion: "stub-v1",
  };
}

/**
 * Genera un resumen consolidado de un ambiente basado en sus fotos.
 */
export function summarizeRoom(
  roomName: string,
  aiAnalyses: AIPhotoAnalysis[]
): string {
  if (aiAnalyses.length === 0) {
    return `${roomName}: sin fotos para analizar.`;
  }

  const damageCount = aiAnalyses.reduce(
    (sum, a) => sum + a.damageFindings.length,
    0
  );
  const needsReview = aiAnalyses.some((a) => a.needsHumanReview);

  if (damageCount === 0) {
    return `${roomName}: ${aiAnalyses.length} foto${aiAnalyses.length > 1 ? "s" : ""} analizada${aiAnalyses.length > 1 ? "s" : ""}. No se aprecian daños evidentes en las imagenes.`;
  }

  return `${roomName}: ${aiAnalyses.length} foto${aiAnalyses.length > 1 ? "s" : ""} analizada${aiAnalyses.length > 1 ? "s" : ""}. ${damageCount} hallazgo${damageCount > 1 ? "s" : ""} detectado${damageCount > 1 ? "s" : ""}. ${needsReview ? "Algunos requieren revision humana." : ""}`;
}
