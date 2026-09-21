/**
 * Píxel de Meta (Facebook/Instagram Ads): medición de campañas.
 *
 * Se activa solo si existe NEXT_PUBLIC_META_PIXEL_ID (Vercel). Sin ID, todo
 * es un no-op: el sitio no carga nada de Meta. El script lo monta
 * components/MetaPixel.tsx; desde el resto de la app se usa `pixel()`.
 *
 * Eventos que enviamos (estándar de Meta salvo el custom):
 *  - PageView            cada cambio de ruta (MetaPixel.tsx)
 *  - Lead                descarga de la plantilla (PlantillaLeadMagnet)
 *  - CompleteRegistration primer login (SessionBootstrap, evento signup)
 *  - ActaCreada (custom) el asistente guarda un acta (ActaWizard)
 *  - InitiateCheckout    clic en "Comprar pack" con sesión (PacksGrid)
 *  - Purchase            vuelta de Flow con pago=pagado (MisCreditosPage),
 *                        con value/currency y eventID = commerce_order
 *
 * En Meta Ads, las conversiones a optimizar son ActaCreada (volumen) y
 * Purchase (dinero). El mismo recorrido queda también en el Analytics Hub
 * (lib/expansiel-analytics.ts), que no depende de Meta.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();

export function pixelActivo(): boolean {
  return META_PIXEL_ID.length > 0;
}

export interface PixelOpts {
  /** Evento propio (trackCustom) en vez de uno estándar de Meta. */
  custom?: boolean;
  /** Deduplicación: mismo eventID en navegador y servidor cuenta una vez. */
  eventID?: string;
}

/** Envía un evento al píxel. Nunca lanza; sin píxel cargado no hace nada. */
export function pixel(
  evento: string,
  params: Record<string, unknown> = {},
  opts: PixelOpts = {}
): void {
  if (typeof window === "undefined") return;
  const fbq = window.fbq;
  if (typeof fbq !== "function") return;
  try {
    const modo = opts.custom ? "trackCustom" : "track";
    if (opts.eventID) fbq(modo, evento, params, { eventID: opts.eventID });
    else fbq(modo, evento, params);
  } catch {
    /* el píxel no puede romper la app */
  }
}
