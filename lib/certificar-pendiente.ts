/**
 * Acta que alguien estaba certificando cuando se quedó sin créditos.
 *
 * El retorno de Flow siempre cae en /mis-creditos: sin esto, después de
 * pagar la persona no sabía volver al acta y tenía que buscarla. Se guarda
 * al mandar a comprar desde "Certificar" y /mis-creditos lo toma al volver
 * con el pago aprobado (máx. 3 horas, una sola vez).
 */

const CLAVE = "cf_certificar_pendiente";
const VIGENCIA_MS = 3 * 60 * 60 * 1000;

export function guardarCertificacionPendiente(actaId: string): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ actaId, en: Date.now() }));
  } catch {
    /* sin localStorage: sigue el flujo normal */
  }
}

export function tomarCertificacionPendiente(): string | null {
  try {
    const raw = localStorage.getItem(CLAVE);
    localStorage.removeItem(CLAVE);
    if (!raw) return null;
    const { actaId, en } = JSON.parse(raw) as { actaId?: string; en?: number };
    if (!actaId || !en || Date.now() - en > VIGENCIA_MS) return null;
    return actaId;
  } catch {
    return null;
  }
}
