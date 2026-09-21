import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarCorreoConAdjunto, listmonkConfigurado } from "@/lib/correo";
import { correoActa } from "@/lib/correo-plantillas";

/**
 * POST /api/acta/enviar — manda el PDF de un acta por correo a las partes.
 *
 * Flujo (lib/acta-email.ts): el navegador genera el PDF, lo sube al bucket
 * privado `certifoto` en {user_id}/{acta_id}/... con su propia sesión (RLS) y
 * aquí lo bajamos con esa misma sesión para adjuntarlo. Así el archivo no
 * pasa por el body de la función (Vercel corta en 4,5 MB) y además queda
 * respaldado junto al acta.
 *
 * Reply-To = el usuario: certifoto.cl no recibe correo, y quien responde
 * quiere hablar con quien envió el acta, no con nosotros.
 */

export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_DESTINATARIOS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  actaId?: unknown;
  ruta?: unknown;
  destinatarios?: unknown;
  mensaje?: unknown;
  tipoLabel?: unknown;
  direccion?: unknown;
  fechaInspeccion?: unknown;
  certificado?: unknown;
  hash?: unknown;
  remitenteNombre?: unknown;
}

const texto = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json(
      { ok: false, error: "login_required", message: "Inicia sesión para enviar el acta" },
      { status: 401 }
    );
  }
  if (!listmonkConfigurado()) {
    return NextResponse.json(
      { ok: false, error: "correo no configurado" },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "json inválido" }, { status: 400 });
  }

  // Solo se envían actas certificadas (el borrador se ve en pantalla, no sale).
  if (body.certificado !== true) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_certified",
        message: "El envío por correo se desbloquea al certificar el acta.",
      },
      { status: 403 }
    );
  }

  const actaId = texto(body.actaId, 80);
  const ruta = texto(body.ruta, 300);
  const prefijo = `${user.id}/${actaId}/`;
  if (
    !actaId ||
    !ruta.startsWith(prefijo) ||
    ruta.includes("..") ||
    !ruta.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json({ ok: false, error: "ruta inválida" }, { status: 400 });
  }

  const destinatarios = Array.from(
    new Set(
      (Array.isArray(body.destinatarios) ? body.destinatarios : [])
        .filter((d): d is string => typeof d === "string")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
    )
  );
  if (destinatarios.length === 0 || destinatarios.length > MAX_DESTINATARIOS) {
    return NextResponse.json(
      { ok: false, error: `entre 1 y ${MAX_DESTINATARIOS} destinatarios` },
      { status: 400 }
    );
  }
  const invalido = destinatarios.find((d) => !EMAIL_RE.test(d) || d.length > 254);
  if (invalido) {
    return NextResponse.json(
      { ok: false, error: "email inválido", message: `Correo inválido: ${invalido}` },
      { status: 400 }
    );
  }

  // El PDF, con la sesión del usuario: RLS solo deja bajar lo suyo.
  const { data: archivo, error: errDescarga } = await supabase.storage
    .from("certifoto")
    .download(ruta);
  if (errDescarga || !archivo) {
    return NextResponse.json(
      { ok: false, error: "archivo no encontrado" },
      { status: 404 }
    );
  }
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "too_large",
        message: `El PDF pesa ${(archivo.size / 1048576).toFixed(1)} MB; el máximo por correo es 20 MB.`,
      },
      { status: 413 }
    );
  }
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const nombreArchivo = ruta.slice(ruta.lastIndexOf("/") + 1);

  const correo = correoActa({
    remitenteNombre: texto(body.remitenteNombre, 80) || user.email,
    remitenteEmail: user.email,
    tipoLabel: texto(body.tipoLabel, 60) || "Acta",
    direccion: texto(body.direccion, 200) || "la propiedad",
    fechaInspeccion: texto(body.fechaInspeccion, 60) || null,
    certificado: body.certificado === true,
    hash: texto(body.hash, 128) || null,
    mensaje: texto(body.mensaje, 1000) || null,
  });

  const enviados: string[] = [];
  const fallidos: string[] = [];
  for (const para of destinatarios) {
    const r = await enviarCorreoConAdjunto({
      para,
      asunto: correo.asunto,
      html: correo.html,
      texto: correo.texto,
      responderA: user.email,
      adjuntos: [{ nombre: nombreArchivo, tipo: "application/pdf", datos: bytes }],
    });
    (r.ok ? enviados : fallidos).push(para);
  }

  return NextResponse.json(
    { ok: enviados.length > 0, enviados, fallidos },
    { status: enviados.length > 0 ? 200 : 502 }
  );
}
