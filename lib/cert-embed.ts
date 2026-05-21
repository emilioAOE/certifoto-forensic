/**
 * Incrustacion de datos verificables dentro del PDF del certificado.
 *
 * Como no hay backend/registro central, el PDF se hace "auto-verificable":
 * al final del archivo (despues del %%EOF, que los lectores ignoran) se
 * agrega un bloque con el contenido canonico del acta + su huella. El
 * verificador lee ese bloque, recalcula la huella y confirma que el
 * contenido no fue alterado.
 *
 * Se quitan las imagenes (dataUrl) del payload: no afectan la huella —
 * computeDocumentHash no las usa— y harian el PDF enorme.
 */

import type { Acta, Property } from "./acta-types";

export const VERIFY_SENTINEL_START = "\n%%CERTIFOTO-VERIFY:";
export const VERIFY_SENTINEL_END = ":END-CERTIFOTO%%\n";

export interface EmbeddedPayload {
  app: "CertiFoto";
  v: number;
  documentHash: string | null;
  certifiedAt: string | null;
  acta: Acta;
  property: Property | null;
}

/** Quita las imagenes pesadas. No afectan la huella del documento. */
export function stripActaImages(acta: Acta): Acta {
  return {
    ...acta,
    photos: acta.photos.map((p) => ({
      ...p,
      dataUrl: "",
      thumbnailDataUrl: null,
    })),
  };
}

function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function fromBase64Utf8(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Construye el bloque de texto (sentinela + base64) a anexar al PDF. */
export function buildEmbeddedBlock(acta: Acta, property: Property | null): string {
  const payload: EmbeddedPayload = {
    app: "CertiFoto",
    v: 1,
    documentHash: acta.documentHash,
    certifiedAt: acta.certifiedAt,
    acta: stripActaImages(acta),
    property,
  };
  const b64 = toBase64Utf8(JSON.stringify(payload));
  return VERIFY_SENTINEL_START + b64 + VERIFY_SENTINEL_END;
}

/**
 * Extrae el payload embebido de los bytes de un PDF. Devuelve null si no hay
 * bloque de verificacion (PDF que no es certificado CertiFoto, o borrador).
 */
export function extractEmbeddedPayload(bytes: Uint8Array): EmbeddedPayload | null {
  // Decodificar como latin1 (1 byte = 1 char) para buscar marcadores ASCII
  // sin corromper el resto del binario.
  let s = "";
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const start = s.indexOf(VERIFY_SENTINEL_START);
  if (start === -1) return null;
  const from = start + VERIFY_SENTINEL_START.length;
  const end = s.indexOf(VERIFY_SENTINEL_END, from);
  if (end === -1) return null;
  const b64 = s.slice(from, end).trim();
  try {
    const payload = JSON.parse(fromBase64Utf8(b64)) as EmbeddedPayload;
    if (payload.app !== "CertiFoto" || !payload.acta) return null;
    return payload;
  } catch {
    return null;
  }
}
