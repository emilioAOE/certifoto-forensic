import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase/env";

/**
 * Acceso del servidor a los pedidos express (RPC gateadas por
 * CERTIFOTO_PAGOS_SECRET; sin service role en Vercel).
 */

export function clienteAnon() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function secretoPagos(): string | null {
  return process.env.CERTIFOTO_PAGOS_SECRET?.trim() || null;
}

export interface PedidoDatos {
  token: string;
  commerce_order: string;
  email: string;
  nombre: string | null;
  monto_clp: number;
  estado: "creado" | "pendiente" | "pagado" | "rechazado" | "anulado";
  acta_id: string | null;
  resumen: { direccion?: string | null; tipo?: string | null; fotos?: number | null; nombre?: string | null };
  hash_documento: string | null;
  certificada_en: string | null;
  enviado_en: string | null;
  pagado_en: string | null;
}

export async function datosPedido(token: string): Promise<PedidoDatos | null> {
  const secret = secretoPagos();
  if (!secret) return null;
  const { data, error } = await clienteAnon().rpc("cf_pedido_datos", {
    p_secret: secret,
    p_token: token,
  });
  if (error || !data) return null;
  return data as PedidoDatos;
}

/** Resumen que guarda el pedido: solo lo necesario para correos y soporte. */
export function limpiarResumen(v: unknown): PedidoDatos["resumen"] {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const texto = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : null) || null;
  return {
    direccion: texto(o.direccion, 160),
    tipo: texto(o.tipo, 40),
    fotos: typeof o.fotos === "number" && o.fotos >= 0 ? Math.min(Math.round(o.fotos), 999) : null,
    nombre: texto(o.nombre, 80),
  };
}
