import { NextResponse } from "next/server";
import { adminConfigurado, createAdminClient } from "@/lib/supabase/admin";
import { enviarCorreo, escapeHtml, listmonkConfigurado } from "@/lib/correo";

/**
 * Magic link con envio propio.
 *
 * Supabase Auth NO manda correo aqui: le pedimos el token del enlace con la
 * API admin (generateLink) y lo enviamos nosotros por Listmonk (SES). Asi no
 * hay que configurar SMTP, plantillas ni redirect URLs en el dashboard, y el
 * proyecto compartido no se ve afectado. El enlace cae en /auth/confirm, que
 * verifica el token_hash y deja la sesion en cookies.
 *
 * Anti-abuso (el correo sale por la cuenta SES compartida):
 *  - honeypot `company`;
 *  - rate limit en cf_login_solicitudes: 3 por correo / 15 min, 10 por IP / hora;
 *  - Turnstile opcional (TURNSTILE_SECRET_KEY) verificado contra Cloudflare.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_POR_EMAIL_15MIN = 3;
const MAX_POR_IP_HORA = 10;

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

  if (!adminConfigurado() || !listmonkConfigurado()) {
    console.error(
      "[auth] login no disponible:",
      !adminConfigurado() ? "falta SUPABASE_SERVICE_ROLE_KEY" : "falta LISTMONK_*"
    );
    return NextResponse.json(
      { ok: false, error: "El acceso por correo no está disponible en este momento." },
      { status: 503 }
    );
  }

  const admin = createAdminClient();

  // ---- Rate limit (tabla sin policies: solo service role) ----
  const hace15 = new Date(Date.now() - 15 * 60_000).toISOString();
  const hace60 = new Date(Date.now() - 60 * 60_000).toISOString();
  const [porEmail, porIp] = await Promise.all([
    admin
      .from("cf_login_solicitudes")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("creado_en", hace15),
    ip
      ? admin
          .from("cf_login_solicitudes")
          .select("id", { count: "exact", head: true })
          .eq("ip", ip)
          .gte("creado_en", hace60)
      : Promise.resolve({ count: 0, error: null }),
  ]);
  if ((porEmail.count ?? 0) >= MAX_POR_EMAIL_15MIN || (porIp.count ?? 0) >= MAX_POR_IP_HORA) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Espera unos minutos y vuelve a intentar." },
      { status: 429 }
    );
  }
  await admin.from("cf_login_solicitudes").insert({ email, ip });
  // Limpieza oportunista: no acumulamos historial.
  void admin
    .from("cf_login_solicitudes")
    .delete()
    .lt("creado_en", new Date(Date.now() - 24 * 60 * 60_000).toISOString());

  // ---- Token del enlace (sin que Supabase envie nada) ----
  let link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error && /not found|no user|does not exist/i.test(link.error.message)) {
    const creado = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (creado.error) {
      console.error("[auth] createUser:", creado.error.message);
      return NextResponse.json(
        { ok: false, error: "No pudimos crear tu acceso. Intenta de nuevo." },
        { status: 500 }
      );
    }
    link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  }
  if (link.error || !link.data.properties?.hashed_token) {
    console.error("[auth] generateLink:", link.error?.message ?? "sin hashed_token");
    return NextResponse.json(
      { ok: false, error: "No pudimos generar tu enlace. Intenta de nuevo." },
      { status: 500 }
    );
  }
  const { hashed_token, verification_type } = link.data.properties;

  const origin = new URL(request.url).origin;
  const url = new URL("/auth/confirm", origin);
  url.searchParams.set("token_hash", hashed_token);
  url.searchParams.set("type", verification_type || "magiclink");
  url.searchParams.set("next", safeNext(body.next));
  const enlace = url.toString();

  // ---- Envio por Listmonk ----
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
