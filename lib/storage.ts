/**
 * Capa de persistencia.
 *
 * Para el MVP usa LocalStorage (client-side), pero la interfaz esta diseñada
 * para que se pueda swappear a Supabase/Postgres en produccion sin tocar
 * los componentes que la consumen.
 *
 * Limitaciones de LocalStorage:
 * - ~5-10 MB por origen
 * - Las fotos se guardan como dataURL base64 (grandes)
 * - Para produccion las fotos deben ir a object storage
 *
 * Convencion de keys: "certifoto:<entity>:<id>"
 */

import type { Acta, ActaSummary, Property, Organization } from "./acta-types";

const KEY_ACTAS = "certifoto:actas";
const KEY_PROPERTIES = "certifoto:properties";
const KEY_ORGANIZATIONS = "certifoto:organizations";
const KEY_CURRENT_USER = "certifoto:currentUser";

// ============================================
// Helpers
// ============================================

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Storage read error for ${key}:`, err);
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Storage write error for ${key}:`, err);
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error(
        "El almacenamiento local esta lleno. Algunas fotos no se guardaron. Considera reducir la cantidad o calidad de imagenes."
      );
    }
    throw err;
  }
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================
// Current user (mock auth para MVP)
// ============================================

export interface CurrentUser {
  id: string;
  name: string;
  email: string | null;
  role: "landlord" | "tenant" | "broker" | "property_manager" | "admin";
  organizationId: string | null;
}

export function getCurrentUser(): CurrentUser {
  const stored = readJSON<CurrentUser | null>(KEY_CURRENT_USER, null);
  if (stored) return stored;
  // Default user para MVP
  const defaultUser: CurrentUser = {
    id: generateId("user"),
    name: "Usuario",
    email: null,
    role: "broker",
    organizationId: null,
  };
  writeJSON(KEY_CURRENT_USER, defaultUser);
  return defaultUser;
}

export function setCurrentUser(user: CurrentUser): void {
  writeJSON(KEY_CURRENT_USER, user);
}

// ============================================
// Actas
// ============================================

export function listActas(): Acta[] {
  return readJSON<Acta[]>(KEY_ACTAS, []);
}

export function getActa(id: string): Acta | null {
  const actas = listActas();
  return actas.find((a) => a.id === id) ?? null;
}

export function saveActa(acta: Acta): void {
  const actas = listActas();
  const existingIdx = actas.findIndex((a) => a.id === acta.id);
  const updated = { ...acta, updatedAt: new Date().toISOString() };
  if (existingIdx >= 0) {
    actas[existingIdx] = updated;
  } else {
    actas.push(updated);
  }
  writeJSON(KEY_ACTAS, actas);
}

export function deleteActa(id: string): void {
  const actas = listActas().filter((a) => a.id !== id);
  writeJSON(KEY_ACTAS, actas);
}

export function listActaSummaries(): ActaSummary[] {
  return listActas().map((a): ActaSummary => {
    const property = getProperty(a.propertyId);
    return {
      id: a.id,
      type: a.type,
      status: a.status,
      propertyAddress: property
        ? `${property.address}${property.unit ? ` ${property.unit}` : ""}, ${property.commune}`
        : "(sin propiedad)",
      partiesCount: a.parties.length,
      photosCount: a.photos.length,
      roomsCount: a.rooms.length,
      signaturesCount: a.signatures.length,
      signaturesRequired: a.parties.filter((p) => p.canSign).length,
      inspectionDate: a.inspectionDate,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  });
}

// ============================================
// Properties
// ============================================

export function listProperties(): Property[] {
  return readJSON<Property[]>(KEY_PROPERTIES, []);
}

export function getProperty(id: string): Property | null {
  return listProperties().find((p) => p.id === id) ?? null;
}

export function saveProperty(property: Property): void {
  const props = listProperties();
  const idx = props.findIndex((p) => p.id === property.id);
  const updated = { ...property, updatedAt: new Date().toISOString() };
  if (idx >= 0) props[idx] = updated;
  else props.push(updated);
  writeJSON(KEY_PROPERTIES, props);
}

// ============================================
// Organizations
// ============================================

export function listOrganizations(): Organization[] {
  return readJSON<Organization[]>(KEY_ORGANIZATIONS, []);
}

export function getOrganization(id: string): Organization | null {
  return listOrganizations().find((o) => o.id === id) ?? null;
}

export function saveOrganization(org: Organization): void {
  const orgs = listOrganizations();
  const idx = orgs.findIndex((o) => o.id === org.id);
  const updated = { ...org, updatedAt: new Date().toISOString() };
  if (idx >= 0) orgs[idx] = updated;
  else orgs.push(updated);
  writeJSON(KEY_ORGANIZATIONS, orgs);
}

// ============================================
// Estadisticas para dashboard
// ============================================

export interface DashboardStats {
  totalActas: number;
  draft: number;
  pendingReview: number;
  pendingSignatures: number;
  signed: number;
  closed: number;
  rejected: number;
  totalProperties: number;
  totalPhotos: number;
}

export function getDashboardStats(): DashboardStats {
  const actas = listActas();
  return {
    totalActas: actas.length,
    draft: actas.filter((a) => a.status === "draft" || a.status === "evidence_collection").length,
    pendingReview: actas.filter((a) => a.status === "review" || a.status === "ai_processing").length,
    pendingSignatures: actas.filter((a) => a.status === "pending_signatures").length,
    signed: actas.filter(
      (a) =>
        a.status === "signed_with_conformity" || a.status === "signed_with_observations"
    ).length,
    closed: actas.filter((a) => a.status === "closed").length,
    rejected: actas.filter((a) => a.status === "rejected").length,
    totalProperties: listProperties().length,
    totalPhotos: actas.reduce((sum, a) => sum + a.photos.length, 0),
  };
}

// ============================================
// Limpieza (util para debugging)
// ============================================

export function clearAllData(): void {
  if (!isClient()) return;
  localStorage.removeItem(KEY_ACTAS);
  localStorage.removeItem(KEY_PROPERTIES);
  localStorage.removeItem(KEY_ORGANIZATIONS);
  localStorage.removeItem(KEY_CURRENT_USER);
}
