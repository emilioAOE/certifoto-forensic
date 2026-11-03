import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";
import { estadoPago, estadoATexto, type EstadoPagoTexto } from "@/lib/flow";
import { enviarCorreo } from "@/lib/correo";
import { correoPedidoPagado } from "@/lib/correo-plantillas";

/**
 * Confirmacion de un pago de Flow a partir de su token (webhook o retorno).
 * Verifica el estado contra Flow con nuestra apiKey (no confiamos en nada que
 * venga del navegador) y lo registra con la RPC que corresponda, idempotente:
 *  - cf-…  pack de créditos (cf_pago_confirmar): solo la primera transición a
 *          'pagado' abona los créditos.
 *  - cfx-… certificado express (cf_pedido_confirmar): la primera transición a
 *          'pagado' además manda el correo con el enlace del pedido.
 *
 * Sin service role: las RPC van gateadas por CERTIFOTO_PAGOS_SECRET.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

export interface ConfirmacionResult {
  tipo: "pack" | "pedido";
  estado: EstadoPagoTexto;
  commerceOrder: string;
  creditos?: number;
  saldo?: number;
  yaEstaba?: boolean;
  /** Token del pedido express (tipo "pedido"). */
  token?: string;
}

export class PagoDesconocidoError extends Error {}

function cliente() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function secretoPagos(): string {
  const secret = process.env.CERTIFOTO_PAGOS_SECRET?.trim();
  if (!secret) throw new Error("CERTIFOTO_PAGOS_SECRET no configurada");
  return secret;
}

export async function confirmarPagoPorToken(token: string): Promise<ConfirmacionResult> {
  const secret = secretoPagos();
  const estado = await estadoPago(token); // lanza si Flow no reconoce el token
  const texto = estadoATexto(estado.status);
  const supabase = cliente();

  if (estado.commerceOrder.startsWith("cfx-")) {
    const { data, error } = await supabase.rpc("cf_pedido_confirmar", {
      p_secret: secret,
      p_commerce_order: estado.commerceOrder,
      p_estado: texto,
      p_payload: estado.raw,
    });
    if (error) {
      if (/not_found/i.test(error.message)) {
        throw new PagoDesconocidoError(`pedido ${estado.commerceOrder} no existe`);
      }
      throw new Error(`cf_pedido_confirmar: ${error.message}`);
    }
    const r = (data ?? {}) as {
      token?: string;
      email?: string;
      ya_estaba?: boolean;
      resumen?: { direccion?: string | null; nombre?: string | null };
    };
    if (texto === "pagado" && !r.ya_estaba && r.token && r.email) {
      // Comprobante + enlace de recuperación. Si el correo falla no se pierde
      // nada: el retorno de Flow igual lleva al pedido en este navegador.
      const enlace = `${SITE_URL}/certificar/listo?p=${r.token}`;
      const c = correoPedidoPagado({
        nombre: r.resumen?.nombre ?? null,
        direccion: r.resumen?.direccion ?? null,
        enlace,
        montoCLP: estado.amount,
      });
      const env = await enviarCorreo({ para: r.email, asunto: c.asunto, html: c.html, texto: c.texto });
      if (!env.ok) console.error("[pedidos] correo de pago recibido:", env.error);
    }
    return {
      tipo: "pedido",
      estado: texto,
      commerceOrder: estado.commerceOrder,
      token: r.token,
      yaEstaba: r.ya_estaba,
    };
  }

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
    tipo: "pack",
    estado: texto,
    commerceOrder: estado.commerceOrder,
    creditos: r.creditos,
    saldo: r.saldo,
    yaEstaba: r.ya_estaba,
  };
}

/**
 * Token del pedido express a partir del token de Flow. Para el retorno de
 * Flow cuando la confirmación falla: igual hay que llevar a la persona a su
 * pedido. null si no es un pedido (o no se pudo consultar).
 */
export async function pedidoPorFlowToken(flowToken: string): Promise<string | null> {
  try {
    const { data } = await cliente().rpc("cf_pedido_por_flow_token", {
      p_secret: secretoPagos(),
      p_flow_token: flowToken,
    });
    return typeof data === "string" && /^[0-9a-f]{32}$/.test(data) ? data : null;
  } catch {
    return null;
  }
}
