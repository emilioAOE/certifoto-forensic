/**
 * Certificado express (lado navegador): el acta se arma aquí como siempre
 * (contrato + fotos + IA), y en vez de cuenta y créditos hay un pedido con un
 * token. Flujo:
 *
 *  1. Al pasar a "revisar": crearPedido() → token. Las fotos se suben en
 *     segundo plano a Storage (<token>/foto-….jpg) con URLs firmadas que
 *     emite el servidor (/api/pedido/subida).
 *  2. Al pagar: se guarda el acta en el navegador, se sube acta.json y
 *     pagarPedido() devuelve la URL de Flow.
 *  3. Al volver pagado (/certificar/listo?p=token): certificarPedido()
 *     registra la huella en el servidor (cf_pedido_certificar), sella el acta,
 *     genera el PDF, lo sube y pide que se envíe por correo.
 *
 * Si la pestaña se cerró entre el pago y la vuelta, descargarActaDeNube()
 * reconstruye el acta desde Storage en cualquier navegador.
 */

import type { Acta, PhotoEvidence, Property } from "./acta-types";
import { createClient } from "./supabase/client";
import { appendAuditLog, computeDocumentHash } from "./acta-helpers";
import { getActa, getProperty, saveActa, saveProperty } from "./storage";
import { stripActaImages } from "./cert-embed";
import { buildActaPdf } from "./acta-pdf";

export const BUCKET_PEDIDOS = "cf-pedidos";
const LS_PEDIDO = "cf_express_pedido";
const ARCHIVO_ACTA = "acta.json";
const ARCHIVO_PDF = "certificado.pdf";

// ------------------------------------------------------------- pedido local

export interface PedidoLocal {
  token: string;
  actaId: string;
  email: string;
  creadoEn: number;
}

export function leerPedidoLocal(): PedidoLocal | null {
  try {
    const raw = localStorage.getItem(LS_PEDIDO);
    if (!raw) return null;
    const p = JSON.parse(raw) as PedidoLocal;
    if (!p.token || !p.actaId) return null;
    // Más de 3 días: el servidor ya borró los archivos de un pedido sin pagar.
    if (Date.now() - (p.creadoEn || 0) > 3 * 86400_000) return null;
    return p;
  } catch {
    return null;
  }
}

export function guardarPedidoLocal(p: PedidoLocal): void {
  try {
    localStorage.setItem(LS_PEDIDO, JSON.stringify(p));
  } catch {
    /* sin localStorage: el correo de pago trae el enlace igual */
  }
}

export function borrarPedidoLocal(): void {
  try {
    localStorage.removeItem(LS_PEDIDO);
  } catch {
    /* nada */
  }
}

// ------------------------------------------------------------------- API

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string; message?: string };
  if (!res.ok || data.ok === false) {
    const err = new Error(data.message ?? data.error ?? `Error ${res.status}`);
    (err as Error & { codigo?: string }).codigo = data.error;
    throw err;
  }
  return data;
}

export interface ResumenPedido {
  direccion: string | null;
  tipo: string;
  fotos: number;
  nombre: string | null;
}

export async function crearPedido(o: {
  email: string;
  nombre: string | null;
  actaId: string;
  resumen: ResumenPedido;
}): Promise<string> {
  const r = await post<{ token: string }>("/api/pedido/crear", o);
  return r.token;
}

/** URL de Flow para pagar el pedido. Lanza "already_paid" si ya está pagado. */
export async function pagarPedido(token: string, email?: string, resumen?: ResumenPedido): Promise<string> {
  const r = await post<{ url: string }>("/api/pedido/pagar", { token, email, resumen });
  return r.url;
}

export interface EstadoPedido {
  existe: boolean;
  estado?: "creado" | "pendiente" | "pagado" | "rechazado" | "anulado";
  email_oculto?: string;
  nombre?: string | null;
  acta_id?: string | null;
  monto_clp?: number;
  hash?: string | null;
  certificada_en?: string | null;
  enviado_en?: string | null;
  resumen?: Partial<ResumenPedido>;
}

