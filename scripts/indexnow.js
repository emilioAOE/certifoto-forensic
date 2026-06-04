#!/usr/bin/env node
/**
 * Notifica a los motores que soportan IndexNow (Bing, Yandex, DuckDuckGo,
 * Seznam) que las URLs del sitio se crearon o actualizaron, para acelerar
 * el rastreo. Google NO usa IndexNow todavia: para Google hay que usar
 * "Request Indexing" en Search Console.
 *
 * Como funciona:
 *  1. Hay un archivo de verificacion en public/<KEY>.txt cuyo contenido es
 *     la propia KEY. IndexNow lo consulta para confirmar que controlas el
 *     dominio.
 *  2. Este script lee las URLs del sitemap en vivo y las envia en un POST
 *     al endpoint de IndexNow. Re-ejecutalo cuando agregues/edites paginas.
 *
 * Uso:
 *   node scripts/indexnow.js
 *   node scripts/indexnow.js https://www.certifoto.cl/blog/nuevo-post  (1+ URLs sueltas)
 *
 * La KEY no es secreta (se sirve publicamente), por eso vive en el codigo.
 */

const KEY = "fceee884e8c2996942f0db4b8974d91d";
const HOST = "www.certifoto.cl";
const SITE = `https://${HOST}`;
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function getSitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml respondio ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return urls.filter((u) => u.startsWith(SITE));
}

async function main() {
  const cliUrls = process.argv.slice(2).filter((a) => a.startsWith("http"));
  const urlList = cliUrls.length ? cliUrls : await getSitemapUrls();

  if (!urlList.length) {
    console.error("[indexnow] No hay URLs para enviar.");
    process.exit(1);
  }

  console.log(`[indexnow] Enviando ${urlList.length} URLs a IndexNow...`);
  urlList.forEach((u) => console.log(`  - ${u}`));

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  const body = await res.text();
  console.log(`[indexnow] HTTP ${res.status} ${res.statusText}`);
  if (body) console.log(`[indexnow] respuesta: ${body}`);

  // 200 = aceptado, 202 = aceptado (validacion de key pendiente)
  if (res.status === 200 || res.status === 202) {
    console.log("[indexnow] OK — URLs encoladas para rastreo.");
  } else {
    console.error("[indexnow] Fallo. Revisa que el archivo de key este publico.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[indexnow] Error:", err.message);
  process.exit(1);
});
