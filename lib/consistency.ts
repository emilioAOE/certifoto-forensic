import type { PhotoAnalysis, ConsistencyCheck, CheckStatus } from "./types";
import {
  AI_SOFTWARE_PATTERNS,
  EDITING_SOFTWARE_PATTERNS,
  AI_DIGITAL_SOURCE_TYPES,
} from "./constants";

type PartialAnalysis = Omit<PhotoAnalysis, "consistency">;

function check(
  id: string,
  label: string,
  status: CheckStatus,
  detail: string
): ConsistencyCheck {
  return { id, label, status, detail };
}

function checkDateConsistency(a: PartialAnalysis): ConsistencyCheck {
  const { dateTimeOriginal, dateTimeDigitized, dateTime } = a.exifTemporal;

  if (!dateTimeOriginal && !dateTimeDigitized && !dateTime) {
    return check(
      "date-consistency",
      "Fechas",
      "info",
      "No se encontraron campos de fecha en la metadata"
    );
  }

  const dates = [dateTimeOriginal, dateTimeDigitized, dateTime].filter(Boolean) as string[];

  if (dates.length === 1) {
    return check(
      "date-consistency",
      "Fechas",
      "pass",
      "Solo un campo de fecha presente"
    );
  }

  const timestamps = dates.map((d) => new Date(d).getTime());
  const maxDiff = Math.max(...timestamps) - Math.min(...timestamps);

  if (maxDiff <= 2000) {
    return check(
      "date-consistency",
      "Fechas",
      "pass",
      "Todas las fechas son consistentes entre si"
    );
  }

  if (maxDiff <= 86400000) {
    return check(
      "date-consistency",
      "Fechas",
      "warn",
      `Diferencia de ${Math.round(maxDiff / 1000)}s entre campos de fecha`
    );
  }

  return check(
    "date-consistency",
    "Fechas",
    "fail",
    `Diferencia significativa de ${Math.round(maxDiff / 86400000)} dias entre campos de fecha`
  );
}

function checkSuspiciousSoftware(a: PartialAnalysis): ConsistencyCheck {
  const software = (
    (a.exifDevice.software ?? "") +
    " " +
    (a.xmp.creatorTool ?? "")
  ).toLowerCase();

  if (!software.trim()) {
    return check(
      "suspicious-software",
      "Software",
      "info",
      "No se detecto informacion de software"
    );
  }

  for (const pattern of AI_SOFTWARE_PATTERNS) {
    if (software.includes(pattern)) {
      return check(
        "suspicious-software",
        "Software",
        "fail",
        `Software de generacion IA detectado: ${pattern}`
      );
    }
  }

  for (const pattern of EDITING_SOFTWARE_PATTERNS) {
    if (software.includes(pattern)) {
      return check(
        "suspicious-software",
        "Software",
        "warn",
        `Software de edicion detectado: ${pattern}`
      );
    }
  }

  return check(
    "suspicious-software",
    "Software",
    "pass",
    `Software: ${software.trim()}`
  );
}

function checkThumbnailMatch(a: PartialAnalysis): ConsistencyCheck {
  if (!a.thumbnail.dataUrl) {
    return check(
      "thumbnail-match",
      "Thumbnail",
      "info",
      "No se encontro thumbnail embebido"
    );
  }

  // If we have both thumbnail and actual dimensions, compare aspect ratios
  if (a.thumbnail.width && a.thumbnail.height && a.file.width && a.file.height) {
    const thumbRatio = a.thumbnail.width / a.thumbnail.height;
    const actualRatio = a.file.width / a.file.height;
    const diff = Math.abs(thumbRatio - actualRatio);

    if (diff > 0.1) {
      return check(
        "thumbnail-match",
        "Thumbnail",
        "fail",
        "Proporciones del thumbnail no coinciden con la imagen — posible manipulacion"
      );
    }
  }

  return check(
    "thumbnail-match",
    "Thumbnail",
    "pass",
    "Thumbnail embebido presente y consistente"
  );
}

