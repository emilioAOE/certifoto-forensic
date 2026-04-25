"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowRight, MessageCircle } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { cn } from "@/lib/cn";

interface FaqItem {
  q: string;
  a: string | string[];
}

interface FaqSection {
  title: string;
  description?: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    title: "Sobre la plataforma",
    description: "Que es CertiFoto y como puede ayudarte",
    items: [
      {
        q: "¿Que es exactamente CertiFoto?",
        a: "CertiFoto es una plataforma chilena que te permite documentar el estado de una propiedad arrendada con fotos, descripciones automaticas asistidas con inteligencia artificial y firma digital de las partes. Sirve para crear actas de entrega, devolucion, inspeccion o inventario.",
      },
      {
        q: "¿Por que usar una herramienta digital y no papel?",
        a: "Una acta digital queda fechada con precision tecnica, las fotos guardan su huella criptografica, las observaciones quedan vinculadas a cada foto y todo se firma desde el celular o computador sin necesidad de juntarse fisicamente. Ademas, el PDF se puede compartir y archivar al instante.",
      },
      {
        q: "¿Necesito crear una cuenta para usarlo?",
        a: "No. CertiFoto te permite ingresar a la plataforma y crear actas sin registro previo. Tus datos se guardan localmente en tu navegador. Para casos profesionales con multiples propiedades estamos preparando un plan con cuenta y respaldo en la nube.",
      },
      {
        q: "¿Cuanto cuesta?",
        a: "El uso individual es gratis mientras estamos en periodo de pruebas. Tendremos planes pagados para corredores y administradoras con funciones avanzadas (multiples propiedades, marca propia, dashboard gerencial, integraciones). Puedes ver mas en nuestra pagina de precios.",
      },
      {
        q: "¿Funciona en celular?",
        a: "Si. CertiFoto es mobile-first. Puedes tomar las fotos directamente desde tu celular durante la inspeccion y la app las organiza por ambiente automaticamente.",
      },
    ],
  },
  {
    title: "Sobre las actas",
    description: "Tipos de acta y como crearlas",
    items: [
      {
        q: "¿Que tipos de acta puedo crear?",
        a: [
          "Acta de Entrega: documenta el estado de la propiedad cuando inicia el arriendo.",
          "Acta de Devolucion: documenta el estado al final del arriendo, idealmente para comparar contra la entrega.",
          "Acta de Inspeccion: revision intermedia durante el contrato.",
          "Inventario de Propiedad: listado de muebles, electrodomesticos y accesorios en propiedades amobladas.",
        ],
      },
      {
        q: "¿Quienes pueden firmar el acta?",
        a: "Cualquier parte que agregues con permiso de firma. Tipicamente arrendador y arrendatario, pero tambien puedes incluir corredor, administrador o testigos. Cada parte firma de manera independiente y puede dejar observaciones antes de hacerlo.",
      },
      {
        q: "¿Puedo invitar al arrendador o arrendatario por email?",
        a: "Estamos terminando esa funcionalidad. Hoy puedes generar el PDF firmado por una parte y compartirlo, o que ambas partes firmen desde el mismo dispositivo durante la inspeccion. Pronto podras enviar links unicos de firma a cada parte por email o WhatsApp.",
      },
      {
        q: "¿Se puede modificar un acta despues de firmada?",
        a: "Una vez que un acta esta firmada y cerrada, queda congelada. Si necesitas hacer cambios, debes crear una nueva acta complementaria o iniciar un proceso de revision que invalida las firmas previas.",
      },
      {
        q: "¿Que pasa si una parte no quiere firmar?",
        a: "El acta queda registrada igual con la firma de quien si firmo. La parte que no firma no tiene su nombre en la firma final, pero el documento queda con constancia de quien firmo y quien no. Tambien existe la opcion de Rechazar, donde la parte deja por escrito el motivo del rechazo.",
      },
    ],
  },
  {
    title: "Sobre las fotos y la evidencia",
    description: "Como funciona el respaldo forense",
    items: [
      {
        q: "¿Que es el respaldo forense de las fotos?",
        a: "Cada foto que subes recibe un analisis tecnico automatico que incluye: hash criptografico SHA-256 (huella digital unica), pHash (huella visual), extraccion de metadatos EXIF (fecha, hora, dispositivo, GPS si esta disponible), y verificaciones de consistencia. Si una foto se modifica posteriormente, su hash cambia y queda evidencia tecnica de la alteracion.",
      },
      {
        q: "¿Donde se almacenan las fotos?",
        a: "Por defecto se almacenan localmente en tu navegador. Las fotos no se suben a servidores externos para el analisis forense. En la version con cuenta tendras la opcion de respaldo en la nube si lo quieres.",
      },
      {
        q: "¿Que pasa si tomo la foto desde la app vs si la subo de la galeria?",
        a: "Tomar la foto directamente desde la app durante la inspeccion es mas robusto: el timestamp y el GPS se registran al momento de la captura. Si la subes desde galeria pueden faltar metadatos o la foto puede haber sido editada antes. La plataforma lo refleja en el indicador de fuerza de evidencia.",
      },
      {
        q: "¿Que tipo de imagenes acepta?",
        a: "JPEG, PNG, TIFF, HEIF, WebP y AVIF. Ideal son fotos directas del celular sin filtros. Las fotos editadas pasan igual pero la plataforma marca que tienen indicios de edicion.",
      },
      {
        q: "¿Puedo verificar la autenticidad de una foto que no fue tomada en CertiFoto?",
        a: "Si. Tenemos un modulo separado en /forensic donde puedes subir cualquier foto y obtener su analisis: hash, metadatos EXIF, GPS, deteccion de software de edicion y mas. Util para verificar fotos antes de firmar un acta o para cualquier otra revision.",
      },
    ],
  },
  {
    title: "Sobre la inteligencia artificial",
    description: "Como usamos IA y que limites tiene",
    items: [
      {
        q: "¿Que hace exactamente la IA?",
        a: "La IA observa cada foto y genera una descripcion objetiva del ambiente, identifica los elementos visibles (muros, piso, muebles, etc.) y marca posibles hallazgos como manchas, rayaduras o suciedad. Tambien indica el nivel de confianza de cada hallazgo.",
      },
      {
        q: "¿Las descripciones de IA son obligatorias?",
        a: "Son referenciales. Las partes pueden revisar, editar, complementar con observaciones manuales o ignorar las descripciones generadas. Lo importante es que la IA acelera el proceso de documentacion, no que reemplace el criterio humano.",
      },
      {
        q: "¿La IA determina culpas o responsabilidades?",
        a: "No. La IA describe lo que se observa de manera objetiva, sin atribuir responsabilidades. Frases como 'el arrendatario causo este daño' nunca seran generadas por la IA. Las decisiones sobre causa y responsabilidad las toman las partes humanas o, si corresponde, un perito profesional.",
      },
      {
        q: "¿Que pasa si la IA no detecta un daño que si existe?",
        a: "Por eso las descripciones son referenciales. Las partes deben revisar siempre y agregar observaciones manuales sobre cualquier hallazgo que la IA haya pasado por alto. La IA es asistencia, no sustitucion del ojo humano.",
      },
    ],
  },
  {
    title: "Sobre la firma y el PDF",
    description: "Validez del documento generado",
    items: [
      {
        q: "¿Como funciona la firma digital?",
        a: "Cada parte firma con el dedo o el cursor en un cuadro de firma. Al firmar se registra la fecha, hora, identificacion del firmante, su rol y un hash del documento al momento de la firma. Si despues alguien modifica el contenido, ese hash deja de coincidir.",
      },
      {
        q: "¿La firma digital de CertiFoto tiene la misma validez que una firma manuscrita?",
        a: "CertiFoto utiliza firma digital simple, equivalente a aceptar terminos en cualquier plataforma online. Tiene valor probatorio como evidencia, especialmente combinado con el respaldo forense de las fotos. Para firma electronica avanzada con valor legal pleno se requiere certificacion de proveedores acreditados, lo cual estamos evaluando para versiones futuras.",
      },
      {
        q: "¿El PDF que descargo es definitivo?",
        a: "Si. El PDF incluye toda la informacion: portada, datos de la propiedad y partes, fotos por ambiente, descripciones, observaciones, firmas con timestamp y un anexo tecnico con los hashes de cada foto y del documento completo.",
      },
      {
        q: "¿Puedo usar el PDF como evidencia en un juicio?",
        a: "El PDF puede acompañar una demanda o defensa como respaldo documental, igual que cualquier registro digital. Su utilidad final depende del caso y de la valoracion del tribunal. Recomendamos siempre asesorarte con un abogado para casos contenciosos.",
      },
    ],
  },
  {
    title: "Sobre privacidad y datos",
    items: [
      {
        q: "¿Que datos guardan?",
        a: "Mientras uses CertiFoto sin cuenta, todos tus datos (actas, fotos, firmas) se guardan localmente en tu navegador. No los recibimos en nuestros servidores. Si en el futuro creas cuenta para sincronizacion en la nube, lo haremos con tu consentimiento explicito.",
      },
      {
        q: "¿Comparten datos con terceros?",
        a: "No. CertiFoto no vende ni comparte datos con terceros. Para servicios de IA usaremos proveedores que cumplan con politicas estrictas de privacidad y solo enviaremos lo necesario para procesar la solicitud.",
      },
      {
        q: "¿Puedo borrar mis actas?",
        a: "Si, en cualquier momento. Cada acta tiene un boton de eliminar, y tambien puedes limpiar todos los datos del navegador desde la configuracion del browser.",
      },
    ],
  },
];

