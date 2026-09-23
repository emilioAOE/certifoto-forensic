/**
 * Páginas públicas (marketing, blog, login): se renderizan en el servidor,
 * sin el marco de la app (AppShell) y sin cargar el almacenamiento local
 * (StorageProvider). Una sola lista para los dos.
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
    pathname.startsWith("/auth")
  );
}
