/**
 * Anuncio principal de CertiFoto ("Esa mancha ya estaba") en tres formatos de Meta:
 * 4:5 feed, 1:1 y 9:16 historias/reels. Marketing, no forma parte del build.
 * Requiere @resvg/resvg-js (no es dependencia del proyecto): instálalo aparte y ejecuta
 *   node scripts/instagram-anuncio.js <carpeta-de-salida>
 * Para probar otro gancho, cambia las líneas del titular en cada formato.
 */
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const FONT = "'Segoe UI', 'Segoe UI Variable', Inter, Arial, sans-serif";
const MONO = "'Cascadia Mono', Consolas, 'Courier New', monospace";
const VERDE = "#16a34a";
const VERDE_OSC = "#15803d";
const INK = "#0a0e17";
const GRIS = "#4b5563";

const LOGO_PATHS = `
<path d="M24 12a6 6 0 0 0-6 6c0 3-0.3 7.5-0.78 12"/>
<path d="M30 21.36c0 7.14 0 19.14-3 26.64"/>
<path d="M39.87 51.06c0.36-1.8 1.29-6.9 1.5-9.06"/>
<path d="M6 24a30 30 0 0 1 54-18"/>
<path d="M6 36h0.03"/>
<path d="M59.4 36c0.6-6 0.39-16.06 0-18"/>
<path d="M15 52.5c1.5-4.5 3-13.5 3-22.5a18 18 0 0 1 1.02-6"/>
<path d="M25.95 57c0.63-1.98 1.35-3.96 1.71-6"/>
<path d="M27 14.4a18 18 0 0 1 27 15.6v6"/>`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function defs() {
  return `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6fbf7"/><stop offset="1" stop-color="#e3f5e8"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${VERDE}" stop-opacity="0.18"/><stop offset="1" stop-color="${VERDE}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#14532d" stroke-opacity="0.07"/></pattern>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f5f1"/><stop offset="1" stop-color="#ebe7e0"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cfc0"/><stop offset="1" stop-color="#c9bda9"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#eff6ff"/></linearGradient>
  <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${VERDE}"/><stop offset="1" stop-color="${VERDE_OSC}"/></linearGradient>
  <filter id="sombra" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#14532d" flood-opacity="0.16"/></filter>
  <filter id="sombra2" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#14532d" flood-opacity="0.22"/></filter>
</defs>`;
}

function fondo(W, H) {
  return `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#grid)"/><circle cx="${W * 0.78}" cy="${H * 0.42}" r="${W * 0.55}" fill="url(#glow)"/>`;
}

function marca(x, y, size = 56) {
  const k = size / 56;
  return `<g transform="translate(${x} ${y})">
  <rect width="${size}" height="${size}" rx="${14 * k}" fill="${VERDE}"/>
  <g transform="translate(${9 * k} ${9 * k}) scale(${0.6 * k})" fill="none" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>
  <text x="${size + 16 * k}" y="${size * 0.72}" font-family="${FONT}" font-size="${34 * k}" font-weight="700" fill="${INK}">CertiFoto</text>
</g>`;
}

