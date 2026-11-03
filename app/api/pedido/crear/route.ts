import { NextResponse } from "next/server";
import { PRECIO_EXPRESS_CLP } from "@/lib/packs";
import { clienteAnon, limpiarResumen, secretoPagos } from "@/lib/pedidos-server";
import { dentroDelLimite, ipDe, RESPUESTA_LIMITE } from "@/lib/limite";

/**
 * Crea un pedido express (certificado sin cuenta). Se llama al llegar a la
 * pantalla de revisión, antes de pagar: devuelve el token con el que el
 * navegador sube las fotos y el acta mientras la persona revisa. La orden en
 * Flow se crea después, en /api/pedido/pagar.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = { email?: unknown; nombre?: unknown; actaId?: unknown; resumen?: unknown };

export async function POST(request: Request) {
  const secret = secretoPagos();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "El pago no está disponible en este momento." }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Ingresa un correo válido." }, { status: 400 });
  }
  const nombre = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 80) : "";
  const actaId = typeof body.actaId === "string" ? body.actaId.trim().slice(0, 80) : "";
  if (!/^acta_[A-Za-z0-9_-]{4,}$/.test(actaId)) {
    return NextResponse.json({ ok: false, error: "Acta inválida" }, { status: 400 });
  }

  const ip = ipDe(request);
  if (
    !(await dentroDelLimite(
      { clave: `pedido:crear:ip:${ip}`, max: 10, ventanaSeg: 3600 },
      { clave: "pedido:crear:global", max: 500, ventanaSeg: 86400 }
    ))
  ) {
    return NextResponse.json({ ok: false, error: RESPUESTA_LIMITE.message }, { status: 429 });
  }

  const { data, error } = await clienteAnon().rpc("cf_pedido_crear", {
    p_secret: secret,
    p_email: email,
    p_nombre: nombre || null,
    p_monto_clp: PRECIO_EXPRESS_CLP,
    p_acta_id: actaId,
    p_resumen: limpiarResumen(body.resumen),
    p_ip: ip,
  });
  const token = (data as { token?: string } | null)?.token;
  if (error || !token) {
    console.error("[pedidos] cf_pedido_crear:", error?.message ?? "sin token");
    return NextResponse.json({ ok: false, error: "No pudimos crear el pedido. Intenta de nuevo." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, token, monto: PRECIO_EXPRESS_CLP });
}
