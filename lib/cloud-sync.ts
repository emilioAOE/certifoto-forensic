/**
 * Respaldo en la nube de actas, propiedades y contactos (Supabase, cf_*).
 *
 * Diseño:
 *  - Solo actúa con sesión (initCloudSync(userId)). Sin sesión, no hace nada
 *    y la app sigue 100% local como siempre.
 *  - Write-through con debounce: storage.ts llama queueActa/queueProperty/...
 *    después de cada guardado; aquí se agrupa por id y se sube.
 *  - Las FOTOS no viajan dentro del JSON del acta (pesan): el acta se sube a
 *    cf_actas sin dataUrl y cada foto va al bucket privado "certifoto" en
 *    {user_id}/{acta_id}/{foto_id}, con su fila en cf_fotos. El PDF generado
 *    (finalPdfDataUrl) tampoco se sube: se regenera desde el acta.
 *  - restoreAll() baja todo (fotos incluidas) y lo aplica en local a través de
 *    los callbacks que le pasa el caller, con `suppress` activo para no volver
 *    a subir lo que acabamos de bajar.
 *
 * Este módulo NO importa lib/storage.ts (storage lo importa a él) para evitar
 * un ciclo de imports: recibe los datos como parámetros.
 */

import type { Acta, Property, Contact } from "./acta-types";
import { createClient } from "./supabase/client";

const BUCKET = "certifoto";
const DEBOUNCE_MS = 600;

let userId: string | null = null;
let suppress = false;
let authBound = false;
/** Fotos confirmadas en cf_fotos (evita re-subir en cada guardado). */
const uploaded = new Set<string>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export interface CloudStatus {
  enabled: boolean;
  busy: boolean;
  pending: number;
  lastSyncAt: string | null;
  lastError: string | null;
}

const status: CloudStatus = {
  enabled: false,
  busy: false,
  pending: 0,
  lastSyncAt: null,
  lastError: null,
};

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) {
    try {
      fn();
    } catch (err) {
      console.error("[cloud] listener error:", err);
    }
  }
}

export function subscribeToCloudStatus(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getCloudStatus(): CloudStatus {
  return { ...status };
}

export function isCloudEnabled(): boolean {
  return userId !== null;
}

export function initCloudSync(uid: string): void {
  userId = uid;
  status.enabled = true;
  status.lastError = null;
  bindAuth();
  notify();
}

export function stopCloudSync(): void {
  userId = null;
  status.enabled = false;
  uploaded.clear();
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  notify();
}

function bindAuth() {
  if (authBound || typeof window === "undefined") return;
  authBound = true;
  createClient().auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") stopCloudSync();
  });
}

// ============================================
// Helpers
// ============================================

function debounce(key: string, fn: () => void) {
  const prev = timers.get(key);
  if (prev) clearTimeout(prev);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      fn();
    }, DEBOUNCE_MS)
  );
}

function beginWork() {
  status.pending += 1;
  status.busy = true;
  notify();
}

function endWork(err?: unknown) {
  status.pending = Math.max(0, status.pending - 1);
  status.busy = status.pending > 0;
  if (err) {
    status.lastError = err instanceof Error ? err.message : String(err);
    console.error("[cloud]", status.lastError);
  } else {
    status.lastSyncAt = new Date().toISOString();
    status.lastError = null;
  }
  notify();
}

/** Acta sin binarios: fotos sin dataUrl/thumbnail y sin el PDF generado. */
function stripBinaries(acta: Acta): Acta {
  return {
    ...acta,
    finalPdfDataUrl: null,
    photos: acta.photos.map((p) => ({ ...p, dataUrl: "", thumbnailDataUrl: null })),
  };
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!m) return null;
  const mime = m[1] || "application/octet-stream";
  if (m[2]) {
    const bin = atob(m[3]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(m[3])], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("FileReader"));
    reader.readAsDataURL(blob);
  });
}

/** Extrae el sha256 del análisis forense sin depender de su forma exacta. */
function sha256Of(forensic: unknown): string | null {
  if (!forensic || typeof forensic !== "object") return null;
  const o = forensic as Record<string, unknown>;
  if (typeof o.sha256 === "string") return o.sha256;
  const h = o.hashes;
  if (h && typeof h === "object") {
    const s = (h as Record<string, unknown>).sha256;
    if (typeof s === "string") return s;
  }
  return null;
}