/** Titular: la frase típica de la pelea, entre comillas. */
function titular(x, y, size, lineas, sub, subSize) {
  const t = `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${INK}" letter-spacing="-2">${lineas
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * 1.06}">${esc(l)}</tspan>`)
    .join("")}</text>`;
  const s = sub
    ? `<text x="${x}" y="${y + size * 1.06 * (lineas.length - 1) + subSize * 1.9}" font-family="${FONT}" font-size="${subSize}" font-weight="500" fill="${GRIS}">${sub
        .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : subSize * 1.35}">${esc(l)}</tspan>`)
        .join("")}</text>`
    : "";
  return t + s;
}

/**
 * La tarjeta de evidencia: una "foto" del living vacío con el hallazgo marcado,
 * chips de contexto, metadatos forenses y el sello de certificación.
 * Ancho w; devuelve también su alto.
 */
function tarjeta(x, y, w, escala = 1, ratio = 0.56) {
  const imgH = Math.round(w * ratio);
  const metaH = Math.round(150 * escala);
  const h = imgH + metaH;
  const r = 32 * escala;
  const fs = (n) => Math.round(n * escala);

  // Escena: living vacío. Coordenadas relativas a la imagen (0..w, 0..imgH).
  const floorY = imgH * 0.68;
  const stainX = x + w * 0.62;
  const stainY = y + imgH * 0.56;
  const escena = `
  <clipPath id="clipImg"><rect x="${x}" y="${y}" width="${w}" height="${imgH}" rx="${r}" ry="${r}"/><rect x="${x}" y="${y + r}" width="${w}" height="${imgH - r}"/></clipPath>
  <g clip-path="url(#clipImg)">
    <rect x="${x}" y="${y}" width="${w}" height="${imgH}" fill="url(#wall)"/>
    <rect x="${x}" y="${y + floorY}" width="${w}" height="${imgH - floorY}" fill="url(#floor)"/>
    <!-- tablas del piso -->
    <g stroke="#b9ab94" stroke-opacity="0.3" stroke-width="2">
      ${[0.12, 0.28, 0.44, 0.6, 0.76, 0.92].map((f) => `<line x1="${x + w * f}" y1="${y + floorY}" x2="${x + w * (f - 0.06)}" y2="${y + imgH}"/>`).join("")}
    </g>
    <!-- guardapolvo -->
    <rect x="${x}" y="${y + floorY - 14 * escala}" width="${w}" height="${14 * escala}" fill="#ffffff" fill-opacity="0.85"/>
    <line x1="${x}" y1="${y + floorY}" x2="${x + w}" y2="${y + floorY}" stroke="#a89b86" stroke-width="2"/>
    <!-- ventana -->
    <g transform="translate(${x + w * 0.1} ${y + imgH * 0.12})">
      <rect width="${w * 0.28}" height="${imgH * 0.4}" rx="6" fill="#ffffff"/>
      <rect x="${8 * escala}" y="${8 * escala}" width="${w * 0.28 - 16 * escala}" height="${imgH * 0.4 - 16 * escala}" rx="4" fill="url(#glass)"/>
      <line x1="${w * 0.14}" y1="${8 * escala}" x2="${w * 0.14}" y2="${imgH * 0.4 - 8 * escala}" stroke="#ffffff" stroke-width="${8 * escala}"/>
      <line x1="${8 * escala}" y1="${imgH * 0.2}" x2="${w * 0.28 - 8 * escala}" y2="${imgH * 0.2}" stroke="#ffffff" stroke-width="${8 * escala}"/>
      <rect x="-6" y="${imgH * 0.4}" width="${w * 0.28 + 12}" height="${10 * escala}" rx="3" fill="#e5e0d6"/>
    </g>
    <!-- luz de la ventana en el piso -->
    <path d="M${x + w * 0.08} ${y + imgH} L${x + w * 0.16} ${y + floorY} L${x + w * 0.36} ${y + floorY} L${x + w * 0.44} ${y + imgH} Z" fill="#ffffff" fill-opacity="0.18"/>
    <!-- puerta -->
    <g transform="translate(${x + w * 0.8} ${y + imgH * 0.1})">
      <rect width="${w * 0.14}" height="${floorY - imgH * 0.1}" rx="4" fill="#ffffff"/>
      <rect x="${7 * escala}" y="${7 * escala}" width="${w * 0.14 - 14 * escala}" height="${floorY - imgH * 0.1 - 7 * escala}" fill="#efe9df"/>
      <rect x="${18 * escala}" y="${22 * escala}" width="${w * 0.14 - 36 * escala}" height="${(floorY - imgH * 0.1) * 0.36}" rx="3" fill="none" stroke="#e0d8ca" stroke-width="2"/>
      <rect x="${18 * escala}" y="${(floorY - imgH * 0.1) * 0.5}" width="${w * 0.14 - 36 * escala}" height="${(floorY - imgH * 0.1) * 0.4}" rx="3" fill="none" stroke="#e0d8ca" stroke-width="2"/>
      <circle cx="${w * 0.14 - 22 * escala}" cy="${(floorY - imgH * 0.1) * 0.5}" r="${5 * escala}" fill="#9ca3af"/>
    </g>
    <!-- enchufe -->
    <rect x="${x + w * 0.5}" y="${y + floorY - 60 * escala}" width="${22 * escala}" height="${22 * escala}" rx="3" fill="#ffffff" stroke="#d6d3cd" stroke-width="1.5"/>
    <!-- mancha en el muro -->
    <path d="M${stainX} ${stainY} c ${-30 * escala} ${-10 * escala}, ${-40 * escala} ${20 * escala}, ${-22 * escala} ${34 * escala} c ${10 * escala} ${18 * escala}, ${40 * escala} ${22 * escala}, ${52 * escala} ${8 * escala} c ${14 * escala} ${-16 * escala}, ${6 * escala} ${-40 * escala}, ${-30 * escala} ${-42 * escala} z" fill="#8b6f52" fill-opacity="0.35"/>
    <path d="M${stainX + 6 * escala} ${stainY + 10 * escala} c ${-14 * escala} ${-4 * escala}, ${-20 * escala} ${12 * escala}, ${-8 * escala} ${20 * escala} c ${8 * escala} ${8 * escala}, ${24 * escala} ${6 * escala}, ${26 * escala} ${-4 * escala} c ${2 * escala} ${-10 * escala}, ${-6 * escala} ${-16 * escala}, ${-18 * escala} ${-16 * escala} z" fill="#6b5340" fill-opacity="0.35"/>
    <!-- marca del hallazgo -->
    <circle cx="${stainX + 4 * escala}" cy="${stainY + 12 * escala}" r="${58 * escala}" fill="none" stroke="${VERDE}" stroke-width="${4 * escala}" stroke-dasharray="${12 * escala} ${9 * escala}"/>
    <line x1="${stainX + 4 * escala}" y1="${stainY - 46 * escala}" x2="${stainX + 4 * escala}" y2="${stainY - 84 * escala}" stroke="${VERDE}" stroke-width="${3 * escala}"/>
    <g transform="translate(${stainX - 150 * escala} ${stainY - 140 * escala})">
      <rect width="${345 * escala}" height="${56 * escala}" rx="${14 * escala}" fill="#ffffff" filter="url(#sombra2)"/>
      <circle cx="${26 * escala}" cy="${28 * escala}" r="${8 * escala}" fill="${VERDE}"/>
      <text x="${46 * escala}" y="${36 * escala}" font-family="${FONT}" font-size="${fs(22)}" font-weight="700" fill="${INK}">Hallazgo: mancha en muro</text>
    </g>
    <!-- chips de contexto -->
    <g transform="translate(${x + 22 * escala} ${y + 22 * escala})"><rect width="${300 * escala}" height="${44 * escala}" rx="${22 * escala}" fill="${INK}" fill-opacity="0.72"/><text x="${20 * escala}" y="${29 * escala}" font-family="${FONT}" font-size="${fs(20)}" font-weight="700" letter-spacing="1.5" fill="#ffffff">LIVING · FOTO 12 / 36</text></g>
    <g transform="translate(${x + w - 22 * escala - 268 * escala} ${y + 22 * escala})"><rect width="${268 * escala}" height="${44 * escala}" rx="${22 * escala}" fill="${INK}" fill-opacity="0.72"/><text x="${20 * escala}" y="${29 * escala}" font-family="${FONT}" font-size="${fs(20)}" font-weight="600" fill="#ffffff">14 mar 2026 · 10:32:14</text></g>
  </g>`;

  // Metadatos forenses
  const my = y + imgH;
  const meta = `
  <rect x="${x}" y="${my}" width="${w}" height="${metaH}" fill="#ffffff"/>
  <g font-family="${MONO}" font-size="${fs(21)}" fill="${GRIS}">
    <text x="${x + 30 * escala}" y="${my + 48 * escala}"><tspan fill="${INK}" font-weight="700" font-family="${FONT}">SHA-256</tspan>  9f3a2c71b0e4d5a6f7c8b9a0e1d2c3b4…e9d0</text>
    <text x="${x + 30 * escala}" y="${my + 88 * escala}"><tspan fill="${INK}" font-weight="700" font-family="${FONT}">Fecha</tspan>  14-03-2026 10:32:14 -03:00 · <tspan fill="${INK}" font-weight="700" font-family="${FONT}">GPS</tspan>  -33.4263, -70.6106</text>
    <text x="${x + 30 * escala}" y="${my + 128 * escala}"><tspan fill="${INK}" font-weight="700" font-family="${FONT}">Integridad</tspan>  EXIF íntegro · sin edición detectada</text>
  </g>`;

  // Sello
  const sello = `
  <g transform="translate(${x + w - 282 * escala} ${my - 34 * escala})" filter="url(#sombra2)">
    <rect width="${254 * escala}" height="${64 * escala}" rx="${32 * escala}" fill="${VERDE}"/>
    <circle cx="${34 * escala}" cy="${32 * escala}" r="${16 * escala}" fill="#ffffff"/>
    <path d="M${26 * escala} ${32 * escala} l${6 * escala} ${6 * escala} l${11 * escala} ${-12 * escala}" fill="none" stroke="${VERDE}" stroke-width="${3.5 * escala}" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${62 * escala}" y="${41 * escala}" font-family="${FONT}" font-size="${fs(24)}" font-weight="800" letter-spacing="1.5" fill="#ffffff">CERTIFICADA</text>
  </g>`;

  const svg = `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#ffffff" filter="url(#sombra)"/>
  ${escena}
  ${meta}
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#14532d" stroke-opacity="0.12" stroke-width="2"/>
  ${sello}`;
  return { svg, h };
}

function cta(x, y, w, escala = 1) {
  const bh = 84 * escala;
  const bw = 430 * escala;
  const fs = (n) => Math.round(n * escala);
  return `
  <g transform="translate(${x} ${y})" filter="url(#sombra2)">
    <rect width="${bw}" height="${bh}" rx="${bh / 2}" fill="url(#btn)"/>
    <text x="${34 * escala}" y="${bh * 0.64}" font-family="${FONT}" font-size="${fs(32)}" font-weight="800" fill="#ffffff">Crea tu acta gratis</text>
    <path d="M${bw - 66 * escala} ${bh / 2 - 12 * escala} l${14 * escala} ${12 * escala} l${-14 * escala} ${12 * escala}" fill="none" stroke="#ffffff" stroke-width="${4 * escala}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="${x + bw + 30 * escala}" y="${y + bh * 0.46}" font-family="${FONT}" font-size="${fs(26)}" font-weight="700" fill="${INK}">certifoto.cl</text>
  <text x="${x + bw + 30 * escala}" y="${y + bh * 0.46 + 34 * escala}" font-family="${FONT}" font-size="${fs(22)}" font-weight="500" fill="${GRIS}">Certificar desde $1.490 · sin registro para partir</text>`;
}

function beneficios(x, y, w, escala = 1) {
  const items = [
    ["Fecha y huella", "verificables"],
    ["La IA describe", "cada foto"],
    ["PDF que cualquiera", "puede comprobar"],
  ];
  const cw = (w - 2 * 20 * escala) / 3;
  const fs = (n) => Math.round(n * escala);
  return items
    .map(
      ([a, b], i) => `
  <g transform="translate(${x + i * (cw + 20 * escala)} ${y})">
    <rect width="${cw}" height="${96 * escala}" rx="${20 * escala}" fill="#ffffff" fill-opacity="0.75" stroke="#14532d" stroke-opacity="0.12" stroke-width="2"/>
    <circle cx="${30 * escala}" cy="${48 * escala}" r="${11 * escala}" fill="${VERDE}"/>
    <path d="M${24 * escala} ${48 * escala} l${4.5 * escala} ${4.5 * escala} l${8 * escala} ${-9 * escala}" fill="none" stroke="#ffffff" stroke-width="${2.6 * escala}" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${54 * escala}" y="${42 * escala}" font-family="${FONT}" font-size="${fs(22)}" font-weight="700" fill="${INK}">${esc(a)}</text>
    <text x="${54 * escala}" y="${70 * escala}" font-family="${FONT}" font-size="${fs(22)}" font-weight="500" fill="${GRIS}">${esc(b)}</text>
  </g>`
    )
    .join("");
}

function render(nombre, svgStr, w) {
  const png = new Resvg(svgStr, {
    fitTo: { mode: "width", value: w },
    font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
  })
    .render()
    .asPng();
  fs.writeFileSync(path.join(OUT, nombre), png);
  console.log(nombre, Math.round(png.length / 1024) + " KB");
}

// ------------------------------------------------------------------ 4:5
{
  const W = 1080, H = 1350, M = 72;
  const cardY = 560;
  const card = tarjeta(M, cardY, W - 2 * M, 0.85, 0.5);
  const ctaY = cardY + card.h + 44;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H)}
  ${marca(M, 110)}
  ${titular(M, 286, 90, ["“Esa mancha", "ya estaba.”"], ["Al terminar el arriendo, todos recuerdan distinto.", "Que no sea tu palabra contra la suya."], 33)}
  ${card.svg}
  ${cta(M, ctaY, W - 2 * M, 0.95)}
  <text x="${W - M}" y="${H - 40}" text-anchor="end" font-family="${FONT}" font-size="22" font-weight="600" fill="${VERDE_OSC}">Actas de entrega con fotos certificadas · @certifoto.cl</text>
</svg>`;
  render("anuncio-certifoto-4x5-feed.png", svg, W);
}

