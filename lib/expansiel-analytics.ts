// Cliente de analytics de Expansiel (Analytics Hub). Aditivo: no rompe el sitio.
// Catalogo de eventos: ver EVENTS.md en el repo analytics-hub.
const ANALYTICS_URL = "https://alksowkwsnjeesmnosvg.supabase.co/rest/v1/events";
const ANALYTICS_KEY = "sb_publishable_uR65ixdIedeOR8Zo-PKNsA_nBJF8W3F";
const SITE_ID = "certifoto";

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

export async function track(
  eventType: string,
  payload: Record<string, unknown> = {},
  opts: { userId?: string | null } = {}
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch(ANALYTICS_URL, {
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
        payload,
        url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      }),
      keepalive: true,
    });
  } catch {
    // Analytics nunca debe romper el sitio.
  }
}

export function trackPageview(): void {
  void track("pageview");
}
