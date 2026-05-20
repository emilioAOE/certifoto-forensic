/**
 * Data del FAQ — fuente unica de verdad.
 *
 * Se consume desde:
 *  - components/marketing/FaqPage.tsx (render visual, acordeon)
 *  - app/faq/page.tsx (FAQPage JSON-LD para SEO + GEO)
 *
 * Tener un solo origen evita que el schema y la UI se desincronicen.
 */

export interface FaqItem {
  q: string;
  a: string | string[];
}

export interface FaqSection {
  title: string;
  description?: string;
  items: FaqItem[];
}

export const FAQ_SECTIONS: FaqSection[] = [
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
        a: "Crear y editar actas es gratis e ilimitado. Solo pagas cuando certificas — es decir, cuando el acta queda lista para entregarse formalmente. Las certificaciones se compran en packs one-time desde $2.990 CLP (1 cert) hasta $99.900 CLP (50 certs). Ver detalle en /precios.",
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
        q: "¿Se puede modificar un acta despues de certificada?",
        a: "No. Al certificar, el acta queda inmutable: se sella el hash del documento, se elimina la marca de agua del PDF y queda lista para compartirse como .certifoto. Si necesitas hacer cambios, debes crear una nueva acta complementaria. Por eso recomendamos certificar solo cuando el documento este verdaderamente listo (firmas obtenidas, fotos completas).",
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

/**
 * Aplana todas las preguntas/respuestas a pares simples para el FAQPage
 * JSON-LD. Las respuestas que son listas se unen en un solo texto.
 */
export function faqFlatQA(): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = [];
  for (const section of FAQ_SECTIONS) {
    for (const item of section.items) {
      out.push({
        question: item.q,
        answer: Array.isArray(item.a) ? item.a.join(" ") : item.a,
      });
    }
  }
  return out;
}
