#!/usr/bin/env node
/**
 * Copia el worker de PDF.js desde node_modules a public/ para que Next.js
 * lo sirva directamente. Asi evitamos depender de CDNs externos (cdnjs no
 * tiene la version 5.x; unpkg si pero agrega fragilidad).
 *
 * Se ejecuta en `postinstall` para que Vercel builds tengan el worker antes
 * del build de Next.
 */

const fs = require("fs");
const path = require("path");

/**
 * Copiamos DOS archivos:
 *  1. pdf.min.mjs       - el bundle principal (lo cargamos via webpackIgnore
 *                         para sortear el bug de webpack con ESM en pdfjs v5)
 *  2. pdf.worker.min.mjs - el worker, requerido por el bundle principal
 */
const FILES = [
  {
    sources: [
      "node_modules/pdfjs-dist/build/pdf.min.mjs",
      "node_modules/pdfjs-dist/build/pdf.mjs",
    ],
    dest: path.join("public", "pdf.min.mjs"),
  },
  {
    sources: [
      "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
      "node_modules/pdfjs-dist/build/pdf.worker.mjs",
    ],
    dest: path.join("public", "pdf.worker.min.mjs"),
  },
];

function copyOne(sources, dest, root) {
  for (const src of sources) {
    const fullSrc = path.join(root, src);
    if (fs.existsSync(fullSrc)) {
      fs.mkdirSync(path.dirname(path.join(root, dest)), { recursive: true });
      fs.copyFileSync(fullSrc, path.join(root, dest));
      const sizeKb = Math.round(fs.statSync(fullSrc).size / 1024);
      console.log(`[copy-pdf-worker] ${src} -> ${dest} (${sizeKb} KB)`);
      return true;
    }
  }
  return false;
}

function main() {
  const root = process.cwd();
  let okCount = 0;
  for (const f of FILES) {
    if (copyOne(f.sources, f.dest, root)) okCount++;
  }
  if (okCount === 0) {
    console.warn(
      "[copy-pdf-worker] No se encontraron archivos pdfjs-dist. " +
        "El ContractUploader fallara hasta que vuelvas a npm install."
    );
  }
}

main();
