/**
 * Builders de structured data (schema.org) para SEO + GEO.
 *
 * GEO (Generative Engine Optimization): los motores generativos (ChatGPT,
 * Perplexity, Google AI Overviews, Claude) usan structured data + texto
 * factual claro para entender y citar el sitio. Definir bien la entidad
 * CertiFoto, la oferta, y el FAQ aumenta la probabilidad de ser citado.
 */

import { PACKS, formatCLP } from "./packs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Entidad CertiFoto — la "ficha" canonica de la marca. */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "CertiFoto",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    description:
      "Plataforma chilena para crear actas digitales del estado de propiedades arrendadas, con respaldo forense de fotografías, descripciones asistidas con IA y firma digital de las partes.",
    areaServed: { "@type": "Country", name: "Chile" },
    email: "contacto@certifoto.cl",
    foundingLocation: { "@type": "Place", name: "Santiago, Chile" },
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "CertiFoto",
    inLanguage: "es-CL",
    publisher: { "@id": ORG_ID },
  };
}

/** La app como SoftwareApplication con su modelo de precios (packs). */
export function softwareApplicationSchema(): Record<string, unknown> {
  return {
    "@type": "SoftwareApplication",
    name: "CertiFoto",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    inLanguage: "es-CL",
    description:
      "Crea actas digitales de entrega, devolución e inspección de propiedades arrendadas. Subes las fotos, la IA detecta los ambientes y extrae los datos del contrato, y certificas el documento con un sello inmutable.",
    publisher: { "@id": ORG_ID },
    offers: PACKS.map((p) => ({
      "@type": "Offer",
      name: p.label,
      price: p.priceCLP,
      priceCurrency: "CLP",
      description: `${p.size} certificación(es) de actas. Pago único, sin suscripción.`,
      url: `${SITE_URL}/precios`,
    })),
  };
}

/** Grafo combinado para la home: Organization + WebSite + SoftwareApplication. */
export function homeGraph(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      softwareApplicationSchema(),
    ],
  };
}

/** FAQPage a partir de pares pregunta/respuesta. */
export function faqPageSchema(
  qa: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "es-CL",
    mainEntity: qa.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Product con OfferCatalog para la pagina de precios. */
export function pricingProductSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Certificaciones CertiFoto",
    description:
      "Packs de certificaciones para sellar actas digitales en CertiFoto. La app es gratis; solo se paga al certificar un acta.",
    brand: { "@type": "Brand", name: "CertiFoto" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CLP",
      lowPrice: Math.min(...PACKS.map((p) => p.priceCLP)),
      highPrice: Math.max(...PACKS.map((p) => p.priceCLP)),
      offerCount: PACKS.length,
      offers: PACKS.map((p) => ({
        "@type": "Offer",
        name: p.label,
        price: p.priceCLP,
        priceCurrency: "CLP",
        description: `${p.size} certificación(es) · ${formatCLP(
          p.unitPriceCLP
        )} por certificación`,
        url: `${SITE_URL}/precios`,
        availability: "https://schema.org/InStock",
      })),
    },
  };
}
