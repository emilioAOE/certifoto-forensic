/**
 * Kit de Instagram de CertiFoto (marketing, no forma parte del build).
 * Requiere @resvg/resvg-js, que NO es dependencia del proyecto: instálalo aparte
 * (por ejemplo en una carpeta temporal con `npm i @resvg/resvg-js`) y ejecuta:
 *   node scripts/instagram-kit.js <carpeta-de-salida>
 * Genera 00-foto-de-perfil.png (1080x1080) y 8 publicaciones 4:5 (1080x1350).
 * Cambia "@certifoto.cl" en marco() si el usuario final es otro.
 */
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const W = 1080;
const H = 1350;
const FONT = "'Segoe UI', 'Segoe UI Variable', Inter, Arial, sans-serif";

// Marca (paths del logo de public/og-image.svg, viewBox 0 0 64 64 aprox.)
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

const ICONS = {
  camera:
    '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  key:
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  gauge:
    '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  alert:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  fileCheck:
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m9 15 2 2 4-4"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  download:
    '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  coins:
    '<path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/><path d="M15 6h1v4"/><path d="m6.134 14.768.866-.5 2 3.464"/><circle cx="16" cy="8" r="6"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  clipboard:
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
};

const GREEN = { bg: ["#f0fdf4", "#dcfce7"], accent: "#16a34a", ink: "#14532d" };
const AMBER = { bg: ["#fffbeb", "#fef3c7"], accent: "#d97706", ink: "#78350f" };
const SLATE = { bg: ["#f8fafc", "#e2e8f0"], accent: "#475569", ink: "#0f172a" };
const TEAL = { bg: ["#f0fdfa", "#ccfbf1"], accent: "#0d9488", ink: "#134e4a" };
const INDIGO = { bg: ["#eef2ff", "#e0e7ff"], accent: "#4f46e5", ink: "#312e81" };
const PURPLE = { bg: ["#fdf4ff", "#fae8ff"], accent: "#c026d3", ink: "#701a75" };

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function defs(t, id = "p") {
  return `<defs>
  <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg[0]}"/><stop offset="1" stop-color="${t.bg[1]}"/></linearGradient>
  <radialGradient id="${id}-glow"><stop offset="0" stop-color="${t.accent}" stop-opacity="0.2"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${t.ink}" stroke-opacity="0.08"/></pattern>
</defs>`;
}

function fondo(t, glowX = 760, glowY = 380) {
  return `<rect width="${W}" height="${H}" fill="url(#p-bg)"/><rect width="${W}" height="${H}" fill="url(#p-grid)"/><circle cx="${glowX}" cy="${glowY}" r="420" fill="url(#p-glow)"/>`;
}

/** Marca arriba y pie abajo (dentro de la zona segura del recorte 1:1: y 135–1215). */
function marco(t, pie = "certifoto.cl · link en la bio") {
  return `
<g transform="translate(72 150)">
  <rect width="56" height="56" rx="14" fill="${t.accent}"/>
  <g transform="translate(9 9) scale(0.6)" fill="none" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>
  <text x="72" y="40" font-family="${FONT}" font-size="34" font-weight="700" fill="${t.ink}">CertiFoto</text>
</g>
<g transform="translate(72 1168)">
  <rect width="${W - 144}" height="2" fill="${t.ink}" fill-opacity="0.12"/>
  <text x="0" y="40" font-family="${FONT}" font-size="26" font-weight="600" fill="${t.ink}" fill-opacity="0.7">${esc(pie)}</text>
  <text x="${W - 144}" y="40" text-anchor="end" font-family="${FONT}" font-size="26" font-weight="600" fill="${t.accent}">@certifoto.cl</text>
</g>`;
}

/** Título en varias líneas (tspans). */
function titulo(lineas, t, y = 300, size = 76, color) {
  const fill = color || t.ink;
  return `<text x="72" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${fill}" letter-spacing="-1.5">${lineas
    .map((l, i) => `<tspan x="72" dy="${i === 0 ? 0 : size * 1.08}">${esc(l)}</tspan>`)
    .join("")}</text>`;
}

function parrafo(lineas, t, y, size = 36, color) {
  const fill = color || t.ink;
  return `<text x="72" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="400" fill="${fill}" fill-opacity="0.85">${lineas
    .map((l, i) => `<tspan x="72" dy="${i === 0 ? 0 : size * 1.4}">${esc(l)}</tspan>`)
    .join("")}</text>`;
}

