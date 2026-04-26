/**
 * Validadores y formateadores comunes para CertiFoto.
 *
 * Incluye:
 * - RUT chileno (validacion + formato)
 * - Email
 * - Pesos chilenos (CLP)
 * - Fechas
 */

// ============================================
// RUT chileno
// ============================================

/**
 * Limpia un RUT a su forma canonica: sin puntos, sin guion, en mayusculas.
 * "12.345.678-K" → "12345678K"
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, "").toUpperCase();
}

/**
 * Calcula el digito verificador de un RUT.
 * Implementacion del algoritmo modulo 11 oficial.
 */
export function computeRutDv(rutBody: string): string {
  const cleanBody = rutBody.replace(/\D/g, "");
  if (!cleanBody) return "";
  let sum = 0;
  let multiplier = 2;
  for (let i = cleanBody.length - 1; i >= 0; i--) {
    sum += parseInt(cleanBody[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/**
 * Valida un RUT chileno completo (cuerpo + DV).
 * Acepta varios formatos: "12.345.678-9", "12345678-9", "12345678K".
 * Devuelve true si el DV calculado coincide con el provisto.
 */
export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeRutDv(body) === dv;
}

/**
 * Formatea un RUT a "12.345.678-9".
 * Si el input es invalido, devuelve la entrada normalizada lo mejor posible.
 */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  // Agregar puntos cada 3 digitos desde la derecha
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

// ============================================
// Email
// ============================================

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

// ============================================
// Pesos chilenos (CLP)
// ============================================

/**
 * Formatea un numero como pesos chilenos: 450000 → "$ 450.000".
 */
export function formatCLP(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseInt(value.replace(/\D/g, ""), 10) : value;
  if (isNaN(num)) return "";
  return "$ " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parsea un texto con formato CLP a numero. "$ 450.000" → 450000.
 */
export function parseCLP(text: string): number | null {
  if (!text) return null;
  const digits = text.replace(/\D/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return isNaN(n) ? null : n;
}

// ============================================
// Telefono chileno
// ============================================

/**
 * Formatea un telefono chileno: "+56 9 1234 5678" o "+56 2 2345 6789".
 * Heuristica simple, mejor para celulares (9 digitos despues de +56).
 */
export function formatPhoneCL(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 9 && clean.startsWith("9")) {
    return `+56 ${clean[0]} ${clean.slice(1, 5)} ${clean.slice(5)}`;
  }
  if (clean.length === 11 && clean.startsWith("569")) {
    return `+56 ${clean[2]} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  if (clean.length === 11 && clean.startsWith("562")) {
    return `+56 ${clean[2]} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  return phone;
}

export function isValidPhoneCL(phone: string): boolean {
  const clean = phone.replace(/\D/g, "");
  return clean.length >= 8 && clean.length <= 12;
}

// ============================================
// Fechas
// ============================================

/**
 * Parsea fechas en formato chileno: "12/04/2026", "12-04-2026", "12 de abril 2026".
 * Devuelve YYYY-MM-DD o null.
 */
export function parseChileanDate(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim().toLowerCase();

  // dd/mm/yyyy o dd-mm-yyyy
  const numeric = trimmed.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (numeric) {
    const day = numeric[1].padStart(2, "0");
    const month = numeric[2].padStart(2, "0");
    let year = numeric[3];
    if (year.length === 2) year = "20" + year;
    return `${year}-${month}-${day}`;
  }

  // dd de mes de yyyy
  const months: Record<string, string> = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    setiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };
  const verbose = trimmed.match(
    /(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?(\d{4})/
  );
  if (verbose) {
    const day = verbose[1].padStart(2, "0");
    const month = months[verbose[2]];
    const year = verbose[3];
    if (month) return `${year}-${month}-${day}`;
  }

  return null;
}

export function isValidISODate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}
