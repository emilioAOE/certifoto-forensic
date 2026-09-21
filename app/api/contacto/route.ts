import { NextResponse } from "next/server";
import { avisar, renderAviso } from "@/lib/correo";
import { PACKS, formatCLP } from "@/lib/packs";

/**
 * Formulario de contacto y solicitud de packs. Es el "checkout" mientras no
 * hay pasarela: cada solicitud de pack tiene que llegar si o si a Emilio.
 *
 * A diferencia de /api/lead (donde la descarga nunca se bloquea), aqui el
 * exito depende de que el aviso haya sido aceptado: si falla, la UI muestra
 * error con reintento en vez de un "enviado" falso.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIPO_LABEL: Record<string, string> = {
  consulta: "Consulta general",
  pack: "Comprar un pack de certificaciones",
  demo: "Solicitar demo",
  empresa: "Corredora / administradora grande",
  soporte: "Soporte técnico",
  prensa: "Prensa",
};

type Body = {
  name?: string;
  email?: string;
  type?: string;
  message?: string;
  pack?: string | number; // tamaño del pack si vino por ?pack=N
  company?: string; // honeypot
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot: bots que llenan el campo oculto reciben un "ok" y se descartan.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 200);
  const type = (body.type ?? "consulta").trim().slice(0, 40);
  const message = (body.message ?? "").trim().slice(0, 4000);

  if (!name) {
    return NextResponse.json({ ok: false, error: "Falta el nombre" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ ok: false, error: "Falta el mensaje" }, { status: 400 });
  }

  const packSize = Number(body.pack);
  const pack = Number.isFinite(packSize) ? PACKS.find((p) => p.size === packSize) : undefined;
  const tipoLabel = TIPO_LABEL[type] ?? type;

  const asunto = pack
    ? `Solicitud de pack: ${pack.label} (${formatCLP(pack.priceCLP)} CLP) — ${name}`
    : `Contacto CertiFoto (${tipoLabel}) — ${name}`;

  const { html, texto } = renderAviso(
    pack ? "Nueva solicitud de pack" : "Nuevo mensaje de contacto",
    [
      ["Nombre", name],
      ["Email", email],
      ["Tipo", tipoLabel],
      ["Pack", pack ? `${pack.label} · ${formatCLP(pack.priceCLP)} CLP` : null],
      ["Mensaje", message],
    ],
    "Responde este correo y le llega directo al cliente (Reply-To)."
  );

  const r = await avisar({ asunto, html, texto, responderA: email });
  if (!r.ok) {
    console.error("[contacto] aviso no enviado:", r.error, "|", email, "|", asunto);
    return NextResponse.json(
      { ok: false, error: "No pudimos enviar tu mensaje. Intenta de nuevo en un momento." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
