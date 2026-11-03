import { NextResponse } from "next/server";
import { crearPago, flowConfigurado } from "@/lib/flow";
import { clienteAnon, limpiarResumen, secretoPagos } from "@/lib/pedidos-server";
import { TOKEN_PEDIDO_RE } from "@/lib/pedido-archivos";
import { dentroDelLimite, ipDe, RESPUESTA_LIMITE } from "@/lib/limite";

/**
 * Crea la orden en Flow para un pedido express y devuelve la URL de pago.
 * Reintentable: si hubo un intento anterior, cf_pedido_pagar emite una orden
 * nueva (Flow no acepta reutilizar commerceOrder).
 *
 * La confirmacion llega por /api/pagos/flow/confirmar (webhook) y, como
 * respaldo, por /pagos/flow/retorno cuando la persona vuelve.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = { token?: unknown; email?: unknown; resumen?: unknown };

export async function POST(request: Request) {
  const secret = secretoPagos();
  if (!secret || !flowConfigurado()) {
    console.error("[pedidos] pago no disponible:", !secret ? "falta CERTIFOTO_PAGOS_SECRET" : "faltan FLOW_API_KEY/FLOW_SECRET_KEY");
    return NextResponse.json({ ok: false, error: "El pago no está disponible en este momento." }, { status: 503 });
  }
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!TOKEN_PEDIDO_RE.test(token)) {
    return NextResponse.json({ ok: false, error: "Pedido inválido" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email && (!EMAIL_RE.test(email) || email.length > 200)) {
    return NextResponse.json({ ok: false, error: "Ingresa un correo válido." }, { status: 400 });
  }
  if (!(await dentroDelLimite({ clave: `pedido:pagar:ip:${ipDe(request)}`, max: 20, ventanaSeg: 3600 }))) {
    return NextResponse.json({ ok: false, error: RESPUESTA_LIMITE.message }, { status: 429 });
  }

  const supabase = clienteAnon();
  const prep = await supabase.rpc("cf_pedido_pagar", {
    p_secret: secret,
    p_token: token,
    p_email: email || null,
    p_resumen: body.resumen === undefined ? null : limpiarResumen(body.resumen),
  });
  const orden = prep.data as { commerce_order?: string; monto_clp?: number; email?: string } | null;
  if (prep.error || !orden?.commerce_order || !orden.monto_clp || !orden.email) {
    const msg = prep.error?.message ?? "";
    if (/already_paid/.test(msg)) {
      return NextResponse.json({ ok: false, error: "already_paid", message: "Este pedido ya está pagado." }, { status: 409 });
    }
    if (/not_found/.test(msg)) {
      return NextResponse.json({ ok: false, error: "not_found", message: "El pedido no existe." }, { status: 404 });
    }
    console.error("[pedidos] cf_pedido_pagar:", msg || "respuesta incompleta");
    return NextResponse.json({ ok: false, error: "No pudimos preparar el pago. Intenta de nuevo." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  let flow;
  try {
    flow = await crearPago({
      commerceOrder: orden.commerce_order,
      subject: "CertiFoto · Certificado de entrega",
      amount: orden.monto_clp,
      email: orden.email,
      urlConfirmation: `${origin}/api/pagos/flow/confirmar`,
      urlReturn: `${origin}/pagos/flow/retorno`,
      // Sin `optional`: Flow lo imprime en la pantalla de pago ("pedido: …").
    });
  } catch (err) {
    console.error("[pedidos] Flow create:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Flow no respondió. Intenta de nuevo en un momento." }, { status: 502 });
  }

  const iniciado = await supabase.rpc("cf_pedido_iniciar", {
    p_secret: secret,
    p_commerce_order: orden.commerce_order,
    p_flow_order: flow.flowOrder,
    p_flow_token: flow.token,
  });
  if (iniciado.error) {
    // La orden existe en Flow; el webhook igual podrá confirmarla por commerceOrder.
    console.error("[pedidos] cf_pedido_iniciar:", iniciado.error.message);
  }
  return NextResponse.json({ ok: true, url: `${flow.url}?token=${encodeURIComponent(flow.token)}` });
}
