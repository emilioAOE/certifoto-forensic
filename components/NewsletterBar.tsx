"use client";

import { useState, useEffect } from "react";

// ───────────────────────────────────────────────────────────────────────────
// Barra de captura de newsletter → Analytics Hub de Expansiel.
// El email cae en la tabla `events`: event_type='newsletter_signup',
// payload = { email, source: 'top-bar' }. Aparece en la sección Newsletters
// del dashboard (analytics.expansiel.com).
//   • Cambiá SITE_ID por el id del sitio en la tabla `sites` del hub.
//   • Ajustá COPY / SUCCESS / BUTTON y, si querés, los colores a la marca.
// Sin dependencias externas (estilos inline) → funciona en cualquier Next.js.
// ───────────────────────────────────────────────────────────────────────────
const SITE_ID = "certifoto";
const HUB = "https://alksowkwsnjeesmnosvg.supabase.co/rest/v1/events";
const KEY = "sb_publishable_uR65ixdIedeOR8Zo-PKNsA_nBJF8W3F";
const DISMISS = "newsletter_bar_dismissed";

// Colores (ajustados a la marca CertiFoto — verde):
const BG = "#14532d";
const FG = "#ffffff";
const BTN_BG = "#16a34a";
const BTN_FG = "#ffffff";

export default function NewsletterBar() {
  const [hidden, setHidden] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS)) setHidden(true); } catch {}
  }, []);

  function dismiss() {
    setHidden(true);
    try { localStorage.setItem(DISMISS, "1"); } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(HUB, {
        method: "POST",
        headers: {
          apikey: KEY,
          Authorization: "Bearer " + KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          site_id: SITE_ID,
          event_type: "newsletter_signup",
          payload: { email, source: "top-bar" },
          url: window.location.href,
          referrer: document.referrer || null,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        try { localStorage.setItem(DISMISS, "1"); } catch {}
        setTimeout(() => setHidden(true), 3500);
      } else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (hidden) return null;

  return (
    <div style={{ background: BG, color: FG, width: "100%", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "9px 38px 9px 16px", position: "relative" }}>
        {status === "success" ? (
          <p style={{ textAlign: "center", fontSize: 14, fontWeight: 600, margin: 0 }}>
            ¡Listo, quedaste conectado!
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <p style={{ fontSize: 14, margin: 0, lineHeight: 1.35, flex: "1 1 260px" }}>
              📸 <strong>Protege tus derechos con pruebas que valen.</strong> Tips de evidencia certificada a tu correo, sin spam.
            </p>
            <form onSubmit={submit} style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="tu@email.com" aria-label="Tu correo electrónico"
                style={{ padding: "7px 11px", borderRadius: 6, border: "none", fontSize: 14, minWidth: 190, color: "#111827" }}
              />
              <button type="submit" disabled={status === "loading"}
                style={{ padding: "7px 15px", borderRadius: 6, border: "none", background: BTN_BG, color: BTN_FG, fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
                {status === "loading" ? "..." : "Quiero recibirlos"}
              </button>
            </form>
            {status === "error" && (
              <span style={{ fontSize: 12, opacity: 0.9 }}>Error, inténtalo de nuevo.</span>
            )}
          </div>
        )}
        <button onClick={dismiss} aria-label="Cerrar"
          style={{ position: "absolute", top: 7, right: 10, background: "none", border: "none", color: "inherit", opacity: 0.7, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 2 }}>
          ✕
        </button>
      </div>
    </div>
  );
}