export function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Centro de ayuda
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Preguntas frecuentes
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Resolvemos las dudas mas comunes sobre actas digitales, firma,
            evidencia fotografica e inteligencia artificial.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {SECTIONS.map((section, sIdx) => (
          <SectionBlock key={sIdx} section={section} />
        ))}
      </section>

      {/* Contact CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-accent-light bg-accent-softer p-8 text-center">
          <MessageCircle className="h-8 w-8 text-accent-dark mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Quedaste con dudas?
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Escribenos a contacto@certifoto.cl o ingresa a la plataforma y
            empieza a probar gratis.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-accent hover:text-accent-dark transition-colors"
            >
              Contactanos
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
            >
              Ingresar a la plataforma
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function SectionBlock({ section }: { section: FaqSection }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {section.title}
        </h2>
        {section.description && (
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
        )}
      </div>

      <div className="space-y-2">
        {section.items.map((item, idx) => (
          <FaqAccordion key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border bg-white transition-colors",
        open ? "border-accent-light" : "border-gray-200 hover:border-gray-300"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
      >
        <span className="text-base font-semibold text-gray-900">{item.q}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          {Array.isArray(item.a) ? (
            <ul className="space-y-1.5 text-sm text-gray-700 leading-relaxed">
              {item.a.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent-dark mt-0.5">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
          )}
        </div>
      )}
    </div>
  );
}
