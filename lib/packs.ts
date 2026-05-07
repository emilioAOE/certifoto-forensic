/**
 * Catalogo de packs de creditos. Fuente unica de verdad para precios y
 * tamanios de pack. Usado por la pagina de precios, mis-creditos y el
 * formulario de contacto (para pre-llenar el asunto).
 *
 * Precios y tamanios decididos en planning:
 *   1  cert  = $2.990 CLP
 *   3  certs = $7.990 CLP
 *   10 certs = $24.900 CLP
 *   50 certs = $99.900 CLP (corredores grandes / administradoras)
 */

export interface Pack {
  id: "p1" | "p3" | "p10" | "p50";
  size: number; // cantidad de certificaciones
  priceCLP: number;
  /** Precio por unidad redondeado, para mostrar el ahorro */
  unitPriceCLP: number;
  /** Etiqueta pensada para el publico */
  label: string;
  /** Descripcion corta (a quien apunta) */
  audience: string;
  /** % de ahorro vs comprar 1 a 1 */
  savingsPercent: number;
  highlighted?: boolean;
  badge?: string;
}

const BASE_UNIT = 2990;

function makePack(
  id: Pack["id"],
  size: number,
  priceCLP: number,
  label: string,
  audience: string,
  highlighted = false,
  badge?: string
): Pack {
  const unitPriceCLP = Math.round(priceCLP / size);
  const savingsPercent =
    size === 1 ? 0 : Math.round((1 - unitPriceCLP / BASE_UNIT) * 100);
  return {
    id,
    size,
    priceCLP,
    unitPriceCLP,
    label,
    audience,
    savingsPercent,
    highlighted,
    badge,
  };
}

export const PACKS: Pack[] = [
  makePack(
    "p1",
    1,
    2990,
    "1 certificacion",
    "Para una entrega o devolucion puntual"
  ),
  makePack(
    "p3",
    3,
    7990,
    "3 certificaciones",
    "Ideal para arrendadores con varios contratos al ano",
    true,
    "Popular"
  ),
  makePack(
    "p10",
    10,
    24900,
    "10 certificaciones",
    "Para corredores que documentan varias propiedades al mes"
  ),
  makePack(
    "p50",
    50,
    99900,
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
