/**
 * Portadas generadas por código para el blog.
 *
 * El blog no tiene fotografías. En vez de stock genérico, cada artículo recibe
 * una ilustración determinista (la misma en cada build) construida a partir de
 * su categoría (paleta + ícono) y de su slug (semilla del plano y de la huella).
 *
 * La misma función produce:
 *  - la imagen SVG del sitio (/blog/[slug]/cover: listado, artículo,
 *    relacionados), con la etiqueta de categoría en fuente del sistema
 *    (un SVG cargado como <img> no puede usar las webfonts de la página);
 *  - el fondo de la imagen Open Graph de cada artículo (/blog/[slug]/og),
 *    sin texto, porque el rasterizador de next/og (resvg) no tiene fuentes y
 *    ahí el título lo dibuja Satori encima.
 *
 * Sin dependencias ni React: devuelve un string para poder usarlo como
 * `data:` URI y como innerHTML.
 *
 * Íconos: trazos de lucide (ISC), 24x24, copiados para no cargar la librería
 * en el bundle de la ruta OG.
 */

export interface CoverTheme {
  /** Degradado de fondo (claro → un poco más saturado). */
  bg: [string, string];
  /** Color de marca de la categoría (ícono, pines, huella). */
  accent: string;
  /** Color de los trazos y del texto sobre el fondo claro. */
  ink: string;
  icon: IconName;
}

const ICONS = {
  clipboardCheck:
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  camera:
    '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  scale:
    '<path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/>',
  scrollText:
    '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  coins:
    '<path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/><path d="M15 6h1v4"/><path d="m6.134 14.768.866-.5 2 3.464"/><circle cx="16" cy="8" r="6"/>',
  keyRound:
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>',
  shieldCheck:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  scanSearch:
    '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  lightbulb:
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
} as const;

type IconName = keyof typeof ICONS;

/** Paleta e ícono por categoría (las claves son las de lib/blog-posts.ts). */
const THEMES: Record<string, CoverTheme> = {
  Guías: { bg: ["#ecfdf5", "#d1fae5"], accent: "#059669", ink: "#064e3b", icon: "clipboardCheck" },
  Práctico: { bg: ["#f0fdf4", "#dcfce7"], accent: "#16a34a", ink: "#14532d", icon: "camera" },
  Legal: { bg: ["#eef2ff", "#e0e7ff"], accent: "#4f46e5", ink: "#312e81", icon: "scale" },
  Contratos: { bg: ["#f0f9ff", "#e0f2fe"], accent: "#0284c7", ink: "#0c4a6e", icon: "scrollText" },
  Dinero: { bg: ["#fffbeb", "#fef3c7"], accent: "#d97706", ink: "#78350f", icon: "coins" },
  Arrendar: { bg: ["#f0fdfa", "#ccfbf1"], accent: "#0d9488", ink: "#134e4a", icon: "keyRound" },
  Mantención: { bg: ["#fff7ed", "#ffedd5"], accent: "#ea580c", ink: "#7c2d12", icon: "wrench" },
  "Evidencia Digital": { bg: ["#f8fafc", "#e2e8f0"], accent: "#475569", ink: "#0f172a", icon: "shieldCheck" },
  Técnico: { bg: ["#f5f3ff", "#ede9fe"], accent: "#7c3aed", ink: "#4c1d95", icon: "scanSearch" },
  IA: { bg: ["#fdf4ff", "#fae8ff"], accent: "#c026d3", ink: "#701a75", icon: "sparkles" },
  Conceptos: { bg: ["#fefce8", "#fef9c3"], accent: "#ca8a04", ink: "#713f12", icon: "lightbulb" },
};

const DEFAULT_THEME: CoverTheme = {
  bg: ["#f0fdf4", "#dcfce7"],
  accent: "#16a34a",
  ink: "#14532d",
  icon: "house",
};

export function coverTheme(category: string): CoverTheme {
  return THEMES[category] ?? DEFAULT_THEME;
}

/** Lienzo de referencia; el sitio lo recorta (slice) a 16:9, 4:3 o 21:9. */
export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

/**
 * Desplaza y escala la composición (ícono + plano) dentro del lienzo.
 * La imagen OG la corre a la derecha para dejar sitio al título.
 */
export interface CoverTransform {
  dx: number;
  dy: number;
  scale: number;
}

export const OG_TRANSFORM: CoverTransform = { dx: 462, dy: 88, scale: 0.72 };

export interface CoverOptions {
  /** Etiqueta de categoría dentro del SVG (solo en el navegador). */
  withText?: boolean;
  transform?: CoverTransform;
}

interface CoverInput {
  slug: string;
  category: string;
}

