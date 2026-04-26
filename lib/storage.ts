/**
 * Capa de persistencia de CertiFoto.
 *
 * API SINCRONA — el cache se hidrata al inicio (ver hydrateStorage()).
 * Los componentes consumen estas funciones sin async/await.
 *
 * Backend: IndexedDB via lib/storage-idb.ts. Migracion automatica desde
 * LocalStorage la primera vez (datos viejos se trasladan).
 *
 * Sincronizacion entre tabs: BroadcastChannel("certifoto") notifica cambios.
 *
 * Convencion: las escrituras son sincronas desde el punto de vista del caller
 * (actualizan el cache inmediatamente) y persisten async (write-through a IDB).
 * Si IDB falla, el cache sigue siendo source of truth en runtime y el usuario
 * recibe un toast (manejado en una capa superior).
 */

import type { Acta, ActaSummary, Property, Organization } from "./acta-types";
import {
  idbBulkImport,
  idbClearAll,
  idbDeleteActa,
  idbGetMeta,
  idbLoadAllActas,
  idbLoadAllOrganizations,
  idbLoadAllProperties,
  idbPutActa,
  idbPutOrganization,
  idbPutProperty,
  idbSetMeta,
  migrateFromLocalStorageIfNeeded,
} from "./storage-idb";

// ============================================
// Cache en memoria
// ============================================

interface MemoryCache {
  actas: Acta[];
  properties: Property[];
  organizations: Organization[];
  currentUser: CurrentUser | null;
  hydrated: boolean;
  hydrationError: string | null;
}

const cache: MemoryCache = {
  actas: [],
  properties: [],
  organizations: [],
  currentUser: null,
  hydrated: false,
  hydrationError: null,
};

// ============================================
// Sync entre tabs
// ============================================

type ChangeMessage =
  | { type: "actas" }
  | { type: "properties" }
  | { type: "organizations" }
  | { type: "currentUser" };

let channel: BroadcastChannel | null = null;
const listeners = new Set<() => void>();

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel("certifoto");
    channel.addEventListener("message", async (e) => {
      const msg = e.data as ChangeMessage;
      // Reload affected store from IDB
      try {
        if (msg.type === "actas") {
          cache.actas = await idbLoadAllActas();
        } else if (msg.type === "properties") {
          cache.properties = await idbLoadAllProperties();
        } else if (msg.type === "organizations") {
          cache.organizations = await idbLoadAllOrganizations();
        } else if (msg.type === "currentUser") {
          cache.currentUser = await idbGetMeta<CurrentUser>("currentUser");
        }
        notifyListeners();
      } catch (err) {
        console.error("[storage] cross-tab refresh failed:", err);
      }
    });
  }
  return channel;
}

function broadcast(msg: ChangeMessage) {
  try {
    getChannel()?.postMessage(msg);
  } catch {
    // ignore
  }
}

function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn();
    } catch (err) {
      console.error("[storage] listener error:", err);
    }
  }
}

/**
 * Suscribirse a cambios de storage (proviene de otra tab via BroadcastChannel).
 * Devuelve una funcion para cancelar la suscripcion.
 */
export function subscribeToStorageChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ============================================
// Hidratacion (carga inicial)
// ============================================

let hydrationPromise: Promise<void> | null = null;

/**
 * Hidrata el cache desde IndexedDB. Idempotente — segura de llamar varias veces.
 * Llamarla en el StorageProvider antes de mostrar la app.
 */
export function hydrateStorage(): Promise<void> {
  if (cache.hydrated) return Promise.resolve();
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      // 1. Migrar desde LocalStorage si es la primera vez
      await migrateFromLocalStorageIfNeeded();

      // 2. Cargar todo en cache
      const [actas, properties, organizations, currentUser] = await Promise.all([
        idbLoadAllActas(),
        idbLoadAllProperties(),
        idbLoadAllOrganizations(),
        idbGetMeta<CurrentUser>("currentUser"),
      ]);

      cache.actas = actas;
      cache.properties = properties;
      cache.organizations = organizations;
      cache.currentUser = currentUser;
      cache.hydrated = true;

      // 3. Activar canal de sync
      getChannel();
    } catch (err) {
      cache.hydrationError = err instanceof Error ? err.message : String(err);
      console.error("[storage] hydration failed:", err);
      // Aun asi marcamos como hidratado con cache vacio para no bloquear la UI
      cache.hydrated = true;
    }
  })();

  return hydrationPromise;
}

export function isStorageHydrated(): boolean {
  return cache.hydrated;
}

export function getHydrationError(): string | null {
  return cache.hydrationError;
}

