import { NextResponse } from "next/server";
import { NOMBRE_ARCHIVO_RE, TOKEN_PEDIDO_RE, urlsDeSubida } from "@/lib/pedido-archivos";
import { dentroDelLimite, ipDe, RESPUESTA_LIMITE } from "@/lib/limite";

/**
 * URLs firmadas para que el navegador suba los archivos de un pedido
 * (fotos, acta.json, certificado.pdf) directo a Storage, sin pasar por
 * Vercel (límite de 4,5 MB por request). Quien conoce el token es quien creó
 * el pedido.
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
  if (
    !(await dentroDelLimite(
      { clave: `pedido:subida:${token}`, max: 400, ventanaSeg: 3600, cantidad: nombres.length },
      { clave: `pedido:subida:ip:${ipDe(request)}`, max: 1500, ventanaSeg: 3600, cantidad: nombres.length }
    ))
  ) {
    return NextResponse.json({ ok: false, error: RESPUESTA_LIMITE.message }, { status: 429 });
  }
  try {
    const urls = await urlsDeSubida(token, nombres);
    return NextResponse.json({ ok: true, urls });
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[pedidos] subida:", msg);
    const noExiste = /not_found/.test(msg);
    return NextResponse.json(
      { ok: false, error: noExiste ? "El pedido no existe." : "No pudimos preparar la subida. Intenta de nuevo." },
      { status: noExiste ? 404 : 502 }
    );
  }
}
