import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PACKS } from "@/lib/packs";
import { crearPago, flowConfigurado } from "@/lib/flow";

/**
 * Inicia la compra de un pack con Flow. Requiere sesion: los creditos se
 * abonan a la cuenta del comprador.
 *
 *  1. cf_pago_crear   -> orden interna (commerceOrder) ligada a auth.uid()
 *  2. Flow /payment/create -> url + token + flowOrder
 *  3. cf_pago_iniciar -> guarda flowOrder/token, estado 'pendiente'
 *  4. responde { url } y el navegador redirige a Flow
 *
 * La confirmacion llega por /api/pagos/flow/confirmar (webhook) y, como
 * respaldo, por /pagos/flow/retorno cuando el usuario vuelve.
 */

export const runtime = "nodejs";

type Body = { packId?: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const pack = PACKS.find((p) => p.id === body.packId);
  if (!pack) {
    return NextResponse.json({ ok: false, error: "Pack desconocido" }, { status: 400 });
  }

  const secret = process.env.CERTIFOTO_PAGOS_SECRET?.trim();
  if (!secret || !flowConfigurado()) {
    console.error(
      "[pagos] compra no disponible:",
      !secret ? "falta CERTIFOTO_PAGOS_SECRET" : "faltan FLOW_API_KEY/FLOW_SECRET_KEY"
    );
    return NextResponse.json(
      { ok: false, error: "El pago con tarjeta no está disponible en este momento." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) {
    return NextResponse.json(
      { ok: false, error: "login_required", message: "Inicia sesión para comprar créditos" },
      { status: 401 }
    );
  }

  // 1. Orden interna
  const creada = await supabase.rpc("cf_pago_crear", {
    p_secret: secret,
    p_pack_id: pack.id,
    p_creditos: pack.size,
    p_monto_clp: pack.priceCLP,
  });
  if (creada.error || typeof creada.data !== "string") {
    console.error("[pagos] cf_pago_crear:", creada.error?.message ?? "sin orden");
    return NextResponse.json(
      { ok: false, error: "No pudimos crear la orden. Intenta de nuevo." },
      { status: 500 }
    );
  }
  const commerceOrder = creada.data;

  // 2. Flow
  const origin = new URL(request.url).origin;
  let flow;
  try {
    flow = await crearPago({
      commerceOrder,
      subject: `CertiFoto · ${pack.label}`,
      amount: pack.priceCLP,
      email: auth.user.email,
      urlConfirmation: `${origin}/api/pagos/flow/confirmar`,
      urlReturn: `${origin}/pagos/flow/retorno`,
      optional: { packId: pack.id, userId: auth.user.id },
    });
  } catch (err) {
    console.error("[pagos] Flow create:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "Flow no respondió. Intenta de nuevo en un momento." },
      { status: 502 }
    );
  }

  // 3. Guardar referencia de Flow
  const iniciado = await supabase.rpc("cf_pago_iniciar", {
    p_secret: secret,
    p_commerce_order: commerceOrder,
    p_flow_order: flow.flowOrder,
    p_flow_token: flow.token,
  });
  if (iniciado.error) {
    // La orden existe en Flow; el webhook igual podra confirmarla por commerceOrder.
    console.error("[pagos] cf_pago_iniciar:", iniciado.error.message);
  }

  return NextResponse.json({ ok: true, url: `${flow.url}?token=${encodeURIComponent(flow.token)}` });
}
