/**
 * certifoto.cl/ig — el link de la bio de Instagram.
 *
 * Redirige a la landing con UTM para que la analítica distinga el tráfico
 * que llega desde el perfil. Redirección temporal (307) a propósito: así se
 * puede cambiar el destino (una campaña, /plantilla, /precios) sin que los
 * navegadores o Instagram se queden con el destino antiguo cacheado.
 */

import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

export function GET() {
  const destino = new URL("/", SITE_URL);
  destino.searchParams.set("utm_source", "instagram");
  destino.searchParams.set("utm_medium", "social");
  destino.searchParams.set("utm_campaign", "bio");
  return NextResponse.redirect(destino, 307);
}
