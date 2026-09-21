import "server-only";

/**
 * Correo de bienvenida: se envía una sola vez, en el primer login exitoso.
 *
 * La idempotencia vive en la base (cf_bienvenida_reclamar marca la fila y
 * devuelve el email solo la primera vez), así que da igual cuántas veces se
 * llame. Si Listmonk rechaza el envío se libera la marca para reintentar en
 * el siguiente login. Nunca lanza: un fallo de correo no puede romper el
 * login.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { enviarCorreo, listmonkConfigurado } from "./correo";
import { correoBienvenida } from "./correo-plantillas";

interface FilaBienvenida {
  email: string;
  nombre: string | null;
}

export async function enviarBienvenidaSiCorresponde(
  supabase: SupabaseClient
): Promise<void> {
  if (!listmonkConfigurado()) return;
  try {
    const { data, error } = await supabase.rpc("cf_bienvenida_reclamar");
    if (error) {
      console.error("[bienvenida] reclamar:", error.message);
      return;
    }
    const fila = (Array.isArray(data) ? data[0] : data) as FilaBienvenida | undefined;
    if (!fila?.email) return; // ya se envió antes

    const correo = correoBienvenida({ email: fila.email, nombre: fila.nombre });
    const r = await enviarCorreo({
      para: fila.email,
      asunto: correo.asunto,
      html: correo.html,
      texto: correo.texto,
      // Las respuestas deben llegar a Emilio: certifoto.cl no recibe correo.
      responderA: process.env.LEAD_NOTIFY_EMAIL?.trim() || undefined,
    });
    if (!r.ok) {
      console.error("[bienvenida] no enviado:", r.error);
      await supabase.rpc("cf_bienvenida_deshacer");
    }
  } catch (err) {
    console.error("[bienvenida]", err instanceof Error ? err.message : err);
  }
}
