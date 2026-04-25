import type {
  ActaType,
  ActaStatus,
  RoomType,
  PartyRole,
  PropertyType,
  ConditionLevel,
  DamageType,
  DamageSeverity,
} from "./acta-types";

// ============================================
// Etiquetas legibles
// ============================================

export const ACTA_TYPE_LABEL: Record<ActaType, string> = {
  entrega: "Acta de Entrega",
  devolucion: "Acta de Devolucion",
  inspeccion: "Acta de Inspeccion",
  inventario: "Inventario de Propiedad",
};

export const ACTA_TYPE_DESCRIPTION: Record<ActaType, string> = {
  entrega: "Documenta el estado de la propiedad al inicio del arriendo",
  devolucion: "Documenta el estado al termino del arriendo",
  inspeccion: "Revision intermedia durante el contrato",
  inventario: "Listado de muebles, electrodomesticos y accesorios",
};

export const ACTA_STATUS_LABEL: Record<ActaStatus, string> = {
  draft: "Borrador",
  evidence_collection: "Recopilando evidencia",
  ai_processing: "Procesando con IA",
  review: "En revision",
  pending_signatures: "Pendiente de firma",
  signed_with_conformity: "Firmada conforme",
  signed_with_observations: "Firmada con observaciones",
  rejected: "Rechazada",
  closed: "Cerrada",
  archived: "Archivada",
};

export const ACTA_STATUS_COLOR: Record<ActaStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  evidence_collection: "bg-blue-50 text-blue-700 border-blue-200",
  ai_processing: "bg-purple-50 text-purple-700 border-purple-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  pending_signatures: "bg-orange-50 text-orange-700 border-orange-200",
  signed_with_conformity: "bg-emerald-50 text-emerald-700 border-emerald-200",
  signed_with_observations: "bg-yellow-50 text-yellow-700 border-yellow-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  apartment: "Departamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  other: "Otro",
};

export const PARTY_ROLE_LABEL: Record<PartyRole, string> = {
  landlord: "Arrendador",
  tenant: "Arrendatario",
  broker: "Corredor",
  property_manager: "Administrador",
  witness: "Testigo",
  admin: "Administrador del sistema",
};

export const CONDITION_LABEL: Record<ConditionLevel, string> = {
  excelente: "Excelente",
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
  no_evaluado: "Sin evaluar",
};

export const CONDITION_COLOR: Record<ConditionLevel, string> = {
  excelente: "text-emerald-600",
  bueno: "text-green-600",
  regular: "text-amber-600",
  malo: "text-red-600",
  no_evaluado: "text-muted",
};

// ============================================
// Ambientes predefinidos
// ============================================

export interface RoomTemplate {
  type: RoomType;
  name: string;
  required: boolean;
  minPhotos: number;
  category: "principal" | "servicios" | "exterior" | "extras";
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  { type: "living", name: "Living", required: true, minPhotos: 2, category: "principal" },
  { type: "comedor", name: "Comedor", required: false, minPhotos: 2, category: "principal" },
  { type: "cocina", name: "Cocina", required: true, minPhotos: 3, category: "principal" },
  { type: "dormitorio_principal", name: "Dormitorio principal", required: true, minPhotos: 3, category: "principal" },
  { type: "dormitorio_secundario", name: "Dormitorio secundario", required: false, minPhotos: 2, category: "principal" },
  { type: "bano_principal", name: "Baño principal", required: true, minPhotos: 2, category: "servicios" },
  { type: "bano_secundario", name: "Baño secundario", required: false, minPhotos: 2, category: "servicios" },
  { type: "logia", name: "Logia", required: false, minPhotos: 1, category: "servicios" },
  { type: "terraza", name: "Terraza", required: false, minPhotos: 1, category: "exterior" },
  { type: "pasillo", name: "Pasillo", required: false, minPhotos: 1, category: "principal" },
  { type: "estacionamiento", name: "Estacionamiento", required: false, minPhotos: 1, category: "exterior" },
  { type: "bodega", name: "Bodega", required: false, minPhotos: 1, category: "exterior" },
  { type: "medidores", name: "Medidores (luz/gas/agua)", required: false, minPhotos: 1, category: "extras" },
  { type: "accesos", name: "Accesos y puertas", required: false, minPhotos: 1, category: "extras" },
  { type: "llaves_controles", name: "Llaves y controles", required: false, minPhotos: 1, category: "extras" },
];

// ============================================
// Tipos de daño
// ============================================

export const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  scratch: "Rayadura",
  crack: "Trizadura",
  stain: "Mancha",
  humidity: "Humedad",
  broken_item: "Objeto roto",
  missing_item: "Faltante",
  dirt: "Suciedad",
  paint_damage: "Daño en pintura",
  floor_damage: "Daño en piso",
  glass_damage: "Daño en vidrio",
  furniture_damage: "Daño en mueble",
  appliance_damage: "Daño en electrodomestico",
  other: "Otro",
};

export const DAMAGE_SEVERITY_LABEL: Record<DamageSeverity, string> = {
  none: "Sin daño",
  minor: "Menor",
  moderate: "Moderado",
  severe: "Severo",
  review_required: "Requiere revision humana",
};

export const DAMAGE_SEVERITY_COLOR: Record<DamageSeverity, string> = {
  none: "text-emerald-600",
  minor: "text-yellow-600",
  moderate: "text-amber-600",
  severe: "text-red-600",
  review_required: "text-blue-600",
};

// ============================================
// Texto de aceptacion estandar
// ============================================

export const STANDARD_ACCEPTANCE_TEXT =
  "Declaro haber revisado el contenido de esta acta, incluyendo fotografias, observaciones y descripciones generadas con apoyo de inteligencia artificial. Entiendo que puedo dejar observaciones antes de firmar.";

export const PDF_DISCLAIMER =
  "Este documento corresponde a un registro digital del estado declarado y observado de la propiedad en la fecha indicada. Las descripciones generadas mediante inteligencia artificial son referenciales y fueron puestas a disposicion de las partes para su revision. La firma de este documento implica que las partes han tenido la oportunidad de revisar, comentar, aceptar u observar su contenido.";
