/**
 * Logica de certificacion de un acta.
 *
 * Certificar = sellar el documento. Pasos:
 *  1. Validar que el acta esta lista para sellarse (firmas requeridas, etc).
 *  2. Exigir sesion: el cobro va atado a una cuenta (decision sep-2026).
 *  3. Calcular hash final del documento.
 *  4. Cobrar 1 credito en el servidor con cf_certificar() — atomico: advisory
 *     lock por usuario + indice unico por acta, asi ni un doble click ni dos
 *     pestañas pueden cobrar dos veces ni certificar sin saldo.
 *  5. Marcar `certifiedAt`, `closedAt`, `status = "closed"` y `documentHash`.
 *  6. Apendear audit log "acta_certified".
 *
 * Errores para la UI:
 *  - "login_required": llevar a /login?next=/actas/{id}
 *  - "no_credits":     llevar a /precios
 */

import type { Acta } from "./acta-types";
import { getActa, saveActa, isActaCertified } from "./storage";
import {
  appendAuditLog,
  computeDocumentHash,
  validateActaForReview,
} from "./acta-helpers";
import { refreshCredits } from "./credits";
import { createClient } from "./supabase/client";

export type CertifyError =
  | "not_found"
  | "already_certified"
  | "not_ready"
  | "login_required"
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

/** Lock en memoria: evita que dos llamadas concurrentes procesen la misma acta. */
const certifyingActas = new Set<string>();

export async function certifyActa(actaId: string): Promise<CertifyResult> {
  if (certifyingActas.has(actaId)) {
    return {
      ok: false,
      error: "internal",
      errorMessage: "Ya hay una certificación en curso para esta acta",
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
      errorMessage: "Esta acta ya está certificada",
    };
  }
  // Defense-in-depth: la UI ya valida antes de mostrar el boton.
  const validation = validateActaForReview(acta);
  if (!validation.valid) {
    return {
      ok: false,
      error: "not_ready",
      errorMessage:
        validation.errors[0] ?? "El acta no tiene contenido mínimo para certificarse",
      validationErrors: validation.errors,
    };
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return {
      ok: false,
      error: "login_required",
      errorMessage: "Inicia sesión para certificar: el crédito queda en tu cuenta",
    };
  }

  certifyingActas.add(actaId);
  try {
    const fresh = getActa(actaId);
    if (fresh && isActaCertified(fresh)) {
      return {
        ok: false,
        error: "already_certified",
        errorMessage: "Esta acta ya está certificada",
      };
    }

    const hash = await computeDocumentHash(acta);

    const { data, error } = await supabase.rpc("cf_certificar", {
      p_acta_id: acta.id,
      p_hash: hash,
    });

    let balanceAfter: number | null = null;
    if (error) {
      const msg = (error.message ?? "").toLowerCase();
      if (msg.includes("no_credits")) {
        return {
          ok: false,
          error: "no_credits",
          errorMessage: "No tienes créditos suficientes para certificar",
        };
      }
      if (msg.includes("not_authenticated")) {
        return {
          ok: false,
          error: "login_required",
          errorMessage: "Tu sesión expiró. Inicia sesión de nuevo para certificar",
        };
      }
      if (!msg.includes("already_certified")) {
        return {
          ok: false,
          error: "internal",
          errorMessage: error.message || "No se pudo cobrar el crédito",
        };
      }
      // already_certified en el servidor pero no localmente (p.ej. otro
      // dispositivo ya la cobro): sellamos sin volver a cobrar.
    } else {
      const payload = data as { saldo?: number } | null;
      balanceAfter = typeof payload?.saldo === "number" ? payload.saldo : null;
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
      { documentHash: hash, balanceAfter, userId: auth.user.id }
    );
    saveActa(withAudit);
    void refreshCredits();
    return { ok: true, acta: withAudit };
  } catch (err) {
    return {
      ok: false,
      error: "internal",
      errorMessage: err instanceof Error ? err.message : "Error desconocido al certificar",
    };
  } finally {
    certifyingActas.delete(actaId);
  }
}
