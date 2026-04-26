/**
 * Distancia de Hamming entre perceptual hashes (pHashes).
 *
 * pHash es una huella perceptual de imagen: dos fotos visualmente similares
 * tienen pHashes con pocos bits distintos. La distancia de Hamming cuenta
 * cuantos bits difieren.
 *
 * - Mismo encuadre, misma imagen: distancia 0
 * - Misma escena con re-compresion, ligero zoom o crop: ~1-10
 * - Misma escena con cambios visibles: ~10-25
 * - Imagenes distintas: 25-32+ (sobre 64 bits tipicos)
 *
 * Si los pHashes son strings de bits ("011010..."), comparamos directo.
 * Si son hex, convertimos. Si son null o de longitudes diferentes, devolvemos
 * Infinity (no comparable).
 */

export function hammingDistance(a: string | null, b: string | null): number {
  if (!a || !b) return Infinity;

  // Si parecen bits (solo 0 y 1)
  if (/^[01]+$/.test(a) && /^[01]+$/.test(b) && a.length === b.length) {
    let count = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) count++;
    }
    return count;
  }

  // Si parecen hex
  if (/^[0-9a-fA-F]+$/.test(a) && /^[0-9a-fA-F]+$/.test(b) && a.length === b.length) {
    let count = 0;
    for (let i = 0; i < a.length; i++) {
      const da = parseInt(a[i], 16);
      const db = parseInt(b[i], 16);
      let xor = da ^ db;
      while (xor) {
        count += xor & 1;
        xor >>= 1;
      }
    }
    return count;
  }

  return Infinity;
}

/**
 * Clasifica una distancia en niveles de cambio.
 */
export type ChangeLevel = "identical" | "minor" | "moderate" | "major" | "unknown";

export function classifyChange(distance: number, hashLength = 64): ChangeLevel {
  if (!isFinite(distance)) return "unknown";
  // Normalizar a porcentaje de bits distintos
  const pct = (distance / hashLength) * 100;
  if (pct < 2) return "identical"; // < 2% = practicamente identico
  if (pct < 10) return "minor"; // re-compresion, leve diferencia
  if (pct < 25) return "moderate"; // cambio visible
  return "major"; // imagen muy diferente
}

export const CHANGE_LEVEL_LABEL: Record<ChangeLevel, string> = {
  identical: "Sin cambios",
  minor: "Cambio menor",
  moderate: "Cambio moderado",
  major: "Cambio importante",
  unknown: "No comparable",
};

export const CHANGE_LEVEL_COLOR: Record<ChangeLevel, string> = {
  identical: "bg-emerald-50 text-emerald-700 border-emerald-200",
  minor: "bg-blue-50 text-blue-700 border-blue-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  major: "bg-red-50 text-red-700 border-red-200",
  unknown: "bg-gray-100 text-gray-600 border-gray-200",
};
