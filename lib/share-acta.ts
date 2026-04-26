/**
 * Compartir un acta como archivo .certifoto (ZIP) para firma offline.
 *
 * Caso de uso: el corredor crea el acta, se la envia al arrendatario por
 * WhatsApp/email como un archivo .certifoto. El receptor lo importa en
 * CertiFoto, firma localmente, y exporta de vuelta. El primero importa la
 * version firmada y queda con todas las firmas.
 *
 * Es un sustituto offline de la firma remota cross-device (que requeriria
 * backend).
 *
 * Formato del .certifoto:
 *   manifest.json    → version, fecha, ID del acta, hash
 *   acta.json        → la Acta completa (con fotos inline)
 *   property.json    → la Property asociada
 *   contacts.json    → contactos relacionados (opcional, para contexto)
 */

import type { Acta, Property, Contact } from "./acta-types";
import {
  getActa,
  getProperty,
  saveActa,
  saveProperty,
  listContacts,
  saveContact,
} from "./storage";
import { syncContactsFromActa } from "./contacts";

const FORMAT_VERSION = 1;

interface ShareManifest {
  app: "CertiFoto";
  format: "single-acta";
  version: number;
  exportedAt: string;
  actaId: string;
  actaType: string;
  documentHash: string | null;
}

export interface ShareExportResult {
  blob: Blob;
  fileName: string;
}

export async function exportActaAsShareFile(
  actaId: string
): Promise<ShareExportResult> {
  const acta = getActa(actaId);
  if (!acta) throw new Error("Acta no encontrada");
  const property = getProperty(acta.propertyId);

  // Filtrar contactos relacionados al acta para incluir contexto
  const contacts = listContacts().filter(
    (c) =>
      c.actaIds.includes(actaId) || c.propertyIds.includes(acta.propertyId)
  );

  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;
  const zip = new JSZip();

  const manifest: ShareManifest = {
    app: "CertiFoto",
    format: "single-acta",
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    actaId: acta.id,
    actaType: acta.type,
    documentHash: acta.documentHash,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("acta.json", JSON.stringify(acta, null, 2));
  if (property) {
    zip.file("property.json", JSON.stringify(property, null, 2));
  }
  zip.file("contacts.json", JSON.stringify(contacts, null, 2));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const slug = `${acta.type}-${actaId.slice(0, 12)}`;
  const fileName = `acta-${slug}.certifoto`;

  return { blob, fileName };
}

export interface ShareImportResult {
  acta: Acta;
  property: Property | null;
  contactsAdded: number;
  isUpdate: boolean; // true si el acta ya existia y se actualizo
}

/**
 * Importa un .certifoto y mergea con los datos locales:
 * - Si el acta ya existe localmente, se reemplaza con la version del archivo
 *   (asumiendo que viene con cambios/firmas adicionales).
 * - La propiedad se guarda/actualiza.
 * - Los contactos del archivo se sincronizan con los locales (sin
 *   sobrescribir contactos existentes con datos parciales).
 */
export async function importActaFromShareFile(
  file: File | Blob
): Promise<ShareImportResult> {
  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) {
    throw new Error("Archivo invalido: falta manifest.json");
  }
  const manifest = JSON.parse(await manifestFile.async("string")) as ShareManifest;
  if (manifest.app !== "CertiFoto" || manifest.format !== "single-acta") {
    throw new Error("Este archivo no es un acta CertiFoto");
  }
  if (manifest.version > FORMAT_VERSION) {
    throw new Error(
      `Version del archivo (${manifest.version}) es mayor a la soportada (${FORMAT_VERSION}). Actualiza CertiFoto.`
    );
  }

  const actaFile = zip.file("acta.json");
  if (!actaFile) throw new Error("Archivo invalido: falta acta.json");
  const acta = JSON.parse(await actaFile.async("string")) as Acta;

  const propertyFile = zip.file("property.json");
  let property: Property | null = null;
  if (propertyFile) {
    property = JSON.parse(await propertyFile.async("string")) as Property;
  }

  const contactsFile = zip.file("contacts.json");
  let contacts: Contact[] = [];
  if (contactsFile) {
    try {
      contacts = JSON.parse(await contactsFile.async("string")) as Contact[];
    } catch {
      contacts = [];
    }
  }

  // Detectar si es update
  const existing = getActa(acta.id);
  const isUpdate = !!existing;

  // Guardar
  if (property) saveProperty(property);
  saveActa(acta);

  // Mergear contactos: si hay un contacto existente con mismo email/RUT, no
  // sobrescribir (preservar datos locales del usuario). syncContactsFromActa
  // ya hace este merge correctamente. Adicionalmente, traemos los contactos
  // del archivo que no esten ya en la agenda (con notas, tags, etc.).
  let contactsAdded = 0;
  for (const c of contacts) {
    // Si no existe localmente (por id), insertarlo si tiene datos utiles
    const existingLocal = listContacts().find(
      (lc) =>
        lc.id === c.id ||
        (c.documentId && lc.documentId === c.documentId) ||
        (c.email && lc.email === c.email)
    );
    if (!existingLocal && c.name) {
      saveContact({
        ...c,
        // Re-vincular acta/propertyIds locales
        actaIds: c.actaIds,
        propertyIds: c.propertyIds,
      });
      contactsAdded++;
    }
  }

  // Sincronizar partes del acta con la agenda (puede agregar mas)
  syncContactsFromActa(acta);

  return { acta, property, contactsAdded, isUpdate };
}
