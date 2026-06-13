#!/usr/bin/env node
/**
 * Mezcla los borradores SEO (content/seo-drafts/batch-*.meta.json + .md)
 * dentro de lib/blog-posts.ts, insertándolos al inicio del array BLOG_POSTS.
 *
 * Los .md tienen el contenido CRUDO (sin escapar). Aquí lo codificamos como
 * template literal seguro para evitar cualquier problema de comillas/escapes.
 *
 * Idempotente: si algún slug ya existe en blog-posts.ts, aborta sin tocar nada.
 *
 *   node scripts/merge-seo-drafts.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DRAFTS = path.join(ROOT, "content", "seo-drafts");
const TARGET = path.join(ROOT, "lib", "blog-posts.ts");
const MARKER = "export const BLOG_POSTS: BlogPost[] = [";

const REQUIRED = [
  "slug",
  "title",
  "excerpt",
  "date",
  "author",
  "category",
  "readMinutes",
  "contentFile",
];

/** Normaliza para comparar títulos (minúsculas, sin puntuación, conserva acentos). */
function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Quita un encabezado inicial (# / ## / ###) si duplica el título. */
function stripLeadingTitle(content, title) {
  const lines = content.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length) {
    const m = lines[i].trim().match(/^#{1,3}\s+(.*)$/);
    if (m && norm(m[1]) === norm(title)) {
      lines.splice(0, i + 1);
      while (lines.length && lines[0].trim() === "") lines.shift();
      return lines.join("\n").trim();
    }
  }
  return content;
}

/** Codifica un string como template literal seguro. */
function tl(s) {
  return (
    "`" +
    String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") +
    "`"
  );
}

function die(msg) {
  console.error(`[merge] ERROR: ${msg}`);
  process.exit(1);
}

// 1. Cargar metas
const metaFiles = fs
  .readdirSync(DRAFTS)
  .filter((f) => /^batch-\d+\.meta\.json$/.test(f))
  .sort();

if (metaFiles.length === 0) die("no se encontraron batch-*.meta.json en " + DRAFTS);

const posts = [];
for (const mf of metaFiles) {
  let arr;
  try {
    arr = JSON.parse(fs.readFileSync(path.join(DRAFTS, mf), "utf8"));
  } catch (e) {
    die(`${mf} no es JSON válido: ${e.message}`);
  }
  if (!Array.isArray(arr)) die(`${mf} no contiene un array`);
  for (const entry of arr) {
    for (const k of REQUIRED) {
      if (entry[k] === undefined || entry[k] === null || entry[k] === "")
        die(`${mf}: entrada "${entry.slug || "?"}" sin campo ${k}`);
    }
    const mdPath = path.join(DRAFTS, entry.contentFile);
    if (!fs.existsSync(mdPath))
      die(`${mf}: no existe el archivo de contenido ${entry.contentFile}`);
    let content = fs.readFileSync(mdPath, "utf8").trim();
    content = stripLeadingTitle(content, entry.title);
    if (content.length < 500)
      die(`${entry.contentFile}: contenido demasiado corto (${content.length} chars)`);
    posts.push({
      slug: String(entry.slug),
      title: String(entry.title),
      excerpt: String(entry.excerpt),
      date: String(entry.date),
      author: String(entry.author),
      category: String(entry.category),
      readMinutes: Number(entry.readMinutes),
      content,
    });
  }
}

// 2. Validar unicidad interna
const seen = new Set();
for (const p of posts) {
  if (seen.has(p.slug)) die(`slug duplicado entre borradores: ${p.slug}`);
  seen.add(p.slug);
}

// 3. Leer target y comprobar colisiones con slugs existentes
const original = fs.readFileSync(TARGET, "utf8");
const existingSlugs = new Set(
  [...original.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1])
);
for (const p of posts) {
  if (existingSlugs.has(p.slug))
    die(`el slug "${p.slug}" ya existe en blog-posts.ts (¿ya corriste el merge?)`);
}

const idx = original.indexOf(MARKER);
if (idx === -1) die(`no se encontró el marcador del array en ${TARGET}`);

// 4. Ordenar por fecha desc (newest first) para que el archivo quede ordenado
posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// 5. Generar literales
const objs = posts
  .map(
    (p) => `  {
    slug: ${JSON.stringify(p.slug)},
    title: ${JSON.stringify(p.title)},
    excerpt: ${JSON.stringify(p.excerpt)},
    date: ${JSON.stringify(p.date)},
    author: ${JSON.stringify(p.author)},
    category: ${JSON.stringify(p.category)},
    readMinutes: ${p.readMinutes},
    content: ${tl(p.content)},
  },`
  )
  .join("\n");

const insertAt = idx + MARKER.length;
const block = `\n  // ---- Artículos SEO de arriendo ----\n${objs}\n`;
const updated = original.slice(0, insertAt) + block + original.slice(insertAt);

fs.writeFileSync(TARGET, updated);

// 6. Líneas para llms.txt
const llmsLines = posts
  .map((p) => `- [${p.title}](https://www.certifoto.cl/blog/${p.slug})`)
  .join("\n");
fs.writeFileSync(path.join(DRAFTS, "_llms-lines.txt"), llmsLines + "\n");

console.log(`[merge] Insertados ${posts.length} artículos en lib/blog-posts.ts`);
for (const p of posts) console.log(`   - ${p.date}  ${p.slug}`);
console.log(`[merge] Líneas para llms.txt -> content/seo-drafts/_llms-lines.txt`);
