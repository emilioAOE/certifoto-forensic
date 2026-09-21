/**
 * Conexión al proyecto compartido de Supabase de Expansiel
 * ("supabase-expansiel-landing"), donde CertiFoto vive bajo el namespace cf_*.
 *
 * La URL y la publishable key son públicas por diseño (ya viajan al navegador
 * en lib/expansiel-analytics.ts), por eso pueden tener fallback aquí. Las
 * variables de entorno permiten apuntar a otro proyecto sin tocar código.
 *
 * El service role (SUPABASE_SERVICE_ROLE_KEY, solo servidor) se usa únicamente
 * para generar el token del magic link y el rate limit de login (ver
 * lib/supabase/admin.ts). Los datos de usuarios siempre van por RLS: el cobro
 * de créditos corre en Postgres con security definer bajo auth.uid().
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://alksowkwsnjeesmnosvg.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_uR65ixdIedeOR8Zo-PKNsA_nBJF8W3F";
