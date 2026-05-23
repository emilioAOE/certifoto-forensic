/**
 * Verificacion de autenticidad de un certificado emitido por CertiFoto.
 *
 * Acepta el PDF del certificado (con datos de verificacion embebidos despues
 * del %%EOF) o un archivo .certifoto (ZIP). En ambos casos recalcula la huella
 * del contenido y la compara con el sello original para detectar alteraciones.
 * No guarda nada: la verificacion es local.
 */

import type { Acta, Property } from "./acta-types";
import { computeDocumentHash } from "./acta-helpers";
import { extractEmbeddedPayload } from "./cert-embed";

/** Estructura del manifest dentro de un archivo .certifoto. */
interface ShareManifest {
  app: "CertiFoto";
  format: "single-acta";
  version: number;
  exportedAt: string;
  actaId: string;
  actaType: string;
  documentHash: string | null;
}

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
 * Verifica un archivo .certifoto (ZIP) SIN guardarlo: confirma que es un
 * certificado emitido por CertiFoto y recalcula su huella.
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
