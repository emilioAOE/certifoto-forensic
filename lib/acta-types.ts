/**
 * Tipos del dominio de Actas Digitales.
 *
 * Diseño orientado a soportar:
 * - Modalidad directa (arrendador/arrendatario)
 * - Modalidad gestionada (corredor/administrador)
 * - Modalidad organizacion (multi-tenant futuro)
 * - Comparacion entre actas (entrega vs devolucion)
 * - Auditoria completa
 *
 * Para el MVP usamos LocalStorage. La interfaz Storage en lib/storage.ts
 * permite swap a Supabase/Postgres sin cambiar este archivo.
 */

import type { PhotoAnalysis } from "./types";

// ============================================
// Acta types and statuses
// ============================================

export type ActaType = "entrega" | "devolucion" | "inspeccion" | "inventario";

export type ActaStatus =
  | "draft"
  | "evidence_collection"
  | "ai_processing"
  | "review"
  | "pending_signatures"
  | "signed_with_conformity"
  | "signed_with_observations"
  | "rejected"
  | "closed"
  | "archived";

export type ActaModality = "directa" | "gestionada" | "organizacion";

// ============================================
// Property
// ============================================

export type PropertyType = "apartment" | "house" | "office" | "commercial" | "other";
export type FurnishedStatus = "yes" | "no" | "partial";

export interface Property {
  id: string;
  address: string;
  unit: string | null;
  city: string;
  commune: string;
  country: string;
  propertyType: PropertyType;
  furnished: FurnishedStatus;
  parking: boolean;
  storageUnit: boolean;
  internalCode: string | null;
  rolSii: string | null;
  observations: string | null;
  ownerId: string | null;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Parties
// ============================================

export type PartyRole =
  | "landlord"
  | "tenant"
  | "broker"
  | "property_manager"
  | "witness"
  | "admin";

export type RepresentsTarget = "self" | "landlord" | "tenant" | "organization";

export interface Party {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  documentId: string | null;
  role: PartyRole;
  represents: RepresentsTarget;
  canUploadEvidence: boolean;
  canComment: boolean;
  canSign: boolean;
  invitationToken: string | null;
  invitationStatus: "pending" | "active" | "signed" | "declined";
}

// ============================================
// Organization (preparado para Pro/Business)
// ============================================

export type OrganizationType =
  | "brokerage"
  | "property_manager"
  | "landlord_company"
  | "individual";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  logoUrl: string | null;
  billingEmail: string | null;
  brandColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BrokerRoleInActa =
  | "manager"
  | "witness"
  | "landlord_representative"
  | "tenant_representative"
  | "neutral_facilitator"
  | "property_manager";

export interface BrokerActaRole {
  organizationId: string;
  brokerUserId: string | null;
  brokerName: string;
  roleInActa: BrokerRoleInActa;
  signedAsBroker: boolean;
  observations: string | null;
}

// ============================================
// Rooms / Areas
// ============================================

export type RoomType =
  | "living"
  | "comedor"
  | "cocina"
  | "dormitorio_principal"
  | "dormitorio_secundario"
  | "bano_principal"
  | "bano_secundario"
  | "terraza"
  | "logia"
  | "pasillo"
  | "estacionamiento"
  | "bodega"
  | "medidores"
  | "accesos"
  | "llaves_controles"
  | "muebles"
  | "electrodomesticos"
  | "otro";

export type ConditionLevel = "excelente" | "bueno" | "regular" | "malo" | "no_evaluado";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  order: number;
  required: boolean;
  minPhotos: number;
  generalCondition: ConditionLevel;
  aiSummary: string | null;
  manualObservations: string | null;
  photoIds: string[];
}

// ============================================
// Photo evidence (combina forensic + IA)
// ============================================

export type DamageType =
  | "scratch"
  | "crack"
  | "stain"
  | "humidity"
  | "broken_item"
  | "missing_item"
  | "dirt"
  | "paint_damage"
  | "floor_damage"
  | "glass_damage"
  | "furniture_damage"
  | "appliance_damage"
  | "other";

export type DamageSeverity = "none" | "minor" | "moderate" | "severe" | "review_required";

export interface DamageFinding {
  id: string;
  type: DamageType;
  severity: DamageSeverity;
  description: string;
  confidence: number;
  needsHumanReview: boolean;
}

export interface AIPhotoAnalysis {
  detectedRoom: string | null;
  caption: string;
  visibleItems: string[];
  conditionSummary: string;
  damageFindings: DamageFinding[];
  quality: {
    isBlurry: boolean;
    isDark: boolean;
    qualityScore: number;
  };
  tags: string[];
  needsHumanReview: boolean;
  analyzedAt: string;
  modelVersion: string;
}

export type EvidenceStrength = "fuerte" | "media" | "debil";

export interface PhotoEvidence {
  id: string;
  actaId: string;
  roomId: string;
  uploadedByPartyId: string | null;
  uploadedByName: string;
  uploadedByRole: PartyRole;
  uploadedAt: string;

