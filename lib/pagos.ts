import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";
import { estadoPago, estadoATexto, type EstadoPagoTexto } from "@/lib/flow";

/**
 * Confirmacion de un pago de Flow a partir de su token (webhook o retorno).
 * Verifica el estado contra Flow con nuestra apiKey (no confiamos en nada que
 * venga del navegador) y lo registra con la RPC cf_pago_confirmar, que es
 * idempotente: solo la primera transicion a 'pagado' abona los creditos.
 *
 * Sin service role: la RPC va gateada por CERTIFOTO_PAGOS_SECRET.
 */

export interface ConfirmacionResult {
  estado: EstadoPagoTexto;
  commerceOrder: string;
  creditos?: number;
  saldo?: number;
  yaEstaba?: boolean;
}

export class PagoDesconocidoError extends Error {}

export async function confirmarPagoPorToken(token: string): Promise<ConfirmacionResult> {
  const secret = process.env.CERTIFOTO_PAGOS_SECRET?.trim();
  if (!secret) throw new Error("CERTIFOTO_PAGOS_SECRET no configurada");

  const estado = await estadoPago(token); // lanza si Flow no reconoce el token
  const texto = estadoATexto(estado.status);

  const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("cf_pago_confirmar", {
    p_secret: secret,
    p_commerce_order: estado.commerceOrder,
    p_estado: texto,
    p_payload: estado.raw,
  });
  if (error) {
    if (/not_found/i.test(error.message)) {
      throw new PagoDesconocidoError(`orden ${estado.commerceOrder} no existe`);
    }
    throw new Error(`cf_pago_confirmar: ${error.message}`);
  }
  const r = (data ?? {}) as { creditos?: number; saldo?: number; ya_estaba?: boolean };
  return {
    estado: texto,
    commerceOrder: estado.commerceOrder,
    creditos: r.creditos,
    saldo: r.saldo,
    yaEstaba: r.ya_estaba,
  };
}