function chip(texto, t, x = 72, y = 232) {
  const w = texto.length * 15.5 + 44;
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="46" rx="23" fill="${t.accent}"/><text x="${w / 2}" y="31" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="700" letter-spacing="2" fill="#ffffff">${esc(texto.toUpperCase())}</text></g>`;
}

function ficha(icon, t, x, y, size = 150, radio = 34) {
  const s = (size - size * 0.55) / 2;
  const k = (size * 0.55) / 24;
  return `<g transform="translate(${x} ${y})"><rect width="${size}" height="${size}" rx="${radio}" fill="#ffffff" stroke="${t.accent}" stroke-opacity="0.35" stroke-width="3"/><g transform="translate(${s} ${s}) scale(${k})" fill="none" stroke="${t.accent}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" color="${t.accent}">${ICONS[icon]}</g></g>`;
}

function pin(t, x, y) {
  return `<circle cx="${x}" cy="${y}" r="16" fill="#ffffff" stroke="${t.accent}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="6" fill="${t.accent}"/>`;
}

/** Plano de planta con pines (ancho w, alto h). */
function plano(t, x, y, w, h, pines = 3) {
  const wall = `stroke="${t.ink}" stroke-opacity="0.38" stroke-width="4"`;
  const sx = x + w * 0.46;
  const sy = y + h * 0.5;
  const sy2 = y + h * 0.58;
  const r = 60;
  const pts = [
    [x + w * 0.2, y + h * 0.22],
    [x + w * 0.3, y + h * 0.76],
    [x + w * 0.74, y + h * 0.3],
    [x + w * 0.8, y + h * 0.8],
  ].slice(0, pines);
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#ffffff" fill-opacity="0.6" stroke="${t.ink}" stroke-opacity="0.45" stroke-width="5"/>
  <line x1="${sx}" y1="${y}" x2="${sx}" y2="${y + h}" ${wall}/>
  <line x1="${x}" y1="${sy}" x2="${sx}" y2="${sy}" ${wall}/>
  <line x1="${sx}" y1="${sy2}" x2="${x + w}" y2="${sy2}" ${wall}/>
  <path d="M${sx} ${y + 40} a${r} ${r} 0 0 1 ${-r} ${r}" fill="none" ${wall}/>
  <path d="M${x + 60} ${sy} a${r} ${r} 0 0 0 ${r} ${r}" fill="none" ${wall}/>
  <g stroke="${t.ink}" stroke-opacity="0.38" stroke-width="3" stroke-linecap="round">
    <line x1="${x}" y1="${y + h + 34}" x2="${x + w}" y2="${y + h + 34}"/><line x1="${x}" y1="${y + h + 24}" x2="${x}" y2="${y + h + 44}"/><line x1="${sx}" y1="${y + h + 26}" x2="${sx}" y2="${y + h + 42}"/><line x1="${x + w}" y1="${y + h + 24}" x2="${x + w}" y2="${y + h + 44}"/>
  </g>
  ${pts.map(([px, py]) => pin(t, px, py)).join("")}
</g>`;
}

function huella(t, x, y, n = 12, cell = 26, gap = 8) {
  const seq = [0.2, 0.9, 0.4, 0.62, 0.9, 0.2, 0.62, 0.4, 0.9, 0.2, 0.62, 0.9, 0.4, 0.2];
  let s = "";
  for (let i = 0; i < n; i++)
    s += `<rect x="${x + i * (cell + gap)}" y="${y}" width="${cell}" height="${cell}" rx="6" fill="${t.accent}" fill-opacity="${seq[i % seq.length]}"/>`;
  return s;
}

function svg(t, cuerpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(t)}${fondo(t)}${cuerpo}${marco(t)}</svg>`;
}

function render(nombre, svgStr, w = W) {
  const png = new Resvg(svgStr, {
    fitTo: { mode: "width", value: w },
    font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
  })
    .render()
    .asPng();
  fs.writeFileSync(path.join(OUT, nombre), png);
  console.log(nombre, Math.round(png.length / 1024) + " KB");
}

