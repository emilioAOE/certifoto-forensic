/**
 * Anuncio principal de CertiFoto ("Acta de entrega con fotos certificadas") en tres
 * formatos de Meta: 4:5 feed, 1:1 y 9:16 historias/reels. Marketing, no forma parte del build.
 * Requiere @resvg/resvg-js (no es dependencia del proyecto): instálalo aparte y ejecuta
 *   node scripts/instagram-anuncio.js <carpeta-de-salida>
 * Regla de Emilio: mensaje literal, sin metáforas, mínimo texto.
 */
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const FONT = "'Segoe UI', 'Segoe UI Variable', Inter, Arial, sans-serif";
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
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6fbf7"/><stop offset="1" stop-color="#dff3e6"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${VERDE}" stop-opacity="0.2"/><stop offset="1" stop-color="${VERDE}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#14532d" stroke-opacity="0.07"/></pattern>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f5f1"/><stop offset="1" stop-color="#ebe7e0"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cfc0"/><stop offset="1" stop-color="#c9bda9"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#eff6ff"/></linearGradient>
  <linearGradient id="btn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${VERDE}"/><stop offset="1" stop-color="${VERDE_OSC}"/></linearGradient>
  <filter id="sombra" x="-15%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#14532d" flood-opacity="0.22"/></filter>
  <filter id="sombra2" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#14532d" flood-opacity="0.22"/></filter>
</defs>`;
}

function fondo(W, H, gx, gy) {
  return `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#grid)"/><circle cx="${gx}" cy="${gy}" r="${W * 0.6}" fill="url(#glow)"/>`;
}

function marca(x, y, size = 56) {
  const k = size / 56;
  return `<g transform="translate(${x} ${y})">
  <rect width="${size}" height="${size}" rx="${14 * k}" fill="${VERDE}"/>
  <g transform="translate(${9 * k} ${9 * k}) scale(${0.6 * k})" fill="none" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>
  <text x="${size + 16 * k}" y="${size * 0.72}" font-family="${FONT}" font-size="${34 * k}" font-weight="700" fill="${INK}">CertiFoto</text>
</g>`;
}

/** Titular de tres líneas: dos en tinta y la última en verde. */
function titular(x, y, size, lineas, sub, subSize, anchor = "start") {
  const t = `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="800" letter-spacing="-2">${lineas
    .map(
      ([l, color], i) =>
        `<tspan x="${x}" dy="${i === 0 ? 0 : size * 1.04}" fill="${color}">${esc(l)}</tspan>`
    )
    .join("")}</text>`;
  const s = sub
    ? `<text x="${x}" y="${y + size * 1.04 * (lineas.length - 1) + subSize * 2}" text-anchor="${anchor}" font-family="${FONT}" font-size="${subSize}" font-weight="600" fill="${GRIS}">${esc(sub)}</text>`
    : "";
  return t + s;
}

