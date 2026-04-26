/**
 * Export/Import del estado completo de CertiFoto como archivo ZIP.
 *
 * Util para:
 * - Backup local
 * - Migrar entre dispositivos
 * - Compartir un acta con otra parte para que la firme y la regrese
 *   (sustituto offline de firma remota)
 *
 * Formato del ZIP:
 *   manifest.json       → version, fecha, contenidos
 *   actas.json          → array de Acta (con dataUrl de fotos inline)
 *   properties.json     → array de Property
 *   organizations.json  → array de Organization
 *   currentUser.json    → CurrentUser (opcional)
 *
 * Optimizacion futura: separar fotos a /photos/{id}.jpg y referenciarlas
 * por path en lugar de inline. Por ahora mantenemos inline por simplicidad.
 */

import type JSZip from "jszip";
import type { Acta, Property, Organization } from "./acta-types";
import {
  listActas,
  listProperties,
  listOrganizations,
  getCurrentUser,
  bulkReplace,
  type CurrentUser,
} from "./storage";

const EXPORT_VERSION = 1;

interface Manifest {
  app: "CertiFoto";
  version: number;
  exportedAt: string;
  counts: {
    actas: number;
    properties: number;
    organizations: number;
  };
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
  bytes: number;
  counts: Manifest["counts"];
}

/**
 * Genera un ZIP con todo el estado actual y devuelve el Blob para descargar.
 */
export async function exportAllAsZip(): Promise<ExportResult> {
  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;

  const actas = listActas();
  const properties = listProperties();
  const organizations = listOrganizations();
  const currentUser = getCurrentUser();

  const manifest: Manifest = {
    app: "CertiFoto",
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    counts: {
      actas: actas.length,
      properties: properties.length,
      organizations: organizations.length,
    },
  };

  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("actas.json", JSON.stringify(actas, null, 2));
  zip.file("properties.json", JSON.stringify(properties, null, 2));
  zip.file("organizations.json", JSON.stringify(organizations, null, 2));
  zip.file("currentUser.json", JSON.stringify(currentUser, null, 2));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `certifoto-backup-${ts}.zip`;

  return {
    blob,
    fileName,
    bytes: blob.size,
    counts: manifest.counts,
  };
}

/**
 * Dispara la descarga de un blob al usuario.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export interface ImportResult {
  manifest: Manifest;
  imported: {
    actas: number;
    properties: number;
    organizations: number;
  };
  warnings: string[];
}

/**
 * Lee un ZIP exportado por CertiFoto y reemplaza el estado actual.
 * IMPORTANTE: esto BORRA todos los datos actuales y los reemplaza con
 * los del ZIP. Pedirle confirmacion al usuario antes de llamar esto.
 */
export async function importFromZip(file: File | Blob): Promise<ImportResult> {
  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;

  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) {
    throw new Error("ZIP invalido: falta manifest.json");
  }
  const manifest = JSON.parse(await manifestFile.async("string")) as Manifest;
  if (manifest.app !== "CertiFoto") {
    throw new Error("Este ZIP no es de CertiFoto");
  }
  if (manifest.version > EXPORT_VERSION) {
    throw new Error(
      `Version del archivo (${manifest.version}) es mayor a la soportada (${EXPORT_VERSION}). Actualiza CertiFoto.`
    );
  }

  const warnings: string[] = [];

  const actasJson = await readJsonFile(zip, "actas.json");
  const actas = (Array.isArray(actasJson) ? actasJson : []) as Acta[];

  const propsJson = await readJsonFile(zip, "properties.json");
  const properties = (Array.isArray(propsJson) ? propsJson : []) as Property[];

  const orgsJson = await readJsonFile(zip, "organizations.json");
  const organizations = (Array.isArray(orgsJson) ? orgsJson : []) as Organization[];

  let currentUser: CurrentUser | undefined;
  try {
    const userJson = await readJsonFile(zip, "currentUser.json");
    if (userJson && typeof userJson === "object" && "id" in userJson) {
      currentUser = userJson as CurrentUser;
    }
  } catch {
    warnings.push("currentUser.json ausente o invalido — se mantendra el usuario actual");
  }

  await bulkReplace({
    actas,
    properties,
    organizations,
    currentUser,
  });

  return {
    manifest,
    imported: {
      actas: actas.length,
      properties: properties.length,
      organizations: organizations.length,
    },
    warnings,
  };
}

async function readJsonFile<T = unknown>(
  zip: JSZip,
  path: string
): Promise<T | null> {
  const file = zip.file(path);
  if (!file) return null;
  try {
    const text = await file.async("string");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
