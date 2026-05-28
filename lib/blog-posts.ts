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
    slug: "acta-entrega-propiedad-arriendo-que-incluir",
    title: "Acta de entrega de propiedad: qué incluir para evitar disputas en arriendo (2026)",
    excerpt:
      "Guía completa de qué debe incluir un acta de entrega de propiedad en Chile para que sirva como prueba en disputas de arriendo, retenciones de depósito y juicios en JPL.",
    date: "2026-05-22",
    author: "Equipo CertiFoto",
    category: "Guías",
    readMinutes: 11,
    content: `Imagina esta escena: arrendaste tu departamento hace un año. Cuando el arrendatario te devuelve las llaves, descubres que pintó el living de morado intenso. Le reclamas, y te responde con total tranquilidad: "Pero si estaba así cuando llegué". No tienes fotos firmadas, no tienes un acta detallada, y la garantía equivale a un mes de canon que ahora él reclama de vuelta. ¿Qué haces?

Sin un acta de entrega bien hecha, esa conversación termina en un Juzgado de Policía Local, o peor, en una pérdida directa. El acta es lo único que separa una disputa subjetiva ("eso ya estaba así") de una prueba documental concreta.

En esta guía repasamos todo lo que debe incluir un acta de entrega de propiedad en Chile para que efectivamente te proteja: qué fotografiar, qué describir, qué firmar, y por qué el respaldo forense (timestamp y hash criptográfico) marca la diferencia entre un papel mojado y una prueba que aguanta en tribunales.

## Por qué importa tanto un acta de entrega

El acta de entrega es el documento que registra el estado de la propiedad en el momento exacto en que el arrendatario recibe las llaves. Su utilidad es invisible mientras todo va bien, pero se vuelve crítica el día que aparece un problema: una mancha en la alfombra, una grifería rota, un mueble dañado.

Sin acta, todo es palabra contra palabra. Con acta, hay evidencia.

La Ley de Arrendamiento 18.101 permite al arrendador exigir un depósito de hasta un mes de renta, que debe devolverse en un plazo de 60 días contados desde la restitución del inmueble. Ese depósito puede retenerse total o parcialmente solo si hay daños justificados que excedan el desgaste normal por uso. Y acá está el punto: "justificar" requiere prueba, y la única prueba realmente útil es la que muestra el estado original contrastado con el estado final.

Cuando la disputa escala, llega al Juzgado de Policía Local (JPL), tribunal competente para conflictos de arriendo en Chile. Allí los jueces revisan dos cosas: el contrato y la evidencia documental. Una serie de fotos sueltas en el celular sin contexto, sin firma y sin fecha verificable tiene poco peso. Un acta firmada por ambas partes con timestamp confiable y hashes de las fotos, en cambio, es difícil de cuestionar.

## El problema del acta tradicional: por qué no basta con un Word

La mayoría de los arriendos en Chile siguen documentándose con un Word donde se pegan fotos y se imprime para que ambas partes firmen. Funciona en casos simples, pero tiene fallas estructurales que el otro lado puede atacar en una disputa:

- Las fotos pegadas en Word pierden la metadata EXIF original (fecha, dispositivo, GPS).
- Cualquiera puede editar el archivo y reemplazar imágenes sin que quede rastro.
- No hay forma técnica de probar cuándo se tomaron las fotos.
- La firma manuscrita escaneada es trivial de falsificar.
- No hay hash criptográfico que permita verificar integridad años después.

En una disputa seria, un abogado puede argumentar que el documento fue modificado, que las fotos no corresponden al momento de la entrega, o que la firma fue agregada después. Sin respaldo forense, esas objeciones tienen peso.

Acá es donde entra el concepto de acta forense: un documento donde cada foto tiene su hash SHA-256 calculado al momento de subirla, un timestamp verificable, y un PDF firmado que cualquiera puede auditar después. Si alguien intentara modificar una sola foto, el hash cambiaría y la modificación quedaría en evidencia.

## Datos que no pueden faltar en el acta

Antes de pensar en fotos, asegúrate de tener bien los datos básicos. Una buena acta arranca con la información formal completa:

- Dirección exacta del inmueble: calle, número, depto, comuna, ciudad.
- Características de la unidad: metros cuadrados aproximados, número de habitaciones, baños, si tiene estacionamiento, bodega o terraza.
- Si está amoblada, parcialmente amoblada o sin muebles.
- Datos del arrendador: nombre completo, RUT, dirección de notificación, teléfono y correo.
- Datos del arrendatario: nombre completo, RUT, teléfono y correo.
- Si hay codeudor solidario o aval, también sus datos.
- Fecha y hora exacta de la entrega.
- Número y referencia del contrato de arriendo asociado.
- Monto del depósito en garantía entregado.

Este encabezado parece obvio, pero más de un acta cae en JPL porque le faltó el RUT o porque la dirección estaba incompleta. La forma importa.

## Estado por ambiente: el corazón del acta

Acá está el contenido sustantivo. Cada ambiente de la propiedad debe documentarse con descripción escrita y fotografías. La regla general es: si no quieres tener que probar que algo no estaba dañado, fotografíalo.

### Living-comedor

- Estado de pisos (manchas, rayones en el parquet, condiciones del piso flotante).
- Muros: pintura, grietas, hoyos de clavos, marcas de cuadros previos.
- Ventanas: marcos, vidrios, persianas o cortinas si vienen con la propiedad.
- Techo: humedad, manchas, condición de cornisas.
- Enchufes y luminarias.
- Si está amoblado, cada mueble con su estado.

### Cocina

- Muebles altos y bajos: bisagras, puertas, cajones, manchas internas.
- Cubierta: rayones, quemaduras, picaduras.
- Lavaplatos: condición, grifería, filtraciones.
- Electrodomésticos: refrigerador, horno, microondas, campana, hervidor. Funcionamiento y daños visibles.
- Piso y muros, incluido cualquier mancha de grasa antigua.
- Lectura del medidor de gas si aplica.

### Dormitorios

- Closet: puertas, bisagras, repisas internas, manchas o quemaduras.
- Pisos y alfombras (la alfombra es probablemente lo que más se discute al final).
- Muros y techo.
- Ventanas y cortinas.
- Si vienen camas u otros muebles, su estado.

### Baños

- Inodoro: estado del estanque, asiento, tapa, grifería.
- Lavamanos y mueble bajo (típica zona de filtraciones invisibles).
- Tina o receptáculo de ducha: cromado, grifería, fugas, condición del silicón.
- Espejos, accesorios, toalleros.
- Cerámicas: trizaduras, lechada faltante.
- Ventilación.
- Detalle especial en humedad: revisar techos, esquinas y juntas.

### Áreas comunes de la propiedad

- Pasillos, escaleras, ascensores si son privativos.
- Terraza o balcón: piso, baranda, condición de fierros y soldaduras.
- Logia: lavadora si viene incluida, conexiones.
- Bodega.
- Estacionamiento: marcas en el piso, condición del cierre si aplica.

### Lecturas de medidores

Este punto vale oro al cierre del contrato:

- Medidor de luz: número de medidor + lectura visible en foto.
- Medidor de agua: igual.
- Medidor de gas: igual.
- Si hay agua caliente central, verificar.
- En condominios, verificar deudas pendientes de gastos comunes con certificado.

### Llaves y controles

- Cuántas llaves de la puerta principal se entregan.
- Llave de bodega, estacionamiento, llaves de servicio.
- Controles de portones, accesos vehiculares.
- Tarjetas magnéticas o digitales.
- Códigos de cajas fuertes si vienen instaladas.

## Daños preexistentes: el momento de blanquearlos

Toda propiedad usada tiene defectos. Lo importante es que todos esos defectos queden registrados antes de la entrega. Si el arrendatario los descubre después y no están en el acta, es razonable que reclame que se le imputen al final del contrato.

Recorre la propiedad junto al arrendatario y enumeren juntos cada defecto preexistente:

- Rayones, manchas, hoyos de clavos en muros.
- Trizaduras en cerámicas, vidrios o espejos.
- Daños en muebles si está amoblada.
- Grifería con goteo o problemas conocidos.
- Persianas dañadas, cortinas con marcas.
- Cualquier mantención pendiente que el arrendador asume que hará durante el arriendo.

Cada uno de estos puntos debe quedar fotografiado en close-up y descrito en el acta. Esto protege tanto al arrendador (no puede reclamarse después) como al arrendatario (no se le puede atribuir al final).

## Los problemas típicos que cuesta documentar

Hay daños que son particularmente conflictivos al final del arriendo porque son difíciles de fotografiar o porque aparecen lentamente. Vale la pena darles atención extra al momento de la entrega:

- Humedad: revisa esquinas de baños, cocina, logia y muros perimetrales. Si hay manchas amarillentas o pintura saltada, documéntalo.
- Daños invisibles tras muebles: si la propiedad está amoblada, idealmente mueve los muebles para revisar los muros detrás. Si no, déjalo registrado: "Estado de muros detrás de muebles no verificado al momento de la entrega".
- Plagas: revisa esquinas, ranuras y rincones. Si hay rastros de roedores o termitas, es un problema que debe blanquearse antes.
- Sistemas eléctricos: prueba enchufes con un cargador, prueba luminarias.
- Sistema de calefacción y aire acondicionado: si la propiedad tiene split, verifica que funcione (frío y calor). Documenta marca y modelo.
- Cerraduras y chapas: pruébalas todas con las llaves entregadas.

## Cómo redactar el acta y qué firmar

El acta debe estar redactada en un lenguaje claro, sin tecnicismos innecesarios, y debe contener:

- Encabezado con todos los datos de las partes y el inmueble.
- Detalle por ambiente con descripción y fotos enumeradas.
- Inventario de bienes si aplica.
- Lectura de medidores.
- Llaves y controles entregados.
- Observaciones especiales o defectos preexistentes en sección destacada.
- Cláusula de aceptación: que ambas partes declaran haber revisado y estar conformes con lo documentado.
- Lugar para firma de ambas partes con fecha.
- Si hay testigo, sus datos y firma también.

Idealmente se firma físicamente en el lugar de la entrega, en presencia de ambas partes. Si se hace digital, debe usarse una plataforma que registre identidad y timestamp verificable.

Tip importante: imprime o envía copia firmada a ambas partes el mismo día. No dejes el documento "para cerrarlo después", porque ese después tiende a no llegar nunca.

## Acta a mano vs herramienta digital: comparación honesta

Es razonable preguntarse si conviene hacer todo esto a mano con un Word y un celular, o si una herramienta dedicada vale la pena. Veamos la diferencia real:

Acta tradicional (Word + fotos pegadas + firma manuscrita):

- Costo: cero, solo tiempo.
- Tiempo de ejecución: 2 a 4 horas para un acta detallada.
- Robustez probatoria: media-baja. El documento puede modificarse, las fotos pierden metadata al pegarse.
- Verificabilidad: nula. Nadie puede confirmar cuándo se tomaron las fotos ni si el documento fue alterado.
- Profesionalismo percibido: variable, depende mucho del estilo.

Acta digital forense (plataforma especializada como CertiFoto):

- Costo: bajo, accesible incluso para arriendos particulares.
- Tiempo de ejecución: 30 a 60 minutos con asistencia guiada.
- Robustez probatoria: alta. Cada foto con hash SHA-256, timestamp verificable, PDF firmado.
- Verificabilidad: total. Cualquier auditor puede recalcular hashes y confirmar integridad.
- Profesionalismo percibido: alto. Es claramente un documento estructurado.

Para un arriendo familiar de bajo monto, el acta tradicional puede ser suficiente. Para un arriendo con depósito alto, propiedad amoblada o cuando se quiere blindar el contrato, una herramienta digital paga su costo en el primer conflicto evitado.

CertiFoto está diseñado exactamente para esto: guía paso a paso por cada ambiente, calcula automáticamente el hash de cada foto, genera el PDF con firma de ambas partes, y deja un registro que cualquiera puede verificar después.

## Preguntas frecuentes

### ¿En qué plazo debe devolverse el depósito de garantía?

La Ley 18.101 establece un plazo de 60 días desde la restitución del inmueble. Durante ese plazo, el arrendador puede retener total o parcialmente el depósito si hay daños imputables al arrendatario que excedan el desgaste normal. Si no devuelve en plazo y sin causa justificada, el arrendatario puede demandar en JPL.

### ¿Qué pasa si descubro daños preexistentes después de firmar el acta?

Si el daño no está en el acta y aparece después de la entrega, es difícil que el arrendador acepte que es preexistente. Por eso lo ideal es no apurar la firma. Si descubres algo después, notifícalo por escrito (correo electrónico al arrendador) en los primeros días con fotos fechadas, dejando trazabilidad. Esto crea un registro complementario aunque no esté en el acta original.

### ¿Qué pasa si el arrendatario se niega a firmar el acta?

Si el arrendatario rechaza firmar, el acta pierde su valor de mutuo acuerdo, pero no necesariamente su utilidad. El arrendador puede dejar constancia escrita de la negativa, firmar él solo el acta con testigo si corresponde, y enviar copia por correo electrónico certificado al arrendatario antes de la entrega de llaves. Es una situación incómoda y por lo general señala que el arriendo no debería seguir adelante.

### ¿Qué se considera desgaste normal vs daño imputable?

El desgaste normal es el deterioro razonable por uso adecuado: ligero amarillamiento de muros, marcas leves de muebles, desgaste de la pintura en zonas de roce. El daño imputable es lo que excede ese uso esperable: hoyos grandes, manchas profundas, quemaduras, roturas. La línea no siempre es nítida, y en disputa el JPL evalúa caso a caso. Tener fotos comparativas del inicio y final del arriendo simplifica la discusión.

### ¿El acta digital tiene la misma validez legal que una en papel?

Sí. La Ley 19.799 sobre documentos electrónicos reconoce validez a los documentos firmados digitalmente, especialmente cuando incluyen elementos de integridad como hashes y timestamps. En JPL los jueces aceptan habitualmente actas digitales bien estructuradas, y muchas veces les dan más peso que a un Word impreso por su mayor solidez técnica.

### ¿Necesito notario para el acta de entrega?

No es obligatorio. El acta firmada por las partes ya tiene valor probatorio. La intervención de notario o ministro de fe solo aporta una capa adicional de formalidad, útil en propiedades de muy alto valor o cuando hay desconfianza marcada entre las partes. Para la mayoría de los arriendos, un acta digital bien hecha es suficiente.

## Conclusión

Un acta de entrega bien hecha no es burocracia, es seguro barato. Toma unas pocas horas armar, pero te ahorra meses de discusión y eventualmente decenas o cientos de miles de pesos cuando aparece una disputa.

La clave está en tres elementos: completitud (que esté todo documentado, sin saltarse ambientes), precisión (fotos claras y descripciones específicas), y respaldo verificable (hashes, timestamps, firmas trazables). Lo demás es sentido común.

Si quieres ahorrarte la curva de aprendizaje y trabajar con un formato ya probado, CertiFoto te guía paso a paso y te entrega un acta lista para firmar con todo el respaldo forense incorporado. Puedes probarlo gratis y armar tu primera acta en menos de una hora.`,
  },
  {
    slug: "inventario-fotografico-entrega-departamento-checklist",
    title: "Inventario fotográfico para entregar departamento: checklist paso a paso",
    excerpt:
      "Checklist completo de qué fotografiar al entregar un departamento en arriendo, ambiente por ambiente, con foco en evitar disputas y proteger el depósito de garantía.",
    date: "2026-05-15",
    author: "Equipo CertiFoto",
    category: "Práctico",
    readMinutes: 10,
    content: `Una administradora de propiedades del barrio Italia nos contó hace poco un caso clásico: arrendaron un departamento amoblado por dos años. Cuando llegó la devolución, descubrieron que la cubierta de la cocina tenía tres quemaduras profundas, la alfombra del dormitorio principal estaba manchada y faltaba un mueble del living. El arrendatario, sereno, dijo que la cubierta ya estaba así, que la mancha era preexistente y que el mueble lo retiraron porque "no estaba en el inventario". La administradora abrió la carpeta del arriendo y encontró ocho fotos genéricas tomadas el día de la entrega, ninguna de close-up, ninguna firmada. Resultado: depósito devuelto íntegro, costo de reposición a cuenta del propietario.

Esto pasa todo el tiempo. La diferencia entre quedarse tranquilo o perder dinero al cierre del arriendo no está en tener más fotos, está en tener las fotos correctas con el respaldo correcto.

En este artículo te dejamos un checklist concreto, ambiente por ambiente, de qué fotografiar cuando entregas un departamento en arriendo en Chile. Pensado para corredores, administradoras y propietarios particulares que quieren profesionalizar su proceso y blindarse contra disputas.

## Por qué un inventario fotográfico hace la diferencia

El inventario fotográfico es la columna vertebral del acta de entrega. Es lo que convierte una descripción genérica ("departamento en buen estado") en evidencia visual concreta y verificable.

En una disputa de arriendo, el Juzgado de Policía Local no se sienta a leer descripciones literarias. Mira fotos y comparaciones. Si tu acta tiene 80 fotos detalladas con timestamp confiable y hash de integridad, el caso prácticamente se resuelve solo. Si tiene 8 fotos genéricas de WhatsApp, estás en problemas.

Hay tres reglas básicas que definen un buen inventario fotográfico:

- Cantidad suficiente: una propiedad estándar necesita entre 60 y 120 fotos para estar bien documentada. No es exagerado, es lo mínimo defendible.
- Calidad técnica: fotos nítidas, bien iluminadas, con metadata preservada.
- Respaldo forense: hash criptográfico y timestamp que permitan verificar después que la foto corresponde a ese momento exacto.

Sin estos tres ingredientes, el inventario es decorativo, no probatorio.

## Antes de empezar: preparación del recorrido

Algunas cosas importantes antes de empezar a fotografiar:

- Hazlo con buena luz natural si es posible. Las fotos con luz amarilla de ampolleta engañan sobre el estado real de los colores.
- Lleva una linterna o el flash del celular para zonas oscuras (debajo de lavamanos, dentro de closets, rincones).
- Limpia la propiedad antes del recorrido. Una propiedad sucia hace que cualquier foto se vea peor de lo que está.
- Idealmente recorre la propiedad con el arrendatario presente. Así él ve lo mismo que tú fotografías y no puede argumentar después que no le mostraste algo.
- Usa un orden consistente: empieza por la entrada y avanza siempre en el mismo sentido. Esto ayuda a comparar después con el acta de devolución.
- Si tu celular lo permite, activa la opción de geoetiquetado (GPS) para que las fotos guarden la ubicación.

## Checklist por ambiente

### Entrada y hall

- Puerta principal por fuera (estado de pintura, mirilla, número).
- Puerta principal por dentro (estado, picaporte, marco).
- Cerradura y chapa de seguridad (close-up).
- Llaves entregadas, en mesa, con identificación de cada una.
- Piso del hall.
- Muros del hall.
- Luminaria del hall encendida.
- Si hay timbre o citófono, foto del panel.

### Living-comedor

- Foto general del ambiente desde cada esquina (mínimo 4 ángulos).
- Pisos: foto general y close-ups de cualquier mancha, rayón o defecto.
- Muros: foto de cada muro completo y close-ups de defectos.
- Techo: foto general buscando humedad o manchas.
- Ventanas: marcos, vidrios, sellos. Si están sucios, dejarlo evidente o limpiar antes.
- Cortinas o persianas: foto general y close-up de cualquier daño.
- Enchufes y enchufes de luz (que se vea su estado).
- Luminaria encendida y apagada.
- Si está amoblado: cada mueble fotografiado desde varios ángulos, incluyendo respaldo, asientos y zonas de roce.
- Calefacción si aplica (split, estufa empotrada, radiador).

### Cocina

- Foto general desde cada esquina.
- Muebles bajos: cada puerta y cajón abierto y cerrado.
- Muebles altos: igual.
- Cubierta: foto general y close-ups de toda la superficie, especialmente bordes y zona cercana a las hornillas.
- Lavaplatos: cubierta, llave, sifón debajo (típica zona de filtración).
- Mueble debajo del lavaplatos: abierto, mostrando piso interior (donde aparecen las filtraciones).
- Encimera y horno: foto exterior, interior, perillas.
- Campana: filtros, motor visible, estado de la grasa acumulada.
- Refrigerador: exterior, interior con cajones, condición de los sellos de las puertas.
- Microondas, hervidor, tostadora si están incluidos.
- Pisos de cocina, incluido detrás del refrigerador si es accesible.
- Muros, especialmente detrás de zona de cocción (manchas de grasa).
- Llave de paso de gas (cerrada o abierta según corresponda).
- Medidor de gas con lectura visible.

### Logia

- Foto general.
- Lavadora si viene incluida: exterior, tambor interior, dispensador de detergente, condición de las mangueras.
- Secadora si viene incluida: igual.
- Conexiones de agua para lavadora.
- Desagüe.
- Estanque o calefont si está en la logia.
- Muros y piso.

### Baños (cada uno)

- Foto general desde la puerta.
- Inodoro: estanque, tapa, asiento, base.
- Lavamanos: cubierta, grifería, sifón debajo.
- Mueble bajo del lavamanos: abierto, mostrando piso interior y muros traseros (humedad típica).
- Tina o receptáculo de ducha: foto general, grifería, mampara o cortina.
- Si hay tina, fotografía la unión con el muro (silicón).
- Cerámicas de muros: especial atención a juntas (lechada) y posibles trizaduras.
- Cerámicas de piso: igual.
- Ventana si tiene.
- Extractor o ventilación.
- Espejo: estado, condición del azogue por detrás.
- Toalleros, jaboneras y accesorios.
- Toma corrientes (delicado por humedad).
- Luminaria encendida.

### Dormitorios (cada uno)

- Foto general desde cada esquina.
- Closet: puertas cerradas, abiertas, interior con repisas y barras.
- Cajones del closet si tiene: cada uno abierto.
- Pisos: foto general y close-ups, especial atención a alfombras.
- Muros: cada uno completo más close-ups de defectos.
- Techo.
- Ventanas y cortinas.
- Enchufes.
- Luminaria.
- Si está amoblado: cama, veladores, escritorio. Cada mueble con detalle.

### Terraza, balcón o patio

- Piso: foto general y zonas de humedad o daños.
- Baranda: estado de fierros, soldaduras, pintura, oxidación.
- Muros y revestimientos.
- Si hay quincho o asadores, su estado.
- Sumideros y desagües.
- Vista exterior para acreditar ubicación.

### Bodega

- Foto general.
- Estado de muros y piso.
- Cerradura y puerta.
- Estanterías si vienen.
- Numero o identificación de la bodega.

### Estacionamiento

- Foto general del cajón.
- Línea pintada del piso.
- Muros laterales si los hay.
- Si tiene cierre, foto del mecanismo.
- Numero o identificación del estacionamiento.
- Acceso al estacionamiento (puerta automática, control).

## Lecturas de medidores: la sección que más se olvida

Una de las disputas más comunes al cierre del arriendo no es por daños, es por cuentas. El arrendatario se va y queda una cuenta de luz pendiente, o el arrendador descubre un consumo de agua absurdo del último mes que el arrendatario asegura no haber generado.

La forma de evitarlo es simple: fotografiar los medidores el día de la entrega con su lectura completamente visible. Y repetir el ejercicio el día de la devolución.

- Medidor eléctrico: número del medidor + lectura del display (idealmente foto con el número de medidor y la lectura en una sola toma).
- Medidor de agua: número + lectura.
- Medidor de gas individual si aplica: número + lectura.
- Si hay agua caliente central, verificar quién factura y cómo se mide.
- Certificado de deuda de gastos comunes al día (de la administración del edificio).

## Inventario de bienes si la propiedad está amoblada

Para departamentos amoblados, además de fotografiar cada mueble, conviene armar una lista escrita en el acta:

- Tipo de mueble (sofá de tres cuerpos, mesa de comedor de madera, etc.).
- Cantidad.
- Estado general (bueno, regular, con observaciones).
- Marca o características relevantes si aplica.
- Foto de referencia del acta donde se ve.

Lo mismo aplica a electrodomésticos, vajilla, ropa de cama si la propiedad la incluye, decoración, etc. Es tedioso, pero es la única forma de probar después qué se entregó.

## Problemas típicos al cierre y cómo se evitan

Las disputas al cierre del arriendo se concentran en un puñado de situaciones que se repiten. Buena noticia: todas se previenen con un inventario fotográfico bien hecho:

- Depósito retenido por daños cuestionables: el arrendador retiene el depósito alegando daños que el arrendatario considera preexistentes o desgaste normal. Con un inventario claro de entrada, la discusión se resuelve foto contra foto.
- Manchas en alfombras o muros: muy frecuente. El arrendatario dice que la mancha ya estaba, el arrendador dice que no. Con close-ups en el acta de entrega no hay ambigüedad.
- Daños invisibles que el arrendatario reconoce solo al final: una filtración que dejó humedad bajo el lavaplatos, un mueble que se desprendió. Si está en el acta de entrega, queda claro que es nuevo.
- Falta de elementos: una puerta que faltaba al final pero el arrendatario asegura que nunca estuvo. El inventario inicial lo resuelve.
- Quemaduras en cubierta de cocina: clásico de hornillas. Si la cubierta estaba intacta en el acta de entrega, el daño es del arrendatario.
- Olor a humedad: las fotos no capturan olores, pero si hay manchas visibles de humedad nueva, sí se documentan.

## Hacerlo a mano vs con herramienta digital

Documentar un departamento estándar requiere entre 60 y 120 fotos, organizadas por ambiente, con descripciones, lectura de medidores, datos de las partes, firma de ambos lados y respaldo verificable. Si lo haces a mano:

- Tomas las fotos en el celular.
- Las pasas al computador.
- Las pegas en un Word con descripciones.
- Imprimes para firma o las dejas en PDF.
- Le envías copia al arrendatario por mail.

Tiempo realista: una mañana entera, mínimo. Y aún así, el resultado pierde la metadata original de las fotos al pegarlas en Word, no tiene hash verificable, y la firma manuscrita escaneada es trivialmente cuestionable.

Una herramienta digital especializada hace exactamente lo mismo pero en 30 a 60 minutos, sin perder calidad técnica:

- Subes las fotos directo desde el celular.
- La herramienta calcula el hash SHA-256 de cada una al recibirla.
- Asigna automáticamente cada foto al ambiente correspondiente con asistencia de IA.
- Genera descripciones referenciales que puedes ajustar.
- Crea el PDF con firma digital de ambas partes.
- Deja todo en la nube con respaldo verificable.

CertiFoto está pensado exactamente para este flujo. Un corredor o administradora puede documentar 5 a 10 propiedades por día con calidad profesional, contra 1 a 2 con flujo manual. Para un propietario particular, paga la inversión en el primer arriendo donde se evita una disputa.

Si te interesa entender cómo se compara con otros métodos, ya escribimos sobre [diferencias entre acta de entrega y devolución](/blog/diferencia-acta-entrega-devolucion) y sobre [cómo respaldar fotos de un arriendo para que tengan validez](/blog/respaldo-fotografico-arriendo).

## Preguntas frecuentes

### ¿Cuántas fotos son suficientes para un departamento?

Para un departamento estándar de dos dormitorios, lo razonable son entre 60 y 100 fotos. Para uno amoblado, súbele a 100-150. Para casas, el número se duplica fácilmente. La regla práctica es: si quieres poder discutir un daño después, tiene que aparecer claramente en al menos una foto del inicio.

### ¿Las fotos de WhatsApp sirven como prueba?

Tienen utilidad limitada. WhatsApp comprime fuertemente las imágenes y elimina la mayor parte de la metadata original (fecha, dispositivo, GPS). En tribunales se aceptan, pero pesan mucho menos que fotos originales con metadata preservada. Si vas a usar WhatsApp para enviar, envía siempre como "documento" o "archivo", no como "imagen", para preservar el original.

### ¿Qué pasa con el depósito si el arrendatario no firma el acta?

Si el arrendatario no firma, el arrendador queda en una posición debilitada para retener el depósito, porque pierde la prueba del estado inicial acordado. Lo que recomendamos es: nunca entregar las llaves sin acta firmada. Si llegado el momento el arrendatario se rehúsa, conviene posponer la entrega antes que renunciar al respaldo.

### ¿Puedo cobrar al arrendatario por desgaste normal?

No. El desgaste normal por uso adecuado de la propiedad es responsabilidad del arrendador, no del arrendatario. Cobrar por desgaste normal es una de las causas más frecuentes de denuncias en JPL y suele resolverse en contra del arrendador. La línea entre desgaste y daño se evalúa caso a caso, pero quemaduras, hoyos en muros, manchas profundas o roturas son daño imputable; ligero amarillamiento, marcas suaves o desgaste de pintura por roce son desgaste normal.

### ¿Necesito asesoría legal para entregar un departamento?

Para arriendos estándar, no. Un contrato bien redactado y un acta de entrega detallada son suficientes. La asesoría legal se vuelve útil cuando hay condiciones especiales (subarriendo, leasing, propiedades comerciales) o cuando ya hay una disputa abierta. Para evitar disputas, un buen inventario fotográfico hace más que una asesoría reactiva.

### ¿Cómo me protejo si soy arrendatario y el departamento tiene daños no documentados?

Antes de firmar el acta, recorre la propiedad con calma y exige que cada defecto que veas quede registrado, idealmente con foto. Si el arrendador se resiste a documentar algo que ves claramente, déjalo por escrito como observación tuya antes de firmar. Tu firma compromete tu conformidad con lo escrito, así que mejor que esté todo arriba de la mesa.

## Conclusión

Un buen inventario fotográfico no es opcional, es la herramienta básica que define si un arriendo termina ordenadamente o en disputa. La buena noticia es que con un checklist sistemático y la herramienta correcta, puede hacerse en menos tiempo del que tarda una visita.

Si quieres una guía digital que te lleve paso a paso por cada ambiente, calcule automáticamente el respaldo forense de cada foto y entregue un PDF firmado por ambas partes, CertiFoto está construido exactamente para eso. Puedes probarlo gratis y armar tu primer inventario en una hora.`,
  },
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
