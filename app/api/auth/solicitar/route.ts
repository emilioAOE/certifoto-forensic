import { NextResponse } from "next/server";
import { enviarCorreo, escapeHtml, listmonkConfigurado } from "@/lib/correo";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/env";

/**
 * Magic link con envio propio.
 *
 * Supabase Auth NO manda correo aqui, y CertiFoto NO tiene la service role
 * key del proyecto compartido (es la llave maestra de todos los productos).
 * El token lo genera la Edge Function `cf-magic-link` dentro de Supabase,
 * a la que llamamos con un secreto acotado (CERTIFOTO_LINK_SECRET) que solo
 * sirve para "pedir un enlace para el correo X"; la funcion ademas rechaza
 * correos de usuarios de otros productos y aplica el rate limit. Nosotros
 * armamos el enlace a /auth/confirm y lo enviamos por Listmonk.
 *
 * Anti-abuso de este lado: honeypot `company` y Turnstile opcional
 * (TURNSTILE_SECRET_KEY) verificado contra Cloudflare.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
  next?: string;
  company?: string; // honeypot
  captcha?: string; // token de Turnstile (opcional)
};

function safeNext(value: string | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

async function verificarTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true; // CAPTCHA desactivado
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

interface LinkOk {
  hashed_token: string;
  verification_type?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot: fingimos exito y no hacemos nada.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Email inválido" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  if (!(await verificarTurnstile(body.captcha, ip))) {
    return NextResponse.json(
      { ok: false, error: "La verificación de seguridad falló. Inténtalo de nuevo." },
      { status: 400 }
    );
  }

  const secret = process.env.CERTIFOTO_LINK_SECRET?.trim();
  if (!secret || !listmonkConfigurado()) {
    console.error(
      "[auth] login no disponible:",
      !secret ? "falta CERTIFOTO_LINK_SECRET" : "falta LISTMONK_*"
    );
    return NextResponse.json(
      { ok: false, error: "El acceso por correo no está disponible en este momento." },
      { status: 503 }
    );
  }

  // ---- Token del enlace (Edge Function dentro de Supabase) ----
  let edge: Response;
  try {
    edge = await fetch(`${SUPABASE_URL}/functions/v1/cf-magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-certifoto-secret": secret,
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, ip }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[auth] edge function inalcanzable:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "No pudimos generar tu enlace. Intenta de nuevo." },
      { status: 502 }
    );
  }

  if (edge.status === 429) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Espera unos minutos y vuelve a intentar." },
      { status: 429 }
    );
  }
  if (edge.status === 403) {
    // Correo de un usuario de otro producto del proyecto compartido.
    console.warn("[auth] correo rechazado por pertenecer a otro producto");
    return NextResponse.json(
      {
        ok: false,
        error:
          "No pudimos habilitar el acceso para ese correo. Escríbenos desde /contacto y lo resolvemos.",
      },
      { status: 400 }
    );
  }
  if (!edge.ok) {
    const detalle = await edge.text().catch(() => "");
    console.error("[auth] edge function respondio", edge.status, detalle.slice(0, 200));
    return NextResponse.json(
      { ok: false, error: "No pudimos generar tu enlace. Intenta de nuevo." },
      { status: 502 }
    );
  }

  const data = (await edge.json().catch(() => null)) as LinkOk | null;
  if (!data?.hashed_token) {
    console.error("[auth] edge function sin hashed_token");
    return NextResponse.json(
      { ok: false, error: "No pudimos generar tu enlace. Intenta de nuevo." },
      { status: 502 }
    );
  }

  const origin = new URL(request.url).origin;
  const url = new URL("/auth/confirm", origin);
  url.searchParams.set("token_hash", data.hashed_token);
  url.searchParams.set("type", data.verification_type || "magiclink");
  url.searchParams.set("next", safeNext(body.next));
  const enlace = url.toString();

  // ---- Envio por Listmonk (nunca se registra el enlace) ----
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111827">
  <h2 style="font-size:18px;margin:0 0 12px">Tu enlace de acceso a CertiFoto</h2>
  <p style="font-size:14px;line-height:1.5">Haz clic para entrar. El enlace es de un solo uso y vence en 1 hora.</p>
  <p style="margin:20px 0"><a href="${escapeHtml(enlace)}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">Entrar a CertiFoto</a></p>
  <p style="font-size:12px;color:#6b7280;line-height:1.5">Si no pediste este acceso, ignora este correo. Este mensaje se envía desde una dirección que no recibe respuestas.</p>
  <p style="font-size:11px;color:#9ca3af;word-break:break-all">Si el botón no funciona, copia este enlace en tu navegador:<br>${escapeHtml(enlace)}</p>
</div>`;
  const texto = `Tu enlace de acceso a CertiFoto

Abre este enlace para entrar (un solo uso, vence en 1 hora):
${enlace}

Si no pediste este acceso, ignora este correo.`;

  const envio = await enviarCorreo({
    para: email,
    asunto: "Tu enlace de acceso a CertiFoto",
    html,
    texto,
  });
  if (!envio.ok) {
    console.error("[auth] envio magic link:", envio.error);
    return NextResponse.json(
      { ok: false, error: "No pudimos enviar el enlace. Intenta de nuevo en un momento." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
