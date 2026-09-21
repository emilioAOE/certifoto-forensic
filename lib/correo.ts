import "server-only";

/**
 * Avisos transaccionales por correo via Listmonk (infra compartida de
 * Expansiel: Listmonk en AWS + SES). Solo servidor: nunca importar desde
 * componentes cliente.
 *
 * Reglas de la infra compartida (cada una salio de un problema real):
 *  - `subscriber_mode: "external"` SIEMPRE: sin eso Listmonk responde 400 y,
 *    ademas, un flujo transaccional nunca inscribe a nadie en marketing.
 *  - `from_email` explicito: si falta, el correo sale firmado por otro sitio.
 *  - Reply-To al remitente real: certifoto.cl NO tiene MX (no recibe correo);
 *    si Emilio responde un aviso sin Reply-To, la respuesta rebota.
 *  - Escapar TODO lo que venga de un formulario: la plantilla renderiza el
 *    cuerpo con `| Safe` (sin escapar).
 *  - Un 200 de /api/tx significa "aceptado", no "entregado".
 *
 * Variables de entorno (Vercel): LISTMONK_URL, LISTMONK_API_USER,
 * LISTMONK_API_TOKEN, LISTMONK_TX_TEMPLATE (id de la plantilla "pasamanos",
 * cuerpo = {{ .Tx.Data.cuerpo | Safe }}), LEAD_NOTIFY_EMAIL, LEAD_FROM.
 */

export interface AvisoOpts {
  asunto: string;
  html: string;
  texto?: string;
  /** Email del cliente: va como Reply-To para poder contestarle. */
  responderA?: string;
}

export interface AvisoResult {
  ok: boolean;
  error?: string;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

export function correoConfigurado(): boolean {
  return Boolean(
    env("LISTMONK_URL") &&
      env("LISTMONK_API_USER") &&
      env("LISTMONK_API_TOKEN") &&
      env("LEAD_NOTIFY_EMAIL")
  );
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Tabla HTML simple (valores ya escapados aqui) para avisos internos. */
export function renderAviso(
  titulo: string,
  filas: Array<[string, string | null | undefined]>,
  nota?: string
): { html: string; texto: string } {
  const rows = filas
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(
          k
        )}</td><td style="padding:6px 10px;font-size:14px;color:#111827">${escapeHtml(
          String(v)
        ).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px">
  <h2 style="font-size:18px;margin:0 0 12px;color:#111827">${escapeHtml(titulo)}</h2>
  <table style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px">${rows}</table>
  ${nota ? `<p style="font-size:12px;color:#6b7280;margin-top:12px">${escapeHtml(nota)}</p>` : ""}
</div>`;
  const texto = [
    titulo,
    "",
    ...filas
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
      .map(([k, v]) => `${k}: ${String(v)}`),
    ...(nota ? ["", nota] : []),
  ].join("\n");
  return { html, texto };
}

/**
 * Envia un aviso a LEAD_NOTIFY_EMAIL. Nunca lanza: devuelve { ok:false } si
 * falta configuracion o Listmonk rechaza. Nunca registra el token.
 */
export async function avisar(o: AvisoOpts): Promise<AvisoResult> {
  const url = env("LISTMONK_URL")?.replace(/\/+$/, "");
  const user = env("LISTMONK_API_USER");
  const token = env("LISTMONK_API_TOKEN");
  const to = env("LEAD_NOTIFY_EMAIL");
  if (!url || !user || !token || !to) {
    return { ok: false, error: "correo no configurado" };
  }

  const body = {
    subscriber_email: to,
    subscriber_mode: "external",
    template_id: Number(env("LISTMONK_TX_TEMPLATE")) || 6,
    from_email: env("LEAD_FROM") ?? "CertiFoto <hola@certifoto.cl>",
    subject: o.asunto,
    content_type: "html",
    data: { cuerpo: o.html },
    ...(o.texto ? { altbody: o.texto } : {}),
    ...(o.responderA ? { headers: [{ "Reply-To": o.responderA }] } : {}),
  };

  try {
    const res = await fetch(`${url}/api/tx`, {
      method: "POST",
      headers: {
        Authorization: `token ${user}:${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      console.error("[correo] listmonk respondio", res.status, detalle.slice(0, 300));
      return { ok: false, error: `listmonk ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[correo] fallo de red:", msg);
    return { ok: false, error: msg };
  }
}
