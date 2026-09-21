/**
 * Fuentes legales que se citan al pie de cada artículo del blog.
 *
 * Antes se citaba lo mismo en todos (Ley del Consumidor + Código de
 * Procedimiento Civil), incluso en artículos de arriendo, donde la norma que
 * corresponde es la Ley 18.101 y el Código Civil. Citar la ley correcta pesa
 * en confianza (E-E-A-T) y en cómo nos citan los asistentes de IA.
 *
 * Enlaces a Ley Chile (BCN): `idLey=<número>` para leyes numeradas y
 * `idNorma=<id>` para códigos y decretos con fuerza de ley.
 */

export interface FuenteLegal {
  label: string;
  url: string;
}

const BCN = "https://www.bcn.cl/leychile/navegar";
const ley = (n: string, label: string): FuenteLegal => ({
  label,
  url: `${BCN}?idLey=${n.replace(/\./g, "")}`,
});
const norma = (id: string, label: string): FuenteLegal => ({
  label,
  url: `${BCN}?idNorma=${id}`,
});

const LEY_18101 = ley("18.101", "Ley 18.101, sobre arrendamiento de predios urbanos");
const CODIGO_CIVIL = norma("172986", "Código Civil, Título XXVI, del contrato de arrendamiento");
const LEY_21461 = ley("21.461", "Ley 21.461 (\"Devuélveme mi casa\"), procedimiento monitorio de arriendo");
const LEY_21442 = ley("21.442", "Ley 21.442, sobre copropiedad inmobiliaria");
const LEY_21020 = ley("21.020", "Ley 21.020, sobre tenencia responsable de mascotas");
const LEY_19496 = ley("19.496", "Ley 19.496, protección de los derechos de los consumidores");
const LEY_19799 = ley("19.799", "Ley 19.799, sobre documentos electrónicos y firma electrónica");
const LEY_19968 = ley("19.968", "Ley 19.968, que crea los tribunales de familia");
const CPC = norma("22740", "Código de Procedimiento Civil");
const LGUC = norma("13393", "Ley General de Urbanismo y Construcciones (DFL 458), art. 18: garantías de la construcción");
const LEY_RENTA = norma("6368", "Ley sobre Impuesto a la Renta (DL 824)");

const POR_CATEGORIA: Record<string, FuenteLegal[]> = {
  Legal: [LEY_18101, CODIGO_CIVIL, LEY_21461, CPC],
  Contratos: [LEY_18101, CODIGO_CIVIL],
  Arrendar: [LEY_18101, CODIGO_CIVIL],
  Guías: [LEY_18101, CODIGO_CIVIL],
  Práctico: [LEY_18101, CODIGO_CIVIL],
  Conceptos: [LEY_18101, CODIGO_CIVIL],
  Dinero: [LEY_18101, CODIGO_CIVIL, LEY_21442],
  Mantención: [LEY_18101, CODIGO_CIVIL, LEY_21442],
  "Evidencia Digital": [LEY_19799, CPC],
  Técnico: [LEY_19799, CPC],
  IA: [LEY_19799, CPC],
};

/** Artículos cuya materia no es la del resto de su categoría. */
const POR_SLUG: Record<string, FuenteLegal[]> = {
  "producto-defectuoso-fotos-prueba-reclamo": [LEY_19496, LEY_19799],
  "evidencia-whatsapp-juicios-familia-chile": [LEY_19968, LEY_19799, CPC],
  "captura-de-pantalla-como-prueba-validez-chile": [LEY_19799, CPC],
  "mascotas-en-arriendo-puede-prohibir": [LEY_21020, LEY_21442, LEY_18101],
  "gastos-comunes-quien-paga-arriendo": [LEY_21442, LEY_18101, CODIGO_CIVIL],
  "declarar-arriendo-sii-impuestos": [LEY_RENTA, LEY_18101],
  "ley-devuelveme-mi-casa-21461-desalojo": [LEY_21461, LEY_18101, CPC],
  "fotos-estado-propiedad-compraventa-entrega": [CODIGO_CIVIL, LGUC],
  "acta-recepcion-departamento-nuevo-inmobiliaria": [LGUC, LEY_19496, CODIGO_CIVIL],
  "acta-entrega-local-comercial-arriendo": [LEY_18101, CODIGO_CIVIL],
};

const POR_DEFECTO: FuenteLegal[] = [LEY_18101, CODIGO_CIVIL];

export function fuentesParaPost(slug: string, category: string): FuenteLegal[] {
  return POR_SLUG[slug] ?? POR_CATEGORIA[category] ?? POR_DEFECTO;
}