// ============================================
// Push (local -> nube)
// ============================================

export function queueActa(acta: Acta): void {
  if (!userId || suppress) return;
  debounce(`acta:${acta.id}`, () => void pushActa(acta));
}

export function queueProperty(property: Property): void {
  if (!userId || suppress) return;
  debounce(`prop:${property.id}`, () => void pushProperty(property));
}

export function queueContact(contact: Contact): void {
  if (!userId || suppress) return;
  debounce(`contact:${contact.id}`, () => void pushContact(contact));
}

export function queueDelete(kind: "acta" | "propiedad" | "contacto", id: string): void {
  if (!userId || suppress) return;
  const prev = timers.get(`${kind === "acta" ? "acta" : kind === "propiedad" ? "prop" : "contact"}:${id}`);
  if (prev) clearTimeout(prev);
  void pushDelete(kind, id);
}

async function pushActa(acta: Acta): Promise<void> {
  const uid = userId;
  if (!uid) return;
  beginWork();
  try {
    const supabase = createClient();
    const { error } = await supabase.from("cf_actas").upsert(
      {
        id: acta.id,
        user_id: uid,
        tipo: acta.type,
        estado: acta.status,
        propiedad_id: acta.propertyId,
        datos: stripBinaries(acta),
        hash_documento: acta.documentHash,
        certificada_en: acta.certifiedAt,
        actualizado_en: acta.updatedAt,
      },
      { onConflict: "id" }
    );
    if (error) throw new Error(error.message);
    await pushPhotos(acta, uid);
    endWork();
  } catch (err) {
    endWork(err);
  }
}

async function pushPhotos(acta: Acta, uid: string): Promise<void> {
  const supabase = createClient();
  const pendientes = acta.photos.filter((p) => p.dataUrl && !uploaded.has(p.id));
  if (pendientes.length === 0) return;

  // Lo que ya está en la nube para esta acta no se vuelve a subir.
  const { data: existentes } = await supabase
    .from("cf_fotos")
    .select("id")
    .eq("acta_id", acta.id);
  for (const r of existentes ?? []) uploaded.add((r as { id: string }).id);

  for (const p of pendientes) {
    if (uploaded.has(p.id)) continue;
    const blob = dataUrlToBlob(p.dataUrl);
    if (!blob) continue;
    const path = `${uid}/${acta.id}/${p.id}`;
    const up = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: p.mimeType || blob.type, upsert: true });
    if (up.error) throw new Error(up.error.message);
    const { error } = await supabase.from("cf_fotos").upsert(
      {
        id: p.id,
        acta_id: acta.id,
        user_id: uid,
        ruta_storage: path,
        mime: p.mimeType || blob.type,
        bytes: blob.size,
        sha256: sha256Of(p.forensic),
      },
      { onConflict: "id" }
    );
    if (error) throw new Error(error.message);
    uploaded.add(p.id);
  }
}

async function pushProperty(property: Property): Promise<void> {
  const uid = userId;
  if (!uid) return;
  beginWork();
  try {
    const { error } = await createClient()
      .from("cf_propiedades")
      .upsert(
        { id: property.id, user_id: uid, datos: property, actualizado_en: property.updatedAt },
        { onConflict: "id" }
      );
    if (error) throw new Error(error.message);
    endWork();
  } catch (err) {
    endWork(err);
  }
}

async function pushContact(contact: Contact): Promise<void> {
  const uid = userId;
  if (!uid) return;
  beginWork();
  try {
    const { error } = await createClient()
      .from("cf_contactos")
      .upsert(
        { id: contact.id, user_id: uid, datos: contact, actualizado_en: contact.updatedAt },
        { onConflict: "id" }
      );
    if (error) throw new Error(error.message);
    endWork();
  } catch (err) {
    endWork(err);
  }
}

async function pushDelete(kind: "acta" | "propiedad" | "contacto", id: string): Promise<void> {
  const uid = userId;
  if (!uid) return;
  beginWork();
  try {
    const supabase = createClient();
    if (kind === "acta") {
      const prefix = `${uid}/${id}`;
      const { data: objetos } = await supabase.storage.from(BUCKET).list(prefix);
      if (objetos && objetos.length > 0) {
        await supabase.storage.from(BUCKET).remove(objetos.map((o) => `${prefix}/${o.name}`));
      }
      await supabase.from("cf_fotos").delete().eq("acta_id", id);
      const { error } = await supabase.from("cf_actas").delete().eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const table = kind === "propiedad" ? "cf_propiedades" : "cf_contactos";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    }
    endWork();
  } catch (err) {
    endWork(err);
  }
}

