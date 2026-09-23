export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatExposure(seconds: number): string {
  if (seconds >= 1) return `${seconds} s`;
  const denominator = Math.round(1 / seconds);
  return `1/${denominator} s`;
}

export function formatCoordinate(
  decimal: number,
  isLat: boolean
): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(2);
  const dir = isLat
    ? decimal >= 0
      ? "N"
      : "S"
    : decimal >= 0
    ? "E"
    : "W";
  return `${deg}\u00B0 ${min}' ${sec}" ${dir}`;
}

export function formatGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function formatDate(value: Date | string | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatFlash(value: number | string | null): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  const fired = (value & 0x01) !== 0;
  return fired ? "Disparado" : "No disparado";
}

/**
 * Fecha sin hora ("YYYY-MM-DD", como inspectionDate o las del contrato) a
 * medianoche LOCAL. `new Date("2026-09-23")` es medianoche UTC: en Chile eso
 * es el 22 a las 21:00 y el acta certificada salía con un día menos.
 */
export function fechaLocal(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
}

/** Hoy como "YYYY-MM-DD" en la zona del dispositivo (toISOString es UTC). */
export function hoyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
