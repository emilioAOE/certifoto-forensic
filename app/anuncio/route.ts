/**
 * certifoto.cl/anuncio — destino de los anuncios pagados (Meta/Instagram Ads).
 *
 * Lleva a /corredores: se renderiza en el servidor (se ve al instante en el
 * navegador de Instagram), explica el producto y tiene el botón para crear el
 * acta en la primera pantalla. Antes llevaba directo a /actas/nueva, que en el
 * celular mostraba una pantalla blanca de carga y luego un formulario sin
 * contexto. Redirección temporal (307) para poder cambiar el destino sin tocar
 * los anuncios.
 *
 * Conserva TODO lo que agrega Meta (fbclid y sus utm_*): el fbclid es lo que
 * el píxel convierte en la cookie _fbc para atribuir la conversión al anuncio;
 * si se pierde en la redirección, Meta ve visitas pero no sabe de qué anuncio
 * vinieron. Solo completa los utm que falten.
 *
 * Parámetros propios (opcionales, no se reenvían):
 *   ?f=4x5|1x1|9x16   → utm_content si Meta no mandó uno
 *   ?c=<campaña>       → utm_campaign si Meta no mandó uno
 */

import { NextResponse, type NextRequest } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";
const PROPIOS = new Set(["f", "c"]);

export function GET(request: NextRequest) {
  const entrada = new URL(request.url).searchParams;
  const destino = new URL("/corredores", SITE_URL);

  // 1. Reenviar lo que venga (fbclid, utm_* de Meta, etc.), saneado.
  entrada.forEach((valor, clave) => {
    if (PROPIOS.has(clave)) return;
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(clave)) return;
    destino.searchParams.set(clave, valor.slice(0, 500));
  });

  // 2. Completar lo que falte.
  if (!destino.searchParams.has("utm_source")) destino.searchParams.set("utm_source", "instagram");
  if (!destino.searchParams.has("utm_medium")) destino.searchParams.set("utm_medium", "paid");
  if (!destino.searchParams.has("utm_campaign")) {
    destino.searchParams.set("utm_campaign", limpiar(entrada.get("c")) || "acta");
  }
  const formato = limpiar(entrada.get("f"));
  if (formato && !destino.searchParams.has("utm_content")) {
    destino.searchParams.set("utm_content", formato);
  }

  return NextResponse.redirect(destino, 307);
}

/** Solo letras, números, guion y guion bajo; máximo 40 caracteres. */
function limpiar(v: string | null): string {
  return (v ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
}
