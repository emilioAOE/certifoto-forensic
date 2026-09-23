/**
 * Límite de uso de las rutas del servidor (solo servidor: usa
 * CERTIFOTO_LINK_SECRET). Contador por ventana fija en Supabase
 * (cf_limite, ver supabase/migrations/20260923200000_cf_limites.sql).
 *
 * Falla ABIERTA: si Supabase no responde en 1,5 s o el secreto no está
 * configurado, deja pasar. Un límite caído no puede botar la app; lo que
 * protege es el caso normal (bucles, bots, abuso sostenido).
 */

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/env";

export interface Regla {
  clave: string;
  max: number;
  ventanaSeg: number;
  cantidad?: number;
}

async function una(regla: Regla, secret: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cf_limite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        p_secret: secret,
        p_clave: regla.clave.slice(0, 200),
        p_max: regla.max,
        p_ventana_seg: regla.ventanaSeg,
        p_cantidad: regla.cantidad ?? 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return true;
    return (await res.json()) !== false;
  } catch {
    return true;
  }
}

/** true si TODAS las reglas permiten la solicitud (y la cuenta en cada una). */
export async function dentroDelLimite(...reglas: Regla[]): Promise<boolean> {
  const secret = process.env.CERTIFOTO_LINK_SECRET?.trim();
  if (!secret) return true;
  const resultados = await Promise.all(reglas.map((r) => una(r, secret)));
  return resultados.every(Boolean);
}

/** IP del visitante (Vercel pone la real primero en x-forwarded-for). */
export function ipDe(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "sin-ip";
}

const HORA = 3600;
const DIA = 86400;

/**
 * Cupos de las rutas de IA. Por IP: holgados para un corredor que hace
 * varias actas de 40-50 fotos seguidas (cada foto = 1 clasificación + 1
 * análisis). Global por día: techo de gasto si algo se descontrola.
 */
export function reglasIA(ruta: "analizar" | "clasificar" | "contrato", ip: string): Regla[] {
  const porIp = ruta === "contrato" ? 40 : 400;
  const global = ruta === "contrato" ? 3000 : 25000;
  return [
    { clave: `ia:${ruta}:ip:${ip}`, max: porIp, ventanaSeg: HORA },
    { clave: `ia:${ruta}:global`, max: global, ventanaSeg: DIA },
  ];
}

export const RESPUESTA_LIMITE = {
  ok: false,
  error: "rate_limited",
  message: "Demasiadas solicitudes seguidas. Espera unos minutos y vuelve a intentar.",
} as const;
