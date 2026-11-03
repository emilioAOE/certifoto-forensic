// cf-pedido-archivos — archivos del certificado express (bucket cf-pedidos).
//
// El bucket no tiene políticas para anon: si las tuviera, cualquiera podría
// listar la raíz y descubrir los tokens de otros pedidos. En cambio, esta
// función (service role, que nunca sale de Supabase) emite URLs firmadas:
//   - "subir": URLs de subida para <token>/<archivo> (fotos, acta.json, pdf).
//   - "leer":  URLs de descarga (10 min) para recuperar un pedido pagado desde
//              otro navegador y para que Vercel adjunte el PDF al correo.
//   - "limpiar": borra archivos de pedidos no pagados (> 3 días) y de pedidos
//              pagados antiguos (> 90 días; la fila con la huella se conserva).
// "subir" y "leer" exigen el secreto de pagos de CertiFoto (x-certifoto-secret,
// sha256 en cf_config 'pagos_secret_sha256'); quien lo tiene (Vercel) además
// debe conocer el token del pedido. "limpiar" no necesita secreto: solo borra
// lo vencido. Auth propia => verify_jwt desactivado a propósito.
//
// Desplegada en supabase-expansiel-landing (alksowkwsnjeesmnosvg). Este
// archivo es la copia de referencia (carpeta excluida del tsconfig de Next).

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "cf-pedidos";
const TOKEN_RE = /^[0-9a-f]{32}$/;
const NOMBRE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const MAX_ARCHIVOS = 80;

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

function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

type Admin = ReturnType<typeof createClient>;

async function limpiar(admin: Admin): Promise<Response> {
  const d3 = new Date(Date.now() - 3 * 86400_000).toISOString();
  const d90 = new Date(Date.now() - 90 * 86400_000).toISOString();
  const { data, error } = await admin
    .from("cf_pedidos")
    .select("token, estado")
    .or(`and(estado.neq.pagado,creado_en.lt.${d3}),and(estado.eq.pagado,pagado_en.lt.${d90},archivos_borrados_en.is.null)`)
    .limit(200);
  if (error) return json(500, { error: "consulta", detalle: error.message });

  let archivos = 0, filas = 0, marcados = 0;
  for (const p of (data ?? []) as { token: string; estado: string }[]) {
    const { data: lista } = await admin.storage.from(BUCKET).list(p.token, { limit: 1000 });
    const rutas = (lista ?? []).map((o) => `${p.token}/${o.name}`);
    if (rutas.length > 0) {
      const { error: errBorrar } = await admin.storage.from(BUCKET).remove(rutas);
      if (errBorrar) continue; // se reintenta mañana
      archivos += rutas.length;
    }
    if (p.estado === "pagado") {
      await admin.from("cf_pedidos").update({ archivos_borrados_en: new Date().toISOString() }).eq("token", p.token);
      marcados++;
    } else {
      await admin.from("cf_pedidos").delete().eq("token", p.token);
      filas++;
    }
  }
  return json(200, { ok: true, archivos, pedidos_borrados: filas, pedidos_marcados: marcados });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: { op?: unknown; token?: unknown; rutas?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_json" });
  }
  const op = String(body.op ?? "");

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (op === "limpiar") return limpiar(admin);
  if (op !== "subir" && op !== "leer") return json(400, { error: "bad_op" });

  // Secreto de pagos de CertiFoto.
  const provisto = req.headers.get("x-certifoto-secret") ?? "";
  const { data: cfg, error: cfgErr } = await admin
    .from("cf_config")
    .select("valor")
    .eq("clave", "pagos_secret_sha256")
    .maybeSingle();
  if (cfgErr || !cfg?.valor) return json(500, { error: "config" });
  if (!provisto || !iguales(await sha256Hex(provisto), cfg.valor as string)) {
    return json(401, { error: "unauthorized" });
  }

  const token = String(body.token ?? "");
  if (!TOKEN_RE.test(token)) return json(400, { error: "bad_token" });
  const { data: pedido } = await admin.from("cf_pedidos").select("token, estado").eq("token", token).maybeSingle();
  if (!pedido) return json(404, { error: "not_found" });

  const rutas = Array.isArray(body.rutas) ? body.rutas.filter((r): r is string => typeof r === "string") : [];
  if (rutas.length === 0 || rutas.length > MAX_ARCHIVOS || rutas.some((r) => !NOMBRE_RE.test(r))) {
    return json(400, { error: "bad_rutas" });
  }
  const paths = rutas.map((r) => `${token}/${r}`);

  if (op === "subir") {
    const urls = [];
    for (const path of paths) {
      const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true });
      if (error || !data) return json(500, { error: "firmar_subida", detalle: error?.message });
      urls.push({ path, token: data.token });
    }
    return json(200, { ok: true, urls });
  }

  const { data, error } = await admin.storage.from(BUCKET).createSignedUrls(paths, 600);
  if (error || !data) return json(500, { error: "firmar_lectura", detalle: error?.message });
  return json(200, {
    ok: true,
    urls: data.map((d) => ({ path: d.path, url: d.signedUrl || null, error: d.error || null })),
  });
});
