/**
 * Anuncio para corredores ("Tu acta de entrega, lista en 10 minutos.") en 4:5 (feed)
 * y 1:1 (Explorar). Sin 9:16: Historias y Reels van excluidos de las ubicaciones.
 * Marketing, no forma parte del build. Requiere @resvg/resvg-js (no es dependencia
 * del proyecto): instálalo aparte y ejecuta  node scripts/instagram-anuncio-corredores.js <carpeta>
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

function chip(texto, x, y, k = 1) {
  const w = texto.length * 13.2 * k + 44 * k;
  const h = 44 * k;
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="${h / 2}" fill="#dcfce7" stroke="#bbf7d0" stroke-width="2"/><text x="${w / 2}" y="${h * 0.66}" text-anchor="middle" font-family="${FONT}" font-size="${19 * k}" font-weight="700" letter-spacing="${1.6 * k}" fill="${VERDE_OSC}">${esc(texto)}</text></g>`;
}

function lineas(x, y, size, ls, peso = 800, spacing = -2) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${peso}" letter-spacing="${spacing}">${ls
    .map(([t, color], i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * 1.06}" fill="${color}">${esc(t)}</tspan>`)
    .join("")}</text>`;
}

function check(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${VERDE}"/><path d="M${cx - r * 0.45} ${cy} l${r * 0.32} ${r * 0.32} l${r * 0.6} ${-r * 0.62}" fill="none" stroke="#ffffff" stroke-width="${r * 0.24}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ---------------------------------------------------------------- escenas
function escenaLiving(x, y, w, h, id) {
  const k = w / 420;
  const floorY = y + h * 0.7;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14 * k}"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wall)"/>
    <rect x="${x}" y="${floorY}" width="${w}" height="${y + h - floorY}" fill="url(#floor)"/>
    <g transform="translate(${x + w * 0.1} ${y + h * 0.14})">
      <rect width="${w * 0.34}" height="${h * 0.4}" rx="${5 * k}" fill="#ffffff"/>
      <rect x="${8 * k}" y="${8 * k}" width="${w * 0.34 - 16 * k}" height="${h * 0.4 - 16 * k}" fill="url(#glass)"/>
      <line x1="${w * 0.17}" y1="${8 * k}" x2="${w * 0.17}" y2="${h * 0.4 - 8 * k}" stroke="#ffffff" stroke-width="${8 * k}"/>
    </g>
    <g transform="translate(${x + w * 0.74} ${y + h * 0.12})">
      <rect width="${w * 0.17}" height="${floorY - y - h * 0.12}" rx="${3 * k}" fill="#ffffff"/>
      <rect x="${7 * k}" y="${7 * k}" width="${w * 0.17 - 14 * k}" height="${floorY - y - h * 0.12 - 7 * k}" fill="#efe9df"/>
    </g>
    <rect x="${x}" y="${floorY - 10 * k}" width="${w}" height="${10 * k}" fill="#ffffff" fill-opacity="0.85"/>
  </g>`;
}

function escenaCocina(x, y, w, h, id) {
  const k = w / 420;
  const floorY = y + h * 0.8;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14 * k}"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eef1f2"/>
    <rect x="${x}" y="${floorY}" width="${w}" height="${y + h - floorY}" fill="#cbd5e1"/>
    <rect x="${x + w * 0.06}" y="${y + h * 0.1}" width="${w * 0.88}" height="${h * 0.24}" fill="#ffffff" stroke="#d6d3cd" stroke-width="${2 * k}"/>
    ${[0.28, 0.5, 0.72].map((f) => `<line x1="${x + w * f}" y1="${y + h * 0.1}" x2="${x + w * f}" y2="${y + h * 0.34}" stroke="#d6d3cd" stroke-width="${2 * k}"/>`).join("")}
    <rect x="${x + w * 0.04}" y="${y + h * 0.5}" width="${w * 0.92}" height="${h * 0.06}" fill="#94a3b8"/>
    <rect x="${x + w * 0.06}" y="${y + h * 0.56}" width="${w * 0.88}" height="${floorY - y - h * 0.56}" fill="#f8fafc" stroke="#d6d3cd" stroke-width="${2 * k}"/>
    ${[0.28, 0.5, 0.72].map((f) => `<line x1="${x + w * f}" y1="${y + h * 0.56}" x2="${x + w * f}" y2="${floorY}" stroke="#d6d3cd" stroke-width="${2 * k}"/>`).join("")}
    <rect x="${x + w * 0.38}" y="${y + h * 0.42}" width="${w * 0.2}" height="${h * 0.08}" rx="${4 * k}" fill="#e2e8f0"/>
  </g>`;
}

function escenaDormitorio(x, y, w, h, id) {
  const k = w / 420;
  const floorY = y + h * 0.74;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14 * k}"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f3f0ea"/>
    <rect x="${x}" y="${floorY}" width="${w}" height="${y + h - floorY}" fill="url(#floor)"/>
    <g transform="translate(${x + w * 0.66} ${y + h * 0.14})">
      <rect width="${w * 0.26}" height="${h * 0.34}" rx="${5 * k}" fill="#ffffff"/>
      <rect x="${7 * k}" y="${7 * k}" width="${w * 0.26 - 14 * k}" height="${h * 0.34 - 14 * k}" fill="url(#glass)"/>
    </g>
    <rect x="${x + w * 0.1}" y="${y + h * 0.36}" width="${w * 0.46}" height="${h * 0.2}" rx="${6 * k}" fill="#c8b8a6"/>
    <rect x="${x + w * 0.06}" y="${y + h * 0.52}" width="${w * 0.54}" height="${h * 0.26}" rx="${6 * k}" fill="#ffffff" stroke="#d6d3cd" stroke-width="${2 * k}"/>
    <rect x="${x + w * 0.06}" y="${y + h * 0.62}" width="${w * 0.54}" height="${h * 0.16}" rx="${4 * k}" fill="#dbeafe"/>
    <rect x="${x + w * 0.12}" y="${y + h * 0.46}" width="${w * 0.16}" height="${h * 0.1}" rx="${6 * k}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="${2 * k}"/>
  </g>`;
}

/**
 * Celular con un acta terminada: certificada, checklist de lo que hizo
 * la plataforma, tres fotos por ambiente y los dos botones de salida.
 */
