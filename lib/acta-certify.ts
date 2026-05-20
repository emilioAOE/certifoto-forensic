/**
 * Logica de certificacion de un acta.
 *
 * Certificar = sellar el documento. Pasos:
 *  1. Validar que el acta esta lista para sellarse (con la misma logica que
 *     antes usaba "cerrar acta": tiene firmas requeridas, etc).
 *  2. Consumir 1 credito del usuario.
 *  3. Calcular hash final del documento.
 *  4. Marcar `certifiedAt`, `closedAt`, `status = "closed"` y `documentHash`.
 *  5. Apendear audit log "acta_certified".
 *
 * Si no hay creditos, retorna `{ ok: false, error: "no_credits" }` y la UI
 * lleva al usuario a /precios.
 */

import type { Acta } from "./acta-types";
import { getActa, saveActa, isActaCertified } from "./storage";
import {
  appendAuditLog,
  computeDocumentHash,
  validateActaForReview,
} from "./acta-helpers";
import { consumeCredit, getCreditsBalance } from "./credits";

export type CertifyError =
  | "not_found"
  | "already_certified"
  | "not_ready"
  | "no_credits"
  | "internal";

export interface CertifyResult {
  ok: boolean;
  error?: CertifyError;
  errorMessage?: string;
  /** Si error === "not_ready", lista de razones por las que no se puede aun. */
  validationErrors?: string[];
  acta?: Acta;
}

/**
 * Lock en memoria de actas en proceso de certificacion. Evita que dos
 * llamadas concurrentes (doble-click + await del confirm dialog que cede el
 * event loop) consuman 2 creditos por la misma acta cuando el saldo es >= 2.
 */
const certifyingActas = new Set<string>();

export async function certifyActa(actaId: string): Promise<CertifyResult> {
  if (certifyingActas.has(actaId)) {
    return {
      ok: false,
      error: "internal",
      errorMessage: "Ya hay una certificacion en curso para esta acta",
    };
  }
  const acta = getActa(actaId);
  if (!acta) {
    return { ok: false, error: "not_found", errorMessage: "Acta no encontrada" };
  }
  if (isActaCertified(acta)) {
    return {
      ok: false,
      error: "already_certified",
      errorMessage: "Esta acta ya esta certificada",
    };
  }
  // Defense-in-depth: la UI ya valida antes de mostrar el boton, pero alguien
  // que llame esto directo (DevTools, race condition) podria gastar un credito
  // sobre un acta sin contenido minimo.
  const validation = validateActaForReview(acta);
  if (!validation.valid) {
    return {
      ok: false,
      error: "not_ready",
      errorMessage:
        validation.errors[0] ??
        "El acta no tiene contenido minimo para certificarse",
      validationErrors: validation.errors,
    };
  }
  if (getCreditsBalance() < 1) {
    return {
      ok: false,
      error: "no_credits",
      errorMessage: "No tienes creditos suficientes para certificar",
    };
  }

  certifyingActas.add(actaId);
  try {
    // Re-chequear adentro del lock: otra llamada pudo haber certificado el
    // acta mientras esperabamos (entre el getActa de arriba y aca).
    const fresh = getActa(actaId);
    if (fresh && isActaCertified(fresh)) {
      return {
        ok: false,
        error: "already_certified",
        errorMessage: "Esta acta ya esta certificada",
      };
    }

    const hash = await computeDocumentHash(acta);
    const consume = consumeCredit("certify_acta", `Certificacion de acta`, {
      actaId: acta.id,
      actaType: acta.type,
    });
    if (!consume.ok) {
      return {
        ok: false,
        error: "no_credits",
        errorMessage: consume.error ?? "No se pudo consumir el credito",
      };
    }

    const now = new Date().toISOString();
    const certified: Acta = {
      ...acta,
      certifiedAt: now,
      legacyCertified: false,
      documentHash: hash,
      status: "closed",
      closedAt: acta.closedAt ?? now,
      updatedAt: now,
    };
    const withAudit = appendAuditLog(
      certified,
      acta.createdByName,
      acta.createdByRole,
      null,
      "acta_certified",
      { documentHash: hash, balanceAfter: consume.balanceAfter ?? 0 }
    );
    saveActa(withAudit);
    return { ok: true, acta: withAudit };
  } catch (err) {
    return {
      ok: false,
      error: "internal",
      errorMessage:
        err instanceof Error ? err.message : "Error desconocido al certificar",
    };
  } finally {
    certifyingActas.delete(actaId);
  }
}
