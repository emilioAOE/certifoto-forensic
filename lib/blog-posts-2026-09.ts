/**
 * Artículos de septiembre 2026: intención de uso, no solo información.
 *
 * La analítica mostró que casi todo el tráfico de búsqueda caía en artículos
 * informativos (mantenciones, aviso de término) y casi nadie pasaba a la app.
 * Estos cuatro atacan búsquedas de quien ya va a entregar o recibir una
 * propiedad: formato/plantilla de acta, recepción de departamento nuevo,
 * arriendo comercial y arriendo amoblado.
 *
 * Mismo formato que lib/blog-posts.ts (## H2, ### H3 para las FAQ, listas,
 * > citas, **negrita**, [enlaces](/ruta)). Sin cifras inventadas.
 */

import type { BlogPost } from "./blog-posts";

export const POSTS_2026_09: BlogPost[] = [
  {
    slug: "formato-acta-entrega-departamento-pdf-word",
    title: "Formato de acta de entrega de departamento (PDF gratis): qué debe incluir y cómo llenarlo",
    excerpt:
      "Qué debe tener un formato de acta de entrega de departamento en Chile, los errores que la dejan sin valor en la práctica, cómo llenarla paso a paso y una plantilla PDF gratis lista para imprimir o completar en pantalla.",
    date: "2026-09-21",
    author: "Equipo CertiFoto",
    category: "Práctico",
    readMinutes: 8,
    content: `Si buscas un formato de acta de entrega de departamento es porque la entrega es mañana, o fue ayer y te diste cuenta de que no dejaste nada por escrito. Esta guía va al grano: qué debe incluir el formato para que sirva de verdad, cómo se llena en 20 minutos y dónde descargar una [plantilla en PDF gratis](/plantilla) que ya trae todo.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Para qué sirve el acta (y por qué un formato malo no sirve)

El acta de entrega fija por escrito **cómo estaba el departamento el día en que se entregaron las llaves**. Al terminar el arriendo, ese documento es la única referencia objetiva para decidir si un daño ya existía o si lo causó el arrendatario, y por lo tanto si corresponde descontarlo de la garantía.

La Ley 18.101 no exige un formato específico ni una firma notarial: el acta es un anexo del contrato que las partes firman de mutuo acuerdo. Pero justamente por eso, un formato incompleto es peor que ninguno: si dice "departamento en buen estado" y nada más, no prueba nada cuando aparece una mancha, una llave que falta o un medidor con deuda.

## Qué debe incluir un buen formato

Un formato de acta de entrega de departamento completo tiene nueve bloques. Si el que descargaste no tiene alguno, agrégalo a mano.

1. **Identificación del acta.** Tipo (entrega, devolución o inspección), fecha y hora, dirección exacta del departamento, número de bodega y estacionamiento si los hay.
2. **Las partes.** Nombre, RUT y correo de arrendador y arrendatario, y del corredor o administrador si participa. Si alguien firma en representación de otro, que quede dicho.
3. **Referencia al contrato.** Fecha del contrato, monto del arriendo y monto de la garantía. Así el acta queda amarrada al contrato que complementa.
4. **Estado por ambiente.** Living, comedor, cocina, cada dormitorio, cada baño, logia, terraza, bodega y estacionamiento. Por cada uno: muros, cielo, piso, ventanas, puertas y cerraduras, enchufes e interruptores, artefactos. Un checklist Bueno / Regular / Malo con espacio para observaciones es suficiente.
5. **Medidores.** Lectura de luz, agua y gas, con número de medidor y fecha. Es el bloque que más discusiones evita.
6. **Llaves y controles.** Cuántas llaves de cada puerta, controles de portón, tarjetas de acceso, llaves de buzón y bodega. Contadas y firmadas.
7. **Inventario.** Solo si el departamento se entrega con muebles, cortinas, electrodomésticos o artefactos. Marca y modelo cuando exista.
8. **Daños preexistentes y observaciones.** Todo lo que ya estaba: rayas, manchas, humedad, artefactos que no funcionan. Aquí es donde el arrendatario se protege.
9. **Declaración de conformidad y firmas.** Ambas partes declaran haber recorrido el departamento y aceptar el contenido, y firman cada página o al menos la última con la cantidad de páginas indicada.

Y un décimo bloque que los formatos en papel no traen pero que hoy define la utilidad del acta: **las fotos**. Un acta describe; una foto demuestra. Anexa las fotos de cada ambiente, de los medidores y de cada daño preexistente, y referencia en el acta cuántas fotos se tomaron y quién las guarda.

## Cómo llenarla paso a paso

- **Antes de la cita:** completa las partes, el contrato y la dirección. Imprime dos copias o ten el PDF listo en el celular.
- **En el departamento, con las dos partes presentes:** recorre en un orden fijo (desde la entrada hacia adentro) y llena el checklist ambiente por ambiente. No aceptes "después lo revisamos".
- **Foto de cada cosa que anotas.** Si escribes "raya en el piso del dormitorio 2", saca la foto en ese momento, de cerca y con contexto.
- **Medidores al final**, con la foto de la lectura legible.
- **Llaves sobre la mesa**, contadas en voz alta, foto del conjunto.
- **Firmas.** Cada parte se queda con una copia firmada. Si firmas en PDF, envía la copia por correo el mismo día.

## Los cinco errores que dejan un acta sin valor

- **Firmarla días después de la entrega.** La fecha del acta debe coincidir con la fecha real de la entrega de llaves.
- **Describir en general.** "Todo en buen estado" no sirve. "Piso flotante sin rayas visibles; puerta del baño con cerradura funcionando; ventana del living cierra bien" sí.
- **No anotar lo que ya estaba malo.** El arrendatario que no anota la mancha del muro la va a pagar al final.
- **Fotos sin fecha confiable.** Una foto en el celular puede ser de cualquier día. Si la foto lleva una huella digital y una fecha verificable, nadie puede alegar que es de otra fecha o que fue editada.
- **Que solo firme una parte.** Sin la firma de ambas partes, el acta es una declaración unilateral.

## PDF impreso o acta digital

La plantilla en PDF sirve perfectamente para una entrega bien hecha, y la puedes [descargar gratis aquí](/plantilla). Sus límites son dos: las fotos quedan sueltas (en un celular, en un WhatsApp) y no hay forma de demostrar que no se editaron.

Un acta digital como la de CertiFoto resuelve exactamente eso: subes las fotos por ambiente, la inteligencia artificial reconoce el ambiente y describe el estado, cada foto recibe una huella SHA-256 y una fecha verificable, y al certificar obtienes un PDF que cualquiera puede comprobar en [certifoto.cl/forensic](/forensic) sin cuenta. Crear el acta es gratis; se paga solo al certificarla para descargarla y enviarla a las partes.

Si quieres profundizar en qué revisar en cada ambiente, tenemos un [checklist fotográfico paso a paso](/blog/inventario-fotografico-entrega-departamento-checklist) y una guía sobre [qué debe incluir el acta para evitar disputas](/blog/acta-entrega-propiedad-arriendo-que-incluir).

## Preguntas frecuentes

### ¿El acta de entrega tiene que ser notarial?

No. Es un documento privado que firman las partes; no necesita notario ni un formato oficial. Lo que le da valor es el detalle, la fecha correcta, las fotos y las firmas de ambas partes. Si quieres reforzarla, las fotos con huella digital y fecha verificable cumplen ese rol mejor que una firma ante notario, que solo certifica quién firmó, no el estado del departamento.

### ¿Sirve una plantilla de Word o tiene que ser PDF?

Sirve cualquier formato que se pueda llenar, firmar y conservar sin cambios. El PDF es más práctico porque no se desordena al abrirlo en otro computador y se firma en pantalla; Word es cómodo para editar los bloques antes de la entrega. Lo importante es que la versión firmada quede guardada y no se vuelva a editar.

### ¿Quién debe llenar y firmar el acta?

La llena quien organiza la entrega (normalmente el arrendador o el corredor) y la firman arrendador y arrendatario, o quienes los representen. Si el arrendatario se niega a firmar, deja constancia de eso en el acta, tómale las fotos igual y envíale el acta por correo el mismo día: la fecha del envío y las fotos con huella siguen siendo evidencia.

### ¿Cuánto tiempo hay que guardar el acta?

Hasta que se haya devuelto la garantía y no quede ninguna discusión pendiente. En la práctica, guárdala junto con el contrato durante todo el arriendo y al menos un tiempo después de terminado. Una copia digital respaldada evita que se pierda con el papel.`,
  },
  {
    slug: "acta-recepcion-departamento-nuevo-inmobiliaria",
    title: "Acta de recepción de un departamento nuevo: qué revisar antes de firmar a la inmobiliaria",
    excerpt:
      "Qué revisar en la recepción de un departamento nuevo, cómo dejar constancia de las observaciones para la posventa, qué garantías fija la ley para fallas de construcción y por qué las fotos con fecha verificable valen más que la lista que te entrega la inmobiliaria.",
    date: "2026-09-21",
    author: "Equipo CertiFoto",
    category: "Guías",
    readMinutes: 9,
    content: `La recepción de un departamento nuevo dura una hora y define los próximos años. Lo que no anotes ese día, la inmobiliaria puede tratarlo después como "uso normal" o "daño del propietario". Esta guía explica qué revisar, cómo dejar constancia de cada observación y qué plazos de garantía fija la ley chilena para las fallas de construcción.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Qué es la recepción y qué firmas ese día

Cuando la inmobiliaria te cita a "recibir" el departamento, te entrega las llaves y te pide firmar un **acta de entrega o recepción**. Normalmente viene con una lista de observaciones (a veces la llaman "lista de detalles" o "checklist de posventa") donde se anotan los defectos que encuentres en ese momento.

Ese documento tiene dos efectos prácticos: fija la fecha desde la que ocupas el departamento y deja registro de las fallas visibles al momento de recibirlo. Todo lo que quede fuera de la lista lo tendrás que reclamar después por posventa, y ahí la discusión de siempre es si el defecto ya existía o apareció con el uso.

## Qué revisar, ambiente por ambiente

Ve con tiempo, con luz de día y con alguien más. Revisa en un orden fijo y anota todo, aunque parezca menor.

- **Terminaciones:** pintura (manchas, chorreados, grietas finas), cerámicas y porcelanatos (piezas trizadas, desnivel, fragüe incompleto), pisos flotantes o de madera (rayas, tablas levantadas, ruido), guardapolvos y cornisas.
- **Puertas y ventanas:** que abran y cierren sin roce, cerraduras y manillas firmes, ventanas que sellen (pasa la mano por el borde buscando corriente de aire), vidrios sin rayas ni trizaduras, quincallería completa.
- **Instalaciones eléctricas:** prueba cada enchufe (un cargador basta), cada interruptor, timbre, citófono, luces de closets y logia. Revisa el tablero: que cada automático esté identificado.
- **Agua y gas:** abre todas las llaves y mira presión y agua caliente. Revisa bajo los lavaplatos y lavamanos con una linterna buscando goteos. Descarga cada WC. Si hay gas, que el calefont o la caldera enciendan.
- **Humedad:** esquinas de muros, cielos de baños, bajo ventanas y en la logia. Una mancha chica hoy es una filtración en invierno.
- **Artefactos y equipamiento:** cocina, campana, horno, calefacción, aire acondicionado y todo lo que la promesa decía que incluía. Marca y modelo si el contrato los especifica.
- **Espacios comunes propios:** bodega y estacionamiento, con su numeración, puerta y luz.
- **Medidores:** lectura de luz, agua y gas al momento de recibir. Desde ahí los consumos son tuyos.

## Cómo dejar constancia (la lista de la inmobiliaria no basta)

La lista de observaciones la escribe el personal de la inmobiliaria, con sus palabras y en su formato. Complementa así:

1. **Foto de cada observación**, de cerca y con contexto (que se entienda en qué muro o pieza está). Foto también de lo que está bien en los puntos críticos: cerámicas, ventanas, artefactos.
2. **Tu propia acta**, aunque sea una plantilla simple, con la lista completa de lo observado, la lectura de medidores y el estado de cada ambiente. Puedes [descargar una plantilla en PDF gratis](/plantilla) y adaptarla.
3. **Fecha verificable.** Si la inmobiliaria discute después que un defecto "no estaba", lo que decide es poder demostrar cuándo se tomó la foto y que no fue editada. Con [CertiFoto](/) cada foto recibe una huella SHA-256 y una fecha verificable, la IA describe el estado y el PDF final se puede comprobar sin cuenta. Crear el acta es gratis.
4. **Copia firmada de todo** lo que firmes ese día, con la lista de observaciones adjunta. Si te entregan solo la hoja de firmas, pide la lista.

## Garantías legales por fallas de construcción

La Ley General de Urbanismo y Construcciones (artículo 18) hace responsable al propietario primer vendedor (la inmobiliaria) por los daños y perjuicios que provengan de fallas o defectos de la construcción, y fija plazos para reclamar según el tipo de falla:

- **10 años** para fallas que afecten la estructura soportante del inmueble.
- **5 años** para fallas de los elementos constructivos o de las instalaciones.
- **3 años** para fallas de terminaciones o acabados.

Los plazos de 10 y 5 años se cuentan desde la recepción definitiva de la obra por la Dirección de Obras Municipales; el de 3 años, desde la inscripción del inmueble a nombre del comprador en el Conservador de Bienes Raíces. Además, como comprador de una inmobiliaria estás amparado por la Ley del Consumidor para los problemas de posventa y de información. En cualquier reclamo, el primer documento que se pide es el acta de recepción y sus observaciones: por eso conviene que sea completa y con fotos.

## Los errores más comunes al recibir

- Ir apurado y firmar sin recorrer todo.
- Aceptar "eso lo arreglamos la próxima semana" sin que quede escrito en la lista.
- No probar el agua caliente, el gas ni los enchufes porque "es nuevo".
- No fotografiar los medidores.
- Guardar las fotos solo en el celular y perderlas al cambiarlo.

Para la etapa siguiente, cuando el departamento se arrienda, tenemos una guía sobre [cómo hacer el acta de entrega de arriendo](/blog/como-hacer-acta-entrega-arriendo) y, si lo compraste para vivir, sobre [cómo documentar el estado en una compraventa](/blog/fotos-estado-propiedad-compraventa-entrega).

## Preguntas frecuentes

### ¿Puedo negarme a recibir el departamento si tiene fallas?

Puedes dejar constancia de todas las fallas en la lista de observaciones y firmar la recepción con observaciones; eso no significa aceptar los defectos. Si las fallas son graves (por ejemplo, instalaciones que no funcionan o filtraciones), conviene consultar antes de firmar, porque desde la recepción empiezan a correr tus obligaciones como propietario y los consumos.

### ¿Qué pasa con las fallas que aparecen después de la recepción?

Se reclaman por posventa y, si la inmobiliaria no responde, por la vía de la Ley General de Urbanismo y Construcciones dentro de los plazos de garantía. Tener fotos fechadas de cómo estaba el departamento el día de la recepción sirve para demostrar que el defecto no fue causado por el uso.

### ¿La lista de observaciones de la inmobiliaria reemplaza mi acta?

No la reemplaza: es su registro, en su formato. Tu acta con fotos es tu registro. Lo ideal es que coincidan y que ambas partes las firmen; si la inmobiliaria no quiere firmar la tuya, envíasela por correo el mismo día con las fotos adjuntas para que quede la fecha.

### ¿Sirve una recepción por video?

Sirve como complemento, pero un video largo es difícil de revisar y no acredita fecha por sí solo. Las fotos por ambiente, con fecha y huella verificables, son más fáciles de usar en un reclamo y de contrastar con la lista de observaciones.`,
  },
  {
    slug: "acta-entrega-local-comercial-arriendo",
    title: "Acta de entrega de un local comercial u oficina: qué incluir en un arriendo comercial",
    excerpt:
      "Cómo hacer el acta de entrega de un local comercial u oficina en arriendo: estado de la obra gruesa e instalaciones, medidores, habilitaciones, mejoras del arrendatario y la restitución al término. Con checklist y errores que después cuestan la garantía.",
    date: "2026-09-20",
    author: "Equipo CertiFoto",
    category: "Guías",
    readMinutes: 8,
    content: `En un arriendo comercial la garantía suele ser más alta que en una vivienda, el arrendatario hace obras para habilitar el local y el contrato exige devolverlo "en el estado en que se recibió". Sin un acta de entrega detallada, esa frase es una invitación a la pelea. Esta guía explica qué debe incluir el acta de entrega de un local comercial u oficina, qué la diferencia de la de una vivienda y cómo dejarla lista para la restitución.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## En qué se diferencia de una vivienda

El arriendo de locales y oficinas también se rige por la Ley 18.101 y por las reglas generales del arrendamiento del Código Civil, pero en la práctica el contrato manda mucho más: garantías de dos o tres meses (o más), plazos largos, cláusulas sobre obras y mejoras, y una obligación de restitución que a veces exige retirar todo lo que el arrendatario instaló. Por eso el acta de entrega comercial tiene tres bloques que en una vivienda casi no aparecen:

- **Estado de la obra gruesa y las instalaciones base** (lo que el arrendador entrega "en bruto").
- **Habilitaciones y mejoras** que el arrendatario hará y qué pasa con ellas al término.
- **Capacidades técnicas**: potencia eléctrica, medidores, ductos, extracción, agua, alcantarillado, accesos.

## Qué debe incluir el acta

1. **Identificación.** Dirección, número de local u oficina, superficie útil aproximada según contrato, bodegas y estacionamientos asignados.
2. **Partes y representación.** Razón social, RUT y representante legal de cada parte; el corredor si participa.
3. **Referencia al contrato.** Fecha, renta, garantía, plazo y la cláusula que regula obras, mejoras y restitución. Cita el número de la cláusula.
4. **Estado del inmueble, zona por zona.** Muros, cielos, pisos, vidrios y cortinas metálicas, puertas, baños, cocina o kitchenette, bodega. Anota qué está terminado y qué se entrega sin terminaciones.
5. **Instalaciones y capacidades.** Tablero eléctrico y potencia contratada, número y lectura de medidores de luz, agua y gas, estado de la red de alcantarillado y agua, aire acondicionado o extracción existentes, red de datos, sistema contra incendios si lo hay.
6. **Equipamiento incluido.** Todo lo que el arrendador deja: luminarias, aire, mobiliario, letreros, cámaras. Marca, modelo y estado.
7. **Llaves, controles y accesos.** Llaves de cortina, portón, bodega, tarjetas o claves de acceso al edificio.
8. **Permisos y antecedentes entregados.** Copia de recepción municipal, patente anterior si existe, planos, certificados de instalaciones. Que quede escrito qué documentos se entregan.
9. **Observaciones y daños preexistentes.** Con foto de cada uno.
10. **Declaración de conformidad y firmas** de los representantes, con fecha.

## Las fotos en un local: qué no puede faltar

- Cada muro completo y las esquinas, para dejar constancia de humedades y grietas.
- Piso completo y detalle de cualquier daño.
- Tablero eléctrico abierto, medidores con lectura legible.
- Baños con artefactos y griferías; bajo los lavamanos.
- Fachada, vidrios, cortina metálica y letrero.
- Cielo y ductos visibles.
- Todo el equipamiento incluido, encendido cuando se pueda.

En un local, el volumen de fotos es alto y el plazo del contrato es largo: guardarlas en un celular es perderlas. Con [CertiFoto](/) las fotos se ordenan por zona, cada una recibe huella SHA-256 y fecha verificable, la IA describe el estado y el PDF final queda verificable por cualquiera. Crear el acta es gratis y se paga solo al certificarla; para carteras de varios locales hay [packs de 10 y 50](/precios).

## Mejoras y restitución: lo que se decide en la entrega

El momento de discutir la restitución es la entrega, no el término. Tres cosas que conviene dejar escritas en el acta o en el contrato:

- **Qué mejoras quedan y cuáles se retiran.** Si el arrendatario instala un baño, una cocina o divisiones, ¿quedan para el arrendador o debe retirarlas y reponer el estado original?
- **Qué significa "estado original".** El acta con fotos es la definición práctica de ese estado.
- **Quién paga las reparaciones** por desgaste normal de un uso comercial (piso, pintura) y quién las de daños.

Para el momento de devolver el local, la comparación se hace contra esta acta. Tenemos una guía sobre [la diferencia entre acta de entrega y de devolución](/blog/diferencia-acta-entrega-devolucion) que aplica igual a locales.

## Preguntas frecuentes

### ¿Es obligatorio hacer acta de entrega en un arriendo comercial?

La ley no lo exige, pero casi todos los contratos comerciales la mencionan como anexo y la obligación de restituir "en el mismo estado" solo se puede aplicar si existe un registro del estado inicial. Sin acta, la garantía se discute a ciegas.

### ¿Quién hace el acta, el arrendador o el arrendatario?

La suele preparar el arrendador o su corredor, pero al arrendatario le conviene participar y agregar todo daño o carencia que encuentre, porque es su protección al momento de restituir. Lo ideal es un solo documento firmado por ambos, con las fotos referenciadas.

### ¿Qué pasa con las obras de habilitación que hace el arrendatario?

Depende del contrato. Si no dice nada, la regla general es que el arrendatario puede retirar las mejoras que instaló siempre que no dañe el inmueble, y el arrendador no está obligado a pagarlas. Por eso conviene pactarlo por escrito y dejar en el acta el estado previo a las obras.

### ¿Sirve la misma acta para una oficina en un edificio corporativo?

Sí, con dos agregados: el reglamento del edificio (horarios de carga, normas de fachada y letreros) y las instalaciones compartidas (aire central, red de datos, control de acceso). Deja constancia de qué se entrega funcionando y con qué credenciales.`,
  },
  {
    slug: "arriendo-amoblado-inventario-acta-entrega",
    title: "Arriendo amoblado: cómo hacer el inventario y el acta de entrega para no perder la garantía",
    excerpt:
      "Guía para arrendar o arrendar un departamento amoblado: cómo hacer el inventario (qué anotar de cada mueble y artefacto), qué es desgaste normal y qué es daño, cómo fotografiar para que valga, y qué dice la ley chilena sobre arriendos amoblados de temporada.",
    date: "2026-09-20",
    author: "Equipo CertiFoto",
    category: "Práctico",
    readMinutes: 8,
    content: `En un arriendo amoblado la garantía no cubre solo el departamento: cubre el sofá, el refrigerador, la loza y hasta las sábanas. Por eso la mayoría de las discusiones al final del contrato no son por muros ni pisos, sino por "el microondas que ya no funciona" o "faltan dos vasos". El inventario con fotos es lo único que ordena esa conversación. Esta guía explica cómo hacerlo bien, tanto si arriendas como si eres el arrendatario.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Qué dice la ley sobre los arriendos amoblados

La Ley 18.101 se aplica a los arriendos de viviendas urbanas, amobladas o no, con una excepción relevante: quedan fuera las viviendas amobladas que se arriendan **por temporadas no superiores a tres meses, para descanso o turismo**. Un arriendo amoblado de un año en Santiago se rige por la ley igual que uno sin muebles; un arriendo de verano en la playa por dos meses, no. En ambos casos, el contrato y el inventario firmado son lo que define qué se entregó y en qué estado.

## Inventario y acta: dos documentos que van juntos

El **acta de entrega** describe el estado del inmueble (muros, pisos, instalaciones, medidores, llaves). El **inventario** lista lo que hay dentro: muebles, electrodomésticos, menaje, ropa de cama, decoración. Se firman el mismo día y se referencian mutuamente. Puedes partir de nuestra [plantilla de acta en PDF](/plantilla), que incluye una sección de inventario, y ampliarla.

## Cómo hacer el inventario, pieza por pieza

Recorre cada ambiente y anota, por cada elemento:

- **Qué es y cuántos.** "6 sillas de comedor", "2 veladores", "12 platos bajos".
- **Marca y modelo** de electrodomésticos y artefactos: refrigerador, lavadora, microondas, hervidor, televisor, aire acondicionado. Foto de la etiqueta con número de serie cuando exista.
- **Estado**: Bueno / Regular / Malo, con detalle. "Sofá de 3 cuerpos, tapiz gris, mancha de 5 cm en el cojín derecho."
- **Funcionamiento**: pruébalo en el momento. Enciende el horno, corre un ciclo corto de la lavadora, prueba el control del televisor.
- **Foto de cada elemento** y una foto general del ambiente. Para el menaje, una foto del cajón o repisa abierta con todo a la vista vale más que contar de memoria.

Elementos que casi siempre se olvidan: cortinas y rieles, lámparas, extensiones y controles remotos, colchones (marca y estado), almohadas y frazadas, utensilios de cocina, ollas y sartenes (estado del teflón), tablas y cuchillos, basureros, tendedero, plancha, aspiradora.

## Desgaste normal o daño: la pregunta de la garantía

El Código Civil obliga al arrendatario a cuidar la cosa arrendada y a restituirla en el estado en que la recibió, salvo el deterioro por el **uso legítimo y el paso del tiempo**. En un amoblado, la línea entre ambos se discute mucho:

- **Desgaste normal:** el tapiz del sofá que pierde color, el colchón que se ablanda, el teflón que se gasta con años de uso, una taza que se rompe en un año de arriendo.
- **Daño:** una quemadura en la mesa, el vidrio del horno quebrado, la lavadora rota por sobrecarga, una mancha de vino en el colchón.

El inventario con fotos fechadas fija el punto de partida. Sin él, el arrendador no puede demostrar que el sofá no tenía la mancha, y el arrendatario no puede demostrar que el microondas ya fallaba.

## Fotos que sirven como prueba

Una foto suelta en el celular prueba poco: puede ser de cualquier fecha y cualquiera puede alegar que fue editada. Lo que le da peso es poder acreditar **cuándo se tomó** y **que no se alteró**. Con [CertiFoto](/) cada foto queda con huella SHA-256 y fecha verificable, la inteligencia artificial reconoce el ambiente y describe el estado (incluidas manchas y rayas), y el PDF final se puede verificar sin cuenta. Crear el acta con su inventario es gratis; se paga solo al certificar para descargarla y enviarla a la otra parte por correo.

Para la devolución, se hace un acta de devolución y se compara elemento por elemento contra este inventario; tenemos una guía sobre [cómo devolver el departamento sin perder la garantía](/blog/devolver-departamento-sin-perder-garantia).

## Checklist rápido para el día de la entrega

- Inventario completo, firmado por ambas partes, con fotos referenciadas.
- Acta de entrega con estado por ambiente, medidores y llaves.
- Artefactos probados y funcionando en presencia de ambos.
- Ropa de cama y menaje contados.
- Copia firmada para cada parte, enviada por correo el mismo día.

## Preguntas frecuentes

### ¿Cuánto es la garantía en un arriendo amoblado?

La ley no fija un monto; lo pacta el contrato. En amoblados es común pedir más de un mes de renta porque la garantía cubre también el mobiliario. Lo que sí conviene fijar es contra qué se descuenta: el inventario firmado con fotos.

### ¿Quién repone lo que se rompe por uso normal?

El desgaste por uso legítimo no se descuenta de la garantía; la reposición de lo que se agota o se gasta con el tiempo corresponde al arrendador, salvo que el contrato diga otra cosa. Los daños por mal uso o accidentes del arrendatario, sí se descuentan. Por eso el inventario debe describir el estado, no solo listar.

### ¿El inventario tiene que estar en el contrato?

Puede ir como anexo del contrato o como documento separado firmado el día de la entrega. Lo importante es que las dos partes lo firmen y que tenga fecha. Si se agrega después, deja constancia de la fecha en que se hizo.

### ¿Qué pasa con los arriendos de temporada por Airbnb o similares?

Los arriendos amoblados de temporada de hasta tres meses para descanso o turismo quedan fuera de la Ley 18.101, pero el inventario y las fotos con fecha siguen siendo la única forma de resolver un reclamo por daños, tanto con el huésped como con la plataforma.`,
  },
];
