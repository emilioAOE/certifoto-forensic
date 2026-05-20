/**
 * Blog posts inline.
 *
 * En produccion estos vivirian como MDX en /content/blog o en una CMS.
 * Para el MVP los manejamos como objetos TypeScript para no agregar
 * dependencias de markdown rendering.
 *
 * El campo `content` admite parrafos separados por linea en blanco.
 * Soporta:
 * - parrafos normales
 * - lineas que empiezan con "## " son subtitulos
 * - lineas que empiezan con "- " son items de lista
 * - lineas que empiezan con "> " son blockquotes
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  category: string;
  readMinutes: number;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-hacer-acta-entrega-arriendo",
    title: "Cómo hacer una acta de entrega de arriendo paso a paso",
    excerpt:
      "Una guía práctica para arrendadores y arrendatarios sobre cómo documentar correctamente el estado de la propiedad al inicio del contrato.",
    date: "2026-04-15",
    author: "Equipo CertiFoto",
    category: "Guías",
    readMinutes: 6,
    content: `Una acta de entrega bien hecha es la mejor forma de evitar discusiones al término del arriendo. Lo que parece un trámite menor cuando todo va bien se vuelve crucial cuando hay disputas sobre garantías, daños o condiciones de devolución.

En esta guía te explicamos cómo hacer una acta de entrega completa, sea que estés arrendando o entregando una propiedad.

## Qué debe incluir una acta de entrega

Una acta de entrega sólida documenta tres cosas: el estado de la propiedad, las cosas que se entregan con ella y las firmas de las partes.

- Datos de la propiedad: dirección exacta, número de unidad, comuna y características (amoblada o no, estacionamiento, bodega).
- Datos de las partes: arrendador y arrendatario, con nombre completo, RUT y datos de contacto.
- Estado por ambiente: cada espacio de la propiedad con su descripción, fotos y observaciones.
- Inventario: si la propiedad está amoblada, listado de muebles y electrodomésticos con su estado.
- Lecturas de medidores: número de medidor de luz, agua y gas con su lectura al momento de la entrega.
- Llaves y controles: cuántas se entregan, de qué tipo (puerta principal, reja, control de portones, etc.).
- Firmas: de ambas partes, idealmente con fecha y testigo.

## Por qué las fotos son tan importantes

Las palabras se interpretan, las fotos no. Un acta que dice "el living está en buen estado" puede significar cosas muy distintas para el arrendador y el arrendatario. Una foto del living, en cambio, muestra la realidad sin discusión.

Recomendamos:

- Tomar al menos 2 a 3 fotos por ambiente, mostrando muros, piso, techo y elementos relevantes.
- Hacer close-ups de cualquier defecto preexistente (rayaduras, manchas, marcas en muebles).
- Fotografiar los medidores con su lectura visible.
- Fotografiar las llaves y controles que se entregan.
- Fotografiar electrodomésticos y muebles si la propiedad está amoblada.

## El error más común: dejarlo para después

El peor momento para hacer una acta de entrega es después de que el arrendatario ya se mudó. Para entonces es imposible distinguir entre el estado original y los cambios que se produjeron al instalarse.

La acta debe hacerse el mismo día de la entrega de llaves, idealmente con las dos partes presentes recorriendo la propiedad juntos. Esto:

- Garantiza que ambos vean lo mismo.
- Da espacio para conversar y aclarar dudas.
- Permite que el arrendatario plantee preocupaciones desde el primer día.
- Evita la sensación de "ahora me dicen esto" más adelante.

## Cómo CertiFoto te ayuda

CertiFoto fue creado precisamente para hacer este proceso más fácil y dejar el respaldo bien hecho:

- Wizard guiado que te lleva paso a paso por todos los datos necesarios.
- Subida de fotos por ambiente con descripciones automáticas asistidas por IA.
- Hash criptográfico de cada foto para verificar que no sean alteradas posteriormente.
- Firma digital de las partes desde el mismo dispositivo.
- PDF formal listo para descargar y archivar.

Todo en menos de 30 minutos, sin papeles y con un respaldo técnico que un acta tradicional no tiene.

## Conclusión

Hacer una acta de entrega bien hecha no toma mucho más tiempo que hacerla mal, pero la diferencia se nota cuando llega el momento de devolver la propiedad. Una buena documentación al inicio es la mejor garantía para todas las partes.`,
  },
  {
    slug: "diferencia-acta-entrega-devolucion",
    title: "Diferencia entre acta de entrega y acta de devolución",
    excerpt:
      "Aunque parecen iguales, cumplen roles distintos en el ciclo del arriendo. Te explicamos cómo hacerlas correctamente y cómo compararlas.",
    date: "2026-04-08",
    author: "Equipo CertiFoto",
    category: "Conceptos",
    readMinutes: 4,
    content: `En el ciclo de un arriendo hay dos momentos clave donde es indispensable documentar el estado de la propiedad: cuando el arrendatario llega y cuando se va. A estos momentos corresponden la acta de entrega y la acta de devolución respectivamente.

Aunque ambas registran el estado de la propiedad, cumplen funciones distintas y se complementan.

## Acta de entrega

Es el documento que se firma al inicio del arriendo, idealmente el mismo día que se entregan las llaves. Su función es dejar constancia del estado en que el arrendador entrega la propiedad al arrendatario.

Sirve para:

- Establecer la línea base del estado de la propiedad.
- Listar lo que se entrega (muebles, electrodomésticos, llaves, controles).
- Registrar las lecturas iniciales de los medidores.
- Documentar cualquier defecto preexistente que el arrendatario no deberá responder al final.

## Acta de devolución

Se firma al término del arriendo, cuando el arrendatario devuelve la propiedad al arrendador. Su función es contrastar el estado actual contra el de la entrega y determinar si hay cambios atribuibles al uso.

Sirve para:

- Documentar el estado en que se devuelve la propiedad.
- Comparar contra la acta de entrega para identificar cambios.
- Registrar las lecturas finales de los medidores (para calcular consumos del último período).
- Decidir sobre la garantía: devolución completa, parcial o retención por daños.

## La comparación: el momento más importante

La utilidad real de tener ambas actas se ve cuando se comparan. Foto por foto, ambiente por ambiente, observación por observación.

Si la acta de entrega muestra una pared limpia y la de devolución muestra una mancha grande, la diferencia es clara. Si ambas muestran la misma marca, no hay caso.

Sin esta comparación sistemática, la conversación se vuelve subjetiva y depende de la memoria de las partes, que casi siempre es selectiva.

## Cómo CertiFoto facilita la comparación

Estamos terminando una funcionalidad que permite:

- Vincular automáticamente una acta de devolución a su acta de entrega.
- Mostrar fotos del mismo ambiente lado a lado.
- Identificar diferencias visibles con apoyo de IA.
- Generar un reporte de cambios que ambas partes pueden revisar.

La idea es eliminar la conversación subjetiva y reemplazarla por evidencia visual ordenada.

## Buenas prácticas

- Usa el mismo formato y orden en ambas actas para facilitar la comparación.
- Fotografía los mismos ambientes desde los mismos ángulos.
- Lee los medidores en ambos momentos.
- Inventaría de la misma forma.
- Si hay diferencias, déjalas en observaciones manuales con detalle.

## Conclusión

La acta de entrega y la acta de devolución son documentos hermanos pero distintos. Hacer ambas bien y poder compararlas es lo que convierte el arriendo en un proceso ordenado en lugar de un terreno fértil para conflictos.`,
  },
  {
    slug: "respaldo-fotografico-arriendo",
    title: "Cómo respaldar fotos de un arriendo para que tengan validez",
    excerpt:
      "Tomar fotos no basta. Para que sean evidencia útil debes preservar metadatos, fechas y huellas digitales. Te explicamos cómo.",
    date: "2026-03-28",
    author: "Equipo CertiFoto",
    category: "Técnico",
    readMinutes: 5,
    content: `Una foto sin contexto es solo una imagen. Para que una foto sirva como evidencia respaldatoria en un proceso de arriendo, debe cumplir con ciertas condiciones técnicas que muchas veces se pasan por alto.

Esta guía te explica qué hace que una foto sea evidencia útil y cómo preservar esa calidad.

## Qué es la metadata EXIF

Las fotos digitales no son solo píxeles. Cada foto tomada con un celular o cámara guarda dentro del archivo información adicional llamada EXIF: fecha y hora exacta, modelo de cámara, configuración (apertura, ISO, exposición), y a veces ubicación GPS.

Esta metadata es útil para:

- Demostrar cuándo se tomó la foto.
- Identificar el dispositivo que la capturó.
- Ubicar geográficamente dónde se tomó, si la cámara registró GPS.
- Detectar si la foto fue editada (programas como Photoshop dejan rastro).

## Cómo se pierde la metadata

Lamentablemente, muchas plataformas la borran o la modifican:

- WhatsApp comprime las fotos y elimina casi toda la metadata.
- Instagram y otras redes sociales también procesan las imágenes.
- Capturas de pantalla no tienen metadata real (solo la fecha de captura).
- Editar la foto en cualquier programa puede alterar o borrar campos.

Por eso, si vas a usar una foto como respaldo, lo ideal es:

- No enviarla por WhatsApp si la quieres usar como evidencia.
- Compartirla por email como archivo adjunto, no como imagen pegada.
- Mantener el archivo original, no recomprimirlo.

## El hash criptográfico

Más allá de la metadata, una manera técnicamente sólida de probar que una foto no ha sido alterada es calcular su hash criptográfico. Un hash es una huella digital única: si cambias un solo píxel de la foto, el hash cambia completamente.

Si calculas el hash de una foto al momento de tomarla y lo registras en un acta firmada, después puedes recalcular el hash de la foto entregada y verificar que sea el mismo. Si coincide, la foto no fue alterada. Si no coincide, hubo modificación.

CertiFoto calcula el hash SHA-256 de cada foto automáticamente al subirla y lo guarda en el PDF del acta firmada. Es una capa extra de seguridad sobre la metadata.

## Cómo CertiFoto preserva todo esto

Cuando subes una foto a CertiFoto, la plataforma:

- Extrae y guarda toda la metadata EXIF disponible.
- Calcula el hash SHA-256 del archivo original.
- Calcula el pHash (hash perceptual, útil para detectar fotos similares pero recomprimidas).
- Detecta si la foto tiene marcadores C2PA (firma de autenticidad de algunos dispositivos modernos).
- Genera un reporte de consistencia: si las fechas tienen sentido, si hay GPS, si parece editada con Photoshop, etc.

Todo esto queda en el PDF del acta y puede verificarse posteriormente.

## Conclusión

Si vas a documentar un arriendo, no basta con tomar fotos: hay que preservar su metadata y calcular su huella digital. Con eso, una foto se convierte en evidencia técnica sólida que es mucho más difícil de cuestionar que una simple imagen sin respaldo.`,
  },
  {
    slug: "ia-vision-actas-arriendo",
    title: "El rol de la inteligencia artificial en las actas de arriendo",
    excerpt:
      "La IA puede ayudar a describir, ordenar y revisar evidencia fotográfica. Pero tiene límites importantes. Te contamos cómo la usamos.",
    date: "2026-03-15",
    author: "Equipo CertiFoto",
    category: "IA",
    readMinutes: 5,
    content: `La inteligencia artificial vino a cambiar muchos procesos, y el de documentar el estado de una propiedad no es la excepción. Pero como toda tecnología poderosa, hay que entender sus capacidades y sus límites antes de confiar ciegamente.

Acá te contamos cómo usamos IA en CertiFoto y por qué la consideramos asistencia, no reemplazo del criterio humano.

## Qué puede hacer la IA

Los modelos modernos de visión computacional pueden, con bastante precisión:

- Reconocer el tipo de ambiente (cocina, baño, dormitorio).
- Identificar elementos visibles (muros, piso, ventanas, muebles).
- Detectar características como manchas, rayaduras o suciedad evidente.
- Generar descripciones objetivas en lenguaje natural.
- Etiquetar fotos por contenido para facilitar la búsqueda.

Esto acelera muchísimo el trabajo de quien documenta una inspección: en vez de escribir manualmente la descripción de cada foto, recibes un borrador automático que puedes ajustar.

## Qué NO puede hacer la IA

Acá es donde es importante ser claros:

- No puede determinar si un daño existía antes o se produjo durante el arriendo.
- No puede atribuir responsabilidades.
- No puede reemplazar el ojo experto de un perito en casos complejos.
- Puede confundir cosas: una sombra puede parecer una mancha, un reflejo puede parecer humedad.
- Su nivel de confianza es estadístico, no infalible.

Por eso en CertiFoto la IA siempre indica el nivel de confianza de cada hallazgo y marca cuando algo "requiere revisión humana". Las descripciones generadas son referenciales y las partes pueden corregirlas, complementarlas o simplemente ignorarlas.

## Cómo está diseñada nuestra IA

Diseñamos las descripciones con tres principios:

- Lenguaje cuidadoso: usamos frases como "se observa", "aparentemente", "no se aprecian daños evidentes". Nunca afirmaciones absolutas.
- Sin atribución de responsabilidad: la IA describe, no juzga.
- Marca explícita de incertidumbre: cuando algo no está claro, lo decimos.

Un ejemplo real de salida:

> Se observa cocina con muebles blancos y cubierta gris. La superficie se ve limpia. Aparentemente hay una pequeña marca cerca del borde de la cubierta que podría corresponder a mancha o suciedad. Requiere revisión humana para confirmar.

Esto es muy distinto a una descripción afirmativa como "la cubierta está dañada", que cargaría un juicio de valor que la IA no está calificada para hacer.

## El rol del humano sigue siendo central

CertiFoto deja siempre la decisión final en manos de las partes:

- Las descripciones de IA pueden editarse antes de firmar.
- Cualquier parte puede agregar observaciones manuales.
- Si una parte no está de acuerdo con un hallazgo, puede firmar con observaciones.
- Si hay un conflicto serio, recomendamos siempre un perito profesional.

La IA es una herramienta de productividad que organiza y describe, no un árbitro que decide.

## El futuro

Estamos trabajando en funciones como:

- Comparación automática entre acta de entrega y acta de devolución.
- Detección de cambios visibles entre dos fotos del mismo ambiente.
- Resúmenes automáticos de toda una acta para revisarla rápido.

Todo manteniendo el principio de asistencia, no sustitución.

## Conclusión

La IA puede hacer que documentar un arriendo sea mucho más rápido y ordenado, pero no reemplaza el ojo humano ni el criterio de las partes. Bien usada, es una ayuda enorme. Mal entendida, puede generar falsas certezas. En CertiFoto la usamos siempre como asistencia, nunca como juicio.`,
  },
  {
    slug: "garantia-arriendo-discusion",
    title: "La garantía del arriendo: cómo evitar discusiones al final",
    excerpt:
      "El momento más delicado de un arriendo suele ser la devolución de la garantía. Te contamos cómo prepararte desde el primer día.",
    date: "2026-03-02",
    author: "Equipo CertiFoto",
    category: "Práctico",
    readMinutes: 5,
    content: `La garantía del arriendo, ese mes de canon que se entrega al inicio para responder por eventuales daños, es una de las fuentes más frecuentes de conflicto al término del contrato.

Para el arrendador, retener parte de la garantía parece justo cuando hay daños evidentes. Para el arrendatario, casi siempre se siente injusto. La verdad es que ambos pueden tener razón, y el problema casi siempre es la falta de evidencia clara sobre el estado original.

## Por qué se generan los conflictos

La mayoría de las disputas de garantía caen en alguno de estos patrones:

- "Eso ya estaba así cuando llegué": el arrendatario asegura que un daño es preexistente, el arrendador no tiene cómo verificarlo.
- "No te das cuenta del daño": el arrendador identifica algo que el arrendatario no consideraba problemático.
- "Mira la diferencia con cómo te lo entregué": frase que solo funciona si efectivamente hay un registro previo.
- "Eso es desgaste normal": discusión sobre qué es uso esperable y qué es daño imputable al arrendatario.

Sin un registro objetivo del estado inicial, todas estas discusiones se vuelven subjetivas y dependen de la memoria de las partes.

## La solución empieza el primer día

Cuanto mejor documentes el estado al inicio del arriendo, más fácil será la conversación al final. No es necesario ser un perito profesional: con una buena acta de entrega con fotos por ambiente y firmadas por ambas partes, la mayoría de los conflictos se evitan.

La lógica es simple: si entregaste un departamento con un raspón en la pared del living y eso quedó fotografiado y firmado en la acta de entrega, no hay cómo cobrártelo al final. Si no lo documentaste, queda en la palabra de cada uno.

## Qué tipo de evidencia funciona

No toda evidencia tiene el mismo valor:

- Fotos de WhatsApp comprimidas: poca utilidad. Faltan metadatos, calidad reducida.
- Fotos en el celular: utilidad media. Tienen metadata pero están dispersas.
- Documento word con fotos pegadas: utilidad media. Se puede modificar fácilmente.
- Acta digital con fotos respaldadas y firmadas: alta utilidad. Cada foto tiene su huella digital, fechas y firma de las partes.
- Acta notarial o pericial: máxima utilidad. También el costo y formalidad más alta.

El punto medio entre simplicidad y solidez es la acta digital firmada. Suficiente para la mayoría de los casos sin necesidad de un notario o perito.

## Qué hacer durante el arriendo

Algunos consejos durante el arriendo para evitar problemas al final:

- Reportar daños relevantes apenas ocurren. Si rompiste algo, avísalo y resuélvanlo en su momento, no al final.
- Hacer mantenciones periódicas. Una propiedad bien mantenida durante el arriendo se devuelve en mejor estado.
- Documentar reparaciones. Si arreglaste algo o el arrendador hizo un mantenimiento, deja constancia.
- Hacer una inspección intermedia. En arriendos largos, una revisión a la mitad ayuda a detectar problemas a tiempo.

## Al momento de la devolución

- Hacer el recorrido juntos, igual que al inicio.
- Hacer una acta de devolución con la misma estructura que la de entrega.
- Comparar foto por foto con la acta de entrega.
- Conversar abiertamente sobre cualquier diferencia.
- Si hay desacuerdo, dejarlo por escrito como observación antes de firmar.

## Cómo CertiFoto ayuda

Nuestra herramienta está diseñada exactamente para reducir estas discusiones. Te permite:

- Crear actas de entrega y devolución con el mismo formato.
- Documentar el estado por ambiente con fotos respaldadas.
- Generar PDF formales con firma de ambas partes.
- (Pronto) Comparar acta de entrega y de devolución automáticamente.

Todo gratis para uso personal y por una fracción del costo de un perito o notario para uso profesional.

## Conclusión

La garantía del arriendo no tiene por qué ser fuente de conflicto. Con buena documentación al inicio, mantenciones durante el contrato y una devolución ordenada, las dos partes pueden quedar tranquilas. La clave está en preparar la evidencia desde el primer día, no recolectarla cuando ya hay una disputa.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return BLOG_POSTS.slice(0, limit);
  return BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.category === current.category
  )
    .concat(BLOG_POSTS.filter((p) => p.slug !== slug && p.category !== current.category))
    .slice(0, limit);
}
