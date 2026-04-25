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
  draft: "bg-gray-700/40 text-gray-300 border-gray-600/50",
  evidence_collection: "bg-blue-900/40 text-blue-400 border-blue-700/50",
  ai_processing: "bg-purple-900/40 text-purple-400 border-purple-700/50",
  review: "bg-amber-900/40 text-amber-400 border-amber-700/50",
  pending_signatures: "bg-orange-900/40 text-orange-400 border-orange-700/50",
  signed_with_conformity: "bg-emerald-900/40 text-emerald-400 border-emerald-700/50",
  signed_with_observations: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
  rejected: "bg-red-900/40 text-red-400 border-red-700/50",
  closed: "bg-emerald-900/40 text-emerald-400 border-emerald-700/50",
  archived: "bg-gray-800/40 text-gray-500 border-gray-700/50",
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
  excelente: "text-emerald-400",
  bueno: "text-green-400",
  regular: "text-amber-400",
  malo: "text-red-400",
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
  none: "text-emerald-400",
  minor: "text-yellow-400",
  moderate: "text-amber-400",
  severe: "text-red-400",
  review_required: "text-blue-400",
};

// ============================================
// Texto de aceptacion estandar
// ============================================

export const STANDARD_ACCEPTANCE_TEXT =
  "Declaro haber revisado el contenido de esta acta, incluyendo fotografias, observaciones y descripciones generadas con apoyo de inteligencia artificial. Entiendo que puedo dejar observaciones antes de firmar.";

export const PDF_DISCLAIMER =
  "Este documento corresponde a un registro digital del estado declarado y observado de la propiedad en la fecha indicada. Las descripciones generadas mediante inteligencia artificial son referenciales y fueron puestas a disposicion de las partes para su revision. La firma de este documento implica que las partes han tenido la oportunidad de revisar, comentar, aceptar u observar su contenido.";
