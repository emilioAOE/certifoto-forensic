import { NextResponse } from "next/server";
import { NOMBRE_ARCHIVO_RE, TOKEN_PEDIDO_RE, urlsDeLectura } from "@/lib/pedido-archivos";
import { dentroDelLimite, RESPUESTA_LIMITE } from "@/lib/limite";

/**
 * URLs firmadas (10 min) para leer los archivos de un pedido: recuperar un
 * pedido pagado desde otro navegador (acta.json + fotos) o volver a bajar el
 * PDF. Solo con el token, que llega por el correo de pago.
 */

export const runtime = "nodejs";

type Body = { token?: unknown; nombres?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const nombres = Array.isArray(body.nombres)
    ? body.nombres.filter((n): n is string => typeof n === "string")
    : [];
  if (!TOKEN_PEDIDO_RE.test(token)) {
    return NextResponse.json({ ok: false, error: "Pedido inválido" }, { status: 400 });
  }
  if (nombres.length === 0 || nombres.length > 80 || nombres.some((n) => !NOMBRE_ARCHIVO_RE.test(n))) {
    return NextResponse.json({ ok: false, error: "Archivos inválidos" }, { status: 400 });
  }
  if (!(await dentroDelLimite({ clave: `pedido:lectura:${token}`, max: 600, ventanaSeg: 3600, cantidad: nombres.length }))) {
    return NextResponse.json({ ok: false, error: RESPUESTA_LIMITE.message }, { status: 429 });
  }
  try {
    const urls = await urlsDeLectura(token, nombres);
    return NextResponse.json({ ok: true, urls });
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[pedidos] archivos:", msg);
    const noExiste = /not_found/.test(msg);
    return NextResponse.json(
      { ok: false, error: noExiste ? "El pedido no existe." : "No pudimos leer los archivos. Intenta de nuevo." },
      { status: noExiste ? 404 : 502 }
    );
  }
}