  // Archivo (los datos de blob no se guardan en localStorage por tamaño,
  // se guarda dataUrl en MVP, en produccion seria URL a storage)
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  dataUrl: string; // base64 data URL para MVP
  thumbnailDataUrl: string | null;

  // Forensic (reutilizado del modulo existente)
  forensic: PhotoAnalysis | null;

  // IA
  aiAnalysis: AIPhotoAnalysis | null;
  aiStatus: "pending" | "processing" | "complete" | "error";

  // Estado
  userCaption: string | null;
  isRelevant: boolean;
  isFlagged: boolean;
  evidenceStrength: EvidenceStrength;
  warnings: string[]; // p.ej. "sin EXIF", "borrosa", "oscura"

  // Tomada en app vs subida
  capturedInApp: boolean;
}

// ============================================
// Inventory (para amobladas)
// ============================================

export type InventoryCategory =
  | "furniture"
  | "appliance"
  | "accessory"
  | "key"
  | "control"
  | "meter"
  | "other";

export interface InventoryItem {
  id: string;
  actaId: string;
  roomId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  condition: ConditionLevel;
  aiDescription: string | null;
  manualObservations: string | null;
  photoIds: string[];
}

// ============================================
// Comments / Observations
// ============================================

export type CommentStatus = "open" | "resolved" | "included_in_final";

export interface Comment {
  id: string;
  actaId: string;
  roomId: string | null;
  photoId: string | null;
  inventoryItemId: string | null;
  authorPartyId: string;
  authorName: string;
  authorRole: PartyRole;
  text: string;
  status: CommentStatus;
  createdAt: string;
}

// ============================================
// Signatures
// ============================================

export type SignatureType = "drawn" | "typed" | "checkbox";
export type SignatureStatus = "signed_conformity" | "signed_with_observations" | "rejected";

export interface Signature {
  id: string;
  actaId: string;
  partyId: string;
  signerName: string;
  signerEmail: string | null;
  signerPhone: string | null;
  signerRole: PartyRole;
  represents: RepresentsTarget;
  signatureType: SignatureType;
  signatureImageDataUrl: string | null; // dibujo
  typedSignature: string | null;
  signedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  status: SignatureStatus;
  observations: string | null;
  rejectionReason: string | null;
  acceptanceText: string;
  documentVersionHash: string | null;
}

// ============================================
// Audit log
// ============================================

export type AuditAction =
  | "acta_created"
  | "acta_updated"
  | "acta_status_changed"
  | "property_created"
  | "party_added"
  | "room_added"
  | "photo_uploaded"
  | "photo_analyzed"
  | "comment_added"
  | "signature_requested"
  | "signature_completed"
  | "signature_invalidated"
  | "acta_closed"
  | "pdf_generated";

export interface AuditLogEntry {
  id: string;
  actaId: string;
  actorPartyId: string | null;
  actorName: string;
  actorRole: PartyRole | "system";
  action: AuditAction;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ============================================
// Acta principal (agregado raiz)
// ============================================

export interface Acta {
  id: string;
  type: ActaType;
  modality: ActaModality;
  status: ActaStatus;

  // Relaciones
  propertyId: string;
  parties: Party[];
  brokerRole: BrokerActaRole | null;
  organizationId: string | null;

  // Estructura
  rooms: Room[];
  photos: PhotoEvidence[];
  inventoryItems: InventoryItem[];
  comments: Comment[];
  signatures: Signature[];
  auditLog: AuditLogEntry[];

  // Metadata
  createdByPartyId: string | null;
  createdByName: string;
  createdByRole: PartyRole;
  visibilityMode: "private" | "parties" | "organization";

  // Documento
  finalPdfDataUrl: string | null;
  documentHash: string | null;
  aiSummary: string | null;
  manualSummary: string | null;
  disclaimerAccepted: boolean;

  // Timestamps
  inspectionDate: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;

  // Para comparacion futura
  relatedEntregaActaId: string | null;
}

// ============================================
// Helper / DTO types
// ============================================

export interface CreateActaInput {
  type: ActaType;
  modality: ActaModality;
  property: Omit<Property, "id" | "createdAt" | "updatedAt">;
  parties: Omit<Party, "id" | "invitationToken" | "invitationStatus">[];
  brokerRole?: BrokerActaRole;
  rooms: Omit<Room, "id" | "photoIds" | "aiSummary">[];
  inspectionDate?: string;
  createdByName: string;
  createdByRole: PartyRole;
}

export interface ActaSummary {
  id: string;
  type: ActaType;
  status: ActaStatus;
  propertyAddress: string;
  partiesCount: number;
  photosCount: number;
  roomsCount: number;
  signaturesCount: number;
  signaturesRequired: number;
  inspectionDate: string | null;
  createdAt: string;
  updatedAt: string;
}
