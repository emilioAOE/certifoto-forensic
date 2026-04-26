/**
 * Dataset estatico de regiones y comunas de Chile.
 *
 * Fuente: Subdere (Subsecretaria de Desarrollo Regional). 16 regiones, 346 comunas.
 *
 * Solo nombres y agrupacion por region. Para coordenadas usar OSM Nominatim
 * en lib/address-autocomplete.ts.
 */

export interface Region {
  code: string;
  name: string;
  romanNumeral: string;
}

export interface Comuna {
  name: string;
  regionCode: string;
}

export const REGIONS: Region[] = [
  { code: "AP", name: "Arica y Parinacota", romanNumeral: "XV" },
  { code: "TA", name: "Tarapaca", romanNumeral: "I" },
  { code: "AN", name: "Antofagasta", romanNumeral: "II" },
  { code: "AT", name: "Atacama", romanNumeral: "III" },
  { code: "CO", name: "Coquimbo", romanNumeral: "IV" },
  { code: "VA", name: "Valparaiso", romanNumeral: "V" },
  { code: "RM", name: "Metropolitana de Santiago", romanNumeral: "RM" },
  { code: "LI", name: "Libertador General Bernardo O'Higgins", romanNumeral: "VI" },
  { code: "ML", name: "Maule", romanNumeral: "VII" },
  { code: "NB", name: "Nuble", romanNumeral: "XVI" },
  { code: "BI", name: "Biobio", romanNumeral: "VIII" },
  { code: "AR", name: "La Araucania", romanNumeral: "IX" },
  { code: "LR", name: "Los Rios", romanNumeral: "XIV" },
  { code: "LL", name: "Los Lagos", romanNumeral: "X" },
  { code: "AI", name: "Aisen del General Carlos Ibanez del Campo", romanNumeral: "XI" },
  { code: "MA", name: "Magallanes y la Antartica Chilena", romanNumeral: "XII" },
];

