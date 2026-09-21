import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Cliente ADMIN de Supabase (service role). Solo servidor, solo para lo que
 * el usuario no puede hacer por si mismo:
 *  - generar el token del magic link (auth.admin.generateLink) para mandarlo
 *    por Listmonk en vez de por el correo de Supabase;
 *  - la tabla de rate limit cf_login_solicitudes (sin policies).
 * Nunca usarlo para leer/escribir datos de usuarios: eso va por RLS.
 */
export function adminConfigurado(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function createAdminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
