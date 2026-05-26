// Cliente de analytics de Expansiel (Analytics Hub). Aditivo: no rompe el sitio.
// Auto-trackea pageview + whatsapp_click + form_submit + tel_click + mailto_click
// (listeners globales, sin instrumentar cada boton/form). Captura pais (GeoJS,
// 1 request por sesion, cacheado), timezone e idioma. Forms: solo metadata, sin PII.
// Catalogo de eventos: ver EVENTS.md en el repo analytics-hub.

const ANALYTICS_URL = "https://alksowkwsnjeesmnosvg.supabase.co/rest/v1/events";
const ANALYTICS_KEY = "sb_publishable_uR65ixdIedeOR8Zo-PKNsA_nBJF8W3F";
const SITE_ID = "certifoto";

type Geo = { country: string | null; city: string | null; region: string | null };
const EMPTY_GEO: Geo = { country: null, city: null, region: null };

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const KEY = "ex_sid";
    let sid = window.localStorage.getItem(KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()) + Math.random().toString(16).slice(2);
      window.localStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return "no-storage";
  }
}

function readGeo(): Geo {
  if (typeof window === "undefined") return EMPTY_GEO;
  try {
    const c = window.localStorage.getItem("ex_geo");
    if (c) return JSON.parse(c) as Geo;
  } catch {}
  return EMPTY_GEO;
}

function ensureGeo(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem("ex_geo")) return;
  } catch {
    return;
  }
  fetch("https://get.geojs.io/v1/ip/geo.json")
    .then((r) => r.json())
    .then((j) => {
      try {
        window.localStorage.setItem(
          "ex_geo",
          JSON.stringify({
            country: j.country_code || j.country || null,
            city: j.city || null,
            region: j.region || null,
          })
        );
      } catch {}
    })
    .catch(() => {});
}

function tz(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export function track(
  eventType: string,
  payload: Record<string, unknown> = {},
  opts: { userId?: string | null } = {}
): void {
  if (typeof window === "undefined") return;
  try {
    const geo = readGeo();
    fetch(ANALYTICS_URL, {
      method: "POST",
      headers: {
        apikey: ANALYTICS_KEY,
        Authorization: `Bearer ${ANALYTICS_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        site_id: SITE_ID,
        event_type: eventType,
        session_id: getSessionId(),
        user_id: opts.userId ?? null,
        payload: {
          ...payload,
          tz: tz(),
          lang: navigator.language,
          city: geo.city,
          region: geo.region,
        },
        url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        country: geo.country,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics nunca debe romper el sitio.
  }
}

export function trackPageview(): void {
  track("pageview");
}

let autoBound = false;
export function initAutoTracking(): void {
  if (typeof window === "undefined" || autoBound) return;
  autoBound = true;
  ensureGeo();

  document.addEventListener(
    "click",
    (e) => {
      try {
        const target = e.target as HTMLElement | null;
        const a = target && target.closest ? target.closest("a") : null;
        if (!a) return;
        const href = a.getAttribute("href") || "";
        const text = (a.textContent || "").trim().slice(0, 80);
        if (/wa\.me|whatsapp\.com|api\.whatsapp/i.test(href)) {
          track("whatsapp_click", { href, text });
        } else if (/^tel:/i.test(href)) {
          track("tel_click", { href, text });
        } else if (/^mailto:/i.test(href)) {
          track("mailto_click", { href, text });
        }
      } catch {}
    },
    true
  );

  document.addEventListener(
    "submit",
    (e) => {
      try {
        const form = e.target as HTMLFormElement | null;
        if (!form || form.tagName !== "FORM") return;
        const names: string[] = [];
        const values: Record<string, string> = {};
        let hasEmail = false;
        let hasPhone = false;
        const SKIP = ["password", "hidden", "file", "submit", "button", "reset"];
        for (const el of Array.from(form.elements)) {
          const f = el as HTMLInputElement;
          const n = (f.name || f.id || "").toString();
          const type = (f.type || "").toString().toLowerCase();
          if (n) names.push(n);
          if (type === "email" || /mail/i.test(n)) hasEmail = true;
          if (type === "tel" || /phone|tel|celular|fono|whats/i.test(n)) hasPhone = true;
          if (n && f.value && !SKIP.includes(type)) {
            if ((type === "checkbox" || type === "radio") && !f.checked) continue;
            values[n] = String(f.value).slice(0, 500);
          }
        }
        const payload: Record<string, unknown> = {
          form_id: form.id || null,
          form_name: form.getAttribute("name") || null,
          action: form.getAttribute("action") || null,
          field_count: names.length,
          fields: names.slice(0, 30),
          has_email: hasEmail,
          has_phone: hasPhone,
        };
        // Capturamos los valores del form siempre (con SKIP de password/hidden/file/submit).
        // Util para forms de interaccion (evaluadores, wizards, encuestas, etc).
        payload.values = values;
        track("form_submit", payload);
      } catch {}
    },
    true
  );
}