// ============================================
// IDs
// ============================================

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
  if (cache.currentUser) return cache.currentUser;
  // Default user para MVP — se persiste en la primera lectura
  const defaultUser: CurrentUser = {
    id: generateId("user"),
    name: "Usuario",
    email: null,
    role: "broker",
    organizationId: null,
  };
  cache.currentUser = defaultUser;
  void idbSetMeta("currentUser", defaultUser).catch((err) =>
    console.error("[storage] persist default user failed:", err)
  );
  broadcast({ type: "currentUser" });
  return defaultUser;
}

export function setCurrentUser(user: CurrentUser): void {
  cache.currentUser = user;
  void idbSetMeta("currentUser", user).catch((err) =>
    console.error("[storage] setCurrentUser persist failed:", err)
  );
  broadcast({ type: "currentUser" });
  notifyListeners();
}

// ============================================
// Actas
// ============================================

export function listActas(): Acta[] {
  return cache.actas;
}

export function getActa(id: string): Acta | null {
  return cache.actas.find((a) => a.id === id) ?? null;
}

export function saveActa(acta: Acta): void {
  const updated = { ...acta, updatedAt: new Date().toISOString() };
  const idx = cache.actas.findIndex((a) => a.id === updated.id);
  if (idx >= 0) {
    cache.actas[idx] = updated;
  } else {
    cache.actas.push(updated);
  }
  void idbPutActa(updated).catch((err) => {
    console.error("[storage] saveActa persist failed:", err);
    throw err;
  });
  broadcast({ type: "actas" });
  notifyListeners();
}

export function deleteActa(id: string): void {
  cache.actas = cache.actas.filter((a) => a.id !== id);
  void idbDeleteActa(id).catch((err) =>
    console.error("[storage] deleteActa persist failed:", err)
  );
  broadcast({ type: "actas" });
  notifyListeners();
}

export function listActaSummaries(): ActaSummary[] {
  return cache.actas.map((a): ActaSummary => {
    const property = cache.properties.find((p) => p.id === a.propertyId) ?? null;
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
  return cache.properties;
}

export function getProperty(id: string): Property | null {
  return cache.properties.find((p) => p.id === id) ?? null;
}

export function saveProperty(property: Property): void {
  const updated = { ...property, updatedAt: new Date().toISOString() };
  const idx = cache.properties.findIndex((p) => p.id === updated.id);
  if (idx >= 0) cache.properties[idx] = updated;
  else cache.properties.push(updated);
  void idbPutProperty(updated).catch((err) =>
    console.error("[storage] saveProperty persist failed:", err)
  );
  broadcast({ type: "properties" });
  notifyListeners();
}

// ============================================
// Organizations
// ============================================

export function listOrganizations(): Organization[] {
  return cache.organizations;
}

export function getOrganization(id: string): Organization | null {
  return cache.organizations.find((o) => o.id === id) ?? null;
}

export function saveOrganization(org: Organization): void {
  const updated = { ...org, updatedAt: new Date().toISOString() };
  const idx = cache.organizations.findIndex((o) => o.id === updated.id);
  if (idx >= 0) cache.organizations[idx] = updated;
  else cache.organizations.push(updated);
  void idbPutOrganization(updated).catch((err) =>
    console.error("[storage] saveOrganization persist failed:", err)
  );
  broadcast({ type: "organizations" });
  notifyListeners();
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
  const actas = cache.actas;
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
    totalProperties: cache.properties.length,
    totalPhotos: actas.reduce((sum, a) => sum + a.photos.length, 0),
  };
}

// ============================================
// Limpieza completa (uso en config / debugging)
// ============================================

export async function clearAllData(): Promise<void> {
  cache.actas = [];
  cache.properties = [];
  cache.organizations = [];
  cache.currentUser = null;
  await idbClearAll();
  broadcast({ type: "actas" });
  broadcast({ type: "properties" });
  broadcast({ type: "organizations" });
  broadcast({ type: "currentUser" });
  notifyListeners();
}

// ============================================
// Bulk import (usado por la importacion ZIP)
// ============================================

export async function bulkReplace(data: {
  actas: Acta[];
  properties: Property[];
  organizations?: Organization[];
  currentUser?: CurrentUser;
}): Promise<void> {
  await idbBulkImport(data);
  // Recargar cache
  cache.actas = await idbLoadAllActas();
  cache.properties = await idbLoadAllProperties();
  cache.organizations = await idbLoadAllOrganizations();
  cache.currentUser = (await idbGetMeta<CurrentUser>("currentUser")) ?? cache.currentUser;
  broadcast({ type: "actas" });
  broadcast({ type: "properties" });
  broadcast({ type: "organizations" });
  notifyListeners();
}

// Export para que el provider pueda forzar refresh tras un import
export async function reloadCache(): Promise<void> {
  cache.actas = await idbLoadAllActas();
  cache.properties = await idbLoadAllProperties();
  cache.organizations = await idbLoadAllOrganizations();
  cache.currentUser = await idbGetMeta<CurrentUser>("currentUser");
  notifyListeners();
}
