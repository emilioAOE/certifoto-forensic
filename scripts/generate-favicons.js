/* eslint-disable @typescript-eslint/no-require-imports */
// Genera favicon.ico, icon-192.png, icon-512.png, apple-touch-icon.png
// con el branding CertiFoto (gradiente verde + "Cf").
// Ejecutar: node scripts/generate-favicons.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");

// SVG fuente: cuadrado con esquinas redondeadas, gradiente verde, letras "Cf" blancas centradas.
// Para que el ICO de 16/32px se vea legible, usamos una "C" grande con una "f" pequena en superindice.
function makeSvg(size) {
  // Para tamanos chicos (<=48), usamos solo "C" para que se lea.
  const small = size <= 48;
  const radius = Math.round(size * 0.19);
  const fontSize = small ? size * 0.78 : size * 0.62;
  const fY = small ? size * 0.72 : size * 0.66;
  const cY = small ? size * 0.78 : size * 0.7;

  if (small) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <text x="50%" y="${cY}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-${Math.round(fontSize * 0.04)}">C</text>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <text x="50%" y="${fY}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-${Math.round(fontSize * 0.06)}">Cf</text>
</svg>`;
}

async function svgToPngBuffer(size) {
  const svg = makeSvg(size);
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
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
    ico.writeUInt8(0, offset); offset += 1; // color palette
    ico.writeUInt8(0, offset); offset += 1; // reserved
    ico.writeUInt16LE(1, offset); offset += 2; // planes
    ico.writeUInt16LE(32, offset); offset += 2; // bpp
    ico.writeUInt32LE(img.buffer.length, offset); offset += 4;
    ico.writeUInt32LE(dataOffset, offset); offset += 4;
    dataOffset += img.buffer.length;
  }

  // Datos PNG
  for (const img of images) {
    img.buffer.copy(ico, offset);
    offset += img.buffer.length;
  }

  return ico;
}

async function main() {
  const sizes = [16, 32, 48, 64];
  const images = [];
  for (const size of sizes) {
    const buffer = await svgToPngBuffer(size);
    images.push({ size, buffer });
  }

  const ico = buildIco(images);
  const faviconPath = path.join(ROOT, "app", "favicon.ico");
  fs.writeFileSync(faviconPath, ico);
  console.log(`OK app/favicon.ico (${ico.length} bytes, ${sizes.length} sizes)`);

  // PNGs publicos para el manifest
  const png192 = await svgToPngBuffer(192);
  fs.writeFileSync(path.join(ROOT, "public", "icon-192.png"), png192);
  console.log(`OK public/icon-192.png (${png192.length} bytes)`);

  const png512 = await svgToPngBuffer(512);
  fs.writeFileSync(path.join(ROOT, "public", "icon-512.png"), png512);
  console.log(`OK public/icon-512.png (${png512.length} bytes)`);

  // Apple touch icon (180x180 sin esquinas redondeadas, iOS las pone)
  const apple = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#16a34a"/>
            <stop offset="100%" stop-color="#15803d"/>
          </linearGradient>
        </defs>
        <rect width="180" height="180" fill="url(#bg)"/>
        <text x="50%" y="119" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-7">Cf</text>
      </svg>`
    )
  )
    .resize(180, 180)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(ROOT, "public", "apple-touch-icon.png"), apple);
  console.log(`OK public/apple-touch-icon.png (${apple.length} bytes)`);

  // Reescribimos el SVG estatico para que tambien sea coherente (Cf en lugar del dibujo previo)
  const newSvg = makeSvg(512);
  fs.writeFileSync(path.join(ROOT, "public", "icon.svg"), newSvg);
  console.log(`OK public/icon.svg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