// ------------------------------------------------------------------ 1:1
{
  const W = 1080, H = 1080, M = 72;
  const cardY = 352;
  const card = tarjeta(M, cardY, W - 2 * M, 0.8, 0.5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H)}
  ${marca(M, 64, 44)}
  ${titular(M, 190, 70, ["“Esa mancha ya estaba.”"], ["Al terminar el arriendo, todos recuerdan distinto. Que no sea tu palabra contra la suya."], 26)}
  ${card.svg}
  ${cta(M, cardY + card.h + 30, W - 2 * M, 0.85)}
</svg>`;
  render("anuncio-certifoto-1x1-cuadrado.png", svg, W);
}

// ------------------------------------------------------------------ 9:16
{
  const W = 1080, H = 1920, M = 72;
  // Zonas seguras de historias (Meta): libre el 14 % superior (269 px) y el 20 % inferior (384 px).
  const cardY = 650;
  const card = tarjeta(M, cardY, W - 2 * M, 0.9, 0.5);
  const benY = cardY + card.h + 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H)}
  ${marca(M, 282, 48)}
  ${titular(M, 430, 88, ["“Esa mancha", "ya estaba.”"], ["Al terminar el arriendo, todos recuerdan distinto.", "Que no sea tu palabra contra la suya."], 32)}
  ${card.svg}
  ${beneficios(M, benY, W - 2 * M, 0.9)}
  ${cta(M, benY + 86 + 40, W - 2 * M, 0.95)}
</svg>`;
  render("anuncio-certifoto-9x16-historia.png", svg, W);
}

console.log("listo:", OUT);
