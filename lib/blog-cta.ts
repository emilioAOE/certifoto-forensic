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

/**
 * Ofertas a medida para los artículos que más tráfico de búsqueda traen
 * (analítica 2026-09): el lector llega con un problema concreto y el CTA
 * genérico ("plantilla gratis") casi no convierte. Cada uno conecta el
 * problema del artículo con lo que el acta resuelve.
 */
const POR_SLUG: Record<string, Partial<{ mid: CtaConfig; end: CtaConfig }>> = {
  "mantenciones-arrendatario-arrendador-ley-chile": {
    mid: {
      icon: "acta",
      title: "¿Quién debe reparar? Primero deja constancia del estado",
      description:
        "La discusión sobre si un daño es desgaste normal o mal uso se resuelve con evidencia fechada. Crea un acta de estado con fotos (huella SHA-256 y fecha verificable) en 10 minutos, gratis.",
      primary: { href: "/dashboard", label: "Crear acta de estado gratis" },
      secondary: { href: "/plantilla", label: "O descarga la plantilla PDF" },
    },
    end: {
      icon: "acta",
      title: "La próxima reparación no debería ser una pelea",
      description:
        "Un acta de entrega bien hecha fija quién recibió qué y en qué estado. Con CertiFoto cada foto queda con fecha y huella, y el PDF se puede verificar. Crear el acta es gratis.",
      primary: { href: "/dashboard", label: "Crear mi acta gratis" },
      secondary: { href: "/blog/acta-entrega-propiedad-arriendo-que-incluir", label: "Qué debe incluir un acta" },
    },
  },
  "aviso-termino-contrato-arriendo-carta-modelo": {
    mid: {
      icon: "acta",
      title: "Después del aviso viene la devolución: prepárala",
      description:
        "Al terminar el contrato se compara el estado actual con el de la entrega. Si no hay acta de entrega, haz hoy un acta de estado con fotos fechadas para tener una base clara el día de las llaves.",
      primary: { href: "/dashboard", label: "Crear acta de devolución gratis" },
      secondary: { href: "/plantilla", label: "O descarga la plantilla PDF" },
    },
    end: {
      icon: "acta",
      title: "Que la devolución de la garantía no sea tu palabra contra la suya",
      description:
        "El acta de devolución con fotos certificadas es lo que cierra el contrato sin discusión. Cada foto lleva fecha y huella SHA-256; el PDF se verifica sin cuenta. Gratis crear, pagas solo al certificar.",
      primary: { href: "/dashboard", label: "Crear mi acta gratis" },
      secondary: { href: "/blog/devolver-departamento-sin-perder-garantia", label: "Cómo devolver sin perder la garantía" },
    },
  },
  "terminar-contrato-arriendo-antes-de-tiempo": {
    end: {
      icon: "acta",
      title: "Si vas a entregar antes, entrega con acta",
      description:
        "Una salida anticipada termina en discusión por la garantía si no hay registro del estado. Documenta la devolución con fotos fechadas y huella verificable. Crear el acta es gratis.",
      primary: { href: "/dashboard", label: "Crear acta de devolución gratis" },
      secondary: { href: "/plantilla", label: "O descarga la plantilla PDF" },
    },
  },
  "comision-corredor-propiedades-arriendo": {
    end: {
      icon: "acta",
      title: "Para corredores: la entrega profesional en 10 minutos",
      description:
        "Sube el contrato, la IA completa las partes, tomas las fotos por ambiente y el acta sale sellada con tu nombre, lista para enviar a arrendador y arrendatario por correo.",
      primary: { href: "/dashboard", label: "Probar con una entrega" },
      secondary: { href: "/precios", label: "Ver packs para corredores" },
    },
  },
  "documentos-pedir-arrendatario-screening": {
    end: {
      icon: "acta",
      title: "Ya elegiste arrendatario: ahora entrega con acta",
      description:
        "El filtro evita el mal pagador; el acta de entrega evita la pelea por los daños. Fotos por ambiente con fecha y huella verificable, en 10 minutos, gratis.",
      primary: { href: "/dashboard", label: "Crear acta de entrega gratis" },
      secondary: { href: "/plantilla", label: "O descarga la plantilla PDF" },
    },
  },
};

export function blogCtas(
  category: string,
  slug?: string
): { mid: CtaConfig; end: CtaConfig } {
  const base = ctasPorCategoria(category);
  const propio = slug ? POR_SLUG[slug] : undefined;
  if (!propio) return base;
  return { mid: propio.mid ?? base.mid, end: propio.end ?? base.end };
}

function ctasPorCategoria(category: string): { mid: CtaConfig; end: CtaConfig } {
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
