/**
 * Builders de structured data (schema.org) para SEO + GEO.
 *
 * GEO (Generative Engine Optimization): los motores generativos (ChatGPT,
 * Perplexity, Google AI Overviews, Claude) usan structured data + texto
 * factual claro para entender y citar el sitio. Definir bien la entidad
 * CertiFoto, la oferta, y el FAQ aumenta la probabilidad de ser citado.
 */

import { PACKS, PRECIO_EXPRESS_CLP, formatCLP } from "./packs";
import { SITE_AUTHOR } from "./site-author";
import { PERFILES_OFICIALES } from "./redes";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Entidad CertiFoto — la "ficha" canonica de la marca. */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@type": ["Organization", "LocalBusiness"],
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
      "Plataforma chilena para documentar el estado de un inmueble al entregarlo o recibirlo (arriendo o compraventa) con fotos respaldadas con hash SHA-256, descripciones asistidas con IA y un certificado en PDF verificable.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santiago",
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    },
    areaServed: { "@type": "Country", name: "Chile" },
    foundingLocation: { "@type": "Place", name: "Santiago, Chile" },
    sameAs: PERFILES_OFICIALES,
    founder: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      jobTitle: SITE_AUTHOR.jobTitle,
      url: `${SITE_URL}${SITE_AUTHOR.path}`,
      ...(SITE_AUTHOR.sameAs.length > 0 ? { sameAs: SITE_AUTHOR.sameAs } : {}),
    },
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
      "Crea actas digitales de entrega, devolución, inspección o inventario para arriendo y compraventa. Subes las fotos, la IA detecta los ambientes y extrae los datos del contrato, y certificas el documento con un sello inmutable y un PDF auto-verificable.",
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
      "Certificado de entrega express por $2.000 sin cuenta (subes el contrato y las fotos y recibes el PDF), y packs de certificaciones con cuenta para corredores.",
    brand: { "@type": "Brand", name: "CertiFoto" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CLP",
      lowPrice: Math.min(PRECIO_EXPRESS_CLP, ...PACKS.map((p) => p.priceCLP)),
      highPrice: Math.max(PRECIO_EXPRESS_CLP, ...PACKS.map((p) => p.priceCLP)),
      offerCount: PACKS.length + 1,
      offers: [
        {
          "@type": "Offer",
          name: "Certificado express",
          price: PRECIO_EXPRESS_CLP,
          priceCurrency: "CLP",
          description: "1 acta de entrega certificada, sin cuenta: contrato y fotos → PDF con fecha y huella verificables",
          url: `${SITE_URL}/certificar`,
          availability: "https://schema.org/InStock",
        },
        ...PACKS.map((p) => ({
          "@type": "Offer",
          name: p.label,
          price: p.priceCLP,
          priceCurrency: "CLP",
          description: `${p.size} certificaciones con cuenta · ${formatCLP(p.unitPriceCLP)} por certificación`,
          url: `${SITE_URL}/precios`,
          availability: "https://schema.org/InStock",
        })),
      ],
    },
  };
}
