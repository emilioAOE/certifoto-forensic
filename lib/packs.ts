/**
 * Catalogo de packs de creditos. Fuente unica de verdad para precios y
 * tamanios de pack. Usado por la pagina de precios, mis-creditos, el
 * formulario de contacto, el JSON-LD y el checkout con Flow (que cobra
 * `priceCLP`, el precio vigente).
 *
 * Precio de lista (decidido en planning):
 *   1  cert  = $2.990 CLP
 *   3  certs = $7.990 CLP
 *   10 certs = $24.900 CLP
 *   50 certs = $99.900 CLP (corredores grandes / administradoras)
 *
 * Precio de lanzamiento (sep-2026, "para partir"): -50% sobre la lista, con
 * cifras redondas chilenas. Se muestra el precio de lista tachado. Para
 * volver a lista basta LAUNCH_PRICING_ACTIVE = false.
 */

export interface Pack {
  id: "p1" | "p3" | "p10" | "p50";
  size: number; // cantidad de certificaciones
  /** Precio vigente: el que se muestra grande y el que cobra Flow. */
  priceCLP: number;
  /** Precio de lista (sin descuento). Se muestra tachado si hay lanzamiento. */
  listPriceCLP: number;
  /** % de descuento de lanzamiento sobre la lista (0 si no aplica). */
  launchDiscountPercent: number;
  /** Precio por unidad redondeado, sobre el precio vigente */
  unitPriceCLP: number;
  /** Etiqueta pensada para el publico */
  label: string;
  /** Descripcion corta (a quien apunta) */
  audience: string;
  /** % de ahorro vs comprar de a 1 (al precio vigente) */
  savingsPercent: number;
  highlighted?: boolean;
  badge?: string;
}

/** Interruptor del precio de lanzamiento. */
export const LAUNCH_PRICING_ACTIVE = true;
export const LAUNCH_PRICING_LABEL = "Precio de lanzamiento";

const LIST_PRICES: Record<Pack["id"], number> = {
  p1: 2990,
  p3: 7990,
  p10: 24900,
  p50: 99900,
};

const LAUNCH_PRICES: Record<Pack["id"], number> = {
  p1: 1490,
  p3: 3990,
  p10: 12490,
  p50: 49900,
};

function makePack(
  id: Pack["id"],
  size: number,
  label: string,
  audience: string,
  highlighted = false,
  badge?: string
): Pack {
  const listPriceCLP = LIST_PRICES[id];
  const priceCLP = LAUNCH_PRICING_ACTIVE ? LAUNCH_PRICES[id] : listPriceCLP;
  const launchDiscountPercent = LAUNCH_PRICING_ACTIVE
    ? Math.round((1 - priceCLP / listPriceCLP) * 100)
    : 0;
  const unitPriceCLP = Math.round(priceCLP / size);
  const baseUnit = LAUNCH_PRICING_ACTIVE ? LAUNCH_PRICES.p1 : LIST_PRICES.p1;
  const savingsPercent = size === 1 ? 0 : Math.round((1 - unitPriceCLP / baseUnit) * 100);
  return {
    id,
    size,
    priceCLP,
    listPriceCLP,
    launchDiscountPercent,
    unitPriceCLP,
    label,
    audience,
    savingsPercent,
    highlighted,
    badge,
  };
}

export const PACKS: Pack[] = [
  makePack("p1", 1, "1 certificación", "Para una entrega o devolución puntual"),
  makePack(
    "p3",
    3,
    "3 certificaciones",
    "Ideal para arrendadores con varios contratos al año",
    true,
    "Popular"
  ),
  makePack(
    "p10",
    10,
    "10 certificaciones",
    "Para corredores que documentan varias propiedades al mes"
  ),
  makePack(
    "p50",
    50,
    "50 certificaciones",
    "Corredoras y administradoras con cartera grande",
    false,
    "Pro"
  ),
];

export function findPack(id: Pack["id"]): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

export function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}