function telefonoActa(x, y, w, id) {
  const k = w / 540;
  const h = 1120 * k;
  const r = 70 * k;
  const bezel = 16 * k;
  const sx = x + bezel, sy = y + bezel, sw = w - 2 * bezel;
  const pad = 30 * k;
  const cw = sw - 2 * pad;

  const items = [
    "Contrato leído por la IA",
    "Fotos por ambiente, con huella",
    "Verificable con código QR",
    "Enviada al propietario y arrendatario",
  ];
  const listY = sy + 262 * k;
  const rowH = 60 * k;
  const lista = items
    .map((t, i) => {
      const cy = listY + i * rowH + rowH / 2;
      return `${check(sx + pad + 16 * k, cy, 14 * k)}
    <text x="${sx + pad + 44 * k}" y="${cy + 8 * k}" font-family="${FONT}" font-size="${21 * k}" font-weight="600" fill="${INK}">${esc(t)}</text>
    ${i < items.length - 1 ? `<line x1="${sx + pad}" y1="${listY + (i + 1) * rowH}" x2="${sx + pad + cw}" y2="${listY + (i + 1) * rowH}" stroke="#e5e7eb" stroke-width="${2 * k}"/>` : ""}`;
    })
    .join("");

  const thumbsY = sy + 526 * k;
  const tw = (cw - 2 * 12 * k) / 3;
  const th = 130 * k;
  const escenas = [escenaLiving, escenaCocina, escenaDormitorio];
  const thumbs = escenas
    .map((fn, i) => {
      const tx = sx + pad + i * (tw + 12 * k);
      return `${fn(tx, thumbsY, tw, th, `${id}-t${i}`)}${check(tx + tw - 18 * k, thumbsY + 18 * k, 11 * k)}`;
    })
    .join("");

  const btnY = sy + 730 * k;
  return `
  <g filter="url(#sombra)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${INK}"/></g>
  <rect x="${sx}" y="${sy}" width="${sw}" height="${h - 2 * bezel}" rx="${r - bezel}" fill="#ffffff"/>
  <rect x="${x + w / 2 - 60 * k}" y="${sy + 18 * k}" width="${120 * k}" height="${30 * k}" rx="${15 * k}" fill="${INK}"/>
  <g transform="translate(${sx + pad} ${sy + 72 * k})">
    <rect width="${44 * k}" height="${44 * k}" rx="${11 * k}" fill="${VERDE}"/>
    <g transform="translate(${7 * k} ${7 * k}) scale(${0.47 * k})" fill="none" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>
    <text x="${58 * k}" y="${20 * k}" font-family="${FONT}" font-size="${24 * k}" font-weight="700" fill="${INK}">Acta de entrega</text>
    <text x="${58 * k}" y="${46 * k}" font-family="${FONT}" font-size="${19 * k}" font-weight="500" fill="${GRIS}">Emitida por tu corredora</text>
  </g>
  <g transform="translate(${sx + pad} ${sy + 150 * k})" filter="url(#sombra2)">
    <rect width="${cw}" height="${80 * k}" rx="${20 * k}" fill="${VERDE}"/>
    <circle cx="${44 * k}" cy="${40 * k}" r="${22 * k}" fill="#ffffff"/>
    <path d="M${33 * k} ${40 * k} l${8 * k} ${8 * k} l${15 * k} ${-16 * k}" fill="none" stroke="${VERDE}" stroke-width="${4.5 * k}" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${82 * k}" y="${51 * k}" font-family="${FONT}" font-size="${30 * k}" font-weight="800" fill="#ffffff">Acta certificada</text>
  </g>
  ${lista}
  ${thumbs}
  <text x="${sx + pad}" y="${thumbsY + th + 34 * k}" font-family="${FONT}" font-size="${18 * k}" font-weight="500" fill="${GRIS}">36 fotos · fecha y huella verificables</text>
  <rect x="${sx + pad}" y="${btnY}" width="${cw}" height="${64 * k}" rx="${14 * k}" fill="url(#btn)"/>
  <text x="${sx + pad + cw / 2}" y="${btnY + 41 * k}" text-anchor="middle" font-family="${FONT}" font-size="${22 * k}" font-weight="700" fill="#ffffff">Descargar PDF</text>
  <rect x="${sx + pad}" y="${btnY + 80 * k}" width="${cw}" height="${64 * k}" rx="${14 * k}" fill="#ffffff" stroke="#d1d5db" stroke-width="${2 * k}"/>
  <text x="${sx + pad + cw / 2}" y="${btnY + 121 * k}" text-anchor="middle" font-family="${FONT}" font-size="${22 * k}" font-weight="700" fill="${INK}">Enviar por correo a las partes</text>`;
}

