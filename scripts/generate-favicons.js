/* eslint-disable @typescript-eslint/no-require-imports */
// Genera favicon.ico, icon-192.png, icon-512.png, apple-touch-icon.png
// con el branding CertiFoto (gradiente verde + huella dactilar de lucide).
// Ejecutar: node scripts/generate-favicons.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");

// Paths del icono Fingerprint de lucide-react v1.7.0 (viewBox 24x24, stroke = currentColor).
const FINGERPRINT_PATHS = [
  "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",
  "M14 13.12c0 2.38 0 6.38-1 8.88",
  "M17.29 21.02c.12-.6.43-2.3.5-3.02",
  "M2 12a10 10 0 0 1 18-6",
  "M2 16h.01",
  "M21.8 16c.2-2 .131-5.354 0-6",
  "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",
  "M8.65 22c.21-.66.45-1.32.57-2",
  "M9 6.8a6 6 0 0 1 9 5.2v2",
];

// Construye el SVG: gradiente verde con esquinas redondeadas + huella centrada.
// padding controla cuanto espacio dejar en los bordes (mas chico = icono mas grande).
function makeSvg(size, options = {}) {
  const { padding = 0.18, strokeWidth = 2 } = options;
  const radius = Math.round(size * 0.19);

  // Espacio interno disponible para el icono (24x24)
  const iconArea = size * (1 - padding * 2);
  const iconOffset = size * padding;
  const iconScale = iconArea / 24;

  // Para tamaños chicos hay que engrosar la linea para que se vea
  const stroke = strokeWidth / iconScale;

  const paths = FINGERPRINT_PATHS.map(
    (d) => `<path d="${d}"/>`
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <g transform="translate(${iconOffset} ${iconOffset}) scale(${iconScale})" fill="none" stroke="white" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>`;
}

async function svgToPngBuffer(size, options) {
  const svg = makeSvg(size, options);
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

// Para tamanos chicos (<=64px) renderizamos al cuadruple y downsampleamos
// con kernel lanczos. Da bordes mas limpios que renderear directo a 16/32px.
async function svgToPngSharp(size, options) {
  const renderAt = size * 4;
  const svg = makeSvg(renderAt, options);
  return sharp(Buffer.from(svg))
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Construye un ICO multi-tamano embebiendo PNGs
function buildIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const n = images.length;

  let totalSize = headerSize + dirEntrySize * n;
  for (const img of images) totalSize += img.buffer.length;

  const ico = Buffer.alloc(totalSize);
  let offset = 0;

  // ICONDIR
  ico.writeUInt16LE(0, offset); offset += 2; // reserved
  ico.writeUInt16LE(1, offset); offset += 2; // type ICO
  ico.writeUInt16LE(n, offset); offset += 2; // count

  // Directorios
  let dataOffset = headerSize + dirEntrySize * n;
  for (const img of images) {
    const dim = img.size === 256 ? 0 : img.size;
    ico.writeUInt8(dim, offset); offset += 1;
    ico.writeUInt8(dim, offset); offset += 1;
    ico.writeUInt8(0, offset); offset += 1;
    ico.writeUInt8(0, offset); offset += 1;
    ico.writeUInt16LE(1, offset); offset += 2;
    ico.writeUInt16LE(32, offset); offset += 2;
    ico.writeUInt32LE(img.buffer.length, offset); offset += 4;
    ico.writeUInt32LE(dataOffset, offset); offset += 4;
    dataOffset += img.buffer.length;
  }

  for (const img of images) {
    img.buffer.copy(ico, offset);
    offset += img.buffer.length;
  }

  return ico;
}

async function main() {
  // Para tamaños chicos, padding mas chico (icono mas grande) y stroke mas gordo
  // para que las lineas no desaparezcan al renderear. Ademas usamos rendering
  // supersampleado para que las curvas se vean limpias.
  const icoSizes = [
    { size: 16, padding: 0.1, strokeWidth: 3.2 },
    { size: 32, padding: 0.13, strokeWidth: 2.6 },
    { size: 48, padding: 0.15, strokeWidth: 2.3 },
    { size: 64, padding: 0.17, strokeWidth: 2.1 },
  ];

  const images = [];
  for (const cfg of icoSizes) {
    const buffer = await svgToPngSharp(cfg.size, cfg);
    images.push({ size: cfg.size, buffer });
  }

  const ico = buildIco(images);
  fs.writeFileSync(path.join(ROOT, "app", "favicon.ico"), ico);
  console.log(`OK app/favicon.ico (${ico.length} bytes, ${icoSizes.length} sizes)`);

  // PNGs para PWA + apple
  const png192 = await svgToPngBuffer(192, { padding: 0.18, strokeWidth: 2 });
  fs.writeFileSync(path.join(ROOT, "public", "icon-192.png"), png192);
  console.log(`OK public/icon-192.png (${png192.length} bytes)`);

  const png512 = await svgToPngBuffer(512, { padding: 0.18, strokeWidth: 2 });
  fs.writeFileSync(path.join(ROOT, "public", "icon-512.png"), png512);
  console.log(`OK public/icon-512.png (${png512.length} bytes)`);

  // Apple touch: sin esquinas redondeadas (iOS las pone)
  const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#16a34a"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
    </defs>
    <rect width="180" height="180" fill="url(#bg)"/>
    <g transform="translate(${180 * 0.18} ${180 * 0.18}) scale(${(180 * 0.64) / 24})" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${FINGERPRINT_PATHS.map((d) => `<path d="${d}"/>`).join("")}
    </g>
  </svg>`;
  const apple = await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(ROOT, "public", "apple-touch-icon.png"), apple);
  console.log(`OK public/apple-touch-icon.png (${apple.length} bytes)`);

  // SVG estatico publico (1:1 con el favicon, escalable)
  fs.writeFileSync(
    path.join(ROOT, "public", "icon.svg"),
    makeSvg(512, { padding: 0.18, strokeWidth: 2 })
  );
  console.log(`OK public/icon.svg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
