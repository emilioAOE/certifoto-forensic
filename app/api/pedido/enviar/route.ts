import { NextResponse } from "next/server";
import { enviarCorreoConAdjunto, listmonkConfigurado } from "@/lib/correo";
import { correoCertificadoExpress } from "@/lib/correo-plantillas";
import { clienteAnon, datosPedido, secretoPagos } from "@/lib/pedidos-server";
import { TOKEN_PEDIDO_RE, urlsDeLectura } from "@/lib/pedido-archivos";
import { dentroDelLimite, RESPUESTA_LIMITE } from "@/lib/limite";

/**
 * Manda por correo el certificado express ya generado. El navegador subió
 * <token>/certificado.pdf a Storage (URL firmada); aquí lo bajamos con otra
 * URL firmada y lo adjuntamos. Solo con el pedido pagado y sellado.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const secret = secretoPagos();
  if (!secret || !listmonkConfigurado()) {
    return NextResponse.json({ ok: false, error: "correo no configurado" }, { status: 503 });
  }
  let body: { token?: unknown; reenviar?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; reenviar?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!TOKEN_PEDIDO_RE.test(token)) {
    return NextResponse.json({ ok: false, error: "Pedido inválido" }, { status: 400 });
  }
  // Cupo por pedido: el remitente es compartido y el token podría filtrarse.
  if (!(await dentroDelLimite({ clave: `pedido:enviar:${token}`, max: 3, ventanaSeg: 3600 }))) {
    return NextResponse.json({ ok: false, error: RESPUESTA_LIMITE.message }, { status: 429 });
  }

  const pedido = await datosPedido(token);
  if (!pedido) {
    return NextResponse.json({ ok: false, error: "El pedido no existe." }, { status: 404 });
  }
  if (pedido.estado !== "pagado" || !pedido.hash_documento) {
    return NextResponse.json({ ok: false, error: "not_ready", message: "El pedido aún no está pagado y sellado." }, { status: 409 });
  }
  // Ya enviado y no es un reenvío pedido a propósito: nada que hacer.
  if (pedido.enviado_en && body.reenviar !== true) {
    return NextResponse.json({ ok: true, enviado: true, yaEstaba: true });
  }

  let bytes: Uint8Array;
  try {
    const [u] = await urlsDeLectura(token, ["certificado.pdf"]);
    if (!u?.url) throw new Error(u?.error ?? "sin URL");
    const res = await fetch(u.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`descarga ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "too_large", message: `El PDF pesa ${(buf.byteLength / 1048576).toFixed(1)} MB; el máximo por correo es 20 MB. Descárgalo desde la página.` },
        { status: 413 }
      );
    }
    bytes = new Uint8Array(buf);
  } catch (err) {
    console.error("[pedidos] enviar: PDF", (err as Error).message);
    return NextResponse.json({ ok: false, error: "No encontramos el PDF del certificado. Vuelve a abrir la página del pedido." }, { status: 404 });
  }

  const direccion = pedido.resumen?.direccion || "la propiedad";
  const c = correoCertificadoExpress({
    nombre: pedido.nombre,
    direccion,
    hash: pedido.hash_documento,
    certificadaEn: pedido.certificada_en,
  });
  const envio = await enviarCorreoConAdjunto({
    para: pedido.email,
    asunto: c.asunto,
    html: c.html,
    texto: c.texto,
    adjuntos: [{ nombre: "certificado-entrega-certifoto.pdf", tipo: "application/pdf", datos: bytes }],
  });
  if (!envio.ok) {
    console.error("[pedidos] enviar: correo", envio.error);
    return NextResponse.json({ ok: false, error: "No pudimos enviar el correo. Descarga el PDF desde la página." }, { status: 502 });
  }
  await clienteAnon().rpc("cf_pedido_marcar_enviado", { p_secret: secret, p_token: token });
  return NextResponse.json({ ok: true, enviado: true });
}