export async function estadoPedido(token: string): Promise<EstadoPedido> {
  const { data, error } = await createClient().rpc("cf_pedido_estado", { p_token: token });
  if (error) throw new Error("No pudimos consultar el pedido. Revisa tu conexión.");
  return (data ?? { existe: false }) as EstadoPedido;
}

// ----------------------------------------------------------------- archivos

export interface ArchivoSubida {
  nombre: string;
  blob: Blob;
  contentType: string;
}

const CONCURRENCIA = 3;
const LOTE = 60;

/** Sube archivos al pedido con URLs firmadas. Reintenta una vez cada uno. */
export async function subirArchivos(
  token: string,
  archivos: ArchivoSubida[],
  onProgreso?: (hechas: number, total: number) => void
): Promise<void> {
  const supabase = createClient();
  let hechas = 0;
  for (let i = 0; i < archivos.length; i += LOTE) {
    const lote = archivos.slice(i, i + LOTE);
    const { urls } = await post<{ urls: { path: string; token: string }[] }>("/api/pedido/subida", {
      token,
      nombres: lote.map((a) => a.nombre),
    });
    const porNombre = new Map(urls.map((u) => [u.path.slice(u.path.lastIndexOf("/") + 1), u]));
    const cola = [...lote];
    const trabajador = async () => {
      for (let a = cola.shift(); a; a = cola.shift()) {
        const u = porNombre.get(a.nombre);
        if (!u) throw new Error(`Sin URL de subida para ${a.nombre}`);
        let ultimo: Error | null = null;
        for (let intento = 0; intento < 2; intento++) {
          const { error } = await supabase.storage
            .from(BUCKET_PEDIDOS)
            .uploadToSignedUrl(u.path, u.token, a.blob, { contentType: a.contentType, upsert: true });
          if (!error) {
            ultimo = null;
            break;
          }
          ultimo = new Error(error.message);
        }
        if (ultimo) throw new Error(`No se pudo subir ${a.nombre}: ${ultimo.message}`);
        hechas++;
        onProgreso?.(hechas, archivos.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCIA, cola.length) }, trabajador));
  }
}

export function dataUrlABlob(dataUrl: string): Blob | null {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: m[1] });
}

export function blobADataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function extension(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Nombre del archivo de una foto dentro del pedido (solo [A-Za-z0-9._-]). */
export function nombreFoto(p: PhotoEvidence): string {
  const id = p.id.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 60);
  return `foto-${id}.${extension(p.mimeType)}`;
}

export function archivoDeFoto(p: PhotoEvidence): ArchivoSubida | null {
  const blob = dataUrlABlob(p.dataUrl);
  if (!blob) return null;
  return { nombre: nombreFoto(p), blob, contentType: blob.type || "image/jpeg" };
}

export function archivoDelActa(acta: Acta, property: Property): ArchivoSubida {
  const json = JSON.stringify({ v: 1, acta: stripActaImages(acta), property });
  return { nombre: ARCHIVO_ACTA, blob: new Blob([json], { type: "application/json" }), contentType: "application/json" };
}

async function urlsDeLectura(token: string, nombres: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (let i = 0; i < nombres.length; i += LOTE) {
    const { urls } = await post<{ urls: { path: string; url: string | null }[] }>("/api/pedido/archivos", {
      token,
      nombres: nombres.slice(i, i + LOTE),
    });
    for (const u of urls) if (u.url) out.set(u.path.slice(u.path.lastIndexOf("/") + 1), u.url);
  }
  return out;
}

/**
 * Reconstruye el acta de un pedido desde Storage (otro navegador, pestaña
 * cerrada) y la deja guardada en este navegador. null si no hay archivos.
 */