/** Escena: living vacío (relativa a x,y; ancho w, alto h). */
function escena(x, y, w, h, id) {
  const floorY = y + h * 0.7;
  const k = w / 420;
  const sx = x + w * 0.66;
  const sy = y + h * 0.6;
  return `
  <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${22 * k}"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wall)"/>
    <rect x="${x}" y="${floorY}" width="${w}" height="${y + h - floorY}" fill="url(#floor)"/>
    <g stroke="#b9ab94" stroke-opacity="0.3" stroke-width="${2 * k}">
      ${[0.12, 0.3, 0.48, 0.66, 0.84].map((f) => `<line x1="${x + w * f}" y1="${floorY}" x2="${x + w * (f - 0.07)}" y2="${y + h}"/>`).join("")}
    </g>
    <rect x="${x}" y="${floorY - 10 * k}" width="${w}" height="${10 * k}" fill="#ffffff" fill-opacity="0.85"/>
    <line x1="${x}" y1="${floorY}" x2="${x + w}" y2="${floorY}" stroke="#a89b86" stroke-width="${2 * k}"/>
    <g transform="translate(${x + w * 0.1} ${y + h * 0.13})">
      <rect width="${w * 0.3}" height="${h * 0.38}" rx="${5 * k}" fill="#ffffff"/>
      <rect x="${7 * k}" y="${7 * k}" width="${w * 0.3 - 14 * k}" height="${h * 0.38 - 14 * k}" rx="${3 * k}" fill="url(#glass)"/>
      <line x1="${w * 0.15}" y1="${7 * k}" x2="${w * 0.15}" y2="${h * 0.38 - 7 * k}" stroke="#ffffff" stroke-width="${7 * k}"/>
      <line x1="${7 * k}" y1="${h * 0.19}" x2="${w * 0.3 - 7 * k}" y2="${h * 0.19}" stroke="#ffffff" stroke-width="${7 * k}"/>
      <rect x="${-5 * k}" y="${h * 0.38}" width="${w * 0.3 + 10 * k}" height="${8 * k}" rx="${2 * k}" fill="#e5e0d6"/>
    </g>
    <path d="M${x + w * 0.06} ${y + h} L${x + w * 0.15} ${floorY} L${x + w * 0.38} ${floorY} L${x + w * 0.47} ${y + h} Z" fill="#ffffff" fill-opacity="0.18"/>
    <g transform="translate(${x + w * 0.8} ${y + h * 0.1})">
      <rect width="${w * 0.15}" height="${floorY - y - h * 0.1}" rx="${3 * k}" fill="#ffffff"/>
      <rect x="${6 * k}" y="${6 * k}" width="${w * 0.15 - 12 * k}" height="${floorY - y - h * 0.1 - 6 * k}" fill="#efe9df"/>
      <circle cx="${w * 0.15 - 18 * k}" cy="${(floorY - y - h * 0.1) * 0.5}" r="${4 * k}" fill="#9ca3af"/>
    </g>
    <path d="M${sx} ${sy} c ${-22 * k} ${-8 * k}, ${-30 * k} ${15 * k}, ${-16 * k} ${26 * k} c ${8 * k} ${13 * k}, ${30 * k} ${16 * k}, ${39 * k} ${6 * k} c ${10 * k} ${-12 * k}, ${4 * k} ${-30 * k}, ${-23 * k} ${-32 * k} z" fill="#8b6f52" fill-opacity="0.35"/>
    <path d="M${sx + 4 * k} ${sy + 8 * k} c ${-10 * k} ${-3 * k}, ${-15 * k} ${9 * k}, ${-6 * k} ${15 * k} c ${6 * k} ${6 * k}, ${18 * k} ${4 * k}, ${20 * k} ${-3 * k} c ${1 * k} ${-8 * k}, ${-5 * k} ${-12 * k}, ${-14 * k} ${-12 * k} z" fill="#6b5340" fill-opacity="0.35"/>
    <circle cx="${sx + 3 * k}" cy="${sy + 9 * k}" r="${42 * k}" fill="none" stroke="${VERDE}" stroke-width="${3 * k}" stroke-dasharray="${9 * k} ${7 * k}"/>
  </g>`;
}

/**
 * Celular con la app: cabecera "Acta de entrega", la foto del living, el sello
 * "Foto certificada" y tres chips. Ancho w (alto proporcional); puede quedar
 * recortado por el borde inferior del lienzo a propósito.
 */
function telefono(x, y, w, id = "t") {
  const k = w / 540;
  const h = 1120 * k;
  const r = 70 * k;
  const bezel = 16 * k;
  const sx = x + bezel, sy = y + bezel, sw = w - 2 * bezel;
  const pad = 30 * k;
  const photoY = sy + 150 * k;
  const photoW = sw - 2 * pad;
  const photoH = 330 * k;
  const chipY = photoY + photoH + 78 * k;
  const chips = ["Fecha y hora", "Huella digital", "Ubicación"];
  const chipW = (photoW - 2 * 12 * k) / 3;
  return `
  <g filter="url(#sombra)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${INK}"/>
  </g>
  <rect x="${sx}" y="${sy}" width="${sw}" height="${h - 2 * bezel}" rx="${r - bezel}" fill="#ffffff"/>
  <rect x="${x + w / 2 - 60 * k}" y="${sy + 18 * k}" width="${120 * k}" height="${30 * k}" rx="${15 * k}" fill="${INK}"/>
  <!-- cabecera de la app -->
  <g transform="translate(${sx + pad} ${sy + 72 * k})">
    <rect width="${44 * k}" height="${44 * k}" rx="${11 * k}" fill="${VERDE}"/>
    <g transform="translate(${7 * k} ${7 * k}) scale(${0.47 * k})" fill="none" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>
    <text x="${58 * k}" y="${20 * k}" font-family="${FONT}" font-size="${24 * k}" font-weight="700" fill="${INK}">Acta de entrega</text>
    <text x="${58 * k}" y="${46 * k}" font-family="${FONT}" font-size="${19 * k}" font-weight="500" fill="${GRIS}">Living · foto 12 de 36</text>
  </g>
  ${escena(sx + pad, photoY, photoW, photoH, id + "-clip")}
  <g transform="translate(${sx + pad + 16 * k} ${photoY + 16 * k})"><rect width="${196 * k}" height="${36 * k}" rx="${18 * k}" fill="${INK}" fill-opacity="0.72"/><text x="${16 * k}" y="${24 * k}" font-family="${FONT}" font-size="${17 * k}" font-weight="600" fill="#ffffff">14 mar 2026 · 10:32</text></g>
  <!-- sello -->
  <g transform="translate(${sx + pad} ${photoY + photoH - 34 * k})" filter="url(#sombra2)">
    <rect width="${photoW}" height="${76 * k}" rx="${20 * k}" fill="${VERDE}"/>
    <circle cx="${44 * k}" cy="${38 * k}" r="${22 * k}" fill="#ffffff"/>
    <path d="M${33 * k} ${38 * k} l${8 * k} ${8 * k} l${15 * k} ${-16 * k}" fill="none" stroke="${VERDE}" stroke-width="${4.5 * k}" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${82 * k}" y="${49 * k}" font-family="${FONT}" font-size="${30 * k}" font-weight="800" fill="#ffffff">Foto certificada</text>
  </g>
  <!-- chips -->
  ${chips
    .map(
      (c, i) => `<g transform="translate(${sx + pad + i * (chipW + 12 * k)} ${chipY})">
    <rect width="${chipW}" height="${58 * k}" rx="${16 * k}" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="${2 * k}"/>
    <circle cx="${22 * k}" cy="${29 * k}" r="${9 * k}" fill="${VERDE}"/>
    <path d="M${17 * k} ${29 * k} l${3.5 * k} ${3.5 * k} l${7 * k} ${-7 * k}" fill="none" stroke="#ffffff" stroke-width="${2.2 * k}" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${38 * k}" y="${35 * k}" font-family="${FONT}" font-size="${16.5 * k}" font-weight="700" fill="${INK}">${esc(c)}</text>
  </g>`
    )
    .join("")}
  <!-- siguiente foto (insinuada) -->
  <rect x="${sx + pad}" y="${chipY + 90 * k}" width="${photoW}" height="${330 * k}" rx="${22 * k}" fill="#e5e7eb"/>
  <text x="${sx + pad + 20 * k}" y="${chipY + 128 * k}" font-family="${FONT}" font-size="${19 * k}" font-weight="600" fill="${GRIS}">Cocina · foto 13 de 36</text>`;
}