function checkGpsTimezone(a: PartialAnalysis): ConsistencyCheck {
  const { latitude, longitude } = a.gps;
  const offset = a.exifTemporal.offsetTimeOriginal ?? a.exifTemporal.offsetTime;

  if (latitude === null || longitude === null) {
    return check(
      "gps-tz-plausibility",
      "GPS vs Timezone",
      "unknown",
      "Sin datos GPS para verificar"
    );
  }

  if (!offset) {
    return check(
      "gps-tz-plausibility",
      "GPS vs Timezone",
      "info",
      "GPS presente pero sin offset de timezone para comparar"
    );
  }

  // Rough UTC offset from longitude: every 15 degrees = 1 hour
  const expectedOffset = Math.round(longitude! / 15);

  // Parse offset string like "+02:00" or "-05:00"
  const match = offset.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (!match) {
    return check(
      "gps-tz-plausibility",
      "GPS vs Timezone",
      "info",
      `No se pudo parsear el offset: ${offset}`
    );
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const actualOffset = sign * hours;

  const diff = Math.abs(expectedOffset - actualOffset);
  if (diff <= 2) {
    return check(
      "gps-tz-plausibility",
      "GPS vs Timezone",
      "pass",
      `Timezone ${offset} es plausible para longitud ${longitude!.toFixed(2)}`
    );
  }

  return check(
    "gps-tz-plausibility",
    "GPS vs Timezone",
    "warn",
    `Timezone ${offset} parece inconsistente con longitud ${longitude!.toFixed(2)} (offset esperado ~${expectedOffset >= 0 ? "+" : ""}${expectedOffset})`
  );
}

function checkResolutionCoherence(a: PartialAnalysis): ConsistencyCheck {
  const exifW = a.exifImage.imageWidth;
  const exifH = a.exifImage.imageHeight;
  const realW = a.file.width;
  const realH = a.file.height;

  if (!exifW || !exifH || !realW || !realH) {
    return check(
      "resolution-coherence",
      "Resolucion",
      "info",
      "No se pudo comparar resolucion EXIF vs real"
    );
  }

  if (exifW === realW && exifH === realH) {
    return check(
      "resolution-coherence",
      "Resolucion",
      "pass",
      `${realW}x${realH} — EXIF coincide con dimensiones reales`
    );
  }

  // Check if swapped (orientation)
  if (exifW === realH && exifH === realW) {
    return check(
      "resolution-coherence",
      "Resolucion",
      "pass",
      `Dimensiones coinciden (rotacion por orientacion EXIF)`
    );
  }

  return check(
    "resolution-coherence",
    "Resolucion",
    "warn",
    `EXIF dice ${exifW}x${exifH} pero archivo real es ${realW}x${realH} — imagen posiblemente recortada o redimensionada`
  );
}

function checkMakerNotes(a: PartialAnalysis): ConsistencyCheck {
  if (a.makerNotesPresent) {
    return check(
      "makernotes-presence",
      "MakerNotes",
      "pass",
      "MakerNotes propietarios presentes — indica imagen de camara real"
    );
  }

  if (a.exifDevice.make || a.exifDevice.model) {
    return check(
      "makernotes-presence",
      "MakerNotes",
      "warn",
      "Dispositivo identificado pero sin MakerNotes — metadata posiblemente limpiada"
    );
  }

  return check(
    "makernotes-presence",
    "MakerNotes",
    "info",
    "Sin MakerNotes ni informacion de dispositivo"
  );
}

function checkC2pa(a: PartialAnalysis): ConsistencyCheck {
  if (a.c2pa.detected) {
    return check(
      "c2pa-signature",
      "C2PA",
      "pass",
      `Content Credentials detectados (${a.c2pa.markers.length} marcadores)`
    );
  }
  return check(
    "c2pa-signature",
    "C2PA",
    "info",
    "Sin firma de procedencia C2PA"
  );
}

function checkAiGeneration(a: PartialAnalysis): ConsistencyCheck {
  // Check DigitalSourceType
  const rawXmp = a.xmp.rawXmp;
  const digitalSourceType = String(
    rawXmp["Iptc4xmpExt:DigitalSourceType"] ??
      rawXmp.DigitalSourceType ??
      ""
  ).toLowerCase();

  for (const aiType of AI_DIGITAL_SOURCE_TYPES) {
    if (digitalSourceType.includes(aiType.toLowerCase())) {
      return check(
        "ai-generation",
        "IA",
        "fail",
        `DigitalSourceType indica generacion IA: ${aiType}`
      );
    }
  }

  // Check keywords and description for AI markers
  const searchText = [
    ...a.iptc.keywords,
    a.iptc.caption ?? "",
    a.xmp.creatorTool ?? "",
    a.exifDevice.software ?? "",
  ]
    .join(" ")
    .toLowerCase();

  for (const pattern of AI_SOFTWARE_PATTERNS) {
    if (searchText.includes(pattern)) {
      return check(
        "ai-generation",
        "IA",
        "fail",
        `Indicador de generacion IA detectado en metadata: ${pattern}`
      );
    }
  }

  return check(
    "ai-generation",
    "IA",
    "pass",
    "No se detectaron indicadores de generacion por IA"
  );
}

function checkMetadataCompleteness(a: PartialAnalysis): ConsistencyCheck {
  let score = 0;
  if (a.exifTemporal.dateTimeOriginal) score++;
  if (a.exifDevice.make) score++;
  if (a.exifDevice.model) score++;
  if (a.exifCapture.fNumber !== null) score++;
  if (a.exifCapture.exposureTime !== null) score++;
  if (a.exifCapture.iso !== null) score++;
  if (a.exifCapture.focalLength !== null) score++;
  if (a.gps.latitude !== null) score++;

  if (score >= 6) {
    return check(
      "metadata-completeness",
      "Completitud",
      "pass",
      `Metadata rica (${score}/8 campos clave presentes)`
    );
  }
  if (score >= 3) {
    return check(
      "metadata-completeness",
      "Completitud",
      "warn",
      `Metadata parcial (${score}/8 campos clave) — algunos datos pueden haberse perdido`
    );
  }
  if (score >= 1) {
    return check(
      "metadata-completeness",
      "Completitud",
      "info",
      `Metadata minima (${score}/8 campos clave)`
    );
  }
  return check(
    "metadata-completeness",
    "Completitud",
    "info",
    "Sin metadata EXIF — posible screenshot o imagen procesada"
  );
}

export function runConsistencyChecks(
  analysis: PartialAnalysis
): ConsistencyCheck[] {
  return [
    checkDateConsistency(analysis),
    checkSuspiciousSoftware(analysis),
    checkThumbnailMatch(analysis),
    checkGpsTimezone(analysis),
    checkResolutionCoherence(analysis),
    checkMakerNotes(analysis),
    checkC2pa(analysis),
    checkAiGeneration(analysis),
    checkMetadataCompleteness(analysis),
  ];
}
