/**
 * Backend de IndexedDB para CertiFoto.
 *
 * Reemplaza LocalStorage que tenia limite de ~5-10MB. IndexedDB ofrece tipicamente
 * 50MB+ y puede crecer hasta GBs con permiso del usuario.
 *
 * La interfaz publica que consume el resto de la app esta en lib/storage.ts —
 * este archivo solo se ocupa del IO con IDB. Las funciones aqui son async pero
 * lib/storage.ts mantiene una API sincrona usando un cache hidratado al inicio.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { Acta, Property, Organization, Contact } from "./acta-types";

const DB_NAME = "certifoto";
const DB_VERSION = 2; // bump al agregar contacts store

// Stores
const STORE_ACTAS = "actas";
const STORE_PROPERTIES = "properties";
const STORE_ORGANIZATIONS = "organizations";
const STORE_CONTACTS = "contacts";
const STORE_META = "meta"; // currentUser, settings

interface CertiFotoDB {
  actas: { key: string; value: Acta };
  properties: { key: string; value: Property };
  organizations: { key: string; value: Organization };
  contacts: { key: string; value: Contact };
  meta: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<CertiFotoDB>> | null = null;

function getDB(): Promise<IDBPDatabase<CertiFotoDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB no esta disponible en SSR"));
  }
  if (!dbPromise) {
    dbPromise = openDB<CertiFotoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_ACTAS)) {
          db.createObjectStore(STORE_ACTAS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_PROPERTIES)) {
          db.createObjectStore(STORE_PROPERTIES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_ORGANIZATIONS)) {
          db.createObjectStore(STORE_ORGANIZATIONS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_CONTACTS)) {
          db.createObjectStore(STORE_CONTACTS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META);
        }
      },
    });
  }
  return dbPromise;
}

// ============================================
// Bulk readers (para hidratacion del cache)
// ============================================

export async function idbLoadAllActas(): Promise<Acta[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_ACTAS, "readonly");
  return tx.store.getAll() as Promise<Acta[]>;
}

export async function idbLoadAllProperties(): Promise<Property[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_PROPERTIES, "readonly");
  return tx.store.getAll() as Promise<Property[]>;
}

export async function idbLoadAllOrganizations(): Promise<Organization[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_ORGANIZATIONS, "readonly");
  return tx.store.getAll() as Promise<Organization[]>;
}

export async function idbLoadAllContacts(): Promise<Contact[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_CONTACTS, "readonly");
  return tx.store.getAll() as Promise<Contact[]>;
}

export async function idbGetMeta<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const value = await db.get(STORE_META, key);
  return (value as T | undefined) ?? null;
}

// ============================================
// Writers (write-through desde el cache)
// ============================================

export async function idbPutActa(acta: Acta): Promise<void> {
  const db = await getDB();
  await db.put(STORE_ACTAS, acta);
}

export async function idbDeleteActa(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_ACTAS, id);
}

export async function idbPutProperty(property: Property): Promise<void> {
  const db = await getDB();
  await db.put(STORE_PROPERTIES, property);
}

export async function idbDeleteProperty(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_PROPERTIES, id);
}

export async function idbPutOrganization(org: Organization): Promise<void> {
  const db = await getDB();
  await db.put(STORE_ORGANIZATIONS, org);
}

export async function idbPutContact(contact: Contact): Promise<void> {
  const db = await getDB();
  await db.put(STORE_CONTACTS, contact);
}

export async function idbDeleteContact(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_CONTACTS, id);
}

export async function idbSetMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put(STORE_META, value, key);
}

// ============================================
// Bulk operations
// ============================================

export async function idbClearAll(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear(STORE_ACTAS),
    db.clear(STORE_PROPERTIES),
    db.clear(STORE_ORGANIZATIONS),
    db.clear(STORE_CONTACTS),
    db.clear(STORE_META),
  ]);
}

export async function idbBulkImport(data: {
  actas: Acta[];
  properties: Property[];
  organizations?: Organization[];
  contacts?: Contact[];
  currentUser?: unknown;
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    [
      STORE_ACTAS,
      STORE_PROPERTIES,
      STORE_ORGANIZATIONS,
      STORE_CONTACTS,
      STORE_META,
    ],
    "readwrite"
  );

  // Limpiar primero
  await Promise.all([
    tx.objectStore(STORE_ACTAS).clear(),
    tx.objectStore(STORE_PROPERTIES).clear(),
    tx.objectStore(STORE_ORGANIZATIONS).clear(),
    tx.objectStore(STORE_CONTACTS).clear(),
  ]);

  // Insertar
  for (const acta of data.actas) {
    await tx.objectStore(STORE_ACTAS).put(acta);
  }
  for (const prop of data.properties) {
    await tx.objectStore(STORE_PROPERTIES).put(prop);
  }
  if (data.organizations) {
    for (const org of data.organizations) {
      await tx.objectStore(STORE_ORGANIZATIONS).put(org);
    }
  }
  if (data.contacts) {
    for (const c of data.contacts) {
      await tx.objectStore(STORE_CONTACTS).put(c);
    }
  }
  if (data.currentUser) {
    await tx.objectStore(STORE_META).put(data.currentUser, "currentUser");
  }

  await tx.done;
}

// ============================================
// Migracion desde LocalStorage (one-shot)
// ============================================

const LS_KEYS = {
  actas: "certifoto:actas",
  properties: "certifoto:properties",
  organizations: "certifoto:organizations",
  currentUser: "certifoto:currentUser",
};

const MIGRATION_FLAG_KEY = "ls-migrated-v1";

export async function migrateFromLocalStorageIfNeeded(): Promise<{
  migrated: boolean;
  counts?: { actas: number; properties: number; organizations: number };
}> {
  if (typeof localStorage === "undefined") return { migrated: false };

  const alreadyMigrated = await idbGetMeta<boolean>(MIGRATION_FLAG_KEY);
  if (alreadyMigrated) return { migrated: false };

  try {
    const lsActas = JSON.parse(localStorage.getItem(LS_KEYS.actas) ?? "[]");
    const lsProps = JSON.parse(localStorage.getItem(LS_KEYS.properties) ?? "[]");
    const lsOrgs = JSON.parse(localStorage.getItem(LS_KEYS.organizations) ?? "[]");
    const lsUser = localStorage.getItem(LS_KEYS.currentUser);

    if (Array.isArray(lsActas) && lsActas.length > 0) {
      for (const a of lsActas) {
        await idbPutActa(a);
      }
    }
    if (Array.isArray(lsProps) && lsProps.length > 0) {
      for (const p of lsProps) {
        await idbPutProperty(p);
      }
    }
    if (Array.isArray(lsOrgs) && lsOrgs.length > 0) {
      for (const o of lsOrgs) {
        await idbPutOrganization(o);
      }
    }
    if (lsUser) {
      try {
        await idbSetMeta("currentUser", JSON.parse(lsUser));
      } catch {
        // ignorar parse error
      }
    }

    await idbSetMeta(MIGRATION_FLAG_KEY, true);

    localStorage.removeItem(LS_KEYS.actas);
    localStorage.removeItem(LS_KEYS.properties);
    localStorage.removeItem(LS_KEYS.organizations);

    return {
      migrated: true,
      counts: {
        actas: Array.isArray(lsActas) ? lsActas.length : 0,
        properties: Array.isArray(lsProps) ? lsProps.length : 0,
        organizations: Array.isArray(lsOrgs) ? lsOrgs.length : 0,
      },
    };
  } catch (err) {
    console.error("[storage-idb] migration failed:", err);
    return { migrated: false };
  }
}

// ============================================
// Storage quota
// ============================================

export interface StorageQuota {
  usage: number;
  quota: number;
  percent: number;
  available: boolean;
}

export async function getStorageQuota(): Promise<StorageQuota> {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage?.estimate
  ) {
    return { usage: 0, quota: 0, percent: 0, available: false };
  }
  try {
    const est = await navigator.storage.estimate();
    const usage = est.usage ?? 0;
    const quota = est.quota ?? 0;
    const percent = quota > 0 ? Math.round((usage / quota) * 100) : 0;
    return { usage, quota, percent, available: true };
  } catch {
    return { usage: 0, quota: 0, percent: 0, available: false };
  }
}
