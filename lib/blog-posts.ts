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
    title: "Como hacer una acta de entrega de arriendo paso a paso",
    excerpt:
      "Una guia practica para arrendadores y arrendatarios sobre como documentar correctamente el estado de la propiedad al inicio del contrato.",
    date: "2026-04-15",
    author: "Equipo CertiFoto",
    category: "Guias",
    readMinutes: 6,
    content: `Una acta de entrega bien hecha es la mejor forma de evitar discusiones al termino del arriendo. Lo que parece un tramite menor cuando todo va bien se vuelve crucial cuando hay disputas sobre garantias, daños o condiciones de devolucion.

En esta guia te explicamos como hacer una acta de entrega completa, sea que estes arrendando o entregando una propiedad.

## Que debe incluir una acta de entrega

Una acta de entrega solida documenta tres cosas: el estado de la propiedad, las cosas que se entregan con ella y las firmas de las partes.

- Datos de la propiedad: direccion exacta, numero de unidad, comuna y caracteristicas (amoblada o no, estacionamiento, bodega).
- Datos de las partes: arrendador y arrendatario, con nombre completo, RUT y datos de contacto.
- Estado por ambiente: cada espacio de la propiedad con su descripcion, fotos y observaciones.
- Inventario: si la propiedad esta amoblada, listado de muebles y electrodomesticos con su estado.
- Lecturas de medidores: numero de medidor de luz, agua y gas con su lectura al momento de la entrega.
- Llaves y controles: cuantas se entregan, de que tipo (puerta principal, reja, control de portones, etc.).
- Firmas: de ambas partes, idealmente con fecha y testigo.

## Por que las fotos son tan importantes

Las palabras se interpretan, las fotos no. Un acta que dice "el living esta en buen estado" puede significar cosas muy distintas para el arrendador y el arrendatario. Una foto del living, en cambio, muestra la realidad sin discusion.

Recomendamos:

- Tomar al menos 2 a 3 fotos por ambiente, mostrando muros, piso, techo y elementos relevantes.
- Hacer close-ups de cualquier defecto preexistente (rayaduras, manchas, marcas en muebles).
- Fotografiar los medidores con su lectura visible.
- Fotografiar las llaves y controles que se entregan.
- Fotografiar electrodomesticos y muebles si la propiedad esta amoblada.

## El error mas comun: dejarlo para despues

El peor momento para hacer una acta de entrega es despues de que el arrendatario ya se mudo. Para entonces es imposible distinguir entre el estado original y los cambios que se produjeron al instalarse.

La acta debe hacerse el mismo dia de la entrega de llaves, idealmente con las dos partes presentes recorriendo la propiedad juntos. Esto:

- Garantiza que ambos vean lo mismo.
- Da espacio para conversar y aclarar dudas.
- Permite que el arrendatario plantee preocupaciones desde el primer dia.
- Evita la sensacion de "ahora me dicen esto" mas adelante.

## Como CertiFoto te ayuda

CertiFoto fue creado precisamente para hacer este proceso mas facil y dejar el respaldo bien hecho:

- Wizard guiado que te lleva paso a paso por todos los datos necesarios.
- Subida de fotos por ambiente con descripciones automaticas asistidas por IA.
- Hash criptografico de cada foto para verificar que no sean alteradas posteriormente.
- Firma digital de las partes desde el mismo dispositivo.
- PDF formal listo para descargar y archivar.

Todo en menos de 30 minutos, sin papeles y con un respaldo tecnico que un acta tradicional no tiene.

## Conclusion

Hacer una acta de entrega bien hecha no toma mucho mas tiempo que hacerla mal, pero la diferencia se nota cuando llega el momento de devolver la propiedad. Una buena documentacion al inicio es la mejor garantia para todas las partes.`,
  },
  {
    slug: "diferencia-acta-entrega-devolucion",
    title: "Diferencia entre acta de entrega y acta de devolucion",
    excerpt:
      "Aunque parecen iguales, cumplen roles distintos en el ciclo del arriendo. Te explicamos como hacerlas correctamente y como compararlas.",
    date: "2026-04-08",
    author: "Equipo CertiFoto",
    category: "Conceptos",
    readMinutes: 4,
    content: `En el ciclo de un arriendo hay dos momentos clave donde es indispensable documentar el estado de la propiedad: cuando el arrendatario llega y cuando se va. A estos momentos corresponden la acta de entrega y la acta de devolucion respectivamente.

Aunque ambas registran el estado de la propiedad, cumplen funciones distintas y se complementan.

## Acta de entrega

Es el documento que se firma al inicio del arriendo, idealmente el mismo dia que se entregan las llaves. Su funcion es dejar constancia del estado en que el arrendador entrega la propiedad al arrendatario.

Sirve para:

- Establecer la linea base del estado de la propiedad.
- Listar lo que se entrega (muebles, electrodomesticos, llaves, controles).
- Registrar las lecturas iniciales de los medidores.
- Documentar cualquier defecto preexistente que el arrendatario no debera responder al final.

## Acta de devolucion

Se firma al termino del arriendo, cuando el arrendatario devuelve la propiedad al arrendador. Su funcion es contrastar el estado actual contra el de la entrega y determinar si hay cambios atribuibles al uso.

Sirve para:

- Documentar el estado en que se devuelve la propiedad.
- Comparar contra la acta de entrega para identificar cambios.
- Registrar las lecturas finales de los medidores (para calcular consumos del ultimo periodo).
- Decidir sobre la garantia: devolucion completa, parcial o retencion por daños.

## La comparacion: el momento mas importante

La utilidad real de tener ambas actas se ve cuando se comparan. Foto por foto, ambiente por ambiente, observacion por observacion.

Si la acta de entrega muestra una pared limpia y la de devolucion muestra una mancha grande, la diferencia es clara. Si ambas muestran la misma marca, no hay caso.

Sin esta comparacion sistematica, la conversacion se vuelve subjetiva y depende de la memoria de las partes, que casi siempre es selectiva.

## Como CertiFoto facilita la comparacion

Estamos terminando una funcionalidad que permite:

- Vincular automaticamente una acta de devolucion a su acta de entrega.
- Mostrar fotos del mismo ambiente lado a lado.
- Identificar diferencias visibles con apoyo de IA.
- Generar un reporte de cambios que ambas partes pueden revisar.

La idea es eliminar la conversacion subjetiva y reemplazarla por evidencia visual ordenada.

## Buenas practicas

- Usa el mismo formato y orden en ambas actas para facilitar la comparacion.
- Fotografia los mismos ambientes desde los mismos angulos.
- Lee los medidores en ambos momentos.
- Inventaria de la misma forma.
- Si hay diferencias, dejalas en observaciones manuales con detalle.

## Conclusion

La acta de entrega y la acta de devolucion son documentos hermanos pero distintos. Hacer ambas bien y poder compararlas es lo que convierte el arriendo en un proceso ordenado en lugar de un terreno fertil para conflictos.`,
  },
  {
    slug: "respaldo-fotografico-arriendo",
    title: "Como respaldar fotos de un arriendo para que tengan validez",
    excerpt:
      "Tomar fotos no basta. Para que sean evidencia util debes preservar metadatos, fechas y huellas digitales. Te explicamos como.",
    date: "2026-03-28",
    author: "Equipo CertiFoto",
    category: "Tecnico",
    readMinutes: 5,
    content: `Una foto sin contexto es solo una imagen. Para que una foto sirva como evidencia respaldatoria en un proceso de arriendo, debe cumplir con ciertas condiciones tecnicas que muchas veces se pasan por alto.

Esta guia te explica que hace que una foto sea evidencia util y como preservar esa calidad.

## Que es la metadata EXIF

Las fotos digitales no son solo pixeles. Cada foto tomada con un celular o camara guarda dentro del archivo informacion adicional llamada EXIF: fecha y hora exacta, modelo de camara, configuracion (apertura, ISO, exposicion), y a veces ubicacion GPS.

Esta metadata es util para:

- Demostrar cuando se tomo la foto.
- Identificar el dispositivo que la capturo.
- Ubicar geograficamente donde se tomo, si la camara registro GPS.
- Detectar si la foto fue editada (programas como Photoshop dejan rastro).

## Como se pierde la metadata

Lamentablemente, muchas plataformas la borran o la modifican:

- WhatsApp comprime las fotos y elimina casi toda la metadata.
- Instagram y otras redes sociales tambien procesan las imagenes.
- Capturas de pantalla no tienen metadata real (solo la fecha de captura).
- Editar la foto en cualquier programa puede alterar o borrar campos.

Por eso, si vas a usar una foto como respaldo, lo ideal es:

- No enviarla por WhatsApp si la quieres usar como evidencia.
- Compartirla por email como archivo adjunto, no como imagen pegada.
- Mantener el archivo original, no recomprimirlo.

## El hash criptografico

Mas alla de la metadata, una manera tecnicamente solida de probar que una foto no ha sido alterada es calcular su hash criptografico. Un hash es una huella digital unica: si cambias un solo pixel de la foto, el hash cambia completamente.

Si calculas el hash de una foto al momento de tomarla y lo registras en un acta firmada, despues puedes recalcular el hash de la foto entregada y verificar que sea el mismo. Si coincide, la foto no fue alterada. Si no coincide, hubo modificacion.

CertiFoto calcula el hash SHA-256 de cada foto automaticamente al subirla y lo guarda en el PDF del acta firmada. Es una capa extra de seguridad sobre la metadata.

## Como CertiFoto preserva todo esto

Cuando subes una foto a CertiFoto, la plataforma:

- Extrae y guarda toda la metadata EXIF disponible.
- Calcula el hash SHA-256 del archivo original.
- Calcula el pHash (hash perceptual, util para detectar fotos similares pero recomprimidas).
- Detecta si la foto tiene marcadores C2PA (firma de autenticidad de algunos dispositivos modernos).
- Genera un reporte de consistencia: si las fechas tienen sentido, si hay GPS, si parece editada con Photoshop, etc.

Todo esto queda en el PDF del acta y puede verificarse posteriormente.

## Conclusion

Si vas a documentar un arriendo, no basta con tomar fotos: hay que preservar su metadata y calcular su huella digital. Con eso, una foto se convierte en evidencia tecnica solida que es mucho mas dificil de cuestionar que una simple imagen sin respaldo.`,
  },
  {
    slug: "ia-vision-actas-arriendo",
    title: "El rol de la inteligencia artificial en las actas de arriendo",
    excerpt:
      "La IA puede ayudar a describir, ordenar y revisar evidencia fotografica. Pero tiene limites importantes. Te contamos como la usamos.",
    date: "2026-03-15",
    author: "Equipo CertiFoto",
    category: "IA",
    readMinutes: 5,
    content: `La inteligencia artificial vino a cambiar muchos procesos, y el de documentar el estado de una propiedad no es la excepcion. Pero como toda tecnologia poderosa, hay que entender sus capacidades y sus limites antes de confiar ciegamente.

Aca te contamos como usamos IA en CertiFoto y por que la consideramos asistencia, no reemplazo del criterio humano.

## Que puede hacer la IA

Los modelos modernos de vision computacional pueden, con bastante precision:

- Reconocer el tipo de ambiente (cocina, baño, dormitorio).
- Identificar elementos visibles (muros, piso, ventanas, muebles).
- Detectar caracteristicas como manchas, rayaduras o suciedad evidente.
- Generar descripciones objetivas en lenguaje natural.
- Etiquetar fotos por contenido para facilitar la busqueda.

Esto acelera muchisimo el trabajo de quien documenta una inspeccion: en vez de escribir manualmente la descripcion de cada foto, recibes un borrador automatico que puedes ajustar.

## Que NO puede hacer la IA

Aca es donde es importante ser claros:

- No puede determinar si un daño existia antes o se produjo durante el arriendo.
- No puede atribuir responsabilidades.
- No puede reemplazar el ojo experto de un perito en casos complejos.
- Puede confundir cosas: una sombra puede parecer una mancha, un reflejo puede parecer humedad.
- Su nivel de confianza es estadistico, no infalible.

Por eso en CertiFoto la IA siempre indica el nivel de confianza de cada hallazgo y marca cuando algo "requiere revision humana". Las descripciones generadas son referenciales y las partes pueden corregirlas, complementarlas o simplemente ignorarlas.

## Como esta diseñada nuestra IA

Diseñamos las descripciones con tres principios:

- Lenguaje cuidadoso: usamos frases como "se observa", "aparentemente", "no se aprecian daños evidentes". Nunca afirmaciones absolutas.
- Sin atribucion de responsabilidad: la IA describe, no juzga.
- Marca explicita de incertidumbre: cuando algo no esta claro, lo decimos.

Un ejemplo real de salida:

> Se observa cocina con muebles blancos y cubierta gris. La superficie se ve limpia. Aparentemente hay una pequeña marca cerca del borde de la cubierta que podria corresponder a mancha o suciedad. Requiere revision humana para confirmar.

Esto es muy distinto a una descripcion afirmativa como "la cubierta esta dañada", que cargaria un juicio de valor que la IA no esta calificada para hacer.

## El rol del humano sigue siendo central

CertiFoto deja siempre la decision final en manos de las partes:

- Las descripciones de IA pueden editarse antes de firmar.
- Cualquier parte puede agregar observaciones manuales.
- Si una parte no esta de acuerdo con un hallazgo, puede firmar con observaciones.
- Si hay un conflicto serio, recomendamos siempre un perito profesional.

La IA es una herramienta de productividad que organiza y describe, no un arbitro que decide.

## El futuro

Estamos trabajando en funciones como:

- Comparacion automatica entre acta de entrega y acta de devolucion.
- Deteccion de cambios visibles entre dos fotos del mismo ambiente.
- Resumenes automaticos de toda una acta para revisarla rapido.

Todo manteniendo el principio de asistencia, no sustitucion.

## Conclusion

La IA puede hacer que documentar un arriendo sea mucho mas rapido y ordenado, pero no reemplaza el ojo humano ni el criterio de las partes. Bien usada, es una ayuda enorme. Mal entendida, puede generar falsas certezas. En CertiFoto la usamos siempre como asistencia, nunca como juicio.`,
  },
  {
    slug: "garantia-arriendo-discusion",
    title: "La garantia del arriendo: como evitar discusiones al final",
    excerpt:
      "El momento mas delicado de un arriendo suele ser la devolucion de la garantia. Te contamos como prepararte desde el primer dia.",
    date: "2026-03-02",
    author: "Equipo CertiFoto",
    category: "Practico",
    readMinutes: 5,
    content: `La garantia del arriendo, ese mes de canon que se entrega al inicio para responder por eventuales daños, es una de las fuentes mas frecuentes de conflicto al termino del contrato.

Para el arrendador, retener parte de la garantia parece justo cuando hay daños evidentes. Para el arrendatario, casi siempre se siente injusto. La verdad es que ambos pueden tener razon, y el problema casi siempre es la falta de evidencia clara sobre el estado original.

## Por que se generan los conflictos

La mayoria de las disputas de garantia caen en alguno de estos patrones:

- "Eso ya estaba asi cuando llegue": el arrendatario asegura que un daño es preexistente, el arrendador no tiene como verificarlo.
- "No te das cuenta del daño": el arrendador identifica algo que el arrendatario no consideraba problematico.
- "Mira la diferencia con como te lo entregue": frase que solo funciona si efectivamente hay un registro previo.
- "Eso es desgaste normal": discusion sobre que es uso esperable y que es daño imputable al arrendatario.

Sin un registro objetivo del estado inicial, todas estas discusiones se vuelven subjetivas y dependen de la memoria de las partes.

## La solucion empieza el primer dia

Cuanto mejor documentes el estado al inicio del arriendo, mas facil sera la conversacion al final. No es necesario ser un perito profesional: con una buena acta de entrega con fotos por ambiente y firmadas por ambas partes, la mayoria de los conflictos se evitan.

La logica es simple: si entregaste un departamento con un raspon en la pared del living y eso quedo fotografiado y firmado en la acta de entrega, no hay como cobrartelo al final. Si no lo documentaste, queda en la palabra de cada uno.

## Que tipo de evidencia funciona

No toda evidencia tiene el mismo valor:

- Fotos de WhatsApp comprimidas: poca utilidad. Faltan metadatos, calidad reducida.
- Fotos en el celular: utilidad media. Tienen metadata pero estan dispersas.
- Documento word con fotos pegadas: utilidad media. Se puede modificar facilmente.
- Acta digital con fotos respaldadas y firmadas: alta utilidad. Cada foto tiene su huella digital, fechas y firma de las partes.
- Acta notarial o pericial: maxima utilidad. Tambien el costo y formalidad mas alta.

El punto medio entre simplicidad y solidez es la acta digital firmada. Suficiente para la mayoria de los casos sin necesidad de un notario o perito.

## Que hacer durante el arriendo

Algunos consejos durante el arriendo para evitar problemas al final:

- Reportar daños relevantes apenas ocurren. Si rompiste algo, avisalo y resuelvanlo en su momento, no al final.
- Hacer mantenciones periodicas. Una propiedad bien mantenida durante el arriendo se devuelve en mejor estado.
- Documentar reparaciones. Si arreglaste algo o el arrendador hizo un mantenimiento, deja constancia.
- Hacer una inspeccion intermedia. En arriendos largos, una revision a la mitad ayuda a detectar problemas a tiempo.

## Al momento de la devolucion

- Hacer el recorrido juntos, igual que al inicio.
- Hacer una acta de devolucion con la misma estructura que la de entrega.
- Comparar foto por foto con la acta de entrega.
- Conversar abiertamente sobre cualquier diferencia.
- Si hay desacuerdo, dejarlo por escrito como observacion antes de firmar.

## Como CertiFoto ayuda

Nuestra herramienta esta diseñada exactamente para reducir estas discusiones. Te permite:

- Crear actas de entrega y devolucion con el mismo formato.
- Documentar el estado por ambiente con fotos respaldadas.
- Generar PDF formales con firma de ambas partes.
- (Pronto) Comparar acta de entrega y de devolucion automaticamente.

Todo gratis para uso personal y por una fraccion del costo de un perito o notario para uso profesional.

## Conclusion

La garantia del arriendo no tiene por que ser fuente de conflicto. Con buena documentacion al inicio, mantenciones durante el contrato y una devolucion ordenada, las dos partes pueden quedar tranquilas. La clave esta en preparar la evidencia desde el primer dia, no recolectarla cuando ya hay una disputa.`,
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
