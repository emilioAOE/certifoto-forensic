import { NextResponse } from "next/server";

/**
 * Captura de leads del lead magnet (plantilla PDF de acta de entrega).
 *
 * El sitio no tiene base de datos. Este endpoint entrega el lead por email
 * usando el proveedor que esté configurado por variable de entorno:
 *
 *  - WEB3FORMS_ACCESS_KEY  -> POST a Web3Forms (gratis, sin backend; el lead
 *                             llega a tu correo). Recomendado.
 *  - RESEND_API_KEY (+ LEAD_NOTIFY_EMAIL, opcional LEAD_FROM) -> Resend.
 *
 * Si no hay ninguna configurada, el lead se registra en los logs y el endpoint
 * igual responde ok: la descarga del PDF NUNCA se bloquea por un fallo de envío.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadBody = {
  email?: string;
  name?: string;
  source?: string;
  company?: string; // honeypot — si viene con valor, es bot
};

async function deliver(lead: {
  email: string;
  name: string;
  source: string;
}): Promise<boolean> {
  const web3 = process.env.WEB3FORMS_ACCESS_KEY;
  const resend = process.env.RESEND_API_KEY;

  if (web3) {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: web3,
        subject: "Nuevo lead — plantilla acta de entrega",
        from_name: "CertiFoto",
        email: lead.email,
        name: lead.name || "(sin nombre)",
        message: `Descarga de la plantilla de acta de entrega.\nNombre: ${
          lead.name || "(sin nombre)"
        }\nEmail: ${lead.email}\nOrigen: ${lead.source}`,
      }),
    });
    return res.ok;
  }

  if (resend) {
    const to = process.env.LEAD_NOTIFY_EMAIL;
    if (!to) {
      console.warn("[lead] RESEND_API_KEY sin LEAD_NOTIFY_EMAIL: no se envía.");
      return false;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_FROM || "CertiFoto <onboarding@resend.dev>",
        to: [to],
        reply_to: lead.email,
        subject: "Nuevo lead — plantilla acta de entrega",
        html: `<p>Nueva descarga de la plantilla de acta de entrega.</p>
<ul>
  <li><strong>Nombre:</strong> ${escapeHtml(lead.name || "(sin nombre)")}</li>
  <li><strong>Email:</strong> ${escapeHtml(lead.email)}</li>
  <li><strong>Origen:</strong> ${escapeHtml(lead.source)}</li>
</ul>`,
      }),
    });
    return res.ok;
  }

  // Sin proveedor configurado: dejamos rastro en logs.
  console.log(
    `[lead] (sin proveedor de email) ${lead.email} · ${lead.name} · ${lead.source}`
  );
  return false;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot: si el campo oculto viene lleno, fingimos éxito y descartamos.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Email inválido" },
      { status: 400 }
    );
  }

  const lead = {
    email,
    name: (body.name || "").trim().slice(0, 120),
    source: (body.source || "plantilla-acta-entrega").trim().slice(0, 80),
  };

  let delivered = false;
  try {
    delivered = await deliver(lead);
  } catch (err) {
    // Nunca bloqueamos la descarga por un fallo de entrega.
    console.error("[lead] fallo al entregar:", (err as Error).message);
  }

  return NextResponse.json({ ok: true, delivered });
}