// ------------------------------------------------------------ foto de perfil
{
  const S = 1080;
  const perfil = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16a34a"/><stop offset="1" stop-color="#15803d"/></linearGradient>
<pattern id="gr" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="#ffffff" stroke-opacity="0.08"/></pattern></defs>
<rect width="${S}" height="${S}" fill="url(#g)"/><rect width="${S}" height="${S}" fill="url(#gr)"/>
<circle cx="${S / 2}" cy="${S / 2}" r="470" fill="#ffffff" fill-opacity="0.06"/>
<g transform="translate(${S / 2 - 300} ${S / 2 - 300}) scale(9.375)" fill="none" stroke="#ffffff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS}</g>
</svg>`;
  render("00-foto-de-perfil.png", perfil, S);
}

// ------------------------------------------------------------ publicaciones
const posts = [];

// 1 · Gancho: entrega
posts.push([
  "01-entregas-un-departamento.png",
  svg(
    GREEN,
    chip("Arriendo · Compraventa", GREEN) +
      titulo(["¿Entregas o recibes", "un departamento?"], GREEN, 340) +
      parrafo(
        ["Documenta el estado el día 1, con fotos", "que tienen fecha y huella verificables.", "Es lo que evita la pelea por la garantía."],
        GREEN,
        520
      ) +
      plano(GREEN, 120, 700, 840, 380, 4)
  ),
]);

// 2 · 3 fotos que no pueden faltar
posts.push([
  "02-tres-fotos-que-no-pueden-faltar.png",
  svg(
    AMBER,
    chip("Checklist", AMBER) +
      titulo(["3 fotos que no", "pueden faltar"], AMBER, 340) +
      parrafo(["al entregar o recibir un arriendo"], AMBER, 500) +
      ficha("gauge", AMBER, 72, 600) +
      `<text x="260" y="660" font-family="${FONT}" font-size="40" font-weight="700" fill="${AMBER.ink}">Medidores</text><text x="260" y="710" font-family="${FONT}" font-size="30" fill="${AMBER.ink}" fill-opacity="0.75">Luz, agua y gas: primer plano de la lectura.</text>` +
      ficha("key", AMBER, 72, 790) +
      `<text x="260" y="850" font-family="${FONT}" font-size="40" font-weight="700" fill="${AMBER.ink}">Llaves y controles</text><text x="260" y="900" font-family="${FONT}" font-size="30" fill="${AMBER.ink}" fill-opacity="0.75">Todos sobre la mesa, contados.</text>` +
      ficha("alert", AMBER, 72, 980) +
      `<text x="260" y="1040" font-family="${FONT}" font-size="40" font-weight="700" fill="${AMBER.ink}">Daños existentes</text><text x="260" y="1090" font-family="${FONT}" font-size="30" fill="${AMBER.ink}" fill-opacity="0.75">Rayas, manchas, humedad: de cerca y con contexto.</text>`
  ),
]);

// 3 · Qué es un acta de entrega
posts.push([
  "03-que-es-un-acta-de-entrega.png",
  svg(
    INDIGO,
    chip("Conceptos", INDIGO) +
      titulo(["¿Qué es un acta", "de entrega?"], INDIGO, 340) +
      parrafo(
        ["El documento que fija cómo estaba la", "propiedad el día que se entregan las llaves:", "ambientes, medidores, llaves e inventario.", "", "Sin acta, al final del contrato es tu", "palabra contra la del otro."],
        INDIGO,
        520
      ) +
      ficha("fileCheck", INDIGO, 72, 900, 190, 44) +
      `<text x="300" y="970" font-family="${FONT}" font-size="34" font-weight="700" fill="${INDIGO.ink}">Con CertiFoto queda</text><text x="300" y="1016" font-family="${FONT}" font-size="34" font-weight="700" fill="${INDIGO.ink}">sellada y verificable.</text><text x="300" y="1066" font-family="${FONT}" font-size="28" fill="${INDIGO.ink}" fill-opacity="0.75">Crear el acta es gratis.</text>`
  ),
]);

// 4 · Huella digital
posts.push([
  "04-cada-foto-con-huella-digital.png",
  svg(
    SLATE,
    chip("Evidencia digital", SLATE) +
      titulo(["Cada foto con", "huella digital"], SLATE, 340) +
      parrafo(
        ["Huella SHA-256 y fecha verificable en cada", "imagen y en el PDF completo.", "", "Si alguien edita la foto después,", "la huella deja de coincidir."],
        SLATE,
        520
      ) +
      ficha("shield", SLATE, 72, 880, 190, 44) +
      huella(SLATE, 300, 905, 14, 32, 10) +
      `<text x="300" y="1000" font-family="${FONT}" font-size="30" font-weight="600" fill="${SLATE.ink}">sha256 · 9f3a 2c71 b0e4 d5a6 …</text><text x="300" y="1050" font-family="${FONT}" font-size="28" fill="${SLATE.ink}" fill-opacity="0.75">Cualquiera puede verificarlo en certifoto.cl/forensic.</text>`
  ),
]);

// 5 · Plantilla gratis
posts.push([
  "05-plantilla-gratis.png",
  svg(
    TEAL,
    chip("Gratis", TEAL) +
      titulo(["Plantilla de acta", "de entrega en PDF"], TEAL, 340) +
      parrafo(
        ["Checklist por ambiente, medidores, llaves,", "inventario y firmas. Lista para imprimir", "o llenar en pantalla."],
        TEAL,
        520
      ) +
      ficha("download", TEAL, 72, 720, 190, 44) +
      `<text x="300" y="790" font-family="${FONT}" font-size="34" font-weight="700" fill="${TEAL.ink}">Descárgala gratis</text><text x="300" y="838" font-family="${FONT}" font-size="30" fill="${TEAL.ink}" fill-opacity="0.8">certifoto.cl/plantilla</text><text x="300" y="884" font-family="${FONT}" font-size="28" fill="${TEAL.ink}" fill-opacity="0.7">(link en la bio)</text>` +
      plano(TEAL, 120, 960, 840, 150, 2)
  ),
]);

// 6 · Precio de lanzamiento
posts.push([
  "06-precio-de-lanzamiento.png",
  svg(
    GREEN,
    chip("Precio de lanzamiento −50%", GREEN) +
      titulo(["Crear actas: gratis.", "Certificar: desde", "$1.490."], GREEN, 340) +
      parrafo(["Pago único, sin suscripción. Los créditos no vencen."], GREEN, 620, 32) +
      [
        ["1 certificación", "$1.490", "$2.990"],
        ["3 certificaciones", "$3.990", "$7.990"],
        ["10 certificaciones", "$12.490", "$24.900"],
        ["50 certificaciones", "$49.900", "$99.900"],
      ]
        .map(
          ([n, p, l], i) =>
            `<g transform="translate(72 ${700 + i * 104})"><rect width="936" height="84" rx="18" fill="#ffffff" stroke="${GREEN.accent}" stroke-opacity="0.3" stroke-width="2"/><text x="28" y="53" font-family="${FONT}" font-size="32" font-weight="600" fill="${GREEN.ink}">${n}</text><text x="700" y="53" text-anchor="end" font-family="${FONT}" font-size="28" fill="${GREEN.ink}" fill-opacity="0.5" text-decoration="line-through">${l}</text><text x="906" y="55" text-anchor="end" font-family="${FONT}" font-size="38" font-weight="800" fill="${GREEN.accent}">${p}</text></g>`
        )
        .join("")
  ),
]);

// 7 · Para corredores
posts.push([
  "07-para-corredores.png",
  svg(
    TEAL,
    chip("Corredores y administradoras", TEAL) +
      titulo(["La entrega", "profesional, en", "10 minutos."], TEAL, 340) +
      parrafo(
        ["Sube el contrato (PDF o foto) y la IA", "completa dirección, partes, RUT y fechas.", "Tú solo tomas las fotos."],
        TEAL,
        610
      ) +
      ficha("users", TEAL, 72, 830, 150) +
      ficha("camera", TEAL, 262, 830, 150) +
      ficha("fileCheck", TEAL, 452, 830, 150) +
      `<text x="72" y="1050" font-family="${FONT}" font-size="30" font-weight="600" fill="${TEAL.ink}" fill-opacity="0.85">Partes → fotos → acta sellada, con tu nombre.</text><text x="72" y="1096" font-family="${FONT}" font-size="28" fill="${TEAL.ink}" fill-opacity="0.7">Packs de 10 y 50 para carteras grandes.</text>`
  ),
]);

// 8 · La IA describe las fotos
posts.push([
  "08-la-ia-describe-cada-foto.png",
  svg(
    PURPLE,
    chip("Inteligencia artificial", PURPLE) +
      titulo(["La IA describe", "cada foto."], PURPLE, 340) +
      parrafo(
        ["Reconoce el ambiente (cocina, baño, living),", "describe el estado de forma objetiva y marca", "posibles hallazgos: manchas, rayas, humedad.", "", "Tú revisas y corriges. La IA no reparte culpas."],
        PURPLE,
        520
      ) +
      ficha("sparkles", PURPLE, 72, 900, 190, 44) +
      `<g transform="translate(300 900)"><rect width="708" height="190" rx="24" fill="#ffffff" stroke="${PURPLE.accent}" stroke-opacity="0.3" stroke-width="2"/><text x="28" y="50" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="2" fill="${PURPLE.accent}">COCINA · FOTO 3</text><text x="28" y="96" font-family="${FONT}" font-size="26" fill="${PURPLE.ink}">Muebles en buen estado. Cubierta con</text><text x="28" y="132" font-family="${FONT}" font-size="26" fill="${PURPLE.ink}">una raya superficial junto al lavaplatos.</text><text x="28" y="168" font-family="${FONT}" font-size="24" fill="${PURPLE.ink}" fill-opacity="0.6">Hallazgo: rayadura · confianza media</text></g>`
  ),
]);

for (const [nombre, s] of posts) render(nombre, s);
console.log("listo:", OUT);
