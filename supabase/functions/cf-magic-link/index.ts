// cf-magic-link — genera el token del magic link de CertiFoto SIN que la
// service role key salga de Supabase. CertiFoto (Vercel) la llama con un
// secreto acotado (x-certifoto-secret); aqui solo vive su sha256 (cf_config).
// Se niega a generar enlaces para usuarios de OTROS productos del proyecto
// compartido (existen en auth.users sin perfil cf_), asi un secreto filtrado
// de CertiFoto no puede tomar cuentas de Tasaciones u otros.
// Auth propia (secreto) => verify_jwt desactivado a proposito.
//
// Desplegada en el proyecto supabase-expansiel-landing (alksowkwsnjeesmnosvg).
// Este archivo es la copia de referencia; el deploy se hace con el MCP/CLI de
// Supabase (esta carpeta esta excluida del tsconfig de Next: es codigo Deno).
// Depende de: cf_config, cf_email_es_de_otro_producto(), cf_login_permitir(),
// cf_perfiles (ver supabase/migrations).

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", Connection: "keep-alive" },
  });
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Comparacion en tiempo constante.
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Secreto acotado de CertiFoto.
  const provisto = req.headers.get("x-certifoto-secret") ?? "";
  const { data: cfg, error: cfgErr } = await admin
    .from("cf_config")
    .select("valor")
    .eq("clave", "link_secret_sha256")
    .maybeSingle();
  if (cfgErr || !cfg?.valor) return json(500, { error: "config" });
  if (!provisto || !iguales(await sha256Hex(provisto), cfg.valor)) {
    return json(401, { error: "unauthorized" });
  }

  // 2. Entrada.
  let body: { email?: unknown; ip?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_json" });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const ip = typeof body.ip === "string" && body.ip ? body.ip.slice(0, 64) : null;
  if (!EMAIL_RE.test(email) || email.length > 200) return json(400, { error: "bad_email" });

  // 3. Aislamiento entre productos (antes de cualquier efecto).
  const ajeno = await admin.rpc("cf_email_es_de_otro_producto", { p_email: email });
  if (ajeno.error) return json(500, { error: "scope_check" });
  if (ajeno.data === true) return json(403, { error: "email_de_otro_producto" });

  // 4. Rate limit atomico (3 por correo / 15 min, 10 por IP / hora).
  const permitido = await admin.rpc("cf_login_permitir", { p_email: email, p_ip: ip });
  if (permitido.error) return json(500, { error: "rate_limit_check" });
  if (permitido.data !== true) return json(429, { error: "rate_limited" });

  // 5. Token del enlace. Supabase NO envia correo aqui. Si el usuario no
  // existe, generateLink lo crea por si mismo (verification_type "signup");
  // la rama de createUser queda por si alguna version responde "not found".
  let link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error && /not found|no user|does not exist/i.test(link.error.message)) {
    const creado = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (creado.error || !creado.data.user) return json(500, { error: "create_user" });
    link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  }
  if (link.error || !link.data.properties?.hashed_token) {
    return json(500, { error: "generate_link" });
  }

  // 6. Membresia CertiFoto SIEMPRE (sin pisar nombre/rol si ya existe). Sin
  // esta fila, el siguiente intento se confundiria con un usuario ajeno.
  const uid = link.data.user?.id;
  if (uid) {
    const perfil = await admin
      .from("cf_perfiles")
      .upsert({ user_id: uid, email }, { onConflict: "user_id", ignoreDuplicates: true });
    if (perfil.error) return json(500, { error: "perfil" });
  }

  // email_otp: el codigo de 6 digitos del MISMO token. Va en el correo para
  // quien abrio CertiFoto dentro de Instagram/Facebook: el enlace se abre en
  // otro navegador (donde no esta su acta local) y el codigo lo deja entrar
  // en el mismo. Tan sensible como hashed_token: nunca se registra.
  return json(200, {
    hashed_token: link.data.properties.hashed_token,
    verification_type: link.data.properties.verification_type ?? "magiclink",
    email_otp: link.data.properties.email_otp ?? null,
  });
});
