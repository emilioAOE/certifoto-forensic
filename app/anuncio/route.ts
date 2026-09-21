/**
 * certifoto.cl/anuncio — destino de los anuncios pagados (Meta/Instagram Ads).
 *
 * Lleva DIRECTO a crear el acta (lo que promete el anuncio), con UTM de
 * campaña pagada. Redirección temporal (307) para poder cambiar el destino
 * sin tocar los anuncios. Parámetros opcionales que se conservan:
 *   ?f=4x5|1x1|9x16   → utm_content (qué formato del anuncio trajo el clic)
 *   ?c=<campaña>       → utm_campaign (por defecto "acta")
 */

import { NextResponse, type NextRequest } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

export function GET(request: NextRequest) {
  const entrada = new URL(request.url).searchParams;
  const destino = new URL("/actas/nueva", SITE_URL);
  destino.searchParams.set("utm_source", "instagram");
  destino.searchParams.set("utm_medium", "paid");
  destino.searchParams.set("utm_campaign", limpiar(entrada.get("c")) || "acta");
  const formato = limpiar(entrada.get("f"));
  if (formato) destino.searchParams.set("utm_content", formato);
  return NextResponse.redirect(destino, 307);
}

/** Solo letras, números, guion y guion bajo; máximo 40 caracteres. */
function limpiar(v: string | null): string {
  return (v ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
}
