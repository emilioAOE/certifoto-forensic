/**
 * Helpers de logica de negocio para Actas.
 * - Transiciones de estado validas
 * - Validaciones antes de cerrar
 * - Calculo de fuerza de evidencia
 * - Audit log helpers
 */

import type {
  Acta,
  ActaStatus,
  PhotoEvidence,
  Room,
  AuditAction,
  AuditLogEntry,
  EvidenceStrength,
  PartyRole,
} from "./acta-types";
import { generateId } from "./storage";

// ============================================
// Transiciones de estado validas
// ============================================

const VALID_TRANSITIONS: Record<ActaStatus, ActaStatus[]> = {
  draft: ["evidence_collection", "archived"],
  evidence_collection: ["draft", "ai_processing", "review", "archived"],
  ai_processing: ["review", "evidence_collection"],
  review: ["pending_signatures", "evidence_collection"],
  pending_signatures: [
    "signed_with_conformity",
    "signed_with_observations",
    "rejected",
    "review",
  ],
  signed_with_conformity: ["closed", "review"],
  signed_with_observations: ["closed", "review"],
  rejected: ["draft", "archived"],
  closed: ["archived"],
  archived: [],
};

export function canTransition(from: ActaStatus, to: ActaStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================
// Validaciones
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateActaForReview(acta: Acta): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (acta.parties.length < 1) {
    errors.push("El acta debe tener al menos una parte registrada.");
  }
  const requireSign = acta.parties.filter((p) => p.canSign);
  if (requireSign.length < 1) {
    errors.push("Al menos una parte debe poder firmar.");
  }

  if (acta.rooms.length === 0) {
    errors.push("Debes seleccionar al menos un ambiente.");
  }

  for (const room of acta.rooms) {
    if (room.required) {
      const photos = acta.photos.filter((p) => p.roomId === room.id);
      if (photos.length === 0) {
        errors.push(`El ambiente "${room.name}" es obligatorio y no tiene fotos.`);
      } else if (photos.length < room.minPhotos) {
        warnings.push(
          `El ambiente "${room.name}" tiene ${photos.length} foto(s), se recomendaba al menos ${room.minPhotos}.`
        );
      }
    }
  }

  // Calidad de evidencia
  const lowQualityPhotos = acta.photos.filter(
    (p) => p.aiAnalysis?.quality.qualityScore != null && p.aiAnalysis.quality.qualityScore < 0.5
  );
  if (lowQualityPhotos.length > 0) {
    warnings.push(`${lowQualityPhotos.length} foto(s) con calidad baja detectada.`);
  }

  const pendingAi = acta.photos.filter(
    (p) => p.aiStatus === "pending" || p.aiStatus === "processing"
  );
  if (pendingAi.length > 0) {
    warnings.push(`${pendingAi.length} foto(s) con analisis IA pendiente.`);
  }

  const noExif = acta.photos.filter(
    (p) => !p.forensic?.exifTemporal.dateTimeOriginal
  );
  if (noExif.length > 0) {
    warnings.push(`${noExif.length} foto(s) sin fecha EXIF original.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateActaForClosing(acta: Acta): ValidationResult {
  const reviewValidation = validateActaForReview(acta);
  const errors = [...reviewValidation.errors];
  const warnings = [...reviewValidation.warnings];

  const requireSign = acta.parties.filter((p) => p.canSign);
  const signaturesByParty = new Set(acta.signatures.map((s) => s.partyId));

  for (const party of requireSign) {
    if (!signaturesByParty.has(party.id)) {
      errors.push(`Falta firma de ${party.name} (${party.role}).`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Fuerza de evidencia
// ============================================

export function calculateEvidenceStrength(photo: PhotoEvidence): EvidenceStrength {
  const f = photo.forensic;

  // Fuerte: tomada en app + GPS + EXIF + sin warnings
  if (
    photo.capturedInApp &&
    f?.gps.latitude != null &&
    f?.exifTemporal.dateTimeOriginal &&
    photo.warnings.length === 0
  ) {
    return "fuerte";
  }

  // Debil: sin EXIF + baja calidad
  if (
    !f?.exifTemporal.dateTimeOriginal &&
    (photo.aiAnalysis?.quality.qualityScore ?? 1) < 0.5
  ) {
    return "debil";
  }

  return "media";
}

export function calculatePhotoWarnings(photo: PhotoEvidence): string[] {
  const warnings: string[] = [];
  const f = photo.forensic;

  if (!f?.exifTemporal.dateTimeOriginal) warnings.push("sin_fecha_exif");
  if (f?.gps.latitude == null) warnings.push("sin_gps");
  if (photo.aiAnalysis?.quality.isBlurry) warnings.push("borrosa");
  if (photo.aiAnalysis?.quality.isDark) warnings.push("oscura");
  if (
    photo.aiAnalysis?.quality.qualityScore != null &&
    photo.aiAnalysis.quality.qualityScore < 0.5
  ) {
    warnings.push("calidad_baja");
  }

  return warnings;
}

// ============================================
// Audit log
// ============================================

export function appendAuditLog(
  acta: Acta,
  actorName: string,
  actorRole: PartyRole | "system",
  actorPartyId: string | null,
  action: AuditAction,
  metadata: Record<string, unknown> = {}
): Acta {
  const entry: AuditLogEntry = {
    id: generateId("audit"),
    actaId: acta.id,
    actorPartyId,
    actorName,
    actorRole,
    action,
    metadata,
    ipAddress: null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    createdAt: new Date().toISOString(),
  };

  return {
    ...acta,
    auditLog: [...acta.auditLog, entry],
  };
}

// ============================================
// Calcular hash del documento (para firmas)
// ============================================

export async function computeDocumentHash(acta: Acta): Promise<string> {
  // Hash determinista del contenido relevante
  const payload = {
    type: acta.type,
    propertyId: acta.propertyId,
    parties: acta.parties.map((p) => ({
      name: p.name,
      role: p.role,
      email: p.email,
    })),
    rooms: acta.rooms.map((r) => ({
      name: r.name,
      condition: r.generalCondition,
      observations: r.manualObservations,
      photoIds: r.photoIds,
    })),
    photos: acta.photos.map((p) => ({
      id: p.id,
      fileName: p.fileName,
      forensicSha256: p.forensic?.file.sha256,
      caption: p.userCaption,
    })),
    inspectionDate: acta.inspectionDate,
    aiSummary: acta.aiSummary,
    manualSummary: acta.manualSummary,
  };

  const text = JSON.stringify(payload);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "no-crypto-available";
}

// ============================================
// Helpers de busqueda
// ============================================

export function getPhotosForRoom(acta: Acta, roomId: string): PhotoEvidence[] {
  return acta.photos.filter((p) => p.roomId === roomId);
}

export function getRoomById(acta: Acta, roomId: string): Room | null {
  return acta.rooms.find((r) => r.id === roomId) ?? null;
}

// ============================================
// Resumen de progreso
// ============================================

export interface ActaProgress {
  totalRooms: number;
  roomsWithPhotos: number;
  totalPhotosRequired: number;
  totalPhotos: number;
  photosWithAI: number;
  signaturesRequired: number;
  signaturesObtained: number;
  percentComplete: number;
}

export function calculateActaProgress(acta: Acta): ActaProgress {
  const totalRooms = acta.rooms.length;
  const roomsWithPhotos = acta.rooms.filter((r) =>
    acta.photos.some((p) => p.roomId === r.id)
  ).length;
  const totalPhotosRequired = acta.rooms.reduce(
    (sum, r) => sum + (r.required ? r.minPhotos : 0),
    0
  );
  const totalPhotos = acta.photos.length;
  const photosWithAI = acta.photos.filter((p) => p.aiStatus === "complete").length;
  const signaturesRequired = acta.parties.filter((p) => p.canSign).length;
  const signaturesObtained = acta.signatures.length;

  const stages = [
    totalRooms > 0 ? 1 : 0,
    totalRooms > 0 ? roomsWithPhotos / totalRooms : 0,
    totalPhotos > 0 ? photosWithAI / totalPhotos : 0,
    signaturesRequired > 0 ? signaturesObtained / signaturesRequired : 0,
  ];
  const percentComplete = Math.round(
    (stages.reduce((sum, s) => sum + s, 0) / stages.length) * 100
  );

  return {
    totalRooms,
    roomsWithPhotos,
    totalPhotosRequired,
    totalPhotos,
    photosWithAI,
    signaturesRequired,
    signaturesObtained,
    percentComplete,
  };
}
