import "server-only";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/env";

/**
 * Archivos del certificado express: URLs firmadas que emite la Edge Function
 * cf-pedido-archivos (service role dentro de Supabase). Solo servidor: va con
 * CERTIFOTO_PAGOS_SECRET. Ver supabase/functions/cf-pedido-archivos/index.ts.
 */

export interface UrlSubida {
  path: string;
  token: string;
}
export interface UrlLectura {
  path: string;
  url: string | null;
  error: string | null;
}

async function llamar<T>(op: "subir" | "leer", token: string, rutas: string[]): Promise<T> {
  const secret = process.env.CERTIFOTO_PAGOS_SECRET?.trim();
  if (!secret) throw new Error("CERTIFOTO_PAGOS_SECRET no configurada");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/cf-pedido-archivos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-certifoto-secret": secret,
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ op, token, rutas }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; urls?: T } | null;
  if (!res.ok || !data?.ok || !data.urls) {
    throw new Error(`cf-pedido-archivos ${op}: ${data?.error ?? `HTTP ${res.status}`}`);
  }
  return data.urls;
}

export function urlsDeSubida(token: string, rutas: string[]): Promise<UrlSubida[]> {
  return llamar<UrlSubida[]>("subir", token, rutas);
}

export function urlsDeLectura(token: string, rutas: string[]): Promise<UrlLectura[]> {
  return llamar<UrlLectura[]>("leer", token, rutas);
}

export const TOKEN_PEDIDO_RE = /^[0-9a-f]{32}$/;
export const NOMBRE_ARCHIVO_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
