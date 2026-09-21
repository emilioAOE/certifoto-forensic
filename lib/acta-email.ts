/**
 * Envío del acta por correo (cliente).
 *
 * 1. Genera el PDF en memoria (buildActaPdf; certificado → auto-verificable).
 * 2. Lo sube al bucket privado `certifoto` en {user_id}/{acta_id}/{archivo}
 *    con la sesión del usuario (RLS): así no viaja en el body de la API
 *    (límite de 4,5 MB en Vercel) y queda respaldado junto al acta.
 * 3. POST /api/acta/enviar: el servidor baja ese archivo con la misma sesión
 *    y lo manda adjunto por Listmonk a cada destinatario.
 *
 * Exige sesión: sin cuenta no hay bucket ni remitente para el Reply-To.
 */

import { createClient } from "./supabase/client";
import { buildActaPdf } from "./acta-pdf";
import { ACTA_TYPE_LABEL } from "./acta-constants";
import { track } from "./expansiel-analytics";
import type { Acta, Property } from "./acta-types";

export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export type EnviarActaResult =
  | { ok: true; enviados: string[]; fallidos: string[] }
  | {
      ok: false;
      error: "login_required" | "too_large" | "server";
      message?: string;
    };

export function direccionCompleta(property: Property): string {
  const partes = [
    property.unit ? `${property.address}, ${property.unit}` : property.address,
    property.commune,
  ].filter((p) => p && p.trim());
  return partes.join(", ");
}

export async function enviarActaPorCorreo(
  acta: Acta,
  property: Property,
  destinatarios: string[],
  mensaje?: string
): Promise<EnviarActaResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "login_required" };

  const { blob, fileName, certified } = await buildActaPdf(acta, property);
  if (blob.size > MAX_PDF_BYTES) {
    return {
      ok: false,
      error: "too_large",
      message: `El PDF pesa ${(blob.size / 1048576).toFixed(1)} MB; el máximo para enviarlo por correo es 20 MB. Descárgalo y adjúntalo desde tu correo.`,
    };
  }

  const ruta = `${user.id}/${acta.id}/${fileName}`;
  const up = await supabase.storage
    .from("certifoto")
    .upload(ruta, blob, { contentType: "application/pdf", upsert: true });
  if (up.error) {
    return { ok: false, error: "server", message: `No se pudo subir el PDF: ${up.error.message}` };
  }

  let res: Response;
  try {
    res = await fetch("/api/acta/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actaId: acta.id,
        ruta,
        destinatarios,
        mensaje: mensaje ?? null,
        tipoLabel: ACTA_TYPE_LABEL[acta.type] ?? "Acta",
        direccion: direccionCompleta(property),
        fechaInspeccion: acta.inspectionDate
          ? new Date(acta.inspectionDate).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : null,
        certificado: certified,
        hash: certified ? acta.documentHash : null,
        remitenteNombre:
          acta.createdByName && acta.createdByName !== "Usuario"
            ? acta.createdByName
            : null,
      }),
    });
  } catch {
    return { ok: false, error: "server", message: "Sin conexión. Intenta de nuevo." };
  }

  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; enviados?: string[]; fallidos?: string[]; error?: string; message?: string }
    | null;

  if (res.status === 401) return { ok: false, error: "login_required" };
  if (!res.ok || !json?.ok) {
    return {
      ok: false,
      error: json?.error === "too_large" ? "too_large" : "server",
      message: json?.message ?? "No se pudo enviar el correo. Intenta de nuevo.",
    };
  }

  track(
    "acta_enviada",
    { destinatarios: destinatarios.length, certificado: certified, tipo: acta.type },
    { userId: user.id }
  );
  return { ok: true, enviados: json.enviados ?? [], fallidos: json.fallidos ?? [] };
}