function boton(x, y, label, k = 1) {
  const bh = 90 * k;
  const bw = (label.length * 19 + 130) * k;
  return `
  <g transform="translate(${x} ${y})" filter="url(#sombra2)">
    <rect width="${bw}" height="${bh}" rx="${bh / 2}" fill="url(#btn)"/>
    <text x="${38 * k}" y="${bh * 0.64}" font-family="${FONT}" font-size="${35 * k}" font-weight="800" fill="#ffffff">${esc(label)}</text>
    <path d="M${bw - 60 * k} ${bh / 2 - 13 * k} l${15 * k} ${13 * k} l${-15 * k} ${13 * k}" fill="none" stroke="#ffffff" stroke-width="${4.5 * k}" stroke-linecap="round" stroke-linejoin="round"/>
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

const TITULO = [
  ["Tu acta de entrega,", INK],
  ["lista en", INK],
  ["10 minutos.", VERDE],
];

// ------------------------------------------------------------------ 4:5
{
  const W = 1080, H = 1350, M = 72;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H, 540, 1080)}
  ${marca(M, 90)}
  ${chip("PARA CORREDORES DE PROPIEDADES", M, 184)}
  ${lineas(M, 318, 84, TITULO)}
  <text x="${M}" y="560" font-family="${FONT}" font-size="30" font-weight="600" fill="${GRIS}">Fotos certificadas · enviada a las partes · desde $998</text>
  ${boton(M, 598, "Pruébalo gratis", 0.95)}
  <text x="${W - M}" y="656" text-anchor="end" font-family="${FONT}" font-size="28" font-weight="700" fill="${VERDE_OSC}">certifoto.cl</text>
  ${telefonoActa(300, 748, 480, "a")}
</svg>`;
  render("anuncio-corredores-4x5-feed.png", svg, W);
}

// ------------------------------------------------------------------ 1:1
{
  const W = 1080, H = 1080, M = 72;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}${fondo(W, H, 820, 600)}
  ${marca(M, 72, 48)}
  ${chip("PARA CORREDORES", M, 158, 0.95)}
  ${lineas(M, 296, 64, [["Tu acta de", INK], ["entrega, lista", INK], ["en 10 minutos.", VERDE]])}
  <text x="${M}" y="492" font-family="${FONT}" font-size="26" font-weight="600" fill="${GRIS}"><tspan x="${M}">Fotos certificadas y enviada</tspan><tspan x="${M}" dy="36">a las partes. Desde $998.</tspan></text>
  ${boton(M, 590, "Pruébalo gratis", 0.82)}
  <text x="${M}" y="740" font-family="${FONT}" font-size="26" font-weight="700" fill="${VERDE_OSC}">certifoto.cl/corredores</text>
  ${telefonoActa(588, 196, 440, "b")}
</svg>`;
  render("anuncio-corredores-1x1-explorar.png", svg, W);
}

console.log("listo:", OUT);
