/**
 * Conexión al proyecto compartido de Supabase de Expansiel
 * ("supabase-expansiel-landing"), donde CertiFoto vive bajo el namespace cf_*.
 *
 * La URL y la publishable key son públicas por diseño (ya viajan al navegador
 * en lib/expansiel-analytics.ts), por eso pueden tener fallback aquí. Las
 * variables de entorno permiten apuntar a otro proyecto sin tocar código.
 *
 * NO hay service role key: el cobro de créditos corre en Postgres con
 * security definer bajo auth.uid(), así que el servidor no necesita secretos.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://alksowkwsnjeesmnosvg.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_uR65ixdIedeOR8Zo-PKNsA_nBJF8W3F";