export async function descargarActaDeNube(token: string): Promise<{ acta: Acta; property: Property } | null> {
  console.info("[express] acta desde la nube", { token: token.slice(0, 8) });
  const urls = await urlsDeLectura(token, [ARCHIVO_ACTA]);
  const urlActa = urls.get(ARCHIVO_ACTA);
  if (!urlActa) return null;
  const res = await fetch(urlActa, { cache: "no-store" });
  if (!res.ok) return null;
  const { acta, property } = (await res.json()) as { acta: Acta; property: Property };
  const nombres = acta.photos.map(nombreFoto);
  const urlsFotos = nombres.length > 0 ? await urlsDeLectura(token, nombres) : new Map<string, string>();
  const photos: PhotoEvidence[] = [];
  for (const p of acta.photos) {
    const u = urlsFotos.get(nombreFoto(p));
    if (!u) {
      photos.push(p);
      continue;
    }
    const r = await fetch(u, { cache: "no-store" });
    photos.push(r.ok ? { ...p, dataUrl: await blobADataUrl(await r.blob()), thumbnailDataUrl: null } : p);
  }
  const completa: Acta = { ...acta, photos };
  saveProperty(property);
  saveActa(completa);
  return { acta: completa, property };
}

// ------------------------------------------------------------ certificar

export class VersionDistintaError extends Error {
  constructor(public hashRegistrado: string) {
    super("El acta de este navegador no coincide con la versión pagada.");
  }
}

export interface CertificadoResultado {
  acta: Acta;
  blob: Blob;
  fileName: string;
  hash: string;
  enviado: boolean;
}

/**
 * Sella el acta de un pedido pagado: registra la huella (una sola vez),
 * genera el PDF certificado, lo sube y pide el envío por correo.
 */
export async function certificarPedido(
  token: string,
  acta: Acta,
  property: Property,
  opts: { enviar: boolean }
): Promise<CertificadoResultado> {
  // El express no lleva firmas: la huella se calcula sin ellas.
  const base: Acta = { ...acta, signatures: [] };
  const hash = await computeDocumentHash(base);
  console.info("[express] sellando", { token: token.slice(0, 8), fotos: base.photos.length, hash: hash.slice(0, 12) });
  const { data, error } = await createClient().rpc("cf_pedido_certificar", { p_token: token, p_hash: hash });
  if (error) {
    if (/not_paid/.test(error.message)) throw new Error("El pedido aún no figura como pagado.");
    throw new Error("No pudimos registrar la huella del documento. Intenta de nuevo.");
  }
  const r = data as { hash: string; certificada_en: string; coincide: boolean };
  if (!r.coincide) throw new VersionDistintaError(r.hash);

  const now = new Date().toISOString();
  const sellada: Acta = {
    ...base,
    certifiedAt: r.certificada_en,
    legacyCertified: false,
    documentHash: r.hash,
    status: "closed",
    closedAt: acta.closedAt ?? r.certificada_en,
    updatedAt: now,
  };
  const conAuditoria = appendAuditLog(sellada, acta.createdByName, acta.createdByRole, null, "acta_certified", {
    documentHash: r.hash,
    pedido: token,
  });
  saveActa(conAuditoria);

  const { blob, fileName } = await buildActaPdf(conAuditoria, property);
  console.info("[express] PDF listo", { kb: Math.round(blob.size / 1024) });
  await subirArchivos(token, [{ nombre: ARCHIVO_PDF, blob, contentType: "application/pdf" }]);

  let enviado = false;
  if (opts.enviar) {
    try {
      const e = await post<{ enviado?: boolean }>("/api/pedido/enviar", { token });
      enviado = e.enviado === true;
    } catch {
      enviado = false; // la descarga sigue disponible en pantalla
    }
  }
  return { acta: conAuditoria, blob, fileName, hash: r.hash, enviado };
}

/** El acta de un pedido, de este navegador o de la nube. */
export async function actaDelPedido(
  token: string,
  actaId: string | null | undefined
): Promise<{ acta: Acta; property: Property } | null> {
  if (actaId) {
    const acta = getActa(actaId);
    const property = acta ? getProperty(acta.propertyId) : null;
    if (acta && property) return { acta, property };
  }
  return descargarActaDeNube(token);
}
