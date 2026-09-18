/**
 * Copy de los CTA del blog — el "puente" entre el trafico de lectura (SEO)
 * y la app.
 *
 * Vive en lib/ (y no dentro del componente) porque BlogCta.tsx es "use client":
 * si esta funcion se exportara desde ahi, el server component no podria
 * llamarla (todos los exports de un modulo cliente son referencias, no valores).
 *
 * Dos posiciones por articulo:
 *  - mid: a mitad del texto, oferta de baja friccion (plantilla PDF gratis).
 *  - end: al cierre, ya leyo todo, oferta principal (crear el acta).
 */

export type CtaConfig = {
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  icon: "plantilla" | "acta";
};

/** Categorias cuyos lectores ya vienen buscando el acta en si. */
const ACTA_CATEGORIES = new Set(["Guías", "Práctico", "Conceptos", "Técnico", "IA"]);

export function blogCtas(category: string): { mid: CtaConfig; end: CtaConfig } {
  const quiereActa = ACTA_CATEGORIES.has(category);

  const mid: CtaConfig = {
    icon: "plantilla",
    title: "Plantilla de acta de entrega, gratis",
    description:
      "Checklist por ambiente, medidores, llaves, inventario y firmas. La descargas en PDF al instante, lista para imprimir o llenar en pantalla.",
    primary: { href: "/plantilla", label: "Descargar plantilla gratis" },
  };

  const end: CtaConfig = quiereActa
    ? {
        icon: "acta",
        title: "Hazla con respaldo forense, gratis",
        description:
          "Sube las fotos y CertiFoto le calcula el hash SHA-256 a cada una, extrae los metadatos EXIF y arma un PDF auto-verificable. Crear el acta es gratis y no necesitas registrarte.",
        primary: { href: "/dashboard", label: "Crear mi acta gratis" },
        secondary: { href: "/plantilla", label: "O descarga la plantilla PDF" },
      }
    : {
        icon: "acta",
        title: "La mayoría de estos conflictos se evitan con un acta",
        description:
          "Dejar constancia del estado de la propiedad el día de la entrega es lo que convierte una discusión en una prueba. En CertiFoto cada foto queda con su huella SHA-256 y fecha verificable. Gratis, sin registro.",
        primary: { href: "/dashboard", label: "Crear mi acta gratis" },
        secondary: { href: "/plantilla", label: "O descarga la plantilla PDF" },
      };

  return { mid, end };
}