function cta(x, y, k = 1, anchorCenter = false) {
  const bw = 470 * k, bh = 92 * k;
  const bx = anchorCenter ? x - bw / 2 : x;
  return `
  <g transform="translate(${bx} ${y})" filter="url(#sombra2)">
    <rect width="${bw}" height="${bh}" rx="${bh / 2}" fill="url(#btn)"/>
    <text x="${38 * k}" y="${bh * 0.65}" font-family="${FONT}" font-size="${36 * k}" font-weight="800" fill="#ffffff">Crea tu acta gratis</text>
    <path d="M${bw - 66 * k} ${bh / 2 - 13 * k} l${15 * k} ${13 * k} l${-15 * k} ${13 * k}" fill="none" stroke="#ffffff" stroke-width="${4.5 * k}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
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

const LINEAS = (c) => [
  ["Acta de entrega", INK],
  ["con fotos", INK],
  ["certificadas.", c],
];
const SUB = "Gratis · en 10 minutos · desde el celular";

// ------------------------------------------------------------------ 9:16
{
  const W = 1080, H = 1920, M = 72;
  // Zonas seguras: libre el 14 % superior (269) y el 20 % inferior (384).
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H, 540, 1300)}
  ${marca(M, 300)}
  ${titular(M, 480, 108, LINEAS(VERDE), SUB, 34)}
  ${cta(M, 850, 1)}
  ${telefono(270, 1010, 540, "a")}
  <text x="${W - M}" y="920" text-anchor="end" font-family="${FONT}" font-size="30" font-weight="700" fill="${VERDE_OSC}">certifoto.cl</text>
</svg>`;
  render("anuncio-certifoto-9x16-historia.png", svg, W);
}

// ------------------------------------------------------------------ 4:5
{
  const W = 1080, H = 1350, M = 72;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H, 540, 1000)}
  ${marca(M, 96)}
  ${titular(M, 262, 96, LINEAS(VERDE), SUB, 31)}
  ${cta(M, 592, 0.95)}
  ${telefono(300, 745, 480, "b")}
  <text x="${W - M}" y="652" text-anchor="end" font-family="${FONT}" font-size="28" font-weight="700" fill="${VERDE_OSC}">certifoto.cl</text>
</svg>`;
  render("anuncio-certifoto-4x5-feed.png", svg, W);
}

// ------------------------------------------------------------------ 1:1
{
  const W = 1080, H = 1080, M = 72;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H, 760, 760)}
  ${marca(M, 72, 48)}
  ${titular(M, 220, 80, LINEAS(VERDE), SUB, 27)}
  ${cta(M, 488, 0.85)}
  ${telefono(320, 592, 440, "c")}
  <text x="${W - M}" y="542" text-anchor="end" font-family="${FONT}" font-size="26" font-weight="700" fill="${VERDE_OSC}">certifoto.cl</text>
</svg>`;
  render("anuncio-certifoto-1x1-cuadrado.png", svg, W);
}

console.log("listo:", OUT);