export const COMUNAS: Comuna[] = [
  // Arica y Parinacota (XV)
  { name: "Arica", regionCode: "AP" },
  { name: "Camarones", regionCode: "AP" },
  { name: "General Lagos", regionCode: "AP" },
  { name: "Putre", regionCode: "AP" },
  // Tarapaca (I)
  { name: "Iquique", regionCode: "TA" },
  { name: "Alto Hospicio", regionCode: "TA" },
  { name: "Camina", regionCode: "TA" },
  { name: "Colchane", regionCode: "TA" },
  { name: "Huara", regionCode: "TA" },
  { name: "Pica", regionCode: "TA" },
  { name: "Pozo Almonte", regionCode: "TA" },
  // Antofagasta (II)
  { name: "Antofagasta", regionCode: "AN" },
  { name: "Mejillones", regionCode: "AN" },
  { name: "Sierra Gorda", regionCode: "AN" },
  { name: "Taltal", regionCode: "AN" },
  { name: "Calama", regionCode: "AN" },
  { name: "Ollague", regionCode: "AN" },
  { name: "San Pedro de Atacama", regionCode: "AN" },
  { name: "Maria Elena", regionCode: "AN" },
  { name: "Tocopilla", regionCode: "AN" },
  // Atacama (III)
  { name: "Copiapo", regionCode: "AT" },
  { name: "Caldera", regionCode: "AT" },
  { name: "Tierra Amarilla", regionCode: "AT" },
  { name: "Chanaral", regionCode: "AT" },
  { name: "Diego de Almagro", regionCode: "AT" },
  { name: "Vallenar", regionCode: "AT" },
  { name: "Alto del Carmen", regionCode: "AT" },
  { name: "Freirina", regionCode: "AT" },
  { name: "Huasco", regionCode: "AT" },
  // Coquimbo (IV)
  { name: "La Serena", regionCode: "CO" },
  { name: "Coquimbo", regionCode: "CO" },
  { name: "Andacollo", regionCode: "CO" },
  { name: "La Higuera", regionCode: "CO" },
  { name: "Paihuano", regionCode: "CO" },
  { name: "Vicuna", regionCode: "CO" },
  { name: "Illapel", regionCode: "CO" },
  { name: "Canela", regionCode: "CO" },
  { name: "Los Vilos", regionCode: "CO" },
  { name: "Salamanca", regionCode: "CO" },
  { name: "Ovalle", regionCode: "CO" },
  { name: "Combarbala", regionCode: "CO" },
  { name: "Monte Patria", regionCode: "CO" },
  { name: "Punitaqui", regionCode: "CO" },
  { name: "Rio Hurtado", regionCode: "CO" },
  // Valparaiso (V)
  { name: "Valparaiso", regionCode: "VA" },
  { name: "Casablanca", regionCode: "VA" },
  { name: "Concon", regionCode: "VA" },
  { name: "Juan Fernandez", regionCode: "VA" },
  { name: "Puchuncavi", regionCode: "VA" },
  { name: "Quintero", regionCode: "VA" },
  { name: "Vina del Mar", regionCode: "VA" },
  { name: "Isla de Pascua", regionCode: "VA" },
  { name: "Los Andes", regionCode: "VA" },
  { name: "Calle Larga", regionCode: "VA" },
  { name: "Rinconada", regionCode: "VA" },
  { name: "San Esteban", regionCode: "VA" },
  { name: "La Ligua", regionCode: "VA" },
  { name: "Cabildo", regionCode: "VA" },
  { name: "Papudo", regionCode: "VA" },
  { name: "Petorca", regionCode: "VA" },
  { name: "Zapallar", regionCode: "VA" },
  { name: "Quillota", regionCode: "VA" },
  { name: "Calera", regionCode: "VA" },
  { name: "Hijuelas", regionCode: "VA" },
  { name: "La Cruz", regionCode: "VA" },
  { name: "Nogales", regionCode: "VA" },
  { name: "San Antonio", regionCode: "VA" },
  { name: "Algarrobo", regionCode: "VA" },
  { name: "Cartagena", regionCode: "VA" },
  { name: "El Quisco", regionCode: "VA" },
  { name: "El Tabo", regionCode: "VA" },
  { name: "Santo Domingo", regionCode: "VA" },
  { name: "San Felipe", regionCode: "VA" },
  { name: "Catemu", regionCode: "VA" },
  { name: "Llaillay", regionCode: "VA" },
  { name: "Panquehue", regionCode: "VA" },
  { name: "Putaendo", regionCode: "VA" },
  { name: "Santa Maria", regionCode: "VA" },
  { name: "Quilpue", regionCode: "VA" },
  { name: "Limache", regionCode: "VA" },
  { name: "Olmue", regionCode: "VA" },
  { name: "Villa Alemana", regionCode: "VA" },
  // Metropolitana (RM) — 52 comunas
  { name: "Santiago", regionCode: "RM" },
  { name: "Cerrillos", regionCode: "RM" },
  { name: "Cerro Navia", regionCode: "RM" },
  { name: "Conchali", regionCode: "RM" },
  { name: "El Bosque", regionCode: "RM" },
  { name: "Estacion Central", regionCode: "RM" },
  { name: "Huechuraba", regionCode: "RM" },
  { name: "Independencia", regionCode: "RM" },
  { name: "La Cisterna", regionCode: "RM" },
  { name: "La Florida", regionCode: "RM" },
  { name: "La Granja", regionCode: "RM" },
  { name: "La Pintana", regionCode: "RM" },
  { name: "La Reina", regionCode: "RM" },
  { name: "Las Condes", regionCode: "RM" },
  { name: "Lo Barnechea", regionCode: "RM" },
  { name: "Lo Espejo", regionCode: "RM" },
  { name: "Lo Prado", regionCode: "RM" },
  { name: "Macul", regionCode: "RM" },
  { name: "Maipu", regionCode: "RM" },
  { name: "Nunoa", regionCode: "RM" },
  { name: "Pedro Aguirre Cerda", regionCode: "RM" },
  { name: "Penalolen", regionCode: "RM" },
  { name: "Providencia", regionCode: "RM" },
  { name: "Pudahuel", regionCode: "RM" },
  { name: "Quilicura", regionCode: "RM" },
  { name: "Quinta Normal", regionCode: "RM" },
  { name: "Recoleta", regionCode: "RM" },
  { name: "Renca", regionCode: "RM" },
  { name: "San Joaquin", regionCode: "RM" },
  { name: "San Miguel", regionCode: "RM" },
  { name: "San Ramon", regionCode: "RM" },
  { name: "Vitacura", regionCode: "RM" },
  { name: "Puente Alto", regionCode: "RM" },
  { name: "Pirque", regionCode: "RM" },
  { name: "San Jose de Maipo", regionCode: "RM" },
  { name: "Colina", regionCode: "RM" },
  { name: "Lampa", regionCode: "RM" },
  { name: "Til Til", regionCode: "RM" },
  { name: "San Bernardo", regionCode: "RM" },
  { name: "Buin", regionCode: "RM" },
  { name: "Calera de Tango", regionCode: "RM" },
  { name: "Paine", regionCode: "RM" },
  { name: "Melipilla", regionCode: "RM" },
  { name: "Alhue", regionCode: "RM" },
  { name: "Curacavi", regionCode: "RM" },
  { name: "Maria Pinto", regionCode: "RM" },
  { name: "San Pedro", regionCode: "RM" },
  { name: "Talagante", regionCode: "RM" },
  { name: "El Monte", regionCode: "RM" },
  { name: "Isla de Maipo", regionCode: "RM" },
  { name: "Padre Hurtado", regionCode: "RM" },
  { name: "Penaflor", regionCode: "RM" },
  // O'Higgins (VI)
  { name: "Rancagua", regionCode: "LI" },
  { name: "Codegua", regionCode: "LI" },
  { name: "Coinco", regionCode: "LI" },
  { name: "Coltauco", regionCode: "LI" },
  { name: "Donihue", regionCode: "LI" },
  { name: "Graneros", regionCode: "LI" },
  { name: "Las Cabras", regionCode: "LI" },
  { name: "Machali", regionCode: "LI" },
  { name: "Malloa", regionCode: "LI" },
  { name: "Mostazal", regionCode: "LI" },
  { name: "Olivar", regionCode: "LI" },
  { name: "Penaflor", regionCode: "LI" },
  { name: "Pichidegua", regionCode: "LI" },
  { name: "Quinta de Tilcoco", regionCode: "LI" },
  { name: "Rengo", regionCode: "LI" },
  { name: "Requinoa", regionCode: "LI" },
  { name: "San Vicente", regionCode: "LI" },
  { name: "Pichilemu", regionCode: "LI" },
  { name: "La Estrella", regionCode: "LI" },
  { name: "Litueche", regionCode: "LI" },
  { name: "Marchihue", regionCode: "LI" },
  { name: "Navidad", regionCode: "LI" },
  { name: "Paredones", regionCode: "LI" },
  { name: "San Fernando", regionCode: "LI" },
  { name: "Chepica", regionCode: "LI" },
  { name: "Chimbarongo", regionCode: "LI" },
  { name: "Lolol", regionCode: "LI" },
  { name: "Nancagua", regionCode: "LI" },
  { name: "Palmilla", regionCode: "LI" },
  { name: "Peralillo", regionCode: "LI" },
  { name: "Placilla", regionCode: "LI" },
  { name: "Pumanque", regionCode: "LI" },
  { name: "Santa Cruz", regionCode: "LI" },
  // Maule (VII)
  { name: "Talca", regionCode: "ML" },
  { name: "Constitucion", regionCode: "ML" },
  { name: "Curepto", regionCode: "ML" },
  { name: "Empedrado", regionCode: "ML" },
  { name: "Maule", regionCode: "ML" },
  { name: "Pelarco", regionCode: "ML" },
  { name: "Pencahue", regionCode: "ML" },
  { name: "Rio Claro", regionCode: "ML" },
  { name: "San Clemente", regionCode: "ML" },
  { name: "San Rafael", regionCode: "ML" },
  { name: "Cauquenes", regionCode: "ML" },
  { name: "Chanco", regionCode: "ML" },
  { name: "Pelluhue", regionCode: "ML" },
  { name: "Curico", regionCode: "ML" },
  { name: "Hualane", regionCode: "ML" },
  { name: "Licanten", regionCode: "ML" },
  { name: "Molina", regionCode: "ML" },
  { name: "Rauco", regionCode: "ML" },
  { name: "Romeral", regionCode: "ML" },
  { name: "Sagrada Familia", regionCode: "ML" },
  { name: "Teno", regionCode: "ML" },
  { name: "Vichuquen", regionCode: "ML" },
  { name: "Linares", regionCode: "ML" },
  { name: "Colbun", regionCode: "ML" },
  { name: "Longavi", regionCode: "ML" },
  { name: "Parral", regionCode: "ML" },
  { name: "Retiro", regionCode: "ML" },
  { name: "San Javier", regionCode: "ML" },
  { name: "Villa Alegre", regionCode: "ML" },
  { name: "Yerbas Buenas", regionCode: "ML" },
  // Nuble (XVI)
  { name: "Chillan", regionCode: "NB" },
  { name: "Bulnes", regionCode: "NB" },
  { name: "Chillan Viejo", regionCode: "NB" },
  { name: "El Carmen", regionCode: "NB" },
  { name: "Pemuco", regionCode: "NB" },
  { name: "Pinto", regionCode: "NB" },
  { name: "Quillon", regionCode: "NB" },
  { name: "San Ignacio", regionCode: "NB" },
  { name: "Yungay", regionCode: "NB" },
  { name: "Quirihue", regionCode: "NB" },
  { name: "Cobquecura", regionCode: "NB" },
  { name: "Coelemu", regionCode: "NB" },
  { name: "Ninhue", regionCode: "NB" },
  { name: "Portezuelo", regionCode: "NB" },
  { name: "Ranquil", regionCode: "NB" },
  { name: "Treguaco", regionCode: "NB" },
  { name: "San Carlos", regionCode: "NB" },
  { name: "Coihueco", regionCode: "NB" },
  { name: "Nigoiganduo", regionCode: "NB" },
  { name: "San Fabian", regionCode: "NB" },
  { name: "San Nicolas", regionCode: "NB" },
  // Biobio (VIII)
  { name: "Concepcion", regionCode: "BI" },
  { name: "Coronel", regionCode: "BI" },
  { name: "Chiguayante", regionCode: "BI" },
  { name: "Florida", regionCode: "BI" },
  { name: "Hualqui", regionCode: "BI" },
  { name: "Lota", regionCode: "BI" },
  { name: "Penco", regionCode: "BI" },
  { name: "San Pedro de la Paz", regionCode: "BI" },
  { name: "Santa Juana", regionCode: "BI" },
  { name: "Talcahuano", regionCode: "BI" },
  { name: "Tome", regionCode: "BI" },
  { name: "Hualpen", regionCode: "BI" },
  { name: "Lebu", regionCode: "BI" },
  { name: "Arauco", regionCode: "BI" },
  { name: "Canete", regionCode: "BI" },
  { name: "Contulmo", regionCode: "BI" },
  { name: "Curanilahue", regionCode: "BI" },
  { name: "Los Alamos", regionCode: "BI" },
  { name: "Tirua", regionCode: "BI" },
  { name: "Los Angeles", regionCode: "BI" },
  { name: "Antuco", regionCode: "BI" },
  { name: "Cabrero", regionCode: "BI" },
  { name: "Laja", regionCode: "BI" },
  { name: "Mulchen", regionCode: "BI" },
  { name: "Nacimiento", regionCode: "BI" },
  { name: "Negrete", regionCode: "BI" },
  { name: "Quilaco", regionCode: "BI" },
  { name: "Quilleco", regionCode: "BI" },
  { name: "San Rosendo", regionCode: "BI" },
  { name: "Santa Barbara", regionCode: "BI" },
  { name: "Tucapel", regionCode: "BI" },
  { name: "Yumbel", regionCode: "BI" },
  { name: "Alto Biobio", regionCode: "BI" },
  // Araucania (IX)
  { name: "Temuco", regionCode: "AR" },
  { name: "Carahue", regionCode: "AR" },
  { name: "Cholchol", regionCode: "AR" },
  { name: "Cunco", regionCode: "AR" },
  { name: "Curarrehue", regionCode: "AR" },
  { name: "Freire", regionCode: "AR" },
  { name: "Galvarino", regionCode: "AR" },
  { name: "Gorbea", regionCode: "AR" },
  { name: "Lautaro", regionCode: "AR" },
  { name: "Loncoche", regionCode: "AR" },
  { name: "Melipeuco", regionCode: "AR" },
  { name: "Nueva Imperial", regionCode: "AR" },
  { name: "Padre Las Casas", regionCode: "AR" },
  { name: "Perquenco", regionCode: "AR" },
  { name: "Pitrufquen", regionCode: "AR" },
  { name: "Pucon", regionCode: "AR" },
  { name: "Saavedra", regionCode: "AR" },
  { name: "Teodoro Schmidt", regionCode: "AR" },
  { name: "Tolten", regionCode: "AR" },
  { name: "Vilcun", regionCode: "AR" },
  { name: "Villarrica", regionCode: "AR" },
  { name: "Angol", regionCode: "AR" },
  { name: "Collipulli", regionCode: "AR" },
  { name: "Curacautin", regionCode: "AR" },
  { name: "Ercilla", regionCode: "AR" },
  { name: "Lonquimay", regionCode: "AR" },
  { name: "Los Sauces", regionCode: "AR" },
  { name: "Lumaco", regionCode: "AR" },
  { name: "Puren", regionCode: "AR" },
  { name: "Renaico", regionCode: "AR" },
  { name: "Traiguen", regionCode: "AR" },
  { name: "Victoria", regionCode: "AR" },
  // Los Rios (XIV)
  { name: "Valdivia", regionCode: "LR" },
  { name: "Corral", regionCode: "LR" },
  { name: "Lanco", regionCode: "LR" },
  { name: "Los Lagos", regionCode: "LR" },
  { name: "Mafil", regionCode: "LR" },
  { name: "Mariquina", regionCode: "LR" },
  { name: "Paillaco", regionCode: "LR" },
  { name: "Panguipulli", regionCode: "LR" },
  { name: "La Union", regionCode: "LR" },
  { name: "Futrono", regionCode: "LR" },
  { name: "Lago Ranco", regionCode: "LR" },
  { name: "Rio Bueno", regionCode: "LR" },
  // Los Lagos (X)
  { name: "Puerto Montt", regionCode: "LL" },
  { name: "Calbuco", regionCode: "LL" },
  { name: "Cochamo", regionCode: "LL" },
  { name: "Fresia", regionCode: "LL" },
  { name: "Frutillar", regionCode: "LL" },
  { name: "Los Muermos", regionCode: "LL" },
  { name: "Llanquihue", regionCode: "LL" },
  { name: "Maullin", regionCode: "LL" },
  { name: "Puerto Varas", regionCode: "LL" },
  { name: "Castro", regionCode: "LL" },
  { name: "Ancud", regionCode: "LL" },
  { name: "Chonchi", regionCode: "LL" },
  { name: "Curaco de Velez", regionCode: "LL" },
  { name: "Dalcahue", regionCode: "LL" },
  { name: "Puqueldon", regionCode: "LL" },
  { name: "Queilen", regionCode: "LL" },
  { name: "Quellon", regionCode: "LL" },
  { name: "Quemchi", regionCode: "LL" },
  { name: "Quinchao", regionCode: "LL" },
  { name: "Osorno", regionCode: "LL" },
  { name: "Puerto Octay", regionCode: "LL" },
  { name: "Purranque", regionCode: "LL" },
  { name: "Puyehue", regionCode: "LL" },
  { name: "Rio Negro", regionCode: "LL" },
  { name: "San Juan de la Costa", regionCode: "LL" },
  { name: "San Pablo", regionCode: "LL" },
  { name: "Chaiten", regionCode: "LL" },
  { name: "Futaleufu", regionCode: "LL" },
  { name: "Hualaihue", regionCode: "LL" },
  { name: "Palena", regionCode: "LL" },
  // Aisen (XI)
  { name: "Coyhaique", regionCode: "AI" },
  { name: "Lago Verde", regionCode: "AI" },
  { name: "Aisen", regionCode: "AI" },
  { name: "Cisnes", regionCode: "AI" },
  { name: "Guaitecas", regionCode: "AI" },
  { name: "Cochrane", regionCode: "AI" },
  { name: "O'Higgins", regionCode: "AI" },
  { name: "Tortel", regionCode: "AI" },
  { name: "Chile Chico", regionCode: "AI" },
  { name: "Rio Ibanez", regionCode: "AI" },
  // Magallanes (XII)
  { name: "Punta Arenas", regionCode: "MA" },
  { name: "Laguna Blanca", regionCode: "MA" },
  { name: "Rio Verde", regionCode: "MA" },
  { name: "San Gregorio", regionCode: "MA" },
  { name: "Cabo de Hornos", regionCode: "MA" },
  { name: "Antartica", regionCode: "MA" },
  { name: "Porvenir", regionCode: "MA" },
  { name: "Primavera", regionCode: "MA" },
  { name: "Timaukel", regionCode: "MA" },
  { name: "Natales", regionCode: "MA" },
  { name: "Torres del Paine", regionCode: "MA" },
];

