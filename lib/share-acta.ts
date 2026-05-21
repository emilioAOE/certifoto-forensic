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
  isActaCertified,
} from "./storage";
import { syncContactsFromActa } from "./contacts";
import { computeDocumentHash } from "./acta-helpers";
import { extractEmbeddedPayload } from "./cert-embed";

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
  if (!isActaCertified(acta)) {
    throw new Error(
      "Solo puedes compartir un .certifoto de un acta certificada. Certifica el acta primero."
    );
  }
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
    throw new Error("Archivo inválido: falta manifest.json");
  }
  const manifest = JSON.parse(await manifestFile.async("string")) as ShareManifest;
  if (manifest.app !== "CertiFoto" || manifest.format !== "single-acta") {
    throw new Error("Este archivo no es un acta CertiFoto");
  }
  if (manifest.version > FORMAT_VERSION) {
    throw new Error(
      `Versión del archivo (${manifest.version}) es mayor a la soportada (${FORMAT_VERSION}). Actualiza CertiFoto.`
    );
  }

  const actaFile = zip.file("acta.json");
  if (!actaFile) throw new Error("Archivo inválido: falta acta.json");
  const rawActa = JSON.parse(await actaFile.async("string")) as Acta &
    Partial<Pick<Acta, "certifiedAt" | "legacyCertified">>;

  // Backwards compat: actas exportadas antes del modelo de creditos no traen
  // los campos de certificacion. Las marcamos como legacy_certified — vienen
  // de un export valido (con firmas/hash) y no deben costar credito.
  const acta: Acta = {
    ...rawActa,
    certifiedAt: rawActa.certifiedAt ?? null,
    legacyCertified:
      rawActa.legacyCertified === undefined ? true : rawActa.legacyCertified,
  };

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

// ============================================
// Verificacion de autenticidad de un certificado emitido
// ============================================

export interface CertifotoVerifyResult {
  /** El archivo es un certificado CertiFoto valido en estructura. */
  isCertifoto: boolean;
  /** El certificado trae huella digital (documentHash). */
  documentHashPresent: boolean;
  /** El contenido coincide con el sello original (no fue alterado). */
  integrityValid: boolean;
  storedHash: string | null;
  recomputedHash: string | null;
  certifiedAt: string | null;
  acta: Acta | null;
  property: Property | null;
  reason?: string;
}

/**
 * Verifica un archivo .certifoto SIN guardarlo: confirma que es un certificado
 * emitido por CertiFoto y recalcula su huella para comprobar que el contenido
 * no fue alterado desde que se sello.
 */
export async function verifyCertifotoFile(
  file: File | Blob
): Promise<CertifotoVerifyResult> {
  const base: CertifotoVerifyResult = {
    isCertifoto: false,
    documentHashPresent: false,
    integrityValid: false,
    storedHash: null,
    recomputedHash: null,
    certifiedAt: null,
    acta: null,
    property: null,
  };

  const JSZipModule = await import("jszip");
  const JSZip = JSZipModule.default;
  let zip: Awaited<ReturnType<typeof JSZip.loadAsync>>;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    return {
      ...base,
      reason: "No se pudo leer el archivo. ¿Es un .certifoto válido?",
    };
  }

  const manifestFile = zip.file("manifest.json");
  const actaFile = zip.file("acta.json");
  if (!manifestFile || !actaFile) {
    return {
      ...base,
      reason: "El archivo no tiene la estructura de un certificado CertiFoto.",
    };
  }

  let manifest: ShareManifest;
  let acta: Acta;
  try {
    manifest = JSON.parse(await manifestFile.async("string")) as ShareManifest;
    acta = JSON.parse(await actaFile.async("string")) as Acta;
  } catch {
    return { ...base, reason: "El contenido del archivo está corrupto." };
  }

  if (manifest.app !== "CertiFoto" || manifest.format !== "single-acta") {
    return {
      ...base,
      reason: "Este archivo no es un certificado emitido por CertiFoto.",
    };
  }

  let property: Property | null = null;
  const propertyFile = zip.file("property.json");
  if (propertyFile) {
    try {
      property = JSON.parse(await propertyFile.async("string")) as Property;
    } catch {
      property = null;
    }
  }

  const storedHash = acta.documentHash ?? manifest.documentHash ?? null;
  const recomputedHash = await computeDocumentHash(acta);
  const documentHashPresent = !!storedHash;
  const integrityValid = documentHashPresent && storedHash === recomputedHash;

  return {
    isCertifoto: true,
    documentHashPresent,
    integrityValid,
    storedHash,
    recomputedHash,
    certifiedAt: acta.certifiedAt ?? null,
    acta,
    property,
    reason: documentHashPresent
      ? integrityValid
        ? undefined
        : "El contenido no coincide con el sello original: el certificado pudo haber sido alterado."
      : "Certificado sin huella digital (versión antigua): no se puede verificar la integridad criptográfica.",
  };
}

/**
 * Verifica un certificado emitido por CertiFoto. Acepta el PDF (con datos de
 * verificacion embebidos) o el archivo .certifoto. Detecta el tipo por los
 * bytes magicos del archivo.
 */
export async function verifyCertificateFile(
  file: File | Blob
): Promise<CertifotoVerifyResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const head = String.fromCharCode(...bytes.subarray(0, 5));

  if (head.startsWith("%PDF")) {
    const payload = extractEmbeddedPayload(bytes);
    if (!payload) {
      return {
        isCertifoto: false,
        documentHashPresent: false,
        integrityValid: false,
        storedHash: null,
        recomputedHash: null,
        certifiedAt: null,
        acta: null,
        property: null,
        reason:
          "Este PDF no tiene datos de verificación embebidos. Asegúrate de que sea un certificado emitido por CertiFoto (no un borrador, ni un PDF re-guardado por otro programa).",
      };
    }
    const recomputedHash = await computeDocumentHash(payload.acta);
    const storedHash = payload.documentHash;
    const documentHashPresent = !!storedHash;
    const integrityValid = documentHashPresent && storedHash === recomputedHash;
    return {
      isCertifoto: true,
      documentHashPresent,
      integrityValid,
      storedHash,
      recomputedHash,
      certifiedAt: payload.certifiedAt,
      acta: payload.acta,
      property: payload.property,
      reason: documentHashPresent
        ? integrityValid
          ? undefined
          : "El contenido no coincide con el sello original: el certificado pudo haber sido alterado."
        : "Certificado sin huella digital (versión antigua): no se puede verificar la integridad criptográfica.",
    };
  }

  // No es PDF: intentar como archivo .certifoto (ZIP).
  return verifyCertifotoFile(file);
}