/** FNV-1a de 32 bits: semilla estable por slug. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32: PRNG determinista y barato. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function coverSvg(post: CoverInput, opts: CoverOptions = {}): string {
  const theme = coverTheme(post.category);
  const seed = fnv1a(post.slug);
  const rand = mulberry32(seed);
  const id = "c" + seed.toString(36);
  const { withText = false, transform = { dx: 0, dy: 0, scale: 1 } } = opts;

  // --- Plano de planta (a la derecha) -------------------------------------
  const px = 490;
  const py = 120;
  const pw = 510;
  const ph = 400;
  const splitX = r1(px + pw * (0.38 + rand() * 0.24));
  const splitYLeft = r1(py + ph * (0.35 + rand() * 0.3));
  const rightSplit = rand() > 0.45;
  const splitYRight = r1(py + ph * (0.4 + rand() * 0.25));

  const wall = `stroke="${theme.ink}" stroke-opacity="0.35" stroke-width="3"`;
  const walls: string[] = [
    `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="6" fill="#ffffff" fill-opacity="0.55" stroke="${theme.ink}" stroke-opacity="0.4" stroke-width="4"/>`,
    `<line x1="${splitX}" y1="${py}" x2="${splitX}" y2="${py + ph}" ${wall}/>`,
    `<line x1="${px}" y1="${splitYLeft}" x2="${splitX}" y2="${splitYLeft}" ${wall}/>`,
  ];
  if (rightSplit) {
    walls.push(
      `<line x1="${splitX}" y1="${splitYRight}" x2="${px + pw}" y2="${splitYRight}" ${wall}/>`
    );
  }

  // Puertas: arco de un cuarto de círculo sobre un muro interior.
  const doorR = 46;
  const door = `fill="none" stroke="${theme.ink}" stroke-opacity="0.35" stroke-width="2.5"`;
  const doorY = r1(py + 24 + rand() * (splitYLeft - py - doorR - 40));
  const doorX = r1(px + 30 + rand() * (splitX - px - doorR - 60));
  const doors = [
    `<path d="M${splitX} ${doorY} a${doorR} ${doorR} 0 0 1 ${-doorR} ${doorR}" ${door}/>`,
    `<path d="M${doorX} ${splitYLeft} a${doorR} ${doorR} 0 0 0 ${doorR} ${doorR}" ${door}/>`,
  ];

  // Pines de foto ("aquí se tomó una foto"), uno por recinto.
  const pin = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="12" fill="#ffffff" stroke="${theme.accent}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="4.5" fill="${theme.accent}"/>`;
  const pins = [
    pin(
      r1(px + 40 + rand() * (splitX - px - 80)),
      r1(py + 40 + rand() * (splitYLeft - py - 80))
    ),
    pin(
      r1(px + 40 + rand() * (splitX - px - 80)),
      r1(splitYLeft + 40 + rand() * (py + ph - splitYLeft - 80))
    ),
    pin(
      r1(splitX + 40 + rand() * (px + pw - splitX - 80)),
      r1(py + 40 + rand() * (ph - 80))
    ),
  ];

  // Cota (línea de dimensión) bajo el plano, como en un plano de arquitecto.
  const cotaY = py + ph + 26;
  const cota = `<g stroke="${theme.ink}" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round">
    <line x1="${px}" y1="${cotaY}" x2="${px + pw}" y2="${cotaY}"/>
    <line x1="${px}" y1="${cotaY - 8}" x2="${px}" y2="${cotaY + 8}"/>
    <line x1="${splitX}" y1="${cotaY - 6}" x2="${splitX}" y2="${cotaY + 6}"/>
    <line x1="${px + pw}" y1="${cotaY - 8}" x2="${px + pw}" y2="${cotaY + 8}"/>
  </g>`;

  // --- Ficha del ícono (a la izquierda) -------------------------------------
  // Zona segura para los recortes del sitio: x 180–1020 (4:3), y 58–572 (21:9).
  const tx = 220;
  const ty = 231;
  const tile = `<g transform="translate(${tx} ${ty})">
    <rect width="168" height="168" rx="36" fill="#ffffff" stroke="${theme.accent}" stroke-opacity="0.35" stroke-width="3"/>
    <g transform="translate(36 36) scale(4)" fill="none" stroke="${theme.accent}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" color="${theme.accent}">${ICONS[theme.icon]}</g>
  </g>`;

  // Huella: 8 celdas cuya intensidad sale de la semilla (guiño al hash).
  const cells: string[] = [];
  const cell = 17;
  const gap = (168 - 8 * cell) / 7;
  const levels = [0.18, 0.38, 0.62, 0.9];
  for (let i = 0; i < 8; i++) {
    const op = levels[Math.floor(rand() * 4)];
    cells.push(
      `<rect x="${r1(tx + i * (cell + gap))}" y="424" width="${cell}" height="${cell}" rx="4" fill="${theme.accent}" fill-opacity="${op}"/>`
    );
  }

  // Resplandor suave detrás del plano, en un punto distinto por artículo.
  const glowX = r1(650 + rand() * 300);
  const glowY = r1(200 + rand() * 220);

  const label = withText
    ? `<text x="${tx}" y="205" font-size="17" font-weight="700" letter-spacing="3" fill="${theme.ink}" fill-opacity="0.75" style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">${escapeXml(post.category.toUpperCase())}</text>`
    : "";

  const { dx, dy, scale } = transform;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style="display:block">
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.bg[0]}"/>
      <stop offset="1" stop-color="${theme.bg[1]}"/>
    </linearGradient>
    <radialGradient id="${id}-glow">
      <stop offset="0" stop-color="${theme.accent}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${theme.ink}" stroke-opacity="0.09" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#${id}-bg)"/>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#${id}-grid)"/>
  <circle cx="${glowX}" cy="${glowY}" r="320" fill="url(#${id}-glow)"/>
  <g transform="translate(${dx} ${dy}) scale(${scale})">
    ${walls.join("\n    ")}
    ${doors.join("\n    ")}
    ${cota}
    ${pins.join("\n    ")}
    ${tile}
    ${cells.join("\n    ")}
    ${label}
  </g>
</svg>`;
}

/** `data:` URI lista para un <img> (por ejemplo dentro de next/og). */
export function coverDataUri(post: CoverInput, opts?: CoverOptions): string {
  return (
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(coverSvg(post, opts))
  );
}
