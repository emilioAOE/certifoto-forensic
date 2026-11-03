/**
 * Páginas públicas (marketing, blog, login, certificado express): se
 * renderizan en el servidor y sin el marco de la app (AppShell).
 */
export function esRutaPublica(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/blog") ||
    pathname === "/faq" ||
    pathname === "/precios" ||
    pathname === "/corredores" ||
    pathname === "/sobre" ||
    pathname === "/contacto" ||
    pathname === "/terminos" ||
    pathname === "/privacidad" ||
    pathname === "/plantilla" ||
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/certificar")
  );
}

/**
 * Dónde cargar el almacenamiento local (IndexedDB con actas y fotos): en la
 * app, y en el certificado express, que arma y guarda un acta aunque no
 * lleve el marco de la app. En el resto de páginas públicas no hace falta.
 */
export function cargaAlmacenamientoLocal(pathname: string): boolean {
  return !esRutaPublica(pathname) || pathname.startsWith("/certificar");
}