/** Sube todo lo local (primer login o botón "Respaldar ahora"). */
export async function backupAll(data: {
  actas: Acta[];
  properties: Property[];
  contacts: Contact[];
}): Promise<void> {
  if (!userId) return;
  for (const p of data.properties) await pushProperty(p);
  for (const c of data.contacts) await pushContact(c);
  for (const a of data.actas) await pushActa(a);
}

// ============================================
// Restore (nube -> local)
// ============================================

interface CfActaRow {
  id: string;
  datos: Acta;
  actualizado_en: string;
}
interface CfRow<T> {
  id: string;
  datos: T;
  actualizado_en: string;
}
interface CfFotoRow {
  id: string;
  acta_id: string;
  ruta_storage: string;
}

export interface RestoreApply {
  acta: (acta: Acta) => void;
  property: (property: Property) => void;
  contact: (contact: Contact) => void;
  /** Devuelve el updatedAt local (ISO) del registro, o null si no existe. */
  localUpdatedAt: (kind: "acta" | "propiedad" | "contacto", id: string) => string | null;
}

export interface RestoreResult {
  actas: number;
  properties: number;
  contacts: number;
  photos: number;
}

/**
 * Baja lo que está en la nube y aplica en local lo que falte o sea más nuevo.
 * Las fotos se descargan del bucket y se reconstruye su dataUrl.
 */
export async function restoreAll(
  apply: RestoreApply,
  onProgress?: (msg: string) => void
): Promise<RestoreResult> {
  const uid = userId;
  const result: RestoreResult = { actas: 0, properties: 0, contacts: 0, photos: 0 };
  if (!uid) return result;

  const supabase = createClient();
  suppress = true;
  beginWork();
  try {
    onProgress?.("Descargando propiedades y contactos…");
    const [props, contacts, actas] = await Promise.all([
      supabase.from("cf_propiedades").select("id, datos, actualizado_en"),
      supabase.from("cf_contactos").select("id, datos, actualizado_en"),
      supabase.from("cf_actas").select("id, datos, actualizado_en"),
    ]);
    if (props.error) throw new Error(props.error.message);
    if (contacts.error) throw new Error(contacts.error.message);
    if (actas.error) throw new Error(actas.error.message);

    for (const row of (props.data ?? []) as CfRow<Property>[]) {
      const local = apply.localUpdatedAt("propiedad", row.id);
      if (!local || local < row.actualizado_en) {
        apply.property(row.datos);
        result.properties++;
      }
    }
    for (const row of (contacts.data ?? []) as CfRow<Contact>[]) {
      const local = apply.localUpdatedAt("contacto", row.id);
      if (!local || local < row.actualizado_en) {
        apply.contact(row.datos);
        result.contacts++;
      }
    }

    const rows = (actas.data ?? []) as CfActaRow[];
    let i = 0;
    for (const row of rows) {
      i++;
      const local = apply.localUpdatedAt("acta", row.id);
      if (local && local >= row.actualizado_en) continue;
      onProgress?.(`Restaurando acta ${i} de ${rows.length}…`);

      const acta = row.datos;
      const { data: fotos } = await supabase
        .from("cf_fotos")
        .select("id, acta_id, ruta_storage")
        .eq("acta_id", row.id);
      const porId = new Map((fotos ?? []).map((f) => [(f as CfFotoRow).id, f as CfFotoRow]));

      const photos = [];
      for (const p of acta.photos) {
        const f = porId.get(p.id);
        if (!f) {
          photos.push(p);
          continue;
        }
        const dl = await supabase.storage.from(BUCKET).download(f.ruta_storage);
        if (dl.error || !dl.data) {
          photos.push(p);
          continue;
        }
        const dataUrl = await blobToDataUrl(dl.data);
        photos.push({ ...p, dataUrl });
        uploaded.add(p.id);
        result.photos++;
      }
      apply.acta({ ...acta, photos });
      result.actas++;
    }
    endWork();
  } catch (err) {
    endWork(err);
    throw err;
  } finally {
    suppress = false;
  }
  return result;
}