// ============================================
// Helpers
// ============================================

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_INDEX = COMUNAS.map((c) => ({
  ...c,
  normalized: normalize(c.name),
}));

const REGION_BY_CODE = new Map(REGIONS.map((r) => [r.code, r]));

/**
 * Busca comunas que coincidan con la query (acento-insensitive, prefix match
 * + partial match). Devuelve los top N resultados con su region.
 */
export function searchComunas(
  query: string,
  limit = 8
): Array<Comuna & { region: Region }> {
  const q = normalize(query);
  if (q.length < 1) return [];

  const exact: typeof NORMALIZED_INDEX = [];
  const prefix: typeof NORMALIZED_INDEX = [];
  const partial: typeof NORMALIZED_INDEX = [];

  for (const c of NORMALIZED_INDEX) {
    if (c.normalized === q) exact.push(c);
    else if (c.normalized.startsWith(q)) prefix.push(c);
    else if (c.normalized.includes(q)) partial.push(c);
  }

  return [...exact, ...prefix, ...partial]
    .slice(0, limit)
    .map((c) => ({
      name: c.name,
      regionCode: c.regionCode,
      region: REGION_BY_CODE.get(c.regionCode)!,
    }));
}

export function getRegionByCode(code: string): Region | null {
  return REGION_BY_CODE.get(code) ?? null;
}

/**
 * Encuentra la comuna por nombre exacto (acento-insensitive). Util cuando
 * un parser extrae "Las Condes" del texto y queremos validar.
 */
export function findComunaByName(name: string): (Comuna & { region: Region }) | null {
  const n = normalize(name);
  const match = NORMALIZED_INDEX.find((c) => c.normalized === n);
  if (!match) return null;
  return {
    name: match.name,
    regionCode: match.regionCode,
    region: REGION_BY_CODE.get(match.regionCode)!,
  };
}
