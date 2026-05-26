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
    description: "Qué es CertiFoto y cómo puede ayudarte",
    items: [
      {
        q: "¿Qué es exactamente CertiFoto?",
        a: "CertiFoto es una plataforma chilena que te permite documentar el estado de una propiedad al entregarla o recibirla (arriendo o compraventa) con fotos respaldadas con hash criptográfico SHA-256, descripciones asistidas por IA y un certificado en PDF verificable. Sirve para crear actas de entrega, devolución, inspección o inventario.",
      },
      {
        q: "¿Por qué usar una herramienta digital y no papel?",
        a: "Una acta digital queda fechada con precisión técnica, las fotos guardan su huella criptográfica (SHA-256, pHash y EXIF) y todo queda consolidado en un único PDF auto-verificable. Si la foto o el documento se alteran después, el verificador lo detecta. Además se comparte y archiva al instante.",
      },
      {
        q: "¿Necesito crear una cuenta para usarlo?",
        a: "No. CertiFoto te permite ingresar a la plataforma y crear actas sin registro previo. Tus datos se guardan localmente en tu navegador (IndexedDB). Es lo que llamamos arquitectura sin backend: cero fricción, sin login.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Crear y editar actas es gratis e ilimitado. Solo pagas cuando certificas — es decir, cuando el acta queda lista para entregarse formalmente. Las certificaciones se compran en packs one-time desde $2.990 CLP (1 cert) hasta $99.900 CLP (50 certs). Ver detalle en /precios.",
      },
      {
        q: "¿Funciona en celular?",
        a: "Sí. CertiFoto es mobile-first. Puedes tomar las fotos directamente desde tu celular durante la inspección y la app las organiza por ambiente automáticamente.",
      },
    ],
  },
  {
    title: "Sobre las actas",
    description: "Tipos de acta y cómo crearlas",
    items: [
      {
        q: "¿Qué tipos de acta puedo crear?",
        a: [
          "Acta de Entrega: documenta el estado de la propiedad cuando inicia el arriendo o se entrega tras una compraventa.",
          "Acta de Devolución: documenta el estado al final del arriendo, idealmente para comparar contra la entrega.",
          "Acta de Inspección: revisión intermedia durante el contrato.",
          "Inventario de Propiedad: listado de muebles, electrodomésticos y accesorios en propiedades amobladas.",
        ],
      },
      {
        q: "¿Sirve también para compraventa, no solo arriendo?",
        a: "Sí. El acta documenta el estado del inmueble al momento de la entrega, independiente del tipo de contrato. Es útil tanto para corredores y arrendadores como para compradores y vendedores que quieren dejar constancia técnica del estado en que se entrega la propiedad.",
      },
      {
        q: "¿Quiénes pueden aparecer como partes en el acta?",
        a: "Las partes que tú agregues — típicamente arrendador y arrendatario, o comprador y vendedor — y opcionalmente corredor, administrador o testigos. Cada parte queda registrada con nombre, RUT y rol.",
      },
      {
        q: "¿Se puede modificar un acta después de certificada?",
        a: "No. Al certificar, el acta queda inmutable: se sella el hash del documento, se elimina la marca de agua del PDF y queda lista para compartirse como certificado verificable. Si necesitas hacer cambios, debes crear una nueva acta complementaria. Por eso recomendamos certificar solo cuando el documento esté verdaderamente listo.",
      },
      {
        q: "¿El certificado consume 1 crédito cada vez?",
        a: "Sí. Cada vez que generas un certificado se consume 1 crédito. Crear y editar el acta es gratis e ilimitado — el cobro ocurre solo al sellarla. Los créditos no caducan.",
      },
    ],
  },
  {
    title: "Sobre las fotos y la evidencia",
    description: "Cómo funciona el respaldo forense",
    items: [
      {
        q: "¿Qué es el respaldo forense de las fotos?",
        a: "Cada foto que subes recibe un análisis técnico automático que incluye: hash criptográfico SHA-256 (huella digital única), pHash (huella visual), extracción de metadatos EXIF (fecha, hora, dispositivo, GPS si está disponible), detección de marcas C2PA y verificaciones de consistencia. Si una foto se modifica posteriormente, su hash cambia y queda evidencia técnica de la alteración.",
      },
      {
        q: "¿Dónde se almacenan las fotos?",
        a: "Localmente en tu navegador (IndexedDB). No se suben a servidores externos. El cálculo forense (hash, pHash, EXIF) ocurre en tu dispositivo. La única excepción es el análisis con IA: la imagen se envía cifrada (HTTPS) al proveedor de IA solo para generar la descripción y vuelve.",
      },
      {
        q: "¿Qué pasa si tomo la foto desde la app vs si la subo de la galería?",
        a: "Tomar la foto directamente desde la app durante la inspección es más robusto: el timestamp y el GPS se registran al momento de la captura. Si la subes desde galería pueden faltar metadatos o la foto puede haber sido editada antes. La plataforma lo refleja en el indicador de fuerza de evidencia.",
      },
      {
        q: "¿Qué tipo de imágenes acepta?",
        a: "JPEG, PNG, TIFF, HEIF, WebP y AVIF. Ideal son fotos directas del celular sin filtros. Las fotos editadas pasan igual pero la plataforma marca que tienen indicios de edición.",
      },
    ],
  },
  {
    title: "Sobre la inteligencia artificial",
    description: "Cómo usamos IA y qué límites tiene",
    items: [
      {
        q: "¿Qué hace exactamente la IA?",
        a: "Tres cosas: (1) lee tu contrato (PDF o foto, incluso escaneado) y autocompleta dirección, partes, RUTs, monto, fechas y garantía; (2) detecta automáticamente los ambientes de cada foto (living, cocina, baño, dormitorio, etc.); y (3) describe de manera objetiva el estado de cada foto e identifica posibles hallazgos (manchas, rayaduras, suciedad) con un nivel de confianza.",
      },
      {
        q: "¿Las descripciones de IA son obligatorias?",
        a: "Son referenciales. Las partes pueden revisar, editar, complementar con observaciones manuales o ignorar las descripciones generadas. Lo importante es que la IA acelera el proceso de documentación, no que reemplace el criterio humano.",
      },
      {
        q: "¿La IA determina culpas o responsabilidades?",
        a: "No. La IA describe lo que se observa de manera objetiva, sin atribuir responsabilidades. Frases como 'el arrendatario causó este daño' nunca serán generadas por la IA. Las decisiones sobre causa y responsabilidad las toman las partes humanas o, si corresponde, un perito profesional.",
      },
      {
        q: "¿Qué pasa si la IA no detecta un daño que sí existe?",
        a: "Por eso las descripciones son referenciales. Las partes deben revisar siempre y agregar observaciones manuales sobre cualquier hallazgo que la IA haya pasado por alto. La IA es asistencia, no sustitución del ojo humano.",
      },
    ],
  },
  {
    title: "Sobre el certificado y la verificación",
    description: "Qué obtienes al certificar y cómo se verifica",
    items: [
      {
        q: "¿Qué es exactamente el certificado?",
        a: "Es el PDF inmutable que entrega CertiFoto al certificar el acta. Incluye portada, datos de la propiedad y partes, fotos por ambiente con sus descripciones, y un anexo técnico con los hashes SHA-256 de cada foto y del documento completo. Después del %%EOF lleva embebido un bloque verificable que permite recalcular su huella sin recurrir a un servidor.",
      },
      {
        q: "¿Cómo se verifica un certificado de CertiFoto?",
        a: "En /forensic cualquiera sube el PDF (o el archivo .certifoto) y el verificador recalcula la huella embebida en el documento. Si la huella coincide, el certificado es auténtico e íntegro. Si fue alterado, el verificador lo detecta. La verificación es local en el navegador — no guardamos ni el archivo ni los datos.",
      },
      {
        q: "¿Qué tan seguro es el certificado frente a falsificación?",
        a: "El certificado detecta alteraciones (cualquier cambio rompe el hash). Sin embargo, hoy la huella es keyless y la lógica de generación es pública, por lo que el sistema demuestra integridad pero no es a prueba de falsificación absoluta. Una firma criptográfica infalsificable requiere un backend que firme con llave privada — está diseñado y queda como próximo paso, junto con la pasarela de pago.",
      },
      {
        q: "¿Puedo usar el certificado como evidencia en un juicio?",
        a: "El PDF puede acompañar una demanda o defensa como respaldo documental, igual que cualquier registro digital con trazabilidad técnica. Su utilidad final depende del caso y de la valoración del tribunal. Recomendamos siempre asesorarte con un abogado para casos contenciosos. CertiFoto no es un servicio jurídico, notarial ni pericial.",
      },
    ],
  },
  {
    title: "Sobre privacidad y datos",
    items: [
      {
        q: "¿Qué datos guardan?",
        a: "Mientras uses CertiFoto sin cuenta, todos tus datos (actas, propiedades, fotos) se guardan localmente en tu navegador. No los recibimos en nuestros servidores. La única excepción es el contenido de las fotos cuando pides análisis de IA: se envía cifrado (HTTPS) al proveedor solo para generar la descripción y no se retiene.",
      },
      {
        q: "¿Comparten datos con terceros?",
        a: "No. CertiFoto no vende ni comparte datos con terceros. Los servicios de IA que usamos están bajo políticas estrictas de privacidad y no entrenan modelos con tu contenido.",
      },
      {
        q: "¿Puedo borrar mis actas?",
        a: "Sí, en cualquier momento. Cada acta tiene un botón de eliminar, y también puedes limpiar todos los datos del navegador desde la configuración del browser.",
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
