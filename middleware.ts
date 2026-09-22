import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Anuncios pagados que apuntan a la portada → directo a crear el acta, que
  // es lo que promete el anuncio. La campaña de Instagram de sept-2026 quedó
  // configurada con certifoto.cl como destino y 82 de 85 visitas se fueron
  // sin tocar nada: en el celular la portada no mostraba ningún botón en la
  // primera pantalla. Se conservan todos los parámetros (fbclid y utm_* de
  // Meta) para que el píxel atribuya la conversión al anuncio.
  const url = request.nextUrl;
  if (url.pathname === "/" && url.searchParams.get("utm_medium") === "paid") {
    const destino = url.clone();
    destino.pathname = "/actas/nueva";
    return NextResponse.redirect(destino, 307);
  }
  return updateSession(request);
}

export const config = {
  // Todo menos assets estáticos y las rutas /api (no usan sesión: el cobro de
  // créditos va directo del navegador a Postgres vía RPC con RLS).
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|xml|json|mjs|js|css|woff|woff2)$).*)",
  ],
};
