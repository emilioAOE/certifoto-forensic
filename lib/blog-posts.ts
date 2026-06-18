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
  // ---- Artículos SEO de arriendo ----
  {
    slug: "contrato-arriendo-que-incluir-modelo",
    title: "Contrato de arriendo en Chile: qué debe incluir (con modelo 2026)",
    excerpt: "Todo lo que debe tener un contrato de arriendo en Chile: cláusulas esenciales, errores comunes y por qué necesitas un acta de entrega.",
    date: "2026-06-12",
    author: "Equipo CertiFoto",
    category: "Contratos",
    readMinutes: 9,
    content: `Un contrato de arriendo mal redactado puede costarte meses de conflicto, pérdida de la garantía o un juicio innecesario. En Chile, la Ley 18.101 establece el marco mínimo, pero muchas cosas que importan en la práctica —inventario de estado, reajustes, multas— quedan entregadas a lo que las partes pacten por escrito. Esta guía te explica qué cláusulas no pueden faltar, qué errores evitar y cómo un acta de entrega complementa y refuerza el contrato.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Individualización de las partes

El contrato debe identificar con precisión a arrendador y arrendatario: nombre completo, RUT, domicilio y estado civil (o razón social y representante legal si es una empresa). Omitir el RUT o indicarlo erróneo es un error frecuente que puede dificultar una demanda posterior.

Si hay codeudor solidario o aval, sus datos deben aparecer igualmente en el contrato y firmar el mismo documento.

## Individualización del inmueble

Describe el inmueble con dirección completa, número de departamento o casa, piso, comuna y ciudad. Si la propiedad tiene rol de avalúo SII, inclúyelo. Menciona también si se arrienda con estacionamiento, bodega u otros espacios.

Una descripción vaga ("departamento en Santiago") ha generado disputas sobre qué espacios estaban incluidos en la renta.

## Renta, forma y fecha de pago

Establece claramente:

- Monto mensual en pesos chilenos (o UF con conversión al día de pago).
- Medio de pago aceptado: transferencia a cuenta específica, depósito bancario, etc. Evitar efectivo sin recibo.
- Fecha límite de pago (ej.: "los primeros cinco días hábiles de cada mes").

Si se pacta en UF, usa el valor oficial publicado por el Banco Central para la conversión. Pactar en dólares u otra divisa extranjera para bienes inmuebles en Chile puede presentar complicaciones prácticas.

## Reajuste de la renta

El contrato debe indicar si la renta se reajusta, con qué índice (habitualmente IPC o UF) y con qué periodicidad. Sin cláusula de reajuste, el monto queda fijo nominalmente durante toda la vigencia. Puedes profundizar este punto en el artículo sobre [reajuste de arriendo e IPC](/blog/reajuste-arriendo-ipc-como-se-calcula).

## Garantía

Indica el monto entregado en garantía (usualmente uno o dos meses de renta), la fecha de entrega y el banco o cuenta donde se depositó. Deja claro en qué condiciones se devuelve y en qué plazo. La Ley 18.101 no fija un monto máximo de garantía, pero sí establece que debe restituirse al término si no hay deudas ni daños.

## Plazo y tipo de contrato

Especifica si el contrato es a plazo fijo (con fecha de inicio y término) o indefinido. Cada modalidad tiene consecuencias distintas respecto al desahucio y la renovación —te lo explicamos en detalle en [contrato de arriendo a plazo fijo vs indefinido](/blog/contrato-arriendo-plazo-fijo-vs-indefinido).

Incluye también la fecha de inicio de la vigencia y, si hay un período de gracia o de habilitación, que quede explícito.

## Destino del inmueble

El contrato debe señalar que el inmueble se destina exclusivamente a uso habitacional (o el uso que corresponda). Esto es relevante porque el SII, las ordenanzas municipales y la misma Ley 18.101 distinguen entre inmuebles habitacionales y comerciales, con reglas distintas para cada uno.

## Prohibiciones y restricciones

### Subarriendo

Sin autorización expresa del arrendador, el arrendatario no puede subarrendar ni ceder el contrato. Inclúyelo explícitamente.

### Mascotas

La ley no prohíbe las mascotas por defecto, pero el contrato puede establecer restricciones razonables. Si el arrendador las permite, conviene indicarlo junto con las condiciones (raza, tamaño, número de animales).

### Modificaciones al inmueble

Prohibir obras, instalaciones o cambios estructurales sin autorización escrita previa.

## Gastos comunes y servicios básicos

Indica quién paga qué: gastos comunes, electricidad, agua, gas, internet, televisión por cable. En muchos arriendos de departamento el arrendatario paga directamente los suministros y el arrendador paga el fondo común; pero esto debe quedar escrito. Un error común es no mencionar gastos comunes extraordinarios o cuotas de fondo de reserva.

## Multas por mora

Puedes pactar un interés o multa por atraso en el pago de la renta, siempre que sea razonable y no implique renuncia a derechos del arrendatario. Indica el porcentaje o monto de la multa y desde cuándo aplica. Una cláusula desproporcionada puede ser cuestionada como abusiva —revisa [cláusulas abusivas en contratos de arriendo](/blog/clausulas-abusivas-contrato-arriendo) para orientarte.

## Restitución y estado de entrega

Esta es una de las cláusulas más importantes y, paradójicamente, una de las más olvidadas. El contrato debe señalar:

- La condición en que se entrega el inmueble.
- El plazo para restituirlo al término.
- Cómo se determina si hay daños imputables al arrendatario.

Sin un respaldo documental del estado inicial, cualquier discusión sobre daños al término es tu palabra contra la del otro. Por eso, adjuntar un **acta de entrega con respaldo fotográfico** al contrato es la práctica más efectiva.

## Por qué el acta de entrega es parte del contrato, no un extra

El acta de entrega documenta el estado real del inmueble al inicio del arriendo: muros, pisos, ventanas, artefactos, llaves, medidores. Con fotos con sello de fecha y hash SHA-256, el acta tiene peso probatorio en caso de conflicto.

Si al término del contrato el arrendatario niega haber recibido el inmueble en cierto estado, el acta es tu principal evidencia. Puedes crear tu acta de entrega gratis en [CertiFoto](/dashboard) y adjuntarla como anexo firmado al contrato. Más detalles en [qué incluir en un acta de entrega de arriendo](/blog/acta-entrega-propiedad-arriendo-que-incluir).

## Firma y registro del contrato

El contrato de arriendo no requiere escritura pública para ser válido, pero sí debe estar firmado por ambas partes. Es recomendable:

1. Firma ante notario: da fecha cierta y facilita la prueba ante tribunales.
2. Dos copias firmadas: una para cada parte.
3. Si hay aval o codeudor solidario, debe firmar también.

Desde la Ley 21.461 ("Devuélveme mi Casa"), el incumplimiento del arrendatario puede dar lugar a procedimientos más expeditos. Tener el contrato firmado notarialmente facilita acreditar la existencia del vínculo contractual.

## Errores comunes que debilitan el contrato

- No incluir el RUT de las partes.
- No detallar qué se entrega (estacionamiento, bodega, electrodomésticos).
- Omitir la cláusula de reajuste.
- No especificar el medio de pago ni la cuenta de destino.
- Firmar sin acta de entrega: sin ella, cualquier daño es difícil de probar.
- Incluir cláusulas nulas como "el arrendatario renuncia a todos sus derechos legales" o "el arrendador puede cortar servicios en caso de mora".
- No firmar ante notario: no invalida el contrato, pero complica la prueba.

## En resumen

Un buen contrato de arriendo en Chile debe individualizar a las partes con RUT, describir el inmueble con precisión, fijar renta, reajuste, garantía, plazo, destino y restricciones, y regular claramente los gastos, las multas y la restitución. Complementa siempre el contrato con un acta de entrega fotográfica: es el respaldo que hace la diferencia cuando hay discrepancias al término. [Crea tu acta gratis en CertiFoto](/dashboard) y tenla lista para el día de entrega de llaves.

## Preguntas frecuentes

### ¿Es obligatorio firmar el contrato de arriendo ante notario?

No. El contrato de arriendo es válido entre las partes aunque sea un documento privado, porque la Ley 18.101 no exige escritura pública. Firmar ante notario (o con firma electrónica avanzada bajo la Ley 19.799) no cambia las obligaciones, pero facilita la prueba de la fecha y de la identidad de quienes firmaron si después hay un juicio.

### ¿Qué cláusulas son nulas aunque estén escritas en el contrato?

Son nulas las cláusulas que renuncian a derechos que la ley reconoce al arrendatario, como una supuesta renuncia general "a todos sus derechos legales" o autorizaciones para que el arrendador corte servicios básicos o ingrese al inmueble sin aviso. Aunque aparezcan firmadas, un Juzgado de Policía Local no las hará valer.

### ¿Sirve de algo el contrato si no hice un acta de entrega?

Sirve para acreditar la relación de arriendo, la renta y el plazo, pero no para acreditar el estado del inmueble. Sin acta de entrega con fotos, al término del contrato es muy difícil probar qué daños existían al inicio, y la discusión sobre la garantía suele resolverse caso a caso según la sana crítica del tribunal.

### ¿Puedo modificar el contrato después de firmado?

Sí, siempre que arrendador y arrendatario estén de acuerdo. Las modificaciones conviene hacerlas por escrito mediante un anexo firmado por ambas partes, indicando qué cláusula se cambia. Un cambio acordado solo de palabra es difícil de probar si después surge un desacuerdo.`,
  },
  {
    slug: "terminar-contrato-arriendo-antes-de-tiempo",
    title: "Cómo terminar un contrato de arriendo antes de tiempo",
    excerpt: "Guía práctica para terminar el contrato de arriendo antes del plazo: aviso previo, cláusula de salida, multas, mutuo acuerdo y entrega con acta de devolución.",
    date: "2026-06-11",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 8,
    content: `Terminar un contrato de arriendo antes del plazo acordado es más común de lo que parece: un traslado laboral, un cambio de situación económica o un conflicto con el arrendatario pueden obligar a ambas partes a cerrar el vínculo antes de lo planeado. La buena noticia es que la ley chilena contempla mecanismos para hacerlo de forma ordenada y sin quedar expuesto a demandas posteriores.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Lo que dice la ley sobre el término anticipado

El arrendamiento en Chile se rige por el Código Civil y, para predios urbanos, por la Ley 18.101. Ambas normas distinguen entre contratos a plazo fijo y contratos indefinidos, y el procedimiento de término varía según cada caso.

En términos generales, la ley protege a ambas partes: el arrendatario tiene derecho a permanecer en el inmueble durante el plazo pactado, y el arrendador tiene derecho a recuperar su propiedad al vencimiento o cuando exista una causal legítima. Terminar anticipadamente sin respetar los plazos y formas puede generar obligaciones de indemnización.

## Desde el lado del arrendatario: cómo salir antes de tiempo

### Revisa el contrato primero

Antes de cualquier paso, lee el contrato. Muchos contratos incluyen una **cláusula de salida anticipada** que establece una multa —generalmente equivalente a uno o dos meses de arriendo— si el arrendatario decide irse antes del plazo pactado. Esa cláusula es válida y exigible siempre que no sea desproporcionada ni abusiva.

Si el contrato no contempla cláusula de salida, el arrendatario igualmente puede comunicar su intención de término, pero queda expuesto a que el arrendador exija indemnización por los meses que restan del contrato.

### El aviso previo

Para contratos indefinidos, la Ley 18.101 exige que el arrendatario avise con al menos **dos meses de anticipación**. Ese plazo corre desde que el arrendador recibe la notificación. En contratos a plazo fijo, el plazo de aviso suele estar indicado en el mismo contrato; si no lo está, aplican las reglas generales.

Para hacerlo bien y dejar registro, lo más recomendable es enviar una **carta certificada** o notificar ante notario. Más detalles sobre cómo redactar ese documento en [aviso de término de contrato de arriendo: plazos y carta modelo](/blog/aviso-termino-contrato-arriendo-carta-modelo).

### Mutuo acuerdo: la salida más limpia

Si arrendador y arrendatario están de acuerdo en terminar antes, lo mejor es firmar un **finiquito de arriendo** o un acuerdo de término anticipado por mutuo acuerdo. Este documento debe quedar por escrito, idealmente ante notario, y debe señalar:

- La fecha de término pactada.
- El estado de la garantía (devolución total, parcial o retención).
- La condición acordada del inmueble.
- La renuncia de ambas partes a acciones futuras relacionadas con el contrato.

Este acuerdo protege a ambas partes y evita litigios posteriores.

## Desde el lado del arrendador: cómo recuperar la propiedad antes del vencimiento

El arrendador tiene menos margen para terminar anticipadamente un contrato a plazo fijo. La regla general es que debe respetar el plazo acordado, salvo que exista una **causal legal**.

### Causales legítimas de término anticipado para el arrendador

- **Incumplimiento grave del arrendatario:** no pago del arriendo, subarriendo no autorizado, deterioro grave del inmueble o uso contrario al pactado en el contrato.
- **Necesidad del inmueble:** en algunos casos, la ley permite al arrendador invocar necesidad propia o de familiares directos, aunque el procedimiento y plazos son específicos.
- **Destrucción o inhabitabilidad:** si el inmueble queda inhabitable por causas no imputables a ninguna de las partes.

Si existe incumplimiento del arrendatario, el arrendador debe iniciar el procedimiento judicial correspondiente ante el **Juzgado de Letras** competente. No es válido —ni legal— cortar servicios, cambiar la cerradura ni retirar pertenencias del arrendatario. Esas acciones constituyen autotutela y pueden derivar en responsabilidad civil e incluso penal para el arrendador.

### Aviso de no renovación en contratos a plazo fijo

Si el contrato está próximo a vencer y el arrendador no quiere renovar, debe notificarlo con la anticipación indicada en el contrato o, en ausencia de pacto, con al menos **dos meses de antelación**. Si no lo hace a tiempo, el contrato puede renovarse automáticamente según sus términos o convertirse en uno indefinido.

## Pasos prácticos para un término ordenado

Independientemente de quién inicia el término, estos pasos ayudan a cerrar el contrato sin problemas:

1. **Comunica la decisión por escrito** y guarda copia con fecha.
2. **Verifica el estado del inmueble** antes de la entrega: lista los arreglos pendientes y acuerda quién los realizará.
3. **Realiza el acta de devolución** el día de la entrega, con fotos y descripción del estado de cada espacio.
4. **Liquida la garantía** según el estado del inmueble y lo pactado en el contrato.
5. **Firma el finiquito** o acuerdo de término para cerrar definitivamente la relación contractual.

## La entrega final: el paso que define si recuperas la garantía

El acta de devolución es tan importante como el contrato mismo. Muchos conflictos post-arriendo nacen de no tener registro del estado del inmueble al momento de la entrega. Un acta con fotos con marca de tiempo y hash criptográfico elimina ambigüedades: si la pared estaba rayada antes de que el arrendatario se fuera, o si ese daño ocurrió durante la ocupación, queda evidenciado.

Puedes revisar los detalles en [cómo devolver el departamento sin perder la garantía](/blog/devolver-departamento-sin-perder-garantia). Y si ya entregaste pero el arrendador no te devuelve el dinero, revisa [cómo recuperar la garantía del arriendo en Chile](/blog/como-recuperar-garantia-arriendo-chile).

CertiFoto te permite crear el acta de devolución gratis: subes las fotos, la IA las describe, y al momento de certificar obtienes un PDF con hash SHA-256 que sirve como evidencia ante cualquier disputa. [Crea tu acta en el dashboard](/dashboard).

## Multas y compensaciones: cuándo se aplican

Las multas por término anticipado solo son exigibles si están **expresamente pactadas en el contrato**. No existen multas legales automáticas por terminar antes de tiempo —la ley lo que permite es reclamar los perjuicios efectivos causados por el incumplimiento del plazo.

Algunos puntos a tener en cuenta:

- Si el arrendatario paga la multa estipulada y entrega el inmueble en buen estado, el arrendador generalmente no puede exigir nada más.
- Si no hay cláusula de multa, el arrendador puede demandar indemnización, pero debe probar el perjuicio efectivo (por ejemplo, meses de arriendo perdidos mientras buscaba nuevo arrendatario).
- El arrendatario nunca pierde automáticamente la garantía por término anticipado, salvo que el contrato lo establezca expresamente y esa cláusula sea considerada válida.

## En resumen

Terminar un contrato de arriendo antes de tiempo es posible para ambas partes, pero exige respetar los procedimientos: avisos oportunos, acuerdos por escrito y, sobre todo, una entrega documentada del inmueble. Las salidas anticipadas que se manejan bien —con comunicación clara y registro formal— rara vez terminan en conflicto. Las que se hacen de forma abrupta o sin documentación son las que generan disputas que pueden durar meses. Si tienes dudas sobre tu situación específica, consulta a un abogado antes de dar el primer paso.

## Preguntas frecuentes

### ¿Puedo terminar el contrato antes del plazo sin pagar multa?

Depende de lo pactado. Si el contrato tiene una cláusula de salida anticipada con aviso previo, basta cumplir ese aviso. Si no la tiene y es a plazo fijo, terminar antes puede generar la obligación de indemnizar al arrendador por las rentas que faltan, salvo que lleguen a un mutuo acuerdo para poner término.

### ¿Cómo formalizo el término por mutuo acuerdo?

Lo ideal es firmar un documento de término de común acuerdo donde ambas partes declaren la fecha de restitución, el estado en que se devuelve el inmueble y la situación de la garantía. Acompañarlo de un acta de devolución con fotos evita reclamos posteriores por daños o por rentas supuestamente impagas.

### ¿Qué pasa con la garantía si me voy antes de tiempo?

La garantía sigue las mismas reglas: cubre rentas impagas, cuentas pendientes y daños que excedan el desgaste normal. Si te vas anticipadamente cumpliendo el aviso o el mutuo acuerdo y entregas el inmueble en buen estado, el arrendador debe devolverla; las retenciones solo proceden por conceptos reales y demostrables.

### ¿Tengo que dar aviso aunque el contrato ya esté por vencer?

Sí, conviene dar siempre el aviso de no renovación con la anticipación pactada o la que indique la ley, porque de lo contrario el contrato puede prorrogarse por tácita reconducción. El aviso por escrito, con constancia de envío, evita discusiones sobre si se notificó a tiempo.`,
  },
  {
    slug: "arrendatario-no-paga-que-hacer",
    title: "Qué hacer si el arrendatario no paga el arriendo",
    excerpt: "Si el arrendatario no paga el arriendo, estos son los pasos correctos: requerimiento escrito, garantía, codeudor, vía judicial y advertencia contra la autotutela.",
    date: "2026-06-10",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 9,
    content: `Descubrir que el arrendatario no paga el arriendo es uno de los escenarios más estresantes para cualquier propietario. La incertidumbre sobre qué hacer, el riesgo de actuar mal y la presión económica se combinan de una forma que lleva a muchos arrendadores a tomar decisiones apresuradas que terminan complicando su situación legal. Esta guía explica los pasos correctos: desde el primer mes de mora hasta la vía judicial.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado. En el contexto de deudas de arriendo y restitución de inmuebles, la asesoría de un profesional puede marcar una diferencia significativa en los tiempos y resultados del proceso.

## Paso 1: comunicación escrita desde el primer mes

Antes de cualquier acción legal, intenta resolver el problema de forma directa. Cuando el arriendo no llega en la fecha pactada, la primera acción debe ser **contactar al arrendatario por escrito** —correo electrónico, WhatsApp o carta— recordándole la deuda y solicitando el pago.

Este paso no es solo cortesía: es estratégico. Si el caso llega a juicio, tener un registro de las comunicaciones previas demuestra que el arrendador actuó de buena fe y agotó las vías amigables. Guarda capturas de pantalla, correos y cualquier respuesta del arrendatario.

Si el arrendatario no responde o no paga en los días siguientes, el siguiente paso es enviar un **requerimiento de pago formal**: carta certificada o notificación ante notario, indicando el monto adeudado, el período de mora y un plazo razonable para regularizar. Este documento tiene relevancia como prueba en un eventual proceso judicial.

## Paso 2: revisar el contrato y reunir la evidencia

Antes de avanzar, organiza tu documentación:

- Contrato de arriendo firmado (original o copia notarial).
- Comprobantes de pago de los períodos anteriores (para demostrar el patrón de pago y luego su interrupción).
- Comprobantes de la deuda actual (ausencia de depósitos, capturas del banco).
- Registro de comunicaciones con el arrendatario.
- Acta de entrega del inmueble, si se levantó al inicio del arriendo.

Esta documentación es la base de cualquier acción legal posterior. Sin el contrato y los comprobantes, el proceso judicial se complica considerablemente.

## Paso 3: ¿usar la garantía o recurrir al codeudor?

### La garantía

La garantía (generalmente uno o dos meses de arriendo) está destinada a cubrir daños en el inmueble o deudas impagas al término del contrato. En Chile, **no existe una norma que impida usarla para cubrir arriendos impagos durante la vigencia del contrato**, pero hacerlo tiene consecuencias prácticas: el arrendatario queda sin garantía, y si sigue incumpliendo, el propietario queda desprotegido ante posibles daños al momento de la restitución.

Antes de imputar la garantía a arriendos impagos, evalúa el contexto: si ya decidiste terminar el contrato y el arrendatario está próximo a irse, puede tener sentido. Si el arriendo continúa, puede ser mejor preservarla y activar otras vías.

### El codeudor solidario o aval

Si el contrato incluye un codeudor solidario, puedes requerirle el pago directamente, de la misma forma que al arrendatario principal. El codeudor responde por la deuda en las mismas condiciones que el deudor principal, lo que lo convierte en una alternativa real de cobro. Más detalle sobre este mecanismo en [aval y codeudor solidario en el arriendo](/blog/aval-codeudor-solidario-arriendo).

## Paso 4: la vía judicial

Si las gestiones amigables no prosperan, el camino es judicial. En Chile, los conflictos de arriendo se ventilan ante el **Juzgado de Letras** en lo Civil competente según la ubicación del inmueble —no ante el Juzgado de Policía Local, que no tiene competencia en estas materias.

### El procedimiento especial de arrendamiento (Ley 18.101)

La Ley 18.101 establece un procedimiento especial para las causas de arriendo, más ágil que el procedimiento ordinario. El arrendador puede demandar el cobro de rentas impagas, la restitución del inmueble o ambas cosas a la vez.

### El procedimiento monitorio (Ley 21.461, "Devuélveme mi Casa")

La Ley 21.461, vigente desde 2022, introdujo un **procedimiento monitorio** que agiliza especialmente la restitución del inmueble cuando el arrendatario no paga. Si se cumplen los requisitos (contrato por escrito, mora acreditada, entre otros), el tribunal puede dictar una orden de restitución de forma más expedita que en el proceso ordinario.

Este procedimiento se explica en detalle en [Ley 21.461 "Devuélveme mi Casa": cómo funciona el desalojo](/blog/ley-devuelveme-mi-casa-21461-desalojo).

### Tiempos realistas

Aunque la Ley 21.461 agilizó los plazos, ningún proceso judicial en Chile es inmediato. Los plazos dependen de la carga del tribunal, si el arrendatario se opone, si hay incidentes y otros factores. En el mejor escenario —sin oposición y con toda la documentación en orden— el proceso puede resolverse en algunos meses. En escenarios con más complejidad, puede extenderse. Consulta con un abogado para tener una estimación realista según tu caso.

## Lo que nunca debes hacer: la advertencia sobre la autotutela

Cuando el arrendatario no paga y no se va, la desesperación puede llevar a pensar en soluciones directas: cambiar la cerradura mientras el arrendatario está fuera, cortar el agua o la luz, retirar sus pertenencias o impedir su acceso al inmueble.

**Todas esas acciones son ilegales.** En Chile, la autotutela en materia de arriendo está prohibida. Cambiar la cerradura sin orden judicial, cortar servicios básicos o retirar pertenencias del arrendatario puede configurar delitos y genera responsabilidad civil para el arrendador, incluso cuando el arrendatario es el que está incumpliendo. El arrendatario podría, además, obtener una medida cautelar que lo reintegre al inmueble mientras el juicio sigue.

La única vía legítima para recuperar el inmueble es la judicial. Es más lenta, pero es la que protege al arrendador de consecuencias adicionales.

## La evidencia que protege al arrendador en el juicio

En un proceso judicial de cobro o restitución, la documentación importa mucho. Además del contrato y los comprobantes de deuda, el acta de entrega inicial del inmueble tiene un valor especial: si al momento de recuperar la propiedad hay daños, el acta levantada al inicio del arriendo —con fotos registradas y descripción del estado— permite demostrar qué fue obra del arrendatario y qué ya existía antes.

CertiFoto permite crear esa acta con fotos certificadas con hash SHA-256, lo que le da validez probatoria ante terceros y en juicio. [Comienza a documentar en el dashboard](/dashboard).

## En resumen

Si el arrendatario no paga, el protocolo correcto es: comunicación escrita, requerimiento formal, revisión de garantía y codeudor, y si nada funciona, vía judicial ante el Juzgado de Letras. La Ley 21.461 mejoró los plazos para la restitución, pero no elimina la necesidad de documentación sólida ni reemplaza la asesoría de un abogado. Y nunca, bajo ninguna circunstancia, recurras a la autotutela: las consecuencias legales para el arrendador pueden ser peores que la deuda misma.

## Preguntas frecuentes

### ¿Puedo cambiar la chapa o cortar los servicios si el arrendatario no paga?

No. La autotutela está prohibida: cambiar la cerradura, sacar las cosas del arrendatario o cortar luz y agua puede exponerte a acciones legales en tu contra. El camino correcto es el requerimiento de pago y, si persiste la mora, la demanda de término de contrato por no pago ante el Juzgado de Policía Local o tribunal competente.

### ¿Cuándo puedo iniciar la demanda por no pago?

El no pago de la renta es causal de término del arriendo. Conviene primero un requerimiento escrito de pago dejando constancia, y si el arrendatario no regulariza, presentar la demanda. La Ley 18.101 contempla el reconvenirle el pago en el juicio, y la Ley 21.461 agrega un procedimiento monitorio más expedito para estos casos.

### ¿De qué sirve el codeudor solidario en este escenario?

El codeudor solidario responde por las mismas obligaciones que el arrendatario y sin beneficio de excusión, por lo que puedes dirigir el cobro de las rentas impagas directamente contra él. Por eso conviene que sus datos estén bien individualizados en el contrato y que haya firmado el mismo documento.

### ¿La garantía cubre los meses que no pagó?

La garantía puede imputarse a rentas impagas, cuentas pendientes y daños, pero suele equivaler a uno o dos meses y rara vez cubre una mora prolongada. No reemplaza la acción de cobro: aunque la apliques, puedes demandar la diferencia adeudada y el término del contrato.`,
  },
  {
    slug: "reajuste-arriendo-ipc-como-se-calcula",
    title: "Reajuste del arriendo con IPC: cómo se calcula y cada cuánto",
    excerpt: "Aprende cómo funciona el reajuste arriendo IPC en Chile: fórmula, periodicidades habituales, ejemplo numérico paso a paso y la alternativa en UF.",
    date: "2026-06-09",
    author: "Equipo CertiFoto",
    category: "Dinero",
    readMinutes: 7,
    content: `## ¿Qué es el reajuste del arriendo con IPC?

El **reajuste del arriendo con IPC** es un mecanismo pactado en el contrato que permite actualizar el valor de la renta según la variación del Índice de Precios al Consumidor (IPC), que mide la inflación oficial en Chile y publica el Instituto Nacional de Estadísticas (INE) cada mes.

La idea es simple: si los precios en la economía suben, el valor del arriendo se actualiza proporcionalmente para mantener el poder adquisitivo del arrendador. Es un mecanismo ampliamente usado en contratos residenciales porque entrega certeza a ambas partes: el arrendatario sabe exactamente cuándo y cuánto subirá la renta, y el arrendador no necesita negociar ajuste por ajuste.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## ¿Qué dice la ley y qué dice el contrato?

La Ley 18.101, que regula los arrendamientos de predios urbanos en Chile, **no fija ni prohíbe ningún mecanismo de reajuste** para contratos residenciales vigentes. Lo que rige es exclusivamente lo que las partes pactaron. Si el contrato dice "la renta se reajustará cada 12 meses según la variación acumulada del IPC", ese es el único reajuste válido durante la vigencia del contrato.

Esto significa que el arrendador **no puede aplicar un reajuste mayor ni más frecuente que el acordado**, aunque la inflación haya sido alta. Cualquier modificación al monto de la renta durante el contrato vigente requiere el acuerdo de ambas partes.

Para entender bien cuándo y cómo puedes subir el arriendo más allá del reajuste pactado, lee [¿Cuánto puedo subir el arriendo legalmente en Chile?](/blog/cuanto-puedo-subir-el-arriendo).

## ¿Cada cuánto se aplica el reajuste?

La periodicidad depende de lo que diga el contrato. Las más comunes en el mercado residencial chileno son:

- **Anual:** la más habitual. La renta se ajusta una vez al año según el IPC acumulado de los últimos 12 meses.
- **Semestral:** se aplica cada seis meses usando el IPC del semestre correspondiente.
- **Trimestral:** menos frecuente, suele aparecer en arriendos de mayor valor o en contextos de inflación alta.
- **Mensual:** muy poco común en residencial; más habitual en locales comerciales.

Si el contrato no especifica la periodicidad, existe ambigüedad y puede generar conflicto. Por eso es fundamental que el contrato lo señale con precisión. Puedes revisar qué debe incluir un buen contrato en [Contrato de arriendo: qué incluir y modelo básico](/blog/contrato-arriendo-que-incluir-modelo).

## Cómo se calcula el reajuste: ejemplo paso a paso

Supongamos que tienes un contrato firmado en junio de 2025, con una renta mensual de **$500.000 CLP**, y una cláusula que dice:

> "La renta se reajustará cada 12 meses calendario, en la misma proporción en que haya variado el IPC en el período."

### Paso 1: Identificar el período de referencia

El contrato venció en junio de 2026. La variación del IPC que aplica es la acumulada entre junio de 2025 y mayo de 2026 (o el período exacto que indique el contrato; siempre verificar).

### Paso 2: Obtener el dato del IPC

Visita el sitio del INE (www.ine.gob.cl) o el Banco Central y busca la **variación acumulada del IPC en 12 meses**. Para este ejemplo, supongamos que la variación acumulada fue de **4,8%** (dato referencial; siempre consulta el valor oficial vigente).

### Paso 3: Calcular el nuevo valor

La fórmula es:

\`\`\`
Renta nueva = Renta actual × (1 + variación IPC / 100)
\`\`\`

Aplicando los números:

\`\`\`
Renta nueva = $500.000 × (1 + 4,8 / 100)
Renta nueva = $500.000 × 1,048
Renta nueva = $524.000 CLP
\`\`\`

El aumento es de **$24.000 mensuales**. Este ajuste se aplica desde el mes siguiente al que correspondía el reajuste, según lo que indique el contrato.

### Paso 4: Redondear (si el contrato lo permite)

Algunos contratos incluyen una cláusula de redondeo al múltiplo de $1.000 más cercano. Si es tu caso, el valor quedaría en **$524.000** (ya es múltiplo). Si la renta hubiera dado $523.750, se redondearía a $524.000 o $523.000 según la regla pactada.

### Paso 5: Notificar al arrendatario

Aunque la ley no exige notificación escrita para el reajuste pactado, es buena práctica enviar un mensaje o correo al arrendatario antes de aplicarlo, indicando el porcentaje y el nuevo valor. Esto evita malentendidos y refuerza la transparencia de la relación.

## La alternativa: arriendo en UF

Muchos contratos de arriendo, especialmente en viviendas de mayor valor o en zonas de alta demanda, se pactan directamente **en Unidades de Fomento (UF)**. En este caso, el mecanismo es diferente:

- El valor de la renta queda fijo en UF (por ejemplo, 15 UF mensuales).
- Cada mes, el arrendatario paga el equivalente en pesos al valor que tenga la UF ese día, publicado diariamente por el Banco Central.
- La UF se reajusta de forma diaria en función de la inflación pasada, lo que significa que el arriendo en UF **se ajusta automáticamente mes a mes**, sin necesidad de una cláusula específica de reajuste anual.

### ¿Qué conviene más?

| Modalidad | Ajuste | Estabilidad para arrendatario | Previsibilidad para arrendador |
|-----------|--------|-------------------------------|-------------------------------|

En términos prácticos (sin tabla formal):

- **Arriendo en pesos con reajuste IPC anual:** el arrendatario sabe que el valor no cambiará por 12 meses. El arrendador asume el riesgo de que la inflación sea mayor al período acordado.
- **Arriendo en UF:** el arrendatario ve variaciones mensuales en el monto en pesos, lo que puede resultar incómodo para planificar gastos. El arrendador mantiene el poder adquisitivo de forma continua.

Ambas modalidades son completamente válidas y de uso corriente en Chile. La elección depende del acuerdo entre las partes y del perfil de la propiedad.

## ¿Qué debe decir el contrato sobre el reajuste?

Para evitar conflictos, el contrato debe especificar al menos los siguientes puntos:

### En contratos en pesos con IPC
- El índice de referencia (IPC general del INE, o algún otro indicador acordado).
- La periodicidad del reajuste (mensual, trimestral, semestral, anual).
- El período de medición exacto del IPC que se usará (por ejemplo: "variación acumulada del IPC publicado por el INE entre el mes anterior al inicio del contrato y el mes anterior al aniversario").
- Si se aplica redondeo y cómo.
- La fecha desde la cual rige el nuevo valor.

### En contratos en UF
- El valor en UF de la renta mensual.
- La fecha de pago y qué valor de UF se usa (del día de pago, del primer día del mes, etc.).
- Cómo se manejan los meses en que la UF cae (¿el arrendatario paga menos? sí, pero también paga más cuando sube).

Si tu contrato actual no tiene estas cláusulas o las tiene de forma ambigua, puedes negociar una adenda con el arrendatario o arrendador para dejarlo claro antes del próximo vencimiento.

## ¿Qué pasa si no hay cláusula de reajuste?

Si el contrato no incluye ninguna cláusula de reajuste, la renta se mantiene fija en el valor pactado durante toda la vigencia del contrato. El arrendador **no puede aplicar ningún reajuste unilateral** sin el acuerdo del arrendatario.

Cuando el contrato se renueva o se firma uno nuevo, ahí sí hay libertad para acordar un nuevo valor. Para entender mejor ese proceso, revisa [¿Cuánto puedo subir el arriendo legalmente en Chile?](/blog/cuanto-puedo-subir-el-arriendo).

## El acta de entrega y la documentación del contrato

Aunque el reajuste es un tema económico, la documentación del estado de la propiedad al inicio y al término del arriendo también incide en las finanzas: si hay daños no documentados, el arrendador podría enfrentar disputas que consumen tiempo y dinero. Un **acta de entrega con respaldo fotográfico** permite dejar constancia del estado de la propiedad desde el primer día.

En CertiFoto puedes crear tu acta de entrega gratis y, cuando necesites certificarla con valor forense (hash SHA-256 y certificado PDF verificable), hacerlo en pocos minutos. [Crea tu acta en el dashboard](/dashboard).

## En resumen

- El reajuste del arriendo con IPC opera según lo que diga el contrato; no existe un tope legal ni una periodicidad obligatoria establecida por ley para contratos residenciales vigentes.
- La fórmula es: renta nueva = renta actual × (1 + variación IPC/100). Con un IPC de 4,8% y una renta de $500.000, el nuevo valor sería $524.000.
- La periodicidad más común es anual, pero puede ser semestral, trimestral o mensual según lo pactado.
- La alternativa es fijar la renta en UF, que se reajusta automáticamente cada mes sin cláusula adicional.
- Si el contrato no tiene cláusula de reajuste, la renta queda fija hasta que se renueve o suscriba un nuevo contrato.
- Siempre consulta el valor oficial del IPC en el sitio del INE antes de aplicar el cálculo.

## Preguntas frecuentes

### ¿Puede el arrendador reajustar la renta si el contrato no dice nada?

No de forma unilateral. El reajuste tiene que estar pactado en el contrato (por ejemplo, "renta reajustable según IPC cada cierto periodo"). Si no hay cláusula de reajuste, la renta se mantiene durante la vigencia del contrato, y un alza solo podría acordarse de común acuerdo o al renovar.

### ¿Cada cuánto se puede aplicar el reajuste por IPC?

La periodicidad es la que las partes pacten: lo habitual es semestral o anual. El IPC lo publica el INE, y el reajuste se aplica acumulando la variación del periodo correspondiente. Lo importante es que la fórmula y la frecuencia queden claras en el contrato para evitar discusiones sobre el monto.

### ¿Qué conviene más, reajustar en UF o en IPC?

Pactar la renta en UF traslada el reajuste a un valor que ya sigue la inflación día a día, lo que da previsibilidad. Reajustar en pesos según IPC mantiene el monto fijo entre cada actualización. Ninguna es mejor en abstracto: depende de cuánta estabilidad mensual quieran las partes; lo esencial es que el mecanismo esté escrito.

### ¿El reajuste se aplica también a la garantía?

Solo si el contrato lo establece. En muchos contratos la garantía se fija en un monto equivalente a la renta inicial y no se reajusta automáticamente. Conviene revisar la cláusula respectiva, porque si la renta sube con el tiempo, la garantía puede quedar por debajo de un mes de arriendo.`,
  },
  {
    slug: "cuanto-puedo-subir-el-arriendo",
    title: "¿Cuánto puedo subir el arriendo legalmente en Chile?",
    excerpt: "Descubre cuánto puedes subir el arriendo según la ley chilena: qué aplica durante el contrato vigente y qué libertad tienes al renovar o firmar uno nuevo.",
    date: "2026-06-08",
    author: "Equipo CertiFoto",
    category: "Dinero",
    readMinutes: 7,
    content: `## La pregunta que todo arrendador se hace

Subir el arriendo es uno de los temas más sensibles en la relación entre arrendadores y arrendatarios. La respuesta corta es: depende de si el contrato está vigente o si se está negociando uno nuevo. Y la distinción importa mucho.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Durante el contrato vigente: solo aplica lo pactado

Mientras el contrato esté en vigencia, el arrendador **no puede subir el arriendo a voluntad**. El único ajuste permitido es el que el contrato expresamente autoriza, que en la mayoría de los casos corresponde al reajuste por IPC o por UF en la periodicidad acordada.

La Ley 18.101 no establece un tope porcentual al reajuste ni prohíbe reajustes altos, pero tampoco permite que el arrendador suba la renta fuera del mecanismo pactado. Si el contrato dice "reajuste anual según IPC", eso es lo que corresponde aplicar, sin importar si el mercado ha subido más.

Si quieres entender exactamente cómo funciona ese cálculo, revisa [Reajuste del arriendo con IPC: cómo se calcula y cada cuánto](/blog/reajuste-arriendo-ipc-como-se-calcula).

### ¿Qué pasa si el arrendador sube el arriendo sin respaldo contractual?

Si el arrendador intenta cobrar un monto mayor al pactado sin que exista una cláusula que lo respalde, el arrendatario tiene derecho a pagar solo el valor vigente conforme al contrato. El arrendatario debería documentar la situación y, si es necesario, buscar asesoría legal.

## Al renovar o firmar un nuevo contrato: libre acuerdo

Cuando el contrato llega a su término natural o cuando se va a suscribir un nuevo contrato, las partes tienen **libertad para acordar el valor que estimen conveniente**. No existe en Chile un control de rentas ni un límite porcentual al alza en el mercado residencial.

En ese momento, el arrendador puede proponer un nuevo valor basándose en:

- El valor de mercado actual en la zona (lo que arriendan propiedades similares).
- La variación acumulada de la inflación desde el último ajuste.
- Mejoras realizadas en la propiedad.
- Las condiciones del mercado local (oferta y demanda de viviendas similares).

Sin embargo, la libertad de fijar el precio convive con una realidad práctica: si el alza es excesiva, el arrendatario puede simplemente no renovar.

### ¿Cuánto aviso se debe dar?

Para los contratos de plazo indefinido, la Ley 18.101 exige que el arrendador dé aviso al arrendatario con a lo menos **dos meses de anticipación** si desea poner término al contrato o modificar sus condiciones al renovar. En la práctica, esto también aplica cuando se quiere cambiar el valor de la renta al renovar.

Para contratos de plazo fijo, el término opera a la llegada del plazo y la renegociación del valor ocurre en ese momento.

Si quieres profundizar en cómo operan las renovaciones, incluyendo las automáticas, revisa [Renovación automática del contrato de arriendo: qué dice la ley](/blog/renovacion-automatica-contrato-arriendo).

## ¿Cuánto sube el mercado en la práctica?

No existe un límite legal porcentual, pero el mercado tiene sus propias restricciones. A modo de referencia (datos referenciales de mercado, no cifras oficiales):

- En años con inflación en torno al 4-6% anual, los arrendadores suelen proponer alzas entre el 5% y el 10% al renovar, dependiendo de la zona y el tipo de propiedad.
- En zonas de alta demanda (como Santiago, Providencia, Las Condes, Ñuñoa), las alzas al renovar pueden ser más agresivas.
- En mercados con alta oferta, proponer alzas muy elevadas puede resultar en que el arrendatario se vaya y la propiedad quede vacía por semanas o meses, lo que en términos financieros suele ser peor que un ajuste moderado.

### Ejemplo de análisis financiero para el arrendador

Supongamos que tienes una propiedad arrendada en **$500.000 mensuales** y quieres subir a **$580.000** al renovar (un 16% de alza).

- Si el arrendatario acepta: ganas $80.000 adicionales al mes, es decir, $960.000 al año.
- Si el arrendatario se va y la propiedad queda vacía **dos meses**: pierdes $1.000.000 en renta (dos meses a $500.000), más los costos de búsqueda de nuevo arrendatario (publicidad, posibles comisiones, tiempo).
- Punto de equilibrio: si la propiedad queda vacía más de aproximadamente 1,2 meses al año, el alza agresiva no se justifica financieramente, a menos que el nuevo valor sea claramente más alto que el de mercado.

Este ejercicio simple muestra por qué muchos arrendadores prefieren alzas moderadas que permitan conservar a un buen arrendatario.

## Buenas prácticas para subir el arriendo sin perder al arrendatario

### 1. Avisa con anticipación y por escrito

Aunque la ley exige aviso de dos meses solo en contratos indefinidos, hacerlo siempre por escrito (correo electrónico, mensaje con acuse de recibo) genera transparencia y tiempo para que el arrendatario decida.

### 2. Justifica el alza con datos de mercado

Mostrar portales inmobiliarios con propiedades comparables en la misma zona es mucho más persuasivo que solo decir "subió el IPC". Si el alza propuesta está alineada con el mercado, el arrendatario lo puede verificar por su cuenta.

### 3. Propón un ajuste escalonado

En lugar de un alza grande de golpe, algunos arrendadores proponen subir un porcentaje menor cada seis meses durante el primer año del nuevo contrato. Esto es más fácil de aceptar y puede evitar la salida del arrendatario.

### 4. Considera el historial de pago

Un arrendatario que lleva años pagando puntualmente, cuidando la propiedad y sin conflictos vale mucho más que la diferencia de $30.000 o $50.000 mensuales. Ese "costo de oportunidad" rara vez se incluye en el análisis, pero debería.

### 5. Documenta el estado de la propiedad antes de renovar

Al momento de renovar el contrato, es buena práctica actualizar el acta de entrega para registrar el estado actual de la propiedad. Esto protege a ambas partes frente a disputas futuras sobre daños o desgaste.

## Situaciones especiales: ¿qué pasa con los contratos muy antiguos?

Hay propiedades con contratos que llevan muchos años sin actualizarse, con rentas muy por debajo del mercado. En estos casos, la ley no ofrece un mecanismo especial de "puesta al día" forzada. El arrendador deberá negociar con el arrendatario y, si no llega a acuerdo, esperar al vencimiento del contrato para proponer el nuevo valor.

En contratos indefinidos, la única vía es dar el aviso legal de dos meses para poner término, lo que libera al arrendador para buscar un nuevo arrendatario al valor de mercado o para renegociar desde cero.

## El rol del acta de entrega en las negociaciones

Cuando el arrendador quiere renovar con un alza significativa, tener documentado el estado de la propiedad con un acta de entrega fotográfica refuerza su posición: demuestra que la propiedad ha sido bien mantenida y justifica el valor propuesto. Si hay mejoras recientes, el acta las documenta visualmente.

En CertiFoto puedes crear o actualizar tu acta de entrega gratis. Si necesitas darle valor legal forense con hash SHA-256 y certificado PDF verificable, el proceso toma pocos minutos. [Accede al dashboard para comenzar](/dashboard).

## En resumen

- Durante el contrato vigente, el arrendador solo puede aplicar el reajuste que el contrato expresamente autoriza (típicamente IPC o UF). No puede subir el arriendo a voluntad.
- Al renovar o en un nuevo contrato, el monto es de libre acuerdo entre las partes. No existe un tope legal porcentual en Chile.
- Para contratos indefinidos, se requiere aviso de al menos dos meses para terminar o modificar condiciones.
- El mercado limita las alzas en la práctica: una propiedad vacía dos meses puede costar más que mantener un alza moderada.
- La transparencia, el aviso anticipado y los datos de mercado son las mejores herramientas para negociar un alza sin conflictos.

## Preguntas frecuentes

### ¿Hay un tope legal para subir el arriendo en Chile?

Durante la vigencia del contrato, la renta solo puede variar según el reajuste pactado (por ejemplo, IPC o UF); no puedes subirla por sobre eso de forma unilateral. Al renovar o firmar un contrato nuevo existe libertad para acordar el monto, ya que la ley chilena no fija un tope general de precios para el arriendo.

### ¿Puedo subir la renta a mitad del contrato porque subió la plusvalía?

No, salvo que ambas partes lo acuerden por escrito. Mientras el contrato esté vigente rige lo pactado, y la plusvalía o el valor de mercado no habilitan un alza unilateral. El momento para ajustar el precio a mercado es al término del plazo, al ofrecer la renovación o un nuevo contrato.

### ¿Qué aviso debo dar si quiero subir el arriendo al renovar?

Conviene avisar con la anticipación pactada en el contrato o la que indique la ley para la no renovación, comunicando por escrito la nueva renta propuesta. Así el arrendatario decide si acepta o se va, y se evita que el contrato se prorrogue automáticamente en las condiciones antiguas por tácita reconducción.

### ¿El reajuste por IPC cuenta como "subir" el arriendo?

No en sentido estricto. El reajuste por IPC solo mantiene el poder adquisitivo de la renta frente a la inflación; no es un aumento real del precio. Un alza es modificar el valor por sobre ese reajuste, y eso requiere acuerdo de las partes, normalmente al renovar.`,
  },
  {
    slug: "garantia-arriendo-cuanto-es-como-funciona",
    title: "Garantía de arriendo: cuánto es, para qué sirve y cuándo se devuelve",
    excerpt: "Todo sobre la garantía de arriendo en Chile: cuánto se pide, qué cubre, qué no, cuándo se devuelve y cómo el acta de entrega protege tu depósito.",
    date: "2026-06-07",
    author: "Equipo CertiFoto",
    category: "Dinero",
    readMinutes: 8,
    content: `## ¿Qué es la garantía de arriendo?

La **garantía de arriendo** (también llamada depósito de garantía o simplemente "mes de garantía") es una suma de dinero que el arrendatario entrega al arrendador al inicio del contrato. Su función es respaldar el cumplimiento de las obligaciones del arrendatario: pagar la renta, mantener la propiedad en buen estado y cubrir eventuales daños al terminar el arriendo.

No es un pago adicional al arriendo: es un dinero que queda retenido por el arrendador durante toda la vigencia del contrato y que, salvo que haya daños o deudas, debe ser devuelto íntegramente al arrendatario cuando entrega la propiedad.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## ¿Cuánto es la garantía de arriendo en Chile?

La Ley 18.101 no fija un monto obligatorio para la garantía de arriendo en contratos residenciales. Lo que se pacte es lo que rige. Dicho eso, **el monto más habitual en el mercado chileno es equivalente a un mes de renta**.

En propiedades de mayor valor, arriendos amoblados o con equipamiento especial (cocinas equipadas, electrodomésticos incluidos, etc.), algunos arrendadores solicitan dos meses de garantía. Esto no es ilegal, pero tampoco es la norma.

### Ejemplo de montos habituales

- Departamento con renta de $450.000: garantía típica entre $450.000 y $900.000.
- Casa con renta de $800.000: garantía típica entre $800.000 y $1.600.000 (en casos de alto valor o amoblada).
- Pieza en arriendo compartido: puede ser menor, a veces equivalente a medio mes o incluso menos.

Siempre es un acuerdo entre las partes. Si te piden tres o cuatro meses de garantía sin justificación, puedes negociar.

## ¿Para qué sirve la garantía?

La garantía tiene propósitos específicos y acotados. Sirve para cubrir:

- **Daños en la propiedad** causados por el arrendatario durante el período de arriendo, más allá del desgaste normal por el uso.
- **Rentas impagas** al momento de terminar el contrato.
- **Gastos comunes o cuentas de servicios** pendientes de pago al término.

Lo que la garantía **no** cubre:

- El desgaste normal por el uso del tiempo (pintura que envejece, piso que se raya por el tránsito habitual, griferías con desgaste natural).
- Reparaciones que son responsabilidad del arrendador por ley o contrato.
- Mejoras que el arrendador quiera hacer por cuenta propia.

Esta distinción entre "daño" y "desgaste normal" es una de las principales fuentes de conflicto al momento de la devolución. La clave está en haber documentado bien el estado de la propiedad desde el inicio.

## ¿Cómo protege la garantía a cada parte?

### Para el arrendador

Le permite recuperar parte de las pérdidas si el arrendatario deja daños o deudas al irse. Sin garantía, tendría que iniciar acciones legales para cobrar esas sumas, lo que es lento y costoso.

### Para el arrendatario

La garantía es un incentivo para que el arrendador acepte al arrendatario sin conocerlo previamente. También es una protección implícita: si el arrendador tiene la garantía retenida, sabe que el arrendatario tiene un interés directo en entregar la propiedad en buen estado.

Pero la garantía es dinero del arrendatario: tiene derecho a que le sea devuelta si cumplió con sus obligaciones.

## ¿Cuándo y cómo se devuelve la garantía?

La Ley 18.101 no establece un plazo específico para la devolución de la garantía en contratos residenciales. Lo que rige es lo pactado en el contrato. En la práctica, el plazo más habitual es de **30 a 60 días hábiles** desde la entrega de las llaves, tiempo que el arrendador usa para revisar la propiedad, verificar el pago de cuentas y servicios, y determinar si hay descuentos.

Si el contrato no fija plazo, se entiende que debe ser devuelta en un tiempo razonable. En caso de disputa, el arrendatario puede recurrir a los Juzgados de Letras en lo Civil.

### Condiciones para la devolución

Para que la devolución sea completa, el arrendatario generalmente debe:

1. Entregar la propiedad limpia y en el mismo estado en que la recibió, salvo desgaste normal.
2. No tener rentas ni gastos comunes adeudados.
3. Entregar las llaves y todos los elementos incluidos en el inventario inicial.
4. Presentar las últimas boletas de agua, luz y gas al día (o el comprobante de su último pago).

Si el arrendador descuenta de la garantía algún monto por daños, debe justificarlo con evidencia. Si no lo hace, el arrendatario puede cuestionarlo.

## El papel del acta de entrega en la garantía

Aquí está el punto más importante de este artículo: **la garantía se discute con evidencia, no con palabras**. Si al terminar el arriendo el arrendador dice que hay daños que el arrendatario causó, y el arrendatario dice que esos daños ya existían antes de entrar, ¿quién tiene razón?

La respuesta la tiene el acta de entrega inicial, firmada al comienzo del arriendo, con el estado de cada rincón de la propiedad.

- Si el acta documenta que el muro ya tenía una grieta al entrar, el arrendador no puede cobrarla al salir.
- Si el acta documenta que la propiedad estaba en perfecto estado y al salir hay daños nuevos, el arrendador tiene respaldo para el descuento.

Un acta de entrega con **fotografías con fecha, descripción detallada de cada recinto y certificación forense** (como hash SHA-256 y PDF verificable) convierte un documento simple en evidencia de peso ante cualquier disputa.

Para profundizar en qué debe incluir ese documento, lee [Acta de entrega de propiedad en arriendo: qué incluir](/blog/acta-entrega-propiedad-arriendo-que-incluir).

## ¿Qué pasa si hay una disputa por la garantía?

Las disputas por garantía son el conflicto más frecuente al término de un arriendo. En términos generales:

- Si el arrendador no devuelve la garantía sin justificación válida, el arrendatario puede demandar en los Juzgados de Letras en lo Civil.
- Si el arrendatario discrepa de los descuentos aplicados, puede solicitar una rendición de cuenta detallada con los respaldos de los gastos.
- La existencia de un acta de entrega bien documentada puede evitar que la disputa llegue a tribunales, porque deja poco margen para la interpretación.

Para entender cómo actuar en caso de que la garantía no sea devuelta o los descuentos sean injustificados, revisa [Cómo recuperar la garantía de arriendo en Chile](/blog/como-recuperar-garantia-arriendo-chile) y [Garantía de arriendo: lo que se discute en la práctica](/blog/garantia-arriendo-discusion).

## Errores comunes con la garantía

### Error 1: No firmar un acta de entrega al entrar

Es el error más grave. Sin un documento que certifique el estado inicial de la propiedad, cualquier daño preexistente puede ser atribuido al arrendatario al salir.

### Error 2: No hacer inventario del equipamiento

En propiedades amobladas o con electrodomésticos, si no hay un inventario firmado de lo que había al entrar (y en qué estado), al salir puede haber discrepancias difíciles de resolver.

### Error 3: Pagar la garantía en efectivo sin respaldo

La garantía siempre debe pagarse con comprobante: transferencia bancaria, cheque cruzado o recibo firmado. El efectivo sin respaldo puede generar problemas si hay disputas sobre el monto pagado.

### Error 4: No dejar constancia de las llaves entregadas

Al devolver las llaves, exige un recibo firmado que indique fecha, número y tipo de llaves entregadas. Ese documento marca el inicio del plazo para la devolución de la garantía.

## Crea tu acta de entrega gratis en CertiFoto

Con CertiFoto puedes crear el acta de entrega de tu propiedad sin costo. Subes las fotos, la IA describe cada ambiente, y quedas con un documento estructurado listo para firmar. Si quieres darle valor forense con certificado PDF verificable y hash SHA-256, lo puedes hacer en el momento que lo necesites.

[Crea tu acta ahora en el dashboard](/dashboard) y protege tu garantía desde el primer día.

## En resumen

- La garantía de arriendo es un depósito que retiene el arrendador durante el contrato y que debe devolver al término, salvo que haya daños o deudas justificadas.
- El monto más habitual en Chile es de un mes de renta, aunque puede variar según lo pactado.
- Cubre daños causados por el arrendatario, rentas impagas y cuentas pendientes. No cubre el desgaste normal por el uso.
- La ley no fija plazo de devolución; el contrato y la costumbre apuntan a 30-60 días hábiles desde la entrega de llaves.
- El acta de entrega con respaldo fotográfico es la herramienta más efectiva para proteger la garantía, tanto para el arrendatario como para el arrendador.
- Si hay disputa, el camino es la negociación con evidencia y, si no hay acuerdo, la vía judicial.

## Preguntas frecuentes

### ¿Cuánto puede pedir el arrendador como garantía?

El monto lo fijan las partes; en la práctica suele equivaler a uno o dos meses de renta. No hay una cifra única obligatoria por ley, por lo que conviene que el contrato indique con claridad el monto, en qué se puede imputar y cuándo se devuelve.

### ¿Qué puede descontar el arrendador de la garantía?

La garantía cubre rentas o cuentas impagas y daños que excedan el desgaste normal por uso. No puede usarse para cobrar deterioro razonable (ligero amarillamiento de muros, marcas suaves de muebles). Cobrar por desgaste normal es una causa frecuente de reclamos en el Juzgado de Policía Local.

### ¿En qué plazo deben devolverme la garantía?

El plazo y las condiciones dependen de lo pactado y de la situación del inmueble al restituirlo. Lo razonable es que se devuelva una vez verificado el estado de la propiedad y pagadas las cuentas pendientes. Si el arrendador retiene sin causa justificada, el arrendatario puede reclamar judicialmente.

### ¿Cómo protejo mi garantía desde el inicio?

Con un acta de entrega detallada y fotos fechadas al inicio del arriendo, y otra al momento de devolver. Tener evidencia comparable del estado inicial y final reduce drásticamente la discusión sobre qué es daño imputable y qué es desgaste normal, que en disputa evalúa el tribunal según la sana crítica.`,
  },
  {
    slug: "ley-devuelveme-mi-casa-21461-desalojo",
    title: "Ley 21.461 'Devuélveme mi Casa': cómo funciona el desalojo",
    excerpt: "Qué es la ley devuélveme mi casa, cómo funciona el procedimiento monitorio para desalojo por mora, requisitos, plazos reales y limitaciones en Chile.",
    date: "2026-06-06",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 8,
    content: `La Ley 21.461, conocida popularmente como "Devuélveme mi Casa", llegó en 2022 para responder a una demanda histórica de los propietarios chilenos: un procedimiento judicial más ágil para recuperar sus inmuebles cuando el arrendatario deja de pagar. Antes de esta ley, los procesos de restitución podían extenderse por períodos muy largos, dejando al arrendador sin recibir el arriendo y sin poder disponer de su propiedad.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado. Los procesos judiciales involucran plazos y requisitos técnicos que pueden variar según el tribunal y las circunstancias del caso.

## El problema que buscó resolver

Antes de la Ley 21.461, un arrendador que enfrentaba un arrendatario moroso debía iniciar un proceso ordinario bajo la Ley 18.101. Si bien esa ley ya contemplaba un procedimiento especial para causas de arriendo, en la práctica los plazos se extendían considerablemente: las notificaciones, los períodos de contestación, las audiencias y los posibles incidentes podían llevar el proceso a durar muchos meses o incluso años.

Durante todo ese tiempo, el arrendador seguía sin recibir el arriendo, debía asumir los gastos del inmueble y vivía en la incertidumbre de cuándo podría recuperar su propiedad. La Ley 21.461 intentó cortar ese ciclo introduciendo un **procedimiento monitorio** específico para los casos de mora en el pago de arriendo.

## En qué consiste el procedimiento monitorio

El procedimiento monitorio es una vía judicial diseñada para ser más rápida que el proceso ordinario en casos donde la deuda está documentada y no es discutida. Funciona, en términos generales, de la siguiente forma:

### Requisitos para presentar la demanda

Para acceder al procedimiento monitorio de la Ley 21.461, el arrendador debe cumplir ciertos requisitos básicos:

- Existencia de un **contrato de arriendo escrito** (no funciona con contratos verbales).
- Acreditar la **mora en el pago del arriendo**: que el arrendatario no ha pagado una o más mensualidades.
- Presentar la demanda ante el **Juzgado de Letras** en lo Civil competente según la ubicación del inmueble. La competencia no corresponde al Juzgado de Policía Local.

El arrendador presenta la demanda junto con el contrato y los antecedentes que acreditan la mora. La presentación puede hacerse con o sin abogado dependiendo de la cuantía, pero en la práctica contar con asesoría legal mejora significativamente las posibilidades de éxito y reduce los riesgos de errores formales.

### Notificación al arrendatario

Una vez admitida la demanda, el tribunal ordena notificar al arrendatario. Esta notificación es un paso crítico: si el arrendatario no es notificado correctamente, el proceso no puede avanzar. La notificación la realiza un receptor judicial.

### El plazo del arrendatario para oponerse

Tras ser notificado, el arrendatario tiene un **plazo determinado para oponerse** a la demanda. Si no presenta oposición dentro de ese plazo, el tribunal puede dictar la **orden de restitución** del inmueble sin necesidad de un juicio más extenso.

Si el arrendatario se opone —por ejemplo, alegando que sí pagó o que existe alguna irregularidad en el contrato—, el procedimiento pasa a una etapa contenciosa con audiencias, lo que lo ralentiza. La oposición bien fundada puede transformar el monitorio en un proceso más largo.

### La orden de restitución y el lanzamiento

Si el tribunal dicta la orden de restitución y el arrendatario no entrega voluntariamente el inmueble, se ordena el **lanzamiento**: una actuación en que un receptor judicial, acompañado por la fuerza pública si es necesario, ejecuta materialmente la restitución del inmueble al arrendador.

El lanzamiento es el paso final del proceso y el que efectivamente devuelve la propiedad. La fecha del lanzamiento la fija el tribunal y depende de la disponibilidad del receptor y la carga del juzgado.

## Qué la hace más rápida que el proceso anterior

La principal diferencia es el mecanismo monitorio: si el arrendatario no se opone dentro del plazo legal, el arrendador puede obtener la orden de restitución sin pasar por un juicio completo con múltiples audiencias. Esto reduce significativamente los tiempos en los casos donde la deuda es clara y el arrendatario no contesta.

Además, la ley fortaleció las herramientas para acreditar la mora y simplificó algunos requisitos formales de la demanda inicial.

## Limitaciones y realidades prácticas

La Ley 21.461 mejoró el panorama, pero no eliminó todos los obstáculos:

- **Requiere contrato escrito:** los arrendadores con contratos verbales no pueden usar este procedimiento y deben recurrir al proceso ordinario.
- **La oposición del arrendatario alarga el proceso:** si el arrendatario contrata abogado y presenta oposición —fundada o no—, el monitorio pierde parte de su ventaja de velocidad.
- **Los plazos reales dependen del tribunal:** la carga de trabajo del Juzgado de Letras competente puede afectar significativamente los tiempos efectivos, desde la notificación hasta el lanzamiento.
- **No resuelve automáticamente el cobro de la deuda:** la ley agiliza la restitución del inmueble, pero cobrar las rentas impagas puede requerir acciones adicionales o un proceso separado.
- **El lanzamiento tiene un costo:** el receptor judicial y la eventual presencia de la fuerza pública tienen costos que generalmente el arrendador debe anticipar, aunque en principio son de cargo del deudor.

En síntesis, la Ley 21.461 es una mejora real, pero no es una solución mágica. Los mejores resultados se obtienen cuando el arrendador tiene documentación sólida desde el inicio del arriendo.

## La importancia de la evidencia desde el día uno

El procedimiento monitorio parte de la existencia de un contrato escrito y de evidencia de mora. Pero más allá de eso, tener un respaldo fotográfico del estado del inmueble al inicio del arriendo tiene un valor adicional: si al recuperar la propiedad hay daños, el arrendador puede acreditar cuáles existían antes y cuáles fueron causados durante la ocupación.

CertiFoto genera actas de entrega con fotos certificadas mediante hash SHA-256, lo que permite documentar el estado inicial del inmueble con valor probatorio. Al momento de recuperar el inmueble tras un proceso judicial, esa documentación puede ser determinante para cobrar los daños. [Crea tu acta desde el dashboard](/dashboard).

Para entender el contexto más amplio de qué hacer cuando el arrendatario no paga antes de llegar a la instancia judicial, revisa [qué hacer si el arrendatario no paga el arriendo](/blog/arrendatario-no-paga-que-hacer). Y para saber qué debe tener un buen contrato que te permita acceder a este procedimiento con todas las herramientas, revisa [qué incluir en el contrato de arriendo](/blog/contrato-arriendo-que-incluir-modelo).

## En resumen

La Ley 21.461 "Devuélveme mi Casa" introdujo un procedimiento monitorio ante el Juzgado de Letras que permite obtener una orden de restitución más rápidamente cuando existe un contrato escrito y mora acreditada. Si el arrendatario no se opone, el proceso es significativamente más ágil que antes. Pero si hay oposición o el contrato es verbal, las ventajas se reducen. La documentación sólida —contrato, comprobantes y acta de entrega— sigue siendo el pilar de cualquier proceso exitoso, y la asesoría de un abogado es indispensable para navegar el procedimiento correctamente.

## Preguntas frecuentes

### ¿Qué hace distinta a la Ley 21.461 frente a un juicio de arriendo común?

La Ley 21.461 ("Devuélveme mi Casa") incorpora un procedimiento monitorio para el cobro de rentas y la restitución del inmueble por no pago, pensado para ser más rápido que el juicio ordinario. Si el arrendatario no se opone fundadamente dentro del plazo, el tribunal puede ordenar antes la restitución.

### ¿Puedo desalojar por mi cuenta usando esta ley?

No. La ley agiliza el procedimiento judicial, pero el desalojo siempre lo ordena y ejecuta el tribunal con auxilio de la fuerza pública si corresponde. Sacar al arrendatario, cambiar la chapa o cortar servicios por cuenta propia sigue siendo autotutela prohibida, aunque exista mora.

### ¿Qué necesito para iniciar el procedimiento por no pago?

Necesitas el contrato de arriendo y acreditar la mora. Conviene haber dejado constancia escrita del requerimiento de pago. Que el contrato individualice bien a las partes con RUT, fije la renta y el medio de pago facilita la prueba y evita demoras en la tramitación.

### ¿Sirve para cualquier causal de término o solo por no pago?

El procedimiento monitorio está orientado principalmente al término por no pago de rentas. Otras causales (por ejemplo, daños graves o destinos no autorizados) pueden requerir las vías de la Ley 18.101. Por eso conviene revisar con un abogado cuál es el procedimiento adecuado a tu caso.`,
  },
  {
    slug: "aviso-termino-contrato-arriendo-carta-modelo",
    title: "Aviso de término de contrato de arriendo: plazos y carta modelo",
    excerpt: "Todo sobre la carta aviso de término de arriendo: plazos según tipo de contrato, qué incluir, cómo notificar y un modelo listo para usar en Chile.",
    date: "2026-06-04",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 7,
    content: `Enviar la carta aviso de término de arriendo a tiempo y de la forma correcta puede ser la diferencia entre cerrar el contrato sin problemas y quedar expuesto a cobros adicionales, pérdida de la garantía o incluso una demanda. Es un trámite que parece simple, pero tiene plazos y requisitos legales que muchos arrendatarios y arrendadores desconocen.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Por qué importa notificar correctamente

La Ley 18.101, que regula los arrendamientos de predios urbanos en Chile, establece obligaciones de aviso previo antes de dar por terminado un contrato. Si no se cumple con esos plazos o no queda constancia de la notificación, la parte que avisó puede quedar como si nunca hubiera comunicado su intención, y el contrato continúa vigente con todas sus consecuencias.

Además, si más adelante surge un conflicto sobre quién debía pagar qué, o si el contrato terminó efectivamente en tal fecha, la carta de aviso con fecha cierta es la prueba más directa.

## Plazos según el tipo de contrato

### Contrato de arriendo indefinido

Para los contratos sin plazo fijo, la Ley 18.101 establece que cualquiera de las partes puede poner término al contrato dando aviso a la otra con **a lo menos dos meses de anticipación**. Ese plazo empieza a correr desde que el aviso llega efectivamente a la contraparte, no desde que se envía.

Esto significa que si envías la carta el 15 de junio, el contrato podrá terminar como mínimo el 15 de agosto —siempre que la otra parte la haya recibido el mismo día.

### Contrato a plazo fijo

En este caso, el contrato termina al vencimiento del plazo pactado. En principio, no es obligatorio avisar con anticipación si ambas partes conocen la fecha de término. Sin embargo, muchos contratos incluyen una **cláusula de renovación automática** que obliga a notificar con antelación si no se desea renovar. Lee tu contrato: probablemente establece un plazo de 30, 45 o 60 días para avisar que no se renovará.

Si no avisas a tiempo en un contrato con renovación automática, el contrato se extiende automáticamente según sus términos. Puedes revisar cómo funciona ese mecanismo en [renovación automática del contrato de arriendo](/blog/renovacion-automatica-contrato-arriendo).

### Término anticipado dentro del plazo fijo

Si quien avisa quiere salir antes del vencimiento, aplican las reglas del término anticipado: revisión de cláusulas de salida, posibles multas y acuerdo entre partes. Más detalle en [cómo terminar un contrato de arriendo antes de tiempo](/blog/terminar-contrato-arriendo-antes-de-tiempo).

## Qué debe contener la carta de aviso

Una carta de término bien redactada no necesita ser extensa, pero sí debe ser precisa. Estos son los elementos mínimos:

- **Identificación del remitente:** nombre completo y RUT de quien avisa (arrendatario o arrendador).
- **Identificación del destinatario:** nombre completo y RUT de la contraparte.
- **Dirección del inmueble arrendado:** calle, número, depto./piso, comuna, región.
- **Referencia al contrato:** fecha de celebración del contrato y, si aplica, número de escritura o notaría.
- **Manifestación de voluntad:** declaración clara de que se pone término al contrato de arrendamiento.
- **Fecha de término propuesta:** la fecha en que se hará efectivo el término, respetando los plazos legales o contractuales.
- **Firma y fecha de la carta.**

Opcional pero recomendable: indicar que se acuerda la restitución del inmueble en la fecha señalada y que se procederá a la liquidación de la garantía conforme a lo pactado.

## Cómo enviar el aviso para que quede constancia

El punto crítico no es solo redactar la carta, sino **probar que la otra parte la recibió y en qué fecha**. Estos son los medios más habituales:

### Carta certificada

Es la opción más común y económica. Se envía desde cualquier sucursal de Correos de Chile. El comprobante de despacho indica la fecha de envío, y Correos emite un acuse de recibo cuando el destinatario retira la correspondencia. Guarda ambos documentos.

**Limitación:** el destinatario puede demorar en retirar la carta o alegar que no lo hizo. Por eso, en casos donde hay tensión entre las partes, se recomienda reforzar con otro medio.

### Notificación ante notario

El notario da fe de que la carta fue entregada en una fecha y lugar determinados. Es más costosa que la carta certificada, pero otorga el máximo nivel de certeza jurídica. Recomendable cuando hay riesgo real de conflicto.

### Correo electrónico con acuse de recibo

Muchos contratos modernos incluyen una cláusula que valida el correo electrónico como medio de notificación. Si el tuyo lo contempla, envía el aviso al correo indicado en el contrato y activa la solicitud de acuse de recibo. Guarda el correo enviado y el acuse en formato PDF.

Si el contrato no menciona el correo como medio válido, úsalo como complemento —no como único canal— y respalda con carta certificada.

### WhatsApp u otros mensajes

Los mensajes de WhatsApp pueden tener valor probatorio en juicio, pero son más difíciles de autentificar formalmente. Úsalos solo como refuerzo, nunca como única forma de aviso para algo tan importante como el término de un contrato.

## Modelo de carta de aviso de término de arriendo

El siguiente es un modelo de referencia. Adáptalo a tu situación y, si tienes dudas, muéstraselo a un abogado antes de enviarlo.

---

**AVISO DE TÉRMINO DE CONTRATO DE ARRENDAMIENTO**

**[Ciudad], [fecha completa]**

Señor/Señora [Nombre completo del destinatario]
RUT: [RUT]
[Dirección del destinatario, si se conoce]

Por medio de la presente, yo, [Nombre completo del remitente], RUT [RUT], en mi calidad de [arrendatario / arrendador] del inmueble ubicado en [dirección completa del inmueble arrendado], vengo en comunicar a usted mi decisión de poner término al contrato de arrendamiento celebrado con fecha [fecha del contrato].

De conformidad con lo establecido en [la cláusula ___ del contrato / la Ley 18.101], el término del contrato se hará efectivo el día [fecha de término], fecha en que procederé a [restituir el inmueble / recibir la restitución del inmueble].

Sin perjuicio de lo anterior, quedo disponible para coordinar la entrega del inmueble y la liquidación de la garantía en los términos pactados.

Saluda atentamente,

[Firma]
[Nombre completo]
[RUT]
[Correo electrónico y teléfono de contacto]

---

## Después de enviar el aviso: los siguientes pasos

Una vez enviado el aviso, marca en el calendario la fecha de término y comienza a preparar la entrega del inmueble. Coordina con la contraparte la revisión del estado del inmueble y la devolución de llaves.

Es fundamental levantar un **acta de devolución** el día de la entrega. Ese documento, con fotos registradas y descripción del estado de cada espacio, es la evidencia que protege tanto al arrendatario (para recuperar la garantía íntegra) como al arrendador (para cobrar daños si los hay). CertiFoto genera ese acta gratis y entrega un certificado PDF con hash SHA-256 al momento de certificar. [Crea tu acta de devolución aquí](/dashboard).

## En resumen

La carta de aviso de término de arriendo debe enviarse con la anticipación que establece la ley o el contrato, contener los datos básicos de identificación y la fecha de término, y entregarse por un medio que deje constancia fehaciente de la recepción. La carta certificada es la opción más accesible; la notarial, la más robusta. Usar el modelo como base y ajustarlo a tu caso reduce el riesgo de errores que pueden invalidar el aviso o extender el contrato más de lo deseado.

## Preguntas frecuentes

### ¿Con cuánta anticipación debo enviar el aviso de término?

Depende del tipo de contrato y de lo pactado. En contratos de plazo indefinido o mes a mes suele exigirse un desahucio con anticipación, mientras que en los de plazo fijo el contrato termina al vencer si se avisa la no renovación a tiempo. Lo clave es respetar el plazo del contrato y de la Ley 18.101 para que el aviso surta efecto.

### ¿Cómo debo notificar el aviso para que tenga validez?

Conviene notificar por un medio que deje constancia: carta por correo certificado, notificación notarial o correo electrónico si el contrato lo admite como medio válido. Guardar el comprobante de envío y la fecha es lo que después permite acreditar que el aviso se hizo dentro de plazo.

### ¿Qué debe contener la carta de aviso?

La individualización de las partes y del inmueble, la referencia al contrato, la manifestación de no renovar o de poner término según la causal, y la fecha en que debe restituirse la propiedad. Un texto claro y fechado evita discusiones sobre el alcance del aviso.

### ¿Qué pasa si no envío el aviso a tiempo?

El contrato puede renovarse o prorrogarse por tácita reconducción en las mismas condiciones, obligándote a esperar un nuevo periodo. Por eso el aviso oportuno y con constancia es la forma más simple de cerrar el contrato en la fecha que corresponde.`,
  },
  {
    slug: "gastos-comunes-quien-paga-arriendo",
    title: "Gastos comunes en el arriendo: ¿los paga el arrendador o el arrendatario?",
    excerpt: "Resuelve quién paga los gastos comunes arriendo en Chile: regla general de mercado, diferencia entre ordinarios y extraordinarios, morosidad y cómo evitar conflictos.",
    date: "2026-06-03",
    author: "Equipo CertiFoto",
    category: "Dinero",
    readMinutes: 6,
    content: `## El conflicto que nadie anticipa

Los gastos comunes son uno de esos temas que parecen secundarios al momento de firmar el contrato y luego se convierten en una fuente constante de fricciones. La pregunta "¿los paga el arrendador o el arrendatario?" tiene una respuesta general que la mayoría aplica en el mercado, pero también tiene matices importantes que dependen de lo que diga el contrato.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## ¿Qué son los gastos comunes?

En el contexto de un edificio o condominio, los gastos comunes son los costos de administración, mantención y operación de las áreas y servicios compartidos. Incluyen, entre otros:

- Remuneración del conserje y personal de aseo de las áreas comunes.
- Energía eléctrica de pasillos, ascensores, estacionamientos y otras áreas comunes.
- Mantención de ascensores, piscinas, gimnasios y jardines.
- Seguro del edificio (sobre la estructura, no sobre el contenido de cada departamento).
- Administración del condominio.

En Chile, los gastos comunes se dividen en dos grandes categorías según la Ley 19.537 de Copropiedad Inmobiliaria:

### Gastos comunes ordinarios

Son los costos periódicos y recurrentes de la operación del edificio: aseo, conserje, energía de áreas comunes, mantención de ascensores, entre otros. Son predecibles y se cobran mensualmente.

### Gastos comunes extraordinarios

Son los costos de mejoras, reparaciones mayores o inversiones en infraestructura del edificio. Por ejemplo: reemplazo de un ascensor, pintura de fachada, impermeabilización de terrazas. Suelen aprobarse en asambleas de copropietarios.

### Fondo de reserva

Es un porcentaje del gasto común ordinario que se destina a cubrir gastos imprevistos o urgentes del edificio. Técnicamente es parte del cobro mensual, pero tiene un destino específico.

## La regla general en el mercado

La práctica más extendida en el mercado de arriendo residencial en Chile es la siguiente:

- **El arrendatario paga los gastos comunes ordinarios**, porque corresponden al uso que él hace de los servicios y áreas del edificio durante su permanencia.
- **El arrendador asume los gastos comunes extraordinarios y el fondo de reserva**, porque corresponden a inversiones en el bien raíz que son de su responsabilidad como propietario.

Esta distribución es una convención de mercado, no una exigencia legal para contratos residenciales. Lo que finalmente rige es lo que las partes escriban en el contrato.

Si el contrato dice que el arrendatario paga "todos los gastos comunes", tendrá que pagar también los extraordinarios. Si no dice nada, se aplica la costumbre de mercado, pero eso puede generar disputas.

## Por qué es fundamental dejarlo claro en el contrato

Imagina este escenario: el arrendatario lleva seis meses viviendo en el departamento y llega un cobro extraordinario por $1.200.000 correspondiente a la reparación de la red de agua potable del edificio. ¿Quién paga?

Si el contrato dice "el arrendatario paga todos los gastos comunes", el arrendatario podría argumentar que ese cobro está incluido. Si el contrato dice "el arrendatario paga los gastos comunes ordinarios", el arrendador debería asumir ese extraordinario.

Este tipo de ambigüedad genera conflictos que pueden deteriorar una relación que funcionaba bien. La solución es simple: el contrato debe distinguir explícitamente entre gastos comunes ordinarios y extraordinarios, y señalar quién paga cada uno.

Para revisar qué otras cláusulas debe incluir un buen contrato de arriendo, lee [Contrato de arriendo: qué incluir y modelo básico](/blog/contrato-arriendo-que-incluir-modelo).

## Morosidad en gastos comunes: un problema serio

Si el arrendatario deja de pagar los gastos comunes, las consecuencias pueden escalar rápidamente:

1. El condominio cobra el gasto común al **propietario** (arrendador), porque es él quien tiene la obligación legal ante la copropiedad.
2. El arrendador queda en deuda con el condominio, aunque la obligación entre arrendador y arrendatario establezca que el arrendatario debe pagarlos.
3. El condominio puede aplicar intereses y multas sobre la deuda, e incluso iniciar acciones legales contra el propietario.

Esto significa que la morosidad del arrendatario en gastos comunes **impacta directamente al arrendador**, quien luego deberá cobrarle al arrendatario por la vía interna o judicial.

### Ejemplo de cálculo de morosidad

Supongamos que el gasto común ordinario es de $85.000 mensuales y el arrendatario deja de pagarlos durante cuatro meses:

- Deuda base: $85.000 × 4 = $340.000
- Intereses y multas del condominio (ejemplo referencial, varían según reglamento): $340.000 × 1,5% mensual × 4 meses ≈ $20.400
- Total aproximado: $360.400

Este monto puede descontarse de la garantía al término del contrato, pero si la garantía no alcanza (porque también hay daños u otras deudas), el arrendador tendrá que perseguir el cobro judicialmente.

## Cómo prevenir problemas con los gastos comunes

### 1. Incluir los gastos comunes en el pago mensual o separarlos claramente

Algunos arrendadores prefieren incluir un monto fijo de gastos comunes en la renta ("$500.000 mensuales, incluido un monto fijo de $70.000 por gastos comunes"). Esto simplifica la relación, pero puede resultar en pérdidas si los gastos suben.

Otros prefieren que el arrendatario pague directamente al condominio y entregue el comprobante mensualmente. Esto traslada la responsabilidad, pero requiere más seguimiento.

### 2. Pedir certificado de gastos comunes al día antes de entregar

Al momento de firmar el contrato, el arrendador debería entregar al arrendatario un **certificado de deuda de gastos comunes al día** emitido por el condominio. Esto prueba que el arrendatario recibe la propiedad sin deudas previas en ese concepto.

Del mismo modo, al término del arriendo, el arrendatario debería acreditar que deja los gastos comunes al día antes de recibir la devolución de la garantía.

### 3. Monitorear el pago mensualmente

En contratos donde el arrendatario paga directamente al condominio, el arrendador debería solicitar el comprobante de pago mensual o verificar con el administrador del edificio que no haya morosidad acumulada.

### 4. Incluir cláusula de retención de garantía por gastos impagos

El contrato debe señalar explícitamente que cualquier deuda de gastos comunes al término del arriendo puede ser descontada de la garantía. Esto facilita el proceso de liquidación final.

## Gastos comunes y el acta de entrega

El acta de entrega que se firma al inicio del arriendo debería incluir el estado de los gastos comunes al momento de la entrega: si están al día, cuál es el monto habitual mensual, y si existe algún cobro extraordinario pendiente de aprobación en asamblea que podría afectar al período de arriendo.

Esta información en el acta protege al arrendatario de deudas que no son suyas y al arrendador de disputas sobre el origen de los cobros.

Para entender qué más corresponde incluir en el acta y quién es responsable de mantenciones durante el contrato, lee [Mantenciones en el arriendo: qué le corresponde a cada parte según la ley](/blog/mantenciones-arrendatario-arrendador-ley-chile).

## ¿Y si la propiedad no tiene gastos comunes?

Las casas independientes y algunas propiedades sin copropiedad inmobiliaria no tienen gastos comunes. En esos casos, los costos de servicios básicos (agua, luz, gas) son de cargo del arrendatario según la regla general, y los costos de mantención mayor del inmueble corresponden al arrendador.

Igualmente, si el contrato lo establece de otra forma, rige el contrato.

## Documenta todo desde el primer día

Tanto el pago de la garantía como el estado de los gastos comunes al inicio del arriendo son puntos que conviene dejar documentados. En CertiFoto puedes crear tu acta de entrega gratis, con fotos y descripción de cada recinto, y certificarla cuando lo necesites para darle respaldo forense. Un documento bien hecho desde el inicio puede evitar meses de disputas al terminar el contrato.

[Crea tu acta de entrega en el dashboard](/dashboard) antes de que el arrendatario entre a vivir.

## En resumen

- Por convención de mercado, el arrendatario paga los gastos comunes ordinarios (uso mensual) y el arrendador asume los extraordinarios (inversiones) y el fondo de reserva, salvo que el contrato diga lo contrario.
- El contrato debe distinguir explícitamente entre gastos comunes ordinarios y extraordinarios para evitar disputas.
- La obligación ante el condominio siempre recae sobre el propietario (arrendador), aunque internamente sea el arrendatario quien deba pagarlos.
- La morosidad en gastos comunes genera intereses y puede consumir la garantía al término del contrato.
- Pedir un certificado de gastos al día al inicio y al término del arriendo es una práctica preventiva clave.
- El acta de entrega debe dejar constancia del estado de los gastos comunes al momento de la entrega.

## Preguntas frecuentes

### Por regla general, ¿quién paga los gastos comunes en un arriendo?

En la práctica de mercado, los gastos comunes ordinarios (los del uso y mantención corriente del edificio) suelen quedar a cargo del arrendatario, mientras que los extraordinarios y las cuentas asociadas a la propiedad como inversión tienden a ser del arrendador. Lo decisivo es lo que el contrato establezca expresamente.

### ¿Cuál es la diferencia entre gastos comunes ordinarios y extraordinarios?

Los ordinarios cubren la operación habitual (aseo, conserjería, electricidad de espacios comunes). Los extraordinarios financian obras o mejoras mayores no habituales, como reparar un ascensor o pintar la fachada. Esa distinción suele usarse para repartir quién paga qué, por lo que conviene dejarla escrita en el contrato.

### ¿Qué pasa si el arrendatario no paga los gastos comunes?

La deuda de gastos comunes recae sobre la unidad y puede afectar al propietario frente a la comunidad. Por eso conviene pactar que el arrendatario acredite los pagos y que la garantía pueda imputarse a gastos comunes impagos. Pedir el certificado de deuda al término del arriendo evita sorpresas.

### ¿Conviene dejar registrado el estado de cuentas al entregar?

Sí. Incluir en el acta de entrega y en la de devolución las lecturas de medidores y el estado de las cuentas (gastos comunes, luz, agua, gas) deja claro qué consumos corresponden a cada periodo y a quién, reduciendo discusiones al cierre del contrato.`,
  },
  {
    slug: "declarar-arriendo-sii-impuestos",
    title: "Cómo declarar el arriendo en el SII y qué impuestos pagar",
    excerpt: "Guía para declarar arriendo SII correctamente: Impuesto Global Complementario, beneficio DFL2, cuándo aplica IVA y qué comprobantes guardar.",
    date: "2026-06-02",
    author: "Equipo CertiFoto",
    category: "Dinero",
    readMinutes: 8,
    content: `Si arriendas una propiedad en Chile, el canon que recibes mes a mes es un ingreso y, como tal, debe ser declarado ante el Servicio de Impuestos Internos (SII). Muchos propietarios primerizos desconocen esta obligación o la posponen, lo que puede derivar en multas e intereses. Esta guía te explica lo esencial para que cumplas con el SII sin sorpresas.

> Esta nota es informativa y no constituye asesoría legal ni tributaria. Para tu caso particular, consulta a un abogado o contador.

## Las rentas de arrendamiento son ingresos tributables

En Chile, los ingresos que obtienes por arrendar una propiedad quedan sujetos al **Impuesto Global Complementario (IGC)**, que se declara anualmente en la Operación Renta (Formulario 22), generalmente entre abril y mayo de cada año.

El IGC es un impuesto progresivo: la tasa que aplica depende de tu ingreso total anual, incluyendo el arriendo y cualquier otro ingreso que tengas (sueldo, honorarios, dividendos, etc.). A medida que tu ingreso aumenta, la tasa marginal sube. Puedes revisar las tablas actualizadas directamente en el sitio del SII o con un contador.

Si eres trabajador dependiente, el SII ya tiene información sobre tu sueldo a través de tus empleadores. Lo que no tiene (a menos que lo declares) son tus ingresos por arriendo. Por eso es importante incluirlos en tu declaración anual.

## ¿Dónde se ingresan los ingresos por arriendo?

En el Formulario 22 de la Operación Renta, los ingresos por arriendos de bienes raíces no agrícolas se declaran en la sección de rentas afectas al IGC. El SII ha simplificado bastante este proceso a través de su declaración propuesta, pero si tienes ingresos por arriendo, es probable que debas ajustar o completar esa propuesta manualmente.

El proceso general es:

1. Ingresa a la plataforma del SII con tu RUT y clave tributaria.
2. Revisa la declaración propuesta en la Operación Renta.
3. Agrega los ingresos por arriendo que no estén incluidos automáticamente.
4. Verifica las deducciones que puedas aplicar (ver más abajo).
5. Revisa el impuesto resultante, paga si corresponde, y envía la declaración.

Si tienes dudas puntuales, el SII tiene asistencia telefónica y presencial. También puedes consultar a un contador, especialmente si tienes más de una propiedad o ingresos de distintas fuentes.

## El beneficio DFL2: viviendas con tratamiento especial

Las viviendas acogidas al Decreto con Fuerza de Ley N° 2 (DFL2) tienen ciertos beneficios tributarios históricos relacionados con el impuesto a la renta. Sin embargo, **este es un tema que ha cambiado con el tiempo y cuya aplicación depende de múltiples factores**: la fecha de construcción, la superficie, si la vivienda califica como DFL2, y cuántas propiedades DFL2 tienes.

Por este motivo, si crees que tu propiedad podría estar acogida al DFL2, **te recomendamos encarecidamente que lo confirmes directamente con el SII o con un contador** antes de asumir que aplica un beneficio tributario. No te guíes solo por lo que te digan de pasada: las condiciones son específicas y la norma ha sido modificada en el tiempo.

## Comprobantes que debes guardar

Para respaldar tus ingresos por arriendo ante el SII, conserva:

- **Los contratos de arriendo firmados**: son el documento base que acredita la relación contractual y el monto acordado.
- **Los comprobantes de pago del canon mensual**: transferencias bancarias, cartolas, o cualquier registro que muestre los montos y fechas de pago.
- **Boletas o recibos emitidos**: si bien no siempre es obligatorio emitir una boleta por arriendo de bien raíz habitacional, es una buena práctica y facilita el respaldo.

Guarda estos documentos por al menos seis años, que es el plazo general de prescripción tributaria en Chile.

## ¿Cuándo puede aplicar IVA al arriendo?

El arriendo de inmuebles habitacionales (casas, departamentos destinados a vivienda) generalmente **no está afecto a IVA**. Sin embargo, hay situaciones en que sí puede aplicar:

- **Arriendo amoblado**: si arriendas un inmueble con muebles y enseres, la parte del canon correspondiente al amoblado puede quedar afecta a IVA.
- **Arriendo para uso comercial**: si el inmueble se arrienda para actividades comerciales o de servicios, la situación tributaria cambia.
- **Arrendador que es empresa o tiene giro**: si quien arrienda es una sociedad o tiene giro de arrendamiento de inmuebles, las reglas son distintas.

Estas son situaciones que requieren análisis caso a caso. Si tu arriendo tiene alguna de estas características, consulta con un contador antes de asumir que no corresponde IVA.

## ¿Puedo deducir gastos?

En términos generales, los propietarios personas naturales que arriendan bienes raíces no agrícolas pueden deducir ciertos gastos necesarios para producir esa renta. Esto incluye, por ejemplo, contribuciones de bienes raíces (impuesto territorial) y en algunos casos gastos de mantención necesarios.

Sin embargo, las reglas de deducción tienen condiciones específicas. No todos los gastos son deducibles automáticamente y la forma de acreditarlos importa. Este es otro punto donde un contador hace la diferencia: un buen profesional puede ayudarte a optimizar tu carga tributaria dentro del marco legal, sin exponerte a observaciones del SII.

## ¿Y si nunca he declarado el arriendo?

Si has estado recibiendo ingresos por arriendo y no los has declarado, lo más recomendable es regularizar tu situación. El SII tiene mecanismos de fiscalización que pueden detectar estas omisiones, especialmente si los pagos se hacen por transferencia bancaria. Actuar antes de ser fiscalizado es siempre mejor: las sanciones por omisión voluntaria son más altas que las multas por corrección espontánea.

Para regularizarte, habla con un contador que te ayude a presentar declaraciones rectificatorias o a gestionar el proceso ante el SII.

## La comisión del corredor también tiene implicancias

Si usaste un corredor para arrendar tu propiedad, la comisión que pagaste puede ser un gasto deducible, dependiendo de tu situación tributaria. Puedes revisar cómo funciona la [comisión del corredor de propiedades en un arriendo](/blog/comision-corredor-propiedades-arriendo) para entender bien ese costo.

## Herramientas que te facilitan la vida

Mantener un registro ordenado de tus ingresos por arriendo parte desde el inicio del contrato. Tener el acta de entrega bien documentada, los contratos firmados y los comprobantes de pago al día te da una base sólida para cualquier declaración tributaria.

Si todavía no tienes el acta de entrega de tu propiedad, puedes crearla gratis en [CertiFoto](/dashboard). El respaldo forense con hash SHA-256 y certificado PDF también puede ser útil como evidencia de la fecha de inicio del contrato y el estado inicial de la propiedad.

Y si estás comenzando el proceso de arrendar, nuestra guía sobre [cómo arrendar tu departamento por primera vez](/blog/arrendar-departamento-primera-vez-guia) te cubre desde la preparación del inmueble hasta la administración posterior.

## En resumen

Los ingresos por arriendo en Chile son tributables y deben declararse en el Impuesto Global Complementario a través de la Operación Renta. El beneficio DFL2 existe pero tiene condiciones específicas que debes confirmar con el SII o un contador. El IVA no aplica en la mayoría de los arriendos habitacionales, pero hay excepciones. Guarda todos tus comprobantes, declara cada año, y si tienes dudas, un contador es la inversión más inteligente que puedes hacer.

## Preguntas frecuentes

### ¿Tengo que declarar al SII lo que recibo por arriendo?

Por regla general, las rentas de arrendamiento son ingresos que deben declararse. Tratándose de personas naturales, suelen formar parte de la base del Impuesto Global Complementario en la declaración anual de renta. La situación concreta depende del tipo de propiedad y del régimen, por lo que conviene confirmarla con el SII o un contador.

### ¿El arriendo de viviendas paga IVA?

El arrendamiento de inmuebles para habitación, sin muebles ni instalaciones que permitan una actividad comercial o industrial, generalmente no está afecto a IVA. La situación cambia cuando se arrienda amoblado o con instalaciones que habilitan una actividad, donde sí puede aplicar. Es un punto que conviene verificar caso a caso.

### ¿Qué es el beneficio DFL2 y a quién aplica?

Las viviendas acogidas al DFL2 tienen beneficios tributarios establecidos por esa normativa, sujetos a requisitos y límites que han variado en el tiempo. Si tu propiedad es DFL2, conviene revisar las condiciones vigentes con el SII, porque no todas las viviendas ni todos los propietarios califican igual.

### ¿Qué comprobantes debo guardar?

Conviene conservar el contrato, los comprobantes de pago de la renta (transferencias o recibos) y los documentos de gastos asociados que sean deducibles según el régimen aplicable. Tener respaldo ordenado facilita la declaración y la respuesta ante cualquier revisión del SII.`,
  },
  {
    slug: "arrendar-departamento-primera-vez-guia",
    title: "Cómo arrendar tu departamento por primera vez: guía completa",
    excerpt: "Aprende cómo arrendar mi departamento paso a paso: preparar la propiedad, fijar el precio, filtrar arrendatarios, redactar el contrato y hacer el acta de entrega.",
    date: "2026-06-01",
    author: "Equipo CertiFoto",
    category: "Arrendar",
    readMinutes: 9,
    content: `Arrendar un departamento por primera vez puede parecer abrumador. Entre fijar el precio, publicar, filtrar candidatos, firmar el contrato y hacer la entrega, hay muchos pasos que, si los omites o los haces a la ligera, pueden costarte caro más adelante. Esta guía te lleva de la mano por todo el proceso para que puedas hacerlo con seguridad y sin sorpresas.

## 1. Prepara la propiedad antes de publicar

El primer error de los arrendadores novatos es publicar antes de tener el departamento listo. Un departamento en buen estado se arrienda más rápido y a mejor precio.

### Revisión básica antes de recibir visitas

- Revisa que todas las llaves, grifos y enchufes funcionen correctamente.
- Asegúrate de que no haya humedad, filtraciones ni hongos visibles. Estos problemas ahuyentan a los interesados y pueden generar conflictos legales después.
- Pinta si es necesario, al menos las zonas con marcas o suciedad evidente.
- Limpia a fondo: baños, cocina, ventanas y pisos.
- Verifica el funcionamiento de calefacción, agua caliente y citófono.

Si la propiedad está amoblada, revisa que los muebles y electrodomésticos estén en buen estado. Haz un inventario fotográfico detallado: te servirá al momento del acta de entrega.

## 2. Fija el precio de arriendo

El precio de mercado lo dicta la oferta y la demanda de la zona. Busca departamentos similares en los mismos portales donde publicarás: misma comuna, metraje parecido, cantidad de dormitorios y estacionamiento. Si hay muchos disponibles y tu precio está por encima del promedio, tardarás más en arrendar.

### Factores que influyen en el precio

- Ubicación y acceso a transporte público.
- Metraje útil (no total).
- Cantidad de dormitorios y baños.
- Presencia de estacionamiento, bodega o terraza.
- Estado de conservación y antigüedad.
- Gastos comunes altos o bajos.

Considera también que el reajuste del canon de arriendo suele pactarse en el contrato, generalmente indexado al IPC. Esto protege el valor real de tu renta a lo largo del tiempo.

## 3. Fotografía y publicación

Las fotos son lo primero que ve un potencial arrendatario. Malas fotos equivalen a menos interesados, aunque el precio sea competitivo.

### Cómo hacer buenas fotos sin ser fotógrafo

- Fotografía en horario de luz natural, idealmente mañana.
- Despeja todos los espacios: saca cajas, ropa, artículos personales.
- Fotografía desde los ángulos que hagan los espacios más amplios (desde las esquinas o desde la puerta).
- Incluye fotos del exterior, el edificio, el estacionamiento y las áreas comunes.

Para la publicación, usa los portales principales del mercado chileno. Escribe un aviso claro con todos los datos relevantes: precio, metraje, número de dormitorios y baños, dirección exacta o sector, gastos comunes aproximados, si acepta mascotas, y condiciones de la garantía.

## 4. Filtra a los interesados

No todas las personas que contacten son candidatos serios. Antes de organizar visitas masivas, puedes hacer una preselección por teléfono o mensaje: pregunta cuántas personas habitarán el departamento, si tienen mascotas, cuándo quisieran ingresar y cuál es su situación laboral.

Para quienes pasen esa primera etapa, solicita los documentos que te permitan evaluar su capacidad de pago y seriedad. Esto incluye liquidaciones de sueldo, contrato de trabajo o inicio de actividades, cédula de identidad e informe comercial. Puedes ver en detalle qué documentos pedir y cómo evaluarlos en nuestra guía de [screening de arrendatarios](/blog/documentos-pedir-arrendatario-screening).

### Criterios objetivos para elegir

- Ingresos demostrables de al menos 2,5 a 3 veces el canon mensual.
- Historial comercial sin deudas impagas relevantes.
- Estabilidad laboral (contrato indefinido o actividad independiente con trayectoria).
- Candidato con aval o codeudor solidario si los ingresos no son suficientes.

Evita basar tu decisión en características personales del candidato que no estén relacionadas con su capacidad de pago o cuidado del inmueble. La Ley 19.628 protege los datos personales, y cualquier proceso de selección debe ser objetivo y no discriminatorio.

## 5. Redacta el contrato de arriendo

El contrato es el documento que regula la relación entre tú y tu arrendatario. Debe estar por escrito y firmado por ambas partes. Aunque legalmente puede ser verbal, no te lo recomendamos bajo ninguna circunstancia.

Los elementos clave que debe incluir son: identificación de las partes, descripción del inmueble, monto del canon, forma de pago, día de vencimiento, reajuste pactado, monto de la garantía, plazo del contrato, y las obligaciones de cada parte en cuanto a mantención y reparaciones.

Revisa nuestra guía sobre [qué incluir en el contrato de arriendo](/blog/contrato-arriendo-que-incluir-modelo) para asegurarte de no omitir ninguna cláusula importante.

### ¿Plazo fijo o indefinido?

El plazo fijo da certeza de ocupación por un período determinado. El indefinido es más flexible pero puede terminar con menos aviso. Ambas opciones tienen sus ventajas según tu situación.

## 6. La garantía

La garantía es una suma de dinero que el arrendatario entrega al inicio del arriendo como respaldo ante posibles daños o deudas. En Chile, la práctica habitual es de un mes de arriendo, aunque puede ser mayor según lo acordado.

Es fundamental que quede establecida en el contrato: el monto exacto, las condiciones en que se devuelve y el plazo para hacerlo. La garantía no es un adelanto del último mes de renta; es una caución que se devuelve si no hay daños ni deudas al término del contrato.

## 7. El acta de entrega: el paso que no puedes saltarte

El día que entregues las llaves es uno de los momentos más importantes del proceso. Ese día debes levantar un acta de entrega que documente el estado exacto del departamento: paredes, pisos, baños, cocina, ventanas, luminarias, y cada ítem del inventario si está amoblado.

Sin un acta firmada por ambas partes y con respaldo fotográfico, es muy difícil demostrar si un daño existía antes o si fue causado por el arrendatario.

> Un acta bien hecha puede ahorrarte meses de disputa al término del contrato.

Puedes ver exactamente qué debe incluir un acta en la guía de [qué incluir en el acta de entrega](/blog/acta-entrega-propiedad-arriendo-que-incluir).

### CertiFoto simplifica el proceso

En [CertiFoto](/dashboard) puedes crear un acta digital con fotos que quedan respaldadas con hash SHA-256, descripciones generadas con IA y un certificado PDF verificable. Crear el acta es gratis; solo pagas si necesitas el certificado con respaldo forense. Esa evidencia vale mucho si alguna vez hay una disputa.

## 8. Administración posterior

Una vez entregadas las llaves, tu trabajo no termina. Como arrendador debes:

1. Emitir boleta o recibo por el pago del arriendo (y conocer tus obligaciones tributarias ante el SII).
2. Mantener un canal de comunicación claro con el arrendatario para reportes de fallas.
3. Responder oportunamente ante problemas estructurales o de mantención mayor.
4. Llevar un registro de pagos recibidos.
5. Reajustar el canon según lo pactado en el contrato.

Si tienes más de una propiedad o no quieres encargarte de la administración, considera un corredor o administrador de propiedades. El costo es una comisión mensual (habitualmente entre el 5% y el 10% del canon), pero te libera de la gestión diaria.

## En resumen

Arrendar por primera vez requiere preparación: adecuar la propiedad, fijar un precio justo, publicar con buenas fotos, seleccionar al arrendatario con criterios objetivos, redactar un contrato completo, acordar la garantía, y hacer un acta de entrega el día que se entregan las llaves. Cada uno de estos pasos reduce el riesgo de problemas futuros. El acta, en particular, es tu principal protección ante disputas al término del contrato. Hazla bien, con fotos y firma de ambas partes, y tendrás la tranquilidad de estar cubierto.

## Preguntas frecuentes

### ¿Qué pasos básicos debo seguir para arrendar mi departamento por primera vez?

Preparar y limpiar la propiedad, fijar un precio acorde al mercado de la zona, publicar con buenas fotos, filtrar a los interesados (screening), redactar un contrato completo y hacer un acta de entrega con fotos al momento de entregar las llaves. Ese último paso es el que más conflictos evita al término del arriendo.

### ¿Cómo fijo el precio del arriendo?

Compara propiedades similares en la misma comuna y sector (metros, dormitorios, estado, gastos comunes). El precio de mercado es referencial: durante el contrato solo podrás reajustarlo según lo pactado (IPC o UF), así que conviene partir con un valor realista en lugar de uno que tengas que corregir después.

### ¿Qué documentos puedo pedir al interesado sin infringir la ley?

Puedes solicitar antecedentes para evaluar capacidad de pago (liquidaciones, contrato de trabajo, informe comercial) y referencias, siempre tratando esos datos con la finalidad de evaluar el arriendo y resguardando la Ley 19.628 sobre protección de datos personales. No conviene conservar ni difundir esa información más allá de lo necesario.

### ¿Por qué necesito un acta de entrega si ya tengo contrato?

Porque el contrato prueba la relación de arriendo, pero no el estado del inmueble. El acta de entrega con fotos fechadas deja registro de cómo se entregó la propiedad, lo que protege la garantía y simplifica la discusión sobre daños cuando el arrendatario la devuelva.`,
  },
  {
    slug: "documentos-pedir-arrendatario-screening",
    title: "Qué documentos pedir antes de arrendar (screening de arrendatarios)",
    excerpt: "Descubre qué documentos para arrendar debes exigir: liquidaciones, contrato de trabajo, informe comercial y referencias, respetando la Ley 19.628.",
    date: "2026-05-31",
    author: "Equipo CertiFoto",
    category: "Arrendar",
    readMinutes: 7,
    content: `Elegir bien a tu arrendatario es una de las decisiones más importantes que tomarás como propietario. Un proceso de selección ordenado y documentado no solo te ayuda a elegir a la persona correcta: también te protege ante eventuales conflictos, porque demuestra que tu decisión se basó en criterios objetivos.

> Esta nota es informativa y no constituye asesoría legal ni tributaria. Para tu caso particular, consulta a un abogado o contador.

Antes de empezar, una advertencia importante: la Ley 19.628 sobre Protección de la Vida Privada regula el tratamiento de datos personales en Chile. Al solicitar documentos a un candidato, debes hacerlo con su consentimiento, usar esa información solo para evaluar su postulación, y no compartirla con terceros sin autorización. Además, tu proceso de selección debe basarse en la capacidad económica del candidato, no en características personales como origen, estado civil, o condición de salud.

## Por qué es importante pedir documentos

Arrendar sin verificar la solvencia del candidato es uno de los errores más comunes entre propietarios primerizos. Un arrendatario que no paga obliga a iniciar un proceso legal que puede extenderse varios meses y tiene costos reales: honorarios de abogado, cuotas no pagadas, y desgaste emocional.

Pedir documentos no garantiza que nada saldrá mal, pero reduce significativamente el riesgo. La clave está en saber qué pedir, cómo interpretarlo, y mantener el proceso dentro de la legalidad.

## Los documentos esenciales

### 1. Cédula de identidad vigente

El documento más básico: identifica a la persona con la que firmarás el contrato. Pide fotocopia por ambos lados y verifica que esté vigente. Si el arrendatario es extranjero, solicita su cédula de identidad para extranjeros o pasaporte con visa que permita celebrar contratos en Chile.

### 2. Liquidaciones de sueldo o acreditación de ingresos

Este es el documento más relevante para evaluar la capacidad de pago. Lo habitual es pedir las últimas tres liquidaciones de sueldo. Busca consistencia en el ingreso: un sueldo que varía mucho de un mes a otro puede ser señal de inestabilidad.

Una regla de mercado ampliamente usada es que los ingresos del candidato sean al menos 2,5 a 3 veces el valor del arriendo mensual. Si el departamento vale $500.000 al mes, el arrendatario idealmente debería acreditar ingresos de $1.250.000 a $1.500.000 mensuales.

### 3. Contrato de trabajo

El contrato de trabajo da contexto a las liquidaciones: permite saber si el empleo es indefinido, a plazo fijo, o por obra. Un contrato indefinido es señal de mayor estabilidad. Un contrato a plazo fijo próximo a vencer puede ser una señal de alerta que merece conversación.

### 4. Trabajadores independientes: inicio de actividades y declaraciones al SII

Si el candidato trabaja de forma independiente, no tendrá liquidaciones de sueldo. En ese caso, solicita:

- Certificado de inicio de actividades ante el SII.
- Últimas declaraciones de renta (Formulario 22) o declaraciones de IVA si corresponde.
- Cotizaciones previsionales si trabaja como independiente con boletas de honorarios.

La antigüedad de la actividad importa: alguien que lleva dos semanas trabajando de forma independiente tiene menos historial que quien lleva tres años.

### 5. Informe comercial

Un informe de DICOM u otro sistema de historial crediticio muestra si el candidato tiene deudas impagas registradas. Puedes solicitarlo al postulante o acceder a servicios que lo emiten directamente.

Aquí aplica especialmente la Ley 19.628: el uso de informes comerciales debe ser proporcional y con el consentimiento del candidato. Evita rechazar a alguien automáticamente por una deuda antigua, pequeña o ya pagada. Evalúa el contexto: ¿es una deuda activa? ¿De qué monto? ¿Con qué institución?

> No uses el informe comercial como único criterio de selección. Combínalo con los demás documentos para tener una imagen completa del candidato.

### 6. Referencias personales o de arrendadores anteriores

Una referencia de un arrendador anterior puede ser muy valiosa. Si el candidato ha arrendado antes, pregúntale por el nombre y contacto de su arrendador previo. Una llamada de cinco minutos puede darte mucha información.

Si no tiene arrendadores anteriores (es primera vez que arrienda), pide dos referencias personales que no sean familiares directos.

## El aval o codeudor solidario

Si el candidato tiene ingresos límite o su situación laboral genera dudas, puedes solicitar un codeudor solidario o aval. Esta persona responde por las obligaciones del arrendatario en caso de que no cumpla. El codeudor debe presentar los mismos documentos que el arrendatario principal.

Ojo: el codeudor solidario tiene responsabilidad directa e inmediata, no subsidiaria. No es "por si acaso"; es parte activa del contrato. Revisa nuestra guía sobre el [rol del aval y codeudor solidario en el arriendo](/blog/aval-codeudor-solidario-arriendo) para entender bien sus implicancias.

## Cómo organizar y evaluar la información

Una vez que tengas los documentos, organiza tu evaluación en criterios objetivos:

1. **Ingresos verificables**: ¿Son suficientes para el canon? ¿Son consistentes?
2. **Estabilidad laboral**: ¿Tiene contrato indefinido o actividad con trayectoria?
3. **Historial comercial**: ¿Tiene deudas impagas activas relevantes?
4. **Referencias**: ¿Hay antecedentes como arrendatario o persona de confianza?
5. **Coherencia del relato**: ¿Lo que dice coincide con lo que muestran los documentos?

Si tienes varios candidatos, ponles puntaje en cada criterio. Eso no solo te ayuda a elegir mejor: también te protege si alguien cuestiona tu decisión.

## Lo que no puedes hacer

La selección de arrendatarios tiene límites legales y éticos. No puedes rechazar a un candidato por:

- Su nacionalidad o país de origen.
- Su estado civil o composición familiar.
- Condición de discapacidad.
- Embarazo o situación de salud.

Estas prácticas son discriminatorias y pueden exponerte a consecuencias legales. Si el rechazo se basa en incapacidad de pago o historial comercial deficiente, documenta esa razón. La objetividad es tu mejor protección.

## Antes de dar el siguiente paso

Una vez elegido tu arrendatario, el proceso continúa con la firma del contrato y la entrega de las llaves. Si estás comenzando, te recomendamos leer nuestra guía completa sobre [cómo arrendar tu departamento por primera vez](/blog/arrendar-departamento-primera-vez-guia), donde cubrimos cada etapa del proceso en detalle.

El día de la entrega de las llaves, no olvides hacer el acta de entrega con fotos y firma de ambas partes. En [CertiFoto](/dashboard) puedes crear el acta gratis y certificarla con respaldo forense si lo necesitas.

## En resumen

Un buen proceso de screening incluye cédula de identidad, liquidaciones de sueldo o acreditación de ingresos, contrato de trabajo o antecedentes de actividad independiente, informe comercial con el consentimiento del candidato, y referencias. Todo debe hacerse respetando la Ley 19.628 y evitando cualquier criterio discriminatorio. Documenta tu proceso y basa tu decisión en la capacidad de pago y la seriedad del candidato: es la mejor forma de protegerte y de actuar dentro de la ley.

## Preguntas frecuentes

### ¿Qué documentos puedo exigir antes de arrendar?

Habitualmente se piden antecedentes que permitan evaluar la capacidad de pago y la seriedad del interesado: liquidaciones de sueldo o ingresos, contrato de trabajo o antecedentes de actividad, informe comercial y referencias de arriendos anteriores. La finalidad debe ser evaluar el arriendo, no acumular datos sin necesidad.

### ¿La Ley 19.628 limita lo que puedo pedir o guardar?

Sí. La Ley 19.628 sobre protección de la vida privada exige tratar los datos personales con una finalidad determinada y legítima. En la práctica esto significa pedir solo lo necesario para evaluar al arrendatario, usarlo para eso y no difundirlo ni conservarlo indefinidamente una vez tomada la decisión.

### ¿Puedo rechazar a un postulante por su informe comercial?

Puedes considerar el informe comercial como un antecedente más para decidir, ya que evalúas riesgo de pago. Lo que conviene evitar es usar criterios discriminatorios ajenos a la solvencia. Guardar coherencia entre lo que pides a todos los postulantes reduce el riesgo de reclamos.

### ¿Sirve el screening si después no hago acta de entrega?

El screening reduce el riesgo de impago, pero no prueba el estado del inmueble. Aunque elijas un buen arrendatario, conviene igual firmar el contrato y hacer un acta de entrega con fotos, porque las discusiones por daños y garantía surgen incluso con arrendatarios cumplidores.`,
  },
  {
    slug: "contrato-arriendo-plazo-fijo-vs-indefinido",
    title: "Contrato de arriendo a plazo fijo vs indefinido: cuál conviene",
    excerpt: "Diferencias entre contrato de arriendo plazo fijo e indefinido: plazos de aviso, tácita reconducción y cuándo conviene cada modalidad.",
    date: "2026-05-29",
    author: "Equipo CertiFoto",
    category: "Contratos",
    readMinutes: 7,
    content: `Una de las decisiones más importantes al firmar un arriendo es elegir entre contrato a plazo fijo o a plazo indefinido. La elección afecta directamente cómo termina la relación, los plazos de aviso que debes dar o recibir, y las consecuencias si una de las partes quiere salir antes de tiempo. Aquí te explicamos las diferencias clave para que elijas con criterio.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Qué es un contrato de arriendo a plazo fijo

Un contrato a plazo fijo tiene fecha de inicio y fecha de término establecidas de antemano —por ejemplo, del 1 de julio de 2026 al 30 de junio de 2027. Durante ese período, ambas partes se comprometen a cumplir: el arrendatario a pagar y mantener el inmueble; el arrendador a no solicitar la restitución anticipada sin causa justificada.

La característica central es la estabilidad: ninguna parte puede terminar el contrato unilateralmente antes del vencimiento sin consecuencias, salvo causales legales (incumplimiento grave, necesidad del inmueble por parte del arrendador, entre otras reconocidas por la ley).

## Qué es un contrato de arriendo indefinido

Un contrato indefinido no tiene fecha de término pactada. Cualquiera de las partes puede ponerle fin, pero debe dar aviso con la anticipación que fija la ley (o el contrato, si pacta algo más favorable).

Según la Ley 18.101, en arriendos de inmuebles urbanos el arrendatario puede poner término al contrato dando aviso con al menos dos meses de anticipación. Para el arrendador, las reglas son distintas según la causal: si desea recuperar el inmueble sin causa específica, debe recurrir al procedimiento de desahucio, con plazos que la misma ley regula.

## Diferencias en los plazos de aviso y desahucio

Esta es la diferencia práctica más importante:

### Plazo fijo

- Al vencerse el plazo, el contrato termina automáticamente (en principio).
- Si ninguna parte avisa con anticipación, puede operar la **tácita reconducción** (ver más abajo).
- Para terminar anticipadamente, la parte que incumple o que quiere salir enfrenta consecuencias: compensación al perjudicado, o acción legal del afectado.

### Indefinido

- El arrendatario puede terminar avisando con dos meses de anticipación (o el plazo que el contrato establezca, si es mayor).
- El arrendador que desea recuperar el inmueble sin causal de incumplimiento debe seguir el procedimiento legal de desahucio, con plazos que la ley fija.
- En caso de no pago u otras causales de incumplimiento, el procedimiento es distinto al desahucio ordinario.

Para entender cómo terminar el contrato antes de tiempo en cualquiera de las modalidades, revisa [cómo terminar un contrato de arriendo antes de tiempo](/blog/terminar-contrato-arriendo-antes-de-tiempo).

## La tácita reconducción: qué pasa al vencer el plazo fijo

Si el contrato a plazo fijo vence y el arrendatario sigue ocupando el inmueble sin que ninguna de las partes haya dado aviso de término, la Ley 18.101 establece que el contrato se entiende renovado, pero ahora en forma indefinida (tácita reconducción). Las condiciones económicas se mantienen, pero el plazo deja de ser fijo.

Esto tiene implicancias importantes:

- El arrendador pierde la ventaja de tener una fecha de término predefinida.
- Para recuperar el inmueble, deberá ahora recurrir al procedimiento de desahucio o esperar una causal de incumplimiento.
- El arrendatario gana mayor estabilidad, pero sigue obligado a avisar con anticipación si decide irse.

Para evitar la tácita reconducción, el arrendador debe comunicar oportunamente que no renovará. Lee más sobre cómo opera la [renovación automática del contrato de arriendo](/blog/renovacion-automatica-contrato-arriendo).

## Ventajas del contrato a plazo fijo

**Para el arrendador:**

- Permite planificar: sabe cuándo recuperará el inmueble.
- Si el arrendatario incumple antes del vencimiento, tiene acción por el período pactado.
- Facilita la venta del inmueble con fecha cierta de desocupación.

**Para el arrendatario:**

- Garantiza estabilidad durante el plazo pactado: el arrendador no puede pedirle que salga sin causa.
- Permite planificar mudanzas, proyectos, colegios, etc.

## Desventajas del contrato a plazo fijo

**Para el arrendador:**

- Si el arrendatario resulta problemático, no puede pedir la restitución antes del plazo por razones distintas al incumplimiento.
- Pierde flexibilidad si necesita el inmueble con urgencia.

**Para el arrendatario:**

- Si necesita mudarse antes del vencimiento, puede enfrentar cobros por el período restante o una negociación con el arrendador.
- Menos flexibilidad ante cambios laborales o familiares.

## Ventajas del contrato indefinido

**Para el arrendador:**

- Mayor flexibilidad para recuperar el inmueble si surgen necesidades (aunque debe seguir el procedimiento legal).
- Más útil en arriendos de corta duración o cuando hay incertidumbre sobre el uso futuro del inmueble.

**Para el arrendatario:**

- Puede salir con solo dos meses de aviso, sin penalidades por "término anticipado".
- Más adecuado para quienes tienen movilidad laboral o situación vital cambiante.

## Desventajas del contrato indefinido

**Para el arrendador:**

- Recuperar el inmueble sin causal de incumplimiento requiere el procedimiento legal de desahucio, con plazos que pueden extenderse.
- Menos certeza de cuándo quedará disponible el inmueble.

**Para el arrendatario:**

- El arrendador puede iniciar desahucio en cualquier momento si cumple los requisitos legales.
- Menor estabilidad a largo plazo.

## ¿Cuándo conviene cada modalidad?

### Elige plazo fijo si:

- Eres arrendador y quieres certeza sobre la fecha en que recuperas el inmueble.
- Eres arrendatario y tienes un proyecto claro (trabajo, estudio) de duración definida.
- Ambas partes prefieren estabilidad y previsibilidad.

### Elige indefinido si:

- Eres arrendatario con trabajo o vida itinerante.
- Eres arrendador que prefiere flexibilidad para ajustar condiciones o recuperar el inmueble con aviso.
- La relación arriendo-arrendador es de confianza y las partes prefieren no atarse a un plazo fijo.

## La cláusula de renovación y lo que debes revisar

Muchos contratos a plazo fijo incluyen una cláusula de renovación automática por períodos iguales, a menos que una de las partes avise con cierta anticipación (usualmente 30 o 60 días antes del vencimiento). Ojo con esta cláusula: si no avisas a tiempo, el contrato se renueva y quedas atado por otro período completo.

## El acta de entrega: igual de importante en ambas modalidades

Independientemente del tipo de contrato que elijas, el acta de entrega es fundamental al inicio del arriendo. Documenta el estado real del inmueble con fotografías verificadas, y protege tanto al arrendador como al arrendatario ante discusiones al término. [Crea tu acta de entrega gratis en CertiFoto](/dashboard) y adjúntala al contrato el día de las llaves.

## En resumen

El contrato a plazo fijo ofrece estabilidad y fecha cierta de término; el indefinido, flexibilidad de salida para ambas partes. La elección depende de tus circunstancias y de lo que más valoras. En ambos casos, cuida los detalles del contrato, conoce los plazos de aviso y documenta siempre el estado del inmueble con un acta de entrega.

## Preguntas frecuentes

### ¿Cuál es la diferencia práctica entre plazo fijo e indefinido?

El contrato a plazo fijo termina en una fecha determinada (sujeto a avisos de no renovación), lo que da certeza sobre cuándo concluye. El indefinido se mantiene hasta que una parte lo termine cumpliendo los plazos de aviso o desahucio de la Ley 18.101. La elección depende de cuánta estabilidad o flexibilidad busque cada parte.

### ¿Qué es la tácita reconducción y a cuál afecta?

La tácita reconducción ocurre cuando, vencido el plazo, el arrendatario sigue ocupando con el consentimiento del arrendador y este recibe la renta: el contrato se entiende prorrogado. Afecta sobre todo a los de plazo fijo cuando no se avisa la no renovación a tiempo, por lo que el aviso oportuno es clave.

### ¿En cuál puedo recuperar antes la propiedad?

En el plazo fijo sabes la fecha de término, pero igual debes avisar la no renovación. En el indefinido necesitas dar el desahucio con la anticipación legal. Ninguno permite recuperar el inmueble de inmediato: el desalojo, si el arrendatario no se va, siempre requiere vía judicial.

### ¿Cuál conviene si quiero estabilidad de largo plazo?

Si buscas estabilidad, un plazo fijo más largo o un indefinido bien redactado entrega previsibilidad. Lo importante, en cualquier caso, es dejar claros los plazos de aviso, el reajuste y las causales de término, y respaldar la entrega con un acta para evitar discusiones al final.`,
  },
  {
    slug: "clausulas-abusivas-contrato-arriendo",
    title: "Cláusulas abusivas en contratos de arriendo: cómo detectarlas",
    excerpt: "Guía práctica para identificar cláusulas abusivas en contratos de arriendo en Chile y qué exigir antes de firmar.",
    date: "2026-05-28",
    author: "Equipo CertiFoto",
    category: "Contratos",
    readMinutes: 7,
    content: `Firmar un contrato de arriendo sin leerlo bien es uno de los errores más costosos que puedes cometer. Algunos contratos circulan con cláusulas que parecen válidas pero que, en rigor, son nulas o difícilmente exigibles porque contravienen la ley o el orden público. Saber identificarlas te protege antes de poner tu firma.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Qué hace abusiva a una cláusula

Una cláusula es abusiva cuando genera un desequilibrio injustificado en perjuicio de una de las partes —casi siempre el arrendatario— o cuando busca renunciar anticipadamente a derechos que la ley reconoce como irrenunciables. El Código Civil y la Ley 18.101 establecen ciertos derechos mínimos que no pueden suprimirse por acuerdo de las partes. Si el contrato lo intenta, esa cláusula puede ser ineficaz aunque ambos la hayan firmado.

Conocer tus [derechos y deberes como arrendatario en Chile](/blog/derechos-deberes-arrendatario-chile) es el punto de partida para detectar estas cláusulas.

## Cláusulas abusivas más frecuentes

### 1. Renuncia anticipada a derechos legales

Frases como "el arrendatario renuncia a todos los derechos que le concede la Ley 18.101" o "el arrendatario no podrá ejercer ninguna acción legal contra el arrendador" son ineficaces. La ley no permite renunciar anticipadamente a derechos que son de orden público. Si esta cláusula aparece, no te preocupes: es nula aunque la hayas firmado, pero conviene exigir su eliminación para evitar conflictos.

### 2. Multas desproporcionadas por atraso en el pago

Una multa razonable por pago tardío es legítima. Lo que resulta abusivo es una multa equivalente a un mes de renta por un día de atraso, o cláusulas acumulativas que triplicar la deuda en pocas semanas. Si ves porcentajes muy elevados o montos fijos que superan con creces el perjuicio real del arrendador, negocia reducirlos o pide su eliminación.

### 3. Retención automática de la garantía

Cláusulas que dicen "al término del contrato, el arrendador podrá retener la garantía sin necesidad de acreditar daños" o "la garantía se pierde en caso de cualquier incumplimiento" son problemáticas. La garantía está para cubrir daños comprobables y deudas concretas. Su retención sin acreditar el perjuicio puede dar lugar a una acción de cobro.

Revisa cómo funciona la garantía en la práctica en [garantía de arriendo: cuánto es y cómo funciona](/blog/garantia-arriendo-cuanto-es-como-funciona).

### 4. Prohibición total de visitas o personas en el inmueble

El arrendatario tiene derecho a usar el inmueble con normalidad, incluyendo recibir visitas. Una cláusula que diga "el arrendatario no podrá recibir visitas sin autorización previa del arrendador" o que restrinja el número de personas que puede haber en el inmueble en todo momento excede lo razonable y puede ser ineficaz. Restricciones específicas (como no subarrendar ni ceder el contrato) sí son válidas.

### 5. Autorización de desalojo extrajudicial

Frases como "el arrendador podrá recuperar el inmueble por sus propios medios en caso de mora" o "ante el incumplimiento, el arrendador está autorizado para ingresar al inmueble y retirar al arrendatario sin necesidad de orden judicial" son nulas. En Chile, el desalojo requiere resolución judicial. No existe el autotutela legal para recuperar un inmueble arrendado.

### 6. Corte de servicios como mecanismo de presión

"En caso de mora, el arrendador podrá cortar el suministro de agua, luz o gas" es otra cláusula nula. El corte de servicios básicos como mecanismo de coerción está prohibido. El arrendador que lo hace puede enfrentar acciones legales del arrendatario.

### 7. Traspaso de reparaciones necesarias al arrendatario

La ley distingue entre reparaciones locativas (pequeñas, de desgaste normal, a cargo del arrendatario) y reparaciones necesarias (las que mantienen el inmueble en condiciones habitables, a cargo del arrendador). Una cláusula que diga "todas las reparaciones, incluyendo cañerías, techumbres e instalaciones eléctricas, son de cargo del arrendatario" invierte esta distribución legal y puede ser ineficaz en la parte que contraviene la ley.

### 8. Cláusulas de desistimiento anticipado con multas excesivas

Si el arrendatario necesita terminar el contrato antes del plazo, es razonable pagar una compensación. Pero cláusulas que obligan a pagar el equivalente al arriendo de todos los meses que restan del contrato, sin posibilidad de mitigar el daño (por ejemplo, porque el arrendador arrienda el inmueble a otra persona), pueden ser cuestionadas como desproporcionadas.

## Cómo revisar el contrato antes de firmar

No basta con leer rápido. Sigue este proceso:

1. **Lee el contrato completo**, incluso las cláusulas en letra pequeña o al final del documento.
2. **Busca palabras clave problemáticas**: "renuncia", "sin necesidad de", "en todo caso", "automáticamente", "por sus propios medios".
3. **Pregunta por cada cláusula que no entiendas**. Si el arrendador no puede explicarla con claridad, probablemente no sea razonable.
4. **Compara con la ley**: si la cláusula te quita derechos que la Ley 18.101 te da, probablemente sea nula —pero mejor confirmarlo con un abogado.
5. **No firmes bajo presión**. Pide tiempo para revisar. Un arrendador razonable lo permitirá.

## Qué exigir o negociar

Si detectas una cláusula problemática, no tienes que simplemente rechazar el contrato. Puedes:

- **Pedir que se elimine** la cláusula abusiva y que se firme una versión corregida.
- **Proponer una redacción alternativa** que proteja los intereses legítimos del arrendador sin vulnerar tus derechos.
- **Dejar constancia escrita** (un correo o mensaje) de que firmaste el contrato entendiendo que cierta cláusula es nula y que la aceptas únicamente en la parte que sea legalmente válida.

Recuerda que aunque firmes una cláusula nula, no queda vinculante. Pero evitar el conflicto desde el inicio siempre es mejor que litigar después.

## El acta de entrega como complemento imprescindible

Un contrato bien redactado protege tus intereses desde el inicio, pero el acta de entrega es lo que respalda qué estado tenía el inmueble el día que recibiste las llaves. Sin ella, cualquier discusión sobre daños al término queda sin evidencia objetiva.

[Crea tu acta de entrega gratis en CertiFoto](/dashboard): fotos con hash SHA-256, descripción con IA y certificado PDF verificable. Es la herramienta que convierte el contrato en un acuerdo completo y defendible.

## En resumen

Las cláusulas abusivas más comunes en contratos de arriendo incluyen renuncia anticipada de derechos, multas desproporcionadas, retención automática de la garantía, autorización de desalojo extrajudicial, corte de servicios y traspaso ilegal de reparaciones. Antes de firmar, lee todo el contrato, identifica estas cláusulas y negocia su eliminación. Un contrato equilibrado y un acta de entrega son tu mejor protección como arrendatario o arrendador.

## Preguntas frecuentes

### ¿Qué se considera una cláusula abusiva en un arriendo?

En términos prácticos, son cláusulas que renuncian a derechos que la ley reconoce al arrendatario o que imponen cargas desproporcionadas. Ejemplos típicos: renuncias generales "a todos los derechos", autorizaciones para cortar servicios básicos por mora o para ingresar al inmueble sin aviso. Aunque estén firmadas, el tribunal puede no hacerlas valer.

### ¿Una cláusula abusiva invalida todo el contrato?

No necesariamente. Por lo general la cláusula cuestionada puede no producir efecto sin afectar la validez del resto del contrato. Lo razonable es identificarla antes de firmar y pedir que se elimine o corrija, en lugar de asumir que "no se aplicará".

### ¿Es abusivo que me cobren por desgaste normal al final?

Cobrar al arrendatario por el desgaste normal del uso adecuado no corresponde, porque ese deterioro es de cargo del arrendador. Pretender descontarlo de la garantía es una causa frecuente de reclamos en el Juzgado de Policía Local. La forma de evitar la discusión es tener un acta de entrega que distinga el estado inicial.

### ¿Qué hago si ya firmé un contrato con cláusulas dudosas?

Conviene revisar el contrato con un abogado para identificar qué cláusulas podrían no tener efecto y cómo proceder. Mientras tanto, documenta por escrito tus comunicaciones con el arrendador y conserva evidencia (correos, fotos fechadas), porque la trazabilidad ayuda si la disputa llega a tribunales.`,
  },
  {
    slug: "renovacion-automatica-contrato-arriendo",
    title: "Renovación automática del contrato de arriendo: cómo funciona",
    excerpt: "Qué es la renovación automática de arriendo, cómo evitarla, diferencia con la tácita reconducción y plazos de aviso que debes conocer.",
    date: "2026-05-27",
    author: "Equipo CertiFoto",
    category: "Contratos",
    readMinutes: 6,
    content: `Muchos arrendadores y arrendatarios llegan al término de un contrato sin saber exactamente si este se renovó automáticamente o no. La renovación automática no es un truco: es una cláusula legítima que puede beneficiarte o perjudicarte dependiendo de tu posición. Aquí te explicamos cómo funciona, cuándo aplica y qué hacer para no quedar atrapado en un arriendo que ya no quieres.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Renovación automática vs tácita reconducción: ¿es lo mismo?

No exactamente, aunque el resultado práctico puede parecerse.

**La renovación automática** es una cláusula que las partes acuerdan expresamente en el contrato. Dice algo como: "Al vencerse el plazo, el contrato se renovará automáticamente por un período igual, salvo que alguna de las partes avise lo contrario con X días de anticipación". Si nadie avisa a tiempo, el contrato sigue vigente por otro período igual al original.

**La tácita reconducción** es un mecanismo legal que opera cuando vence un contrato a plazo fijo y el arrendatario sigue ocupando el inmueble sin que nadie diga nada. En ese caso, la Ley 18.101 entiende que el contrato continúa, pero ya no como plazo fijo sino como contrato indefinido. Las condiciones económicas se mantienen, pero el plazo cambia de naturaleza.

La diferencia clave: con renovación automática pactada, el contrato se renueva por el mismo plazo fijo original. Con tácita reconducción, el contrato pasa a ser indefinido.

## Cómo opera la cláusula de renovación automática

Cuando el contrato incluye esta cláusula, el procedimiento es simple pero tiene un punto crítico: el plazo de aviso.

Supón que el contrato vence el 31 de agosto y la cláusula dice "con 60 días de anticipación". Eso significa que para evitar la renovación, debes avisar a más tardar el 2 de julio. Si llegas el 1 de agosto con tu carta de término, ya es tarde: el contrato se habrá renovado automáticamente desde el 1 de septiembre.

La renovación opera "de pleno derecho" en ese caso: no requiere que ninguna de las partes haga nada adicional. Simplemente sigue vigente.

## Qué plazos de aviso son habituales en Chile

Los contratos de arriendo en Chile suelen establecer plazos de aviso de 30, 60 o 90 días antes del vencimiento para evitar la renovación. No hay un plazo legal estándar para la renovación automática pactada —es lo que las partes acordaron. Lo que sí establece la Ley 18.101 es el plazo de aviso para el desahucio en contratos indefinidos (distinto escenario).

Por eso, lo primero que debes hacer es leer tu contrato y buscar la cláusula de renovación.

## Cómo evitar que el contrato se renueve

Si no quieres que el contrato se renueve, debes:

1. **Identificar la fecha de vencimiento** del contrato actual.
2. **Identificar el plazo de aviso** que establece la cláusula de renovación.
3. **Calcular la fecha límite de aviso**: resta el plazo de aviso a la fecha de vencimiento.
4. **Enviar el aviso antes de esa fecha**, por escrito y con acuse de recibo.

El aviso debe ser escrito. Un correo electrónico con confirmación de lectura, una carta certificada o un WhatsApp con doble check leído pueden servir como evidencia, pero la carta notarial o el correo con acuse son los más robustos. Puedes ver un modelo en [cómo redactar la carta de aviso de término de contrato](/blog/aviso-termino-contrato-arriendo-carta-modelo).

## Si ya se renovó sin que lo quisieras

Si el plazo de aviso venció y el contrato se renovó automáticamente, las opciones son:

- Negociar con la contraparte: si ambas partes están de acuerdo en terminar antes, pueden suscribir un mutuo acuerdo de término anticipado.
- Esperar el siguiente vencimiento y avisar a tiempo.
- En algunos casos, si la renovación se produjo de mala fe o con información incorrecta, puede haber argumentos legales —consulta a un abogado.

## Qué revisar en el contrato antes de firmar

Cuando estés revisando un contrato antes de firmarlo, busca específicamente:

- ¿Hay cláusula de renovación automática? ¿Por qué período se renueva?
- ¿Cuál es el plazo de aviso para evitar la renovación?
- ¿Quién debe avisar: solo el arrendatario, solo el arrendador, o cualquiera de los dos?
- ¿Hay límite de renovaciones (ej.: máximo dos renovaciones) o la renovación es indefinida?

Una cláusula bien redactada debería decir algo como: "El presente contrato se renovará automáticamente por un período de doce meses, salvo que cualquiera de las partes manifieste su voluntad de no renovar mediante comunicación escrita dirigida a la otra parte con al menos sesenta días de anticipación al vencimiento."

Si la cláusula es ambigua sobre el plazo o sobre quién debe avisar, pide que se aclare antes de firmar.

## Renovación automática y contrato indefinido: diferencia en la salida

Si tu contrato es a plazo fijo con renovación automática y ya se renovó, seguirás en un contrato a plazo fijo —lo que significa que salir antes del vencimiento puede acarrear consecuencias. En cambio, si operó la tácita reconducción y el contrato es ahora indefinido, el arrendatario puede poner término dando aviso con la anticipación legal, sin pagar penalidades por "término anticipado".

Para entender mejor las diferencias entre ambas modalidades, revisa [contrato de arriendo a plazo fijo vs indefinido](/blog/contrato-arriendo-plazo-fijo-vs-indefinido).

## El acta de entrega y la renovación: no olvides actualizar el respaldo

Si tu contrato se renueva, considera actualizar el acta de entrega. El estado del inmueble puede haber cambiado desde la entrega inicial: desgaste normal, reparaciones realizadas, mejoras. Documentar el estado al momento de la renovación es una buena práctica que evita discusiones futuras sobre quién causó qué daño y en qué período.

[Crea o actualiza tu acta de entrega gratis en CertiFoto](/dashboard): el registro fotográfico con hash SHA-256 queda vinculado a la fecha exacta, lo que lo hace difícil de cuestionar.

## En resumen

La renovación automática es una cláusula contractual que renueva el arriendo por un período igual al original si ninguna de las partes avisa a tiempo. La tácita reconducción, en cambio, convierte el contrato en indefinido cuando vence sin aviso. Para evitar renovaciones no deseadas, identifica el plazo de aviso en tu contrato, calcula la fecha límite y envía el aviso por escrito con tiempo. Si el contrato ya se renovó, la alternativa más simple es el acuerdo mutuo o esperar el próximo vencimiento.

## Preguntas frecuentes

### ¿Es lo mismo renovación automática que tácita reconducción?

No. La renovación automática es una cláusula del contrato que lo prorroga por nuevos periodos salvo aviso en contrario. La tácita reconducción es una situación que surge de la ley cuando, vencido el plazo, el arrendatario sigue ocupando con el consentimiento del arrendador que recibe la renta. Ambas prolongan el arriendo, pero por causas distintas.

### ¿Cómo evito que el contrato se renueve sin que yo quiera?

Enviando el aviso de no renovación con la anticipación que indique el contrato o la ley, por un medio que deje constancia (carta certificada, notarial o correo si es válido). Guardar el comprobante de envío y la fecha es lo que permite acreditar que se avisó dentro de plazo.

### ¿Con cuánta anticipación debo avisar?

Depende del plazo de aviso pactado y de las reglas de la Ley 18.101 según el tipo de contrato. Lo prudente es revisar la cláusula respectiva apenas se acerque el vencimiento y enviar el aviso con margen, para no quedar obligado a un nuevo periodo por haberlo notificado tarde.

### ¿La renovación automática puede cambiar la renta?

Solo si el contrato lo establece (por ejemplo, prorrogando con el reajuste pactado). Si la cláusula nada dice sobre el monto, la renovación tiende a mantener las condiciones vigentes. Cualquier alza real del precio requiere acuerdo de las partes.`,
  },
  {
    slug: "subarriendo-chile-legal",
    title: "Subarriendo en Chile: ¿es legal y cómo se hace bien?",
    excerpt: "El subarriendo legal chile depende de lo pactado: sin autorización del arrendador puedes perder el arriendo. Aprende cómo formalizarlo y qué riesgos evitar.",
    date: "2026-05-26",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 7,
    content: `## ¿Qué es el subarriendo y cuándo es legal en Chile?

El subarriendo ocurre cuando el arrendatario —la persona que arrienda una propiedad— le cede el uso de ese inmueble, total o parcialmente, a un tercero llamado subarrendatario. En términos simples: tú arriendas un departamento y luego se lo "arriendas" a otra persona.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

La regla general en Chile, bajo el Código Civil y la Ley 18.101 que regula los arrendamientos urbanos, es que el arrendatario **no puede subarrendar sin la autorización del arrendador**. Esta autorización debe estar pactada en el contrato o entregada de forma expresa y por escrito. Si el contrato simplemente no dice nada al respecto, lo más seguro es entender que el subarriendo está prohibido salvo que el arrendador lo apruebe explícitamente.

Si subarriendas sin permiso, el arrendador puede tener motivos para solicitar el término del contrato. Por eso, antes de dar las llaves a alguien más, es fundamental revisar lo que dice el contrato y conversarlo con el propietario.

Para entender bien qué cláusulas debe tener tu contrato, revisa la guía sobre [qué incluir en un contrato de arriendo](/blog/contrato-arriendo-que-incluir-modelo).

## Subarriendo total vs. subarriendo parcial

No es lo mismo subarrendar el inmueble completo que ceder una habitación mientras tú sigues viviendo ahí. Ambas situaciones tienen implicancias distintas.

### Subarriendo total

Ocurre cuando el arrendatario deja el inmueble completamente en manos de un tercero y ya no lo ocupa. En este caso, el arrendador podría entender que se está cediendo la posición contractual entera, lo que va más allá del simple subarriendo y puede generar conflictos adicionales. Es la modalidad de mayor riesgo.

### Subarriendo parcial

Es cuando el arrendatario conserva el uso de parte del inmueble (por ejemplo, ocupa una habitación y arrienda las demás). Aunque parece menos grave, sigue requiriendo autorización del arrendador. En departamentos, además, puede haber restricciones del reglamento de copropiedad.

## El caso de los arriendos por días tipo Airbnb

El arriendo de corta duración mediante plataformas como Airbnb o similares es una forma de subarriendo que ha generado mucha controversia en Chile. Aquí entran en juego al menos tres capas de normas:

### El contrato de arriendo

Si tu contrato prohíbe el subarriendo —o no lo autoriza expresamente— usar la propiedad para arriendos de corta duración puede darte problemas con el arrendador. Incluso si el contrato no menciona plataformas digitales, el uso turístico intensivo puede calificar como subarriendo no autorizado o como uso del inmueble para fines distintos al habitacional pactado.

### El reglamento de copropiedad

Aquí está uno de los frenos más concretos. La Ley 21.442 de Copropiedad Inmobiliaria permite que los reglamentos de edificios y condominios regulen o incluso prohíban los arriendos de corta duración. Muchos edificios en Santiago y otras ciudades ya tienen esta restricción incorporada. Antes de publicar tu departamento en una plataforma, revisa el reglamento que te entregaron al comprar o arrendar.

### Las implicancias tributarias

Quienes arrienden de forma habitual deben declarar esos ingresos en el SII. Esto aplica tanto al arrendador original como al subarrendatario que obtiene renta por los días de ocupación. No es un tema menor.

## Riesgos para el arrendador

Si eres propietario y descubres que tu arrendatario está subarrendando sin tu permiso, los riesgos son reales:

- **Daños al inmueble**: personas desconocidas usando la propiedad sin ningún control.
- **Responsabilidad difusa**: si el subarrendatario causa daños o incumple normas del edificio, la relación jurídica directa sigue siendo con tu arrendatario, pero los problemas prácticos llegan igual.
- **Conflictos con la comunidad**: especialmente en el caso de arriendos turísticos, el flujo de extraños puede tensionar la convivencia del edificio.
- **Uso fuera de lo pactado**: si el contrato dice uso habitacional y el inmueble se usa para turismo, puede haber un incumplimiento de contrato.

Como arrendador, puedes —y deberías— incluir una cláusula que prohíba expresamente el subarriendo, en cualquier forma, incluyendo plataformas digitales.

## Riesgos para el arrendatario

Si eres arrendatario y estás pensando en subarrendar (con o sin permiso), considera lo siguiente:

- **Sin autorización, puedes perder el arriendo**: el arrendador tiene fundamentos para pedir el término del contrato.
- **Sigues siendo responsable frente al arrendador**: aunque alguien más ocupe la propiedad, tú eres quien responde por el pago de la renta y por los daños.
- **El subarrendatario no tiene relación directa con el arrendador**: si el subarrendatario deja de pagarte o causa destrozos, el problema lo enfrentas tú.
- **Problemas con el edificio**: si el reglamento prohíbe el subarriendo y te pillan, pueden aplicarte sanciones.

## ¿Cómo formalizar bien el subarriendo?

Si tienes autorización del arrendador para subarrendar, lo más recomendable es hacerlo con orden:

1. **Obtén la autorización por escrito**: ya sea en el contrato original o mediante un documento firmado por el arrendador.
2. **Firma un contrato de subarriendo**: establece el plazo, el monto, las condiciones de uso y las responsabilidades del subarrendatario.
3. **Haz un acta de entrega al subarrendatario**: documenta el estado del inmueble antes de que entre el subarrendatario. Esto te protege a ti como intermediario si hay daños al término.
4. **Notifica al arrendador si cambia el subarrendatario**: mantén informado al propietario de quién ocupa el inmueble.
5. **Revisa el reglamento de copropiedad**: aunque tengas el visto bueno del arrendador, el edificio puede tener restricciones propias.

Usar CertiFoto para el acta de entrega al subarrendatario es especialmente útil en este escenario: las fotos con hash SHA-256 y el certificado PDF verificable dejan constancia objetiva del estado del inmueble, y ese respaldo sirve tanto para protegerte frente al subarrendatario como para acreditar ante el arrendador original que entregaste la propiedad en buenas condiciones.

Para saber bien cuáles son tus derechos y límites como arrendatario, revisa la guía completa de [derechos y deberes del arrendatario en Chile](/blog/derechos-deberes-arrendatario-chile).

## ¿Puede el arrendador cobrar por el subarriendo?

El contrato puede establecer condiciones para autorizar el subarriendo, incluyendo el pago de un porcentaje adicional o la revisión del subarrendatario. Eso es legítimo. Lo que no puede hacer el arrendador es cobrar al subarrendatario directamente sin que haya una relación contractual entre ellos —esa relación es entre el arrendatario y el subarrendatario.

## En resumen

El subarriendo en Chile no está prohibido per se, pero requiere la autorización del arrendador salvo que el contrato lo permita de forma expresa. Tanto el subarriendo total como el parcial tienen riesgos para ambas partes: el arrendador puede perder el control de quién ocupa su propiedad, y el arrendatario sigue siendo responsable de todo lo que ocurra aunque no sea él quien viva ahí. En el caso de los arriendos por días tipo Airbnb, hay que sumar las restricciones del reglamento de copropiedad del edificio, que pueden prohibirlos independientemente de lo que diga el contrato.

Si vas a subarrendar, hazlo con papel: autorización por escrito, contrato firmado y acta de entrega documentada. [Crea tu acta de entrega en CertiFoto](/dashboard) antes de que el subarrendatario entre al inmueble —es gratis y te da el respaldo que necesitas si las cosas se complican.

## Preguntas frecuentes

### ¿Necesito autorización del arrendador para subarrendar?

Depende de lo pactado. Si el contrato lo prohíbe o exige autorización, subarrendar sin ella puede ser causal de término del arriendo. Si nada dice, conviene igual pedir autorización por escrito para evitar conflictos. Lo seguro es siempre dejar el acuerdo documentado.

### ¿Qué riesgos corro si subarriendo sin permiso?

El principal es perder el contrato: el arrendador puede pedir el término por incumplimiento. Además, sigues respondiendo frente al arrendador por las obligaciones del contrato original, incluido el estado del inmueble y la renta, aunque quien lo ocupe sea el subarrendatario.

### ¿Cómo formalizo bien un subarriendo?

Con la autorización escrita del arrendador y un contrato de subarriendo entre arrendatario y subarrendatario que individualice a las partes y el inmueble. Conviene hacer un acta de entrega con fotos al subarrendatario, porque tú sigues siendo responsable del estado de la propiedad frente al dueño.

### ¿Quién responde por los daños en un subarriendo?

Frente al arrendador, responde el arrendatario original conforme al contrato principal. A su vez, el subarrendatario responde frente al arrendatario según el contrato de subarriendo. Tener actas de entrega en ambos niveles permite atribuir los daños a quien corresponda y proteger las garantías.`,
  },
  {
    slug: "mascotas-en-arriendo-puede-prohibir",
    title: "¿Puede el arrendador prohibir mascotas en el arriendo?",
    excerpt: "Sí, las mascotas arriendo chile pueden prohibirse en el contrato. Conoce qué dice la Ley 21.020, el reglamento de copropiedad y cómo protegerte de cobros injustos.",
    date: "2026-05-25",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 6,
    content: `## La pregunta que muchos arrendatarios se hacen al buscar departamento

Buscar arriendo con mascotas en Chile puede ser una odisea. Muchos propietarios prefieren no arriesgar, los avisos dicen "sin mascotas" y los arrendatarios con animales se ven en aprietos. Pero ¿qué dice la ley realmente? ¿Puede el arrendador prohibirte tener mascotas o tiene límites?

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

La respuesta corta es: sí, el arrendador puede establecer restricciones sobre mascotas en el contrato, y eso es legal. Pero el tema es más matizado de lo que parece, porque entran en juego la Ley 21.020 de Tenencia Responsable de Mascotas y Animales de Compañía, el contrato de arriendo y el reglamento de copropiedad del edificio.

## La libertad contractual: lo que se pacta, vale

En el arriendo de inmuebles en Chile rige el principio de libertad contractual: las partes pueden acordar las condiciones que estimen convenientes, siempre que no sean contrarias a la ley o las buenas costumbres. Eso significa que el arrendador puede incluir una cláusula que prohíba mascotas, y si el arrendatario la firma, queda obligado a respetarla.

Lo mismo aplica en sentido contrario: si el contrato permite expresamente tener mascotas —o no dice nada sobre el tema— el arrendador no puede venir después a exigir que las saques sin un fundamento contractual claro.

Por eso, antes de firmar cualquier contrato, **revisa qué dice sobre mascotas**. Si tienes animales, pide que el permiso quede por escrito. Un "de palabra lo puedes tener" no tiene valor jurídico si después hay un conflicto.

Para entender qué cláusulas pueden ser abusivas o ilegales en un contrato, revisa la guía sobre [cláusulas abusivas en el contrato de arriendo](/blog/clausulas-abusivas-contrato-arriendo).

## ¿Qué dice la Ley 21.020 de Tenencia Responsable?

La Ley 21.020 regula la tenencia responsable de mascotas y animales de compañía en Chile. Un punto importante que genera confusión: esta ley establece derechos y deberes de los tenedores de animales, pero **no obliga a los arrendadores a aceptar mascotas en sus propiedades**.

Lo que sí establece la ley es que los animales de compañía no pueden ser sometidos a maltrato ni abandono. Pero eso no se traduce en un derecho del arrendatario a tener mascotas si el contrato las prohíbe.

Hay un matiz relevante con los animales de asistencia o apoyo emocional reconocidos médicamente. Aunque en Chile no existe aún una norma tan desarrollada como en otros países, es un área donde podría haber discusiones jurídicas. Para estos casos especiales, lo más prudente es consultar con un abogado.

## El reglamento de copropiedad: un actor adicional

Si arriendas en un edificio o condominio, hay una capa adicional que puede restringir la tenencia de mascotas: el reglamento de copropiedad. Este reglamento, regulado por la Ley 21.442 de Copropiedad Inmobiliaria, puede establecer restricciones sobre el tipo, tamaño o número de animales que se pueden tener en las unidades.

Estas restricciones se aplican a todos los residentes, ya sean propietarios o arrendatarios. Entonces, aunque tu contrato de arriendo diga que puedes tener mascotas, si el reglamento del edificio lo prohíbe, tienes un problema.

Como arrendatario, tienes derecho a conocer el reglamento de copropiedad antes de firmar el contrato. Pídelo. Como arrendador, es recomendable que le entregues ese documento al arrendatario y que las condiciones del contrato sean coherentes con lo que establece el reglamento.

## Daños causados por mascotas: quién responde

Uno de los principales temores de los arrendadores es el daño que pueden causar las mascotas: arañazos en pisos de madera, manchas en alfombras, marcas en puertas, olores difíciles de eliminar. ¿Quién paga eso?

La regla general es clara: el arrendatario es responsable de restituir la propiedad en el mismo estado en que la recibió, salvo el deterioro por uso normal. Si una mascota causa daños más allá del deterioro natural, el arrendatario debe responder por ellos.

Ahí es donde la garantía juega un papel clave. Si quieres entender cómo funciona y cuánto suele ser, revisa la guía sobre [la garantía de arriendo: cuánto es y cómo funciona](/blog/garantia-arriendo-cuanto-es-como-funciona).

El problema frecuente es la discusión sobre qué es daño atribuible a la mascota y qué es deterioro normal. Un piso rayado puede haberse rayado antes de que llegara el arrendatario, o puede ser consecuencia directa del perro. Sin documentación del estado inicial del inmueble, esa discusión no tiene cómo resolverse objetivamente.

## La importancia del acta de entrega cuando hay mascotas

Si eres arrendador y aceptas mascotas —o si eres arrendatario y tienes animales— el acta de entrega fotografiada y certificada es tu mejor aliado. Documentar el estado del inmueble antes de que entre la mascota (y el arrendatario) permite:

- Establecer una línea base objetiva del estado de pisos, puertas, muros y revestimientos.
- Distinguir entre deterioro preexistente y daño nuevo al momento de la devolución.
- Evitar discusiones sobre si los arañazos en el parquet ya estaban antes.

[Crea tu acta de entrega en CertiFoto](/dashboard) con fotos que quedan con hash SHA-256 y un certificado PDF verificable. Es gratis crear el acta; solo pagas si necesitas certificarla.

## Buenas prácticas para arrendadores y arrendatarios

### Si eres arrendador y aceptas mascotas

- Deja constancia en el contrato del tipo y número de animales permitidos.
- Considera pedir una garantía mayor (dentro de lo que permite la ley) para cubrir posibles daños.
- Documenta el estado del inmueble con un acta fotográfica antes de la entrega.
- Incluye en el contrato que el arrendatario debe reparar cualquier daño causado por sus animales antes de la restitución.

### Si eres arrendatario con mascotas

- Nunca asumas que está permitido si el contrato no lo dice. Pide autorización por escrito.
- Solicita el reglamento de copropiedad y léelo antes de firmar.
- Documenta el estado en que recibiste el inmueble para protegerte de cobros injustos al salir.
- Mantén al día las vacunas y el registro de tu animal: es una obligación legal de la Ley 21.020 y puede ser relevante si hay un incidente.
- Repara cualquier daño causado por tus animales antes de devolver el inmueble.

## ¿Qué pasa si el arrendatario tiene mascotas pese a la prohibición?

Si el contrato prohíbe mascotas y el arrendatario las tiene de todas formas, el arrendador puede tener fundamentos para solicitar el término del contrato por incumplimiento. También puede existir responsabilidad por los daños que los animales hayan causado.

Dicho eso, la vía judicial para terminar un arriendo no es rápida ni sencilla. El camino más recomendable —si eres arrendador— es conversar primero, dejar constancia escrita del incumplimiento y, si el problema persiste, asesorarte con un abogado.

## En resumen

El arrendador puede prohibir mascotas en el contrato de arriendo, y esa cláusula es válida. La Ley 21.020 de Tenencia Responsable no obliga a los propietarios a aceptar animales en sus inmuebles. Además, el reglamento de copropiedad del edificio puede añadir restricciones adicionales que aplican a todos los residentes.

Cuando hay mascotas de por medio, la documentación del estado del inmueble es fundamental para evitar conflictos al momento de devolver la propiedad. Un acta fotográfica al inicio y al término del arriendo es la forma más concreta de proteger los intereses de ambas partes.

## Preguntas frecuentes

### ¿Puede el arrendador prohibir mascotas en el contrato?

Sí. Las partes pueden pactar que no se admitan mascotas o que se acepten bajo condiciones. Si el contrato lo prohíbe y el arrendatario igualmente las tiene, puede configurarse un incumplimiento. Por eso conviene aclarar este punto antes de firmar.

### ¿El reglamento de copropiedad puede impedir tener mascotas?

El reglamento de copropiedad regula la convivencia en el edificio y puede establecer condiciones sobre mascotas en espacios comunes. Conviene revisarlo junto con el contrato, porque las reglas del condominio aplican aunque el contrato de arriendo no diga nada al respecto.

### ¿La Ley 21.020 me protege frente a un cobro por daños del animal?

La Ley 21.020 (tenencia responsable de mascotas) establece deberes del dueño del animal, incluida la responsabilidad por los daños que cause. En un arriendo, eso significa que el arrendatario responde por los deterioros provocados por su mascota que excedan el desgaste normal, los que deben acreditarse.

### ¿Cómo evito cobros injustos por una mascota al final del arriendo?

Documentando el estado del inmueble al inicio con un acta de entrega y fotos, y otra al devolver. Así se distingue el desgaste normal de un daño atribuible a la mascota. Sin ese registro, la discusión sobre qué deterioro existía antes queda entregada a la apreciación del tribunal.`,
  },
  {
    slug: "aval-codeudor-solidario-arriendo",
    title: "Aval y codeudor solidario en el arriendo: qué son y qué riesgos implican",
    excerpt: "El codeudor solidario arriendo responde igual que el arrendatario principal, sin beneficio de excusión. Entiende el alcance real antes de firmar o pedirlo a alguien.",
    date: "2026-05-24",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 7,
    content: `## Cuando el banco de datos no alcanza: la búsqueda del codeudor

Al postular a un arriendo en Chile, hay algo que muchos arrendatarios descubren tarde: que el propietario o la corredora pide un codeudor solidario o un aval. Para quienes buscan su primer departamento, o quienes no tienen historia de arriendo comprobable, es una exigencia común que puede complicar el proceso.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

Entender qué es exactamente lo que estás firmando —o pidiendo que alguien firme por ti— es fundamental antes de avanzar. La diferencia entre un fiador simple y un codeudor solidario no es menor: en la práctica, implica obligaciones distintas y riesgos muy diferentes para quien presta su nombre.

## Fiador, aval y codeudor solidario: ¿no es lo mismo?

En el lenguaje cotidiano, estos términos se usan de forma intercambiable. En el ámbito legal, hay diferencias importantes.

### El fiador o aval simple

En términos generales, el fiador es quien garantiza el cumplimiento de una obligación ajena. Sin embargo, en la fianza clásica del Código Civil existe un "beneficio de excusión": el fiador puede exigir que primero se persigan los bienes del deudor principal antes de ir contra él. Es decir, el acreedor debe intentar cobrarle al arrendatario primero.

### El codeudor solidario

Es una figura distinta y más exigente. El codeudor solidario responde exactamente igual que el deudor principal, sin beneficio de excusión. Si el arrendatario no paga, el arrendador puede ir directamente contra el codeudor solidario sin necesidad de haber intentado cobrarle al arrendatario primero.

En los contratos de arriendo en Chile, lo que se pide habitualmente es precisamente esto: un **codeudor solidario**, no un fiador simple. Quien firma como codeudor solidario asume la obligación de la misma forma que si fuera el propio arrendatario.

## ¿De qué responde el codeudor solidario?

Esta es la parte que muchas personas no entienden del todo al firmar. El codeudor solidario no responde solo por las rentas impagas: en muchos contratos, la solidaridad se extiende a todas las obligaciones del contrato, lo que puede incluir:

- Rentas atrasadas e intereses.
- Gastos comunes pendientes si el contrato así lo establece.
- Daños al inmueble que el arrendatario no repare.
- Costos del proceso judicial si llega a esa instancia.

El alcance exacto depende de cómo esté redactado el contrato. Por eso es clave que quien va a firmar como codeudor lea el contrato completo, no solo el párrafo que lo menciona a él.

Si eres arrendador y quieres saber qué documentos pedir antes de cerrar el trato, revisa la guía sobre [documentos para hacer el screening del arrendatario](/blog/documentos-pedir-arrendatario-screening).

## ¿Cuándo los arrendadores exigen codeudor solidario?

La exigencia de codeudor solidario es más frecuente en ciertos perfiles de arrendatarios:

- **Primer trabajo o contrato a plazo fijo**: cuando los ingresos no están consolidados o la estabilidad laboral no está acreditada.
- **Trabajadores independientes o por honorarios**: cuyos ingresos son variables y más difíciles de verificar.
- **Estudiantes universitarios**: sin historial crediticio ni de arriendo.
- **Personas con Dicom u otras deudas registradas**: cuya evaluación financiera genera dudas.
- **Arrendatarios extranjeros recién llegados**: que no tienen historial en Chile.

No hay una norma que obligue al arrendador a exigirlo ni al arrendatario a conseguirlo. Es una condición del contrato que ambas partes pueden negociar.

## Los riesgos reales para quien firma como codeudor

Ser codeudor solidario es una decisión financiera y legal de peso. Quien lo hace debe saber que:

1. **Su Dicom puede verse afectado**: si el arrendatario no paga y el arrendador inicia acciones de cobro, el codeudor puede quedar registrado en bases de datos de morosidad.
2. **Puede ser demandado directamente**: sin que el arrendador haya agotado primero las vías contra el arrendatario.
3. **Su capacidad de endeudamiento se reduce**: los bancos y financieras pueden considerar esta obligación al evaluar su perfil crediticio.
4. **La relación personal puede deteriorarse**: si el arrendatario deja de pagar y el codeudor termina respondiendo, la amistad o vínculo familiar que llevó a firmar puede quedar dañada.

Para entender qué pasa cuando un arrendatario no paga y cuáles son las opciones reales del arrendador, la guía sobre [qué hacer si el arrendatario no paga](/blog/arrendatario-no-paga-que-hacer) explica el proceso con detalle.

## ¿Qué alternativas existen al codeudor solidario?

Si no tienes quién firme como codeudor o prefieres no involucrar a un tercero, hay alternativas que algunos arrendadores aceptan:

### Garantía mayor

Ofrecer dos o tres meses de garantía en vez de uno puede dar al arrendador una mayor seguridad sin necesidad de involucrar a una tercera persona. Eso sí, el arrendador no está obligado a aceptar esta alternativa.

### Seguros de arriendo

Existen productos de seguro en el mercado chileno que cubren al arrendador en caso de impago o daños. Si el arrendatario contrata uno de estos seguros, puede ser un argumento para prescindir del codeudor. Algunos arrendadores y corredoras ya los exigen como práctica estándar.

### Demostrar solidez financiera con documentos

En algunos casos, presentar documentación más completa —liquidaciones de sueldo de varios meses, contrato de trabajo indefinido, certificado de AFP o Dicom positivo— puede convencer al arrendador de prescindir del codeudor.

## Consejos prácticos si te piden ser codeudor

- **Lee el contrato completo antes de firmar**: no solo el párrafo que te menciona.
- **Pregunta el alcance exacto de la solidaridad**: ¿responde solo por arriendos o también por daños?
- **Evalúa la solidez del arrendatario principal**: ¿tiene trabajo estable? ¿tiene historial de arriendo? ¿confías en que pagará?
- **Considera el plazo del contrato**: firmar como codeudor por un contrato de 24 meses tiene más exposición que uno de 12.
- **Consulta a un abogado si tienes dudas**: la obligación que estás asumiendo puede tener consecuencias patrimoniales reales.

## En resumen

El codeudor solidario en un arriendo es una figura legal que implica asumir la misma responsabilidad que el arrendatario principal, sin posibilidad de pedir que primero se cobre a él. No se trata solo de "poner el nombre": quien firma puede enfrentar demandas directas, ver afectado su historial crediticio y responder por rentas, daños y costos judiciales.

Si te lo piden como condición para arrendar, evalúa bien antes de pedírselo a alguien. Y si eres tú quien firma como codeudor, lee el contrato de principio a fin y entiende exactamente de qué te estás haciendo responsable. Documentar el estado del inmueble al inicio del arriendo —con un acta certificada— también protege al codeudor, porque fija en un registro objetivo qué había antes y qué daños podrían cargársele. [Crea el acta en CertiFoto](/dashboard) antes de que el arrendatario entre al inmueble.

## Preguntas frecuentes

### ¿Qué significa ser codeudor solidario en un arriendo?

Significa obligarse a responder por las mismas deudas del arrendatario (rentas, cuentas, daños) como si fueras tú quien arrienda. El arrendador puede cobrarte el total directamente, sin tener que perseguir primero al arrendatario, porque la solidaridad elimina el beneficio de excusión.

### ¿Hay diferencia entre aval y codeudor solidario?

En la práctica del arriendo, ambos términos suelen usarse para reforzar el cumplimiento, pero el codeudor solidario queda obligado de forma directa y por el total. Lo determinante es cómo esté redactada la cláusula: conviene leer exactamente a qué te obligas antes de firmar.

### ¿Hasta cuándo responde el codeudor solidario?

Responde mientras esté vigente la obligación que garantizó, según lo que diga el contrato. Si el arriendo se prorroga o renueva, conviene verificar si la garantía personal se mantiene o no, porque a veces se discute si cubre los nuevos periodos.

### ¿Qué debo revisar antes de firmar como codeudor?

Revisa el monto y tipo de obligaciones que garantizas, el plazo, si cubre renovaciones y si tu responsabilidad es solidaria. Como respondes con tu propio patrimonio, conviene exigir copia del contrato y, si tienes dudas, consultar con un abogado antes de comprometerte.`,
  },
  {
    slug: "comision-corredor-propiedades-arriendo",
    title: "Comisión del corredor de propiedades en un arriendo: cuánto y quién paga",
    excerpt: "Todo sobre la comisión corredor de propiedades arriendo en Chile: cuánto es, quién paga, qué incluye el servicio y qué debe decir la orden de corretaje.",
    date: "2026-05-23",
    author: "Equipo CertiFoto",
    category: "Dinero",
    readMinutes: 6,
    content: `Cuando se arrienda una propiedad con la intermediación de un corredor, surge una pregunta que tanto propietarios como arrendatarios se hacen: ¿cuánto es la comisión y quién la paga? La respuesta corta es que depende de lo que acuerden las partes, pero hay una práctica de mercado bastante extendida en Chile. Esta guía te explica cómo funciona.

## ¿Qué hace un corredor de propiedades en un arriendo?

Un corredor de propiedades actúa como intermediario entre el propietario y el potencial arrendatario. Su servicio habitualmente incluye:

- Asesorar al propietario en la fijación del precio de mercado.
- Preparar la publicación del inmueble con fotos y descripción.
- Difundir el aviso en portales y redes de contactos.
- Coordinar y realizar las visitas con interesados.
- Hacer un filtro inicial de candidatos.
- Apoyar en la revisión y redacción del contrato.
- Acompañar en la firma y, en algunos casos, en la entrega del inmueble.

El nivel de servicio varía según el corredor y lo que se haya acordado. Algunos ofrecen un servicio más completo que incluye administración posterior; otros solo cubren la intermediación hasta la firma del contrato. Antes de contratar, aclara exactamente qué está incluido.

## ¿Cuánto es la comisión?

La comisión de un corredor de propiedades en Chile **no está regulada por ley**: es un acuerdo entre las partes. Sin embargo, existe una **práctica de mercado ampliamente extendida** que sirve como referencia:

> La práctica habitual en el mercado chileno es cobrar alrededor del 50% de un mes de arriendo más IVA a cada parte (propietario y arrendatario), lo que equivale a un mes de arriendo total entre ambos. Esto es una convención de mercado, no una obligación legal.

Dicho esto, los montos pueden variar. Algunos corredores cobran menos si la propiedad es de alto valor (porque el monto absoluto ya es significativo) o más si el proceso de búsqueda es largo o complejo. Hay corredores que cobran solo al propietario, otros que dividen el costo, y en algunos casos la negociación lleva a que una de las partes asuma el total.

### El IVA sobre la comisión

El IVA (actualmente del 19%) aplica sobre la comisión del corredor, ya que se trata de un servicio gravado. Es decir, si la comisión base es el 50% de un mes de arriendo, el monto final con IVA es ese 50% más el 19% de ese valor. Este costo adicional debe quedar claro antes de firmar la orden de corretaje.

## ¿Quién paga la comisión?

Como se mencionó, no hay regla fija. Lo más común en Chile es que tanto el propietario como el arrendatario paguen una parte proporcional (el 50% cada uno en la práctica habitual). Sin embargo, en contextos de alta demanda o cuando el propietario tiene urgencia, puede ocurrir que el propietario asuma el total para hacer la propiedad más atractiva.

Lo importante es que esta condición quede **acordada desde el inicio, por escrito**, antes de que el corredor comience su trabajo.

## La orden de corretaje: el documento que regula el acuerdo

Antes de que el corredor empiece a trabajar contigo como propietario, deberías firmar una **orden de corretaje**. Este es el documento que formaliza la relación entre tú y el corredor, y debe indicar:

- Los datos del inmueble a arrendar.
- El precio de arriendo objetivo.
- El monto y condiciones de la comisión.
- El plazo de exclusividad (si aplica).
- Las condiciones de término del acuerdo si no se concreta el arriendo.

Si el corredor no te ofrece una orden de corretaje, pídesela. Trabajar sin ese documento te deja expuesto a cobros inesperados o disputas sobre lo acordado.

### ¿Qué pasa si no se concreta el arriendo?

Si el proceso no llega a la firma del contrato, en general el corredor no cobra comisión (su pago está condicionado al éxito de la gestión). Pero esto debe quedar explícito en la orden de corretaje. Algunos corredores cobran por visitas o por publicación; si ese es el caso, debe estar acordado de antemano.

## ¿Qué exigir a un buen corredor?

No todos los corredores operan con el mismo estándar. Algunos puntos que deberías verificar antes de contratar:

1. **Que esté asociado o certificado**: la Asociación Chilena de Corredores de Propiedades (ACOP) u otras organizaciones del sector tienen registros de profesionales. No es obligatorio estar asociado para ejercer, pero es una señal de seriedad.
2. **Referencias o historial de operaciones anteriores**: pide ejemplos de propiedades que haya intermediado recientemente.
3. **Claridad en las condiciones económicas**: una comisión clara desde el inicio, sin cobros sorpresa.
4. **Comunicación fluida**: un buen corredor te mantiene informado del avance, las visitas realizadas y el perfil de los interesados.
5. **Conocimiento del sector**: alguien que conoce bien el mercado de tu comuna puede hacer la diferencia en el precio y el tiempo de colocación.

## ¿Conviene usar un corredor o arrendar directamente?

Depende de tu disponibilidad y experiencia. Un corredor tiene acceso a una red de contactos y portales, hace el filtro de candidatos y te ahorra tiempo. Si es tu primera vez arrendando o no tienes tiempo para coordinar visitas y revisar documentos, puede ser una inversión que se justifica.

Si decides arrendar sin corredor, asegúrate de cubrir bien todos los pasos del proceso: desde la publicación hasta la firma del contrato y el acta de entrega. Nuestra guía sobre [cómo arrendar tu departamento por primera vez](/blog/arrendar-departamento-primera-vez-guia) te lleva por cada etapa con detalle.

## El corredor no reemplaza un buen contrato ni el acta de entrega

Aunque el corredor puede apoyar en la redacción del contrato, recuerda que es responsabilidad tuya asegurarte de que el documento proteja tus intereses. Revisa nuestra guía sobre [qué incluir en el contrato de arriendo](/blog/contrato-arriendo-que-incluir-modelo) para no dejar cabos sueltos.

Y el día de la entrega de las llaves, tanto si trabajaste con corredor como si arrendaste directamente, no olvides hacer el acta de entrega con fotos y firma de ambas partes. En [CertiFoto](/dashboard) puedes crear el acta gratis y certificarla con respaldo forense (hash SHA-256 + PDF verificable) si quieres máxima protección ante posibles disputas al término del contrato.

## En resumen

La comisión del corredor de propiedades en un arriendo en Chile no está fijada por ley, pero la práctica de mercado habitual es alrededor del 50% de un mes de arriendo más IVA a cada parte. El monto, las condiciones y quién paga deben quedar por escrito en una orden de corretaje antes de que el corredor empiece a trabajar. Exige transparencia desde el inicio, verifica las credenciales del corredor, y asegúrate de que el servicio incluya lo que realmente necesitas.

## Preguntas frecuentes

### ¿Cuánto cobra normalmente un corredor por gestionar un arriendo?

El monto lo acuerdan las partes con el corredor; en el mercado suele expresarse como un porcentaje de la renta o un equivalente a un mes. No hay una tarifa única fijada por ley, por lo que conviene dejar el monto y la forma de cobro por escrito en la orden de corretaje.

### ¿Quién paga la comisión, el arrendador o el arrendatario?

Depende de lo pactado. En la práctica puede pagarla una de las partes o repartirse, según lo que acuerden con el corredor. Lo importante es que quede claro antes de cerrar el negocio para evitar reclamos sobre quién asume el costo.

### ¿Qué debe incluir la orden de corretaje?

Debe individualizar a las partes y la propiedad, describir el servicio, indicar el monto de la comisión, quién la paga y en qué momento se devenga. Un documento claro evita discusiones posteriores sobre si el corredor cumplió y sobre cuánto se le debe.

### ¿Tengo que pagar comisión si el negocio no se concreta?

Por lo general la comisión se devenga cuando el corredor logra el resultado encargado (el arriendo cerrado), salvo que la orden de corretaje diga otra cosa. Por eso conviene leer en qué momento nace la obligación de pago antes de firmar el encargo.`,
  },
  {
    slug: "derechos-deberes-arrendatario-chile",
    title: "Derechos y deberes del arrendatario en Chile",
    excerpt: "Conoce los derechos del arrendatario chile: goce pacífico, reparaciones, devolución de garantía y privacidad, más los deberes que la ley y el contrato te imponen.",
    date: "2026-05-21",
    author: "Equipo CertiFoto",
    category: "Legal",
    readMinutes: 8,
    content: `## Conocer tus derechos puede ahorrarte muchos problemas

Arrendar una propiedad en Chile implica entrar en una relación jurídica regulada principalmente por el Código Civil y la Ley 18.101, que rige los arrendamientos urbanos. Muchos conflictos entre arrendadores y arrendatarios surgen precisamente porque alguna de las partes no sabe bien cuáles son sus derechos y cuáles sus obligaciones.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

Esta guía repasa los derechos y deberes más relevantes del arrendatario en Chile, con el marco legal que los respalda.

## Derechos del arrendatario

### 1. Goce pacífico del inmueble

Uno de los derechos fundamentales del arrendatario es el uso y goce tranquilo del bien arrendado durante todo el plazo del contrato. Eso significa que el arrendador no puede entrar al inmueble sin el consentimiento del arrendatario, ni perturbarlo en su uso, ni intentar presionarlo para que se vaya antes del término pactado.

El arrendador tampoco puede cortar los suministros básicos (agua, luz, gas) como mecanismo de presión para que el arrendatario abandone la propiedad. Esa práctica, además de ser un incumplimiento del contrato, puede tener consecuencias legales para el arrendador.

### 2. Que el arrendador realice las reparaciones necesarias

El arrendador tiene la obligación de mantener el inmueble en condiciones de ser habitado y de hacer las reparaciones que no sean de cargo del arrendatario. Estas se llaman "reparaciones necesarias" o "de conservación": aquellas indispensables para que el inmueble sirva para el fin para el que fue arrendado.

Si el arrendador se niega a hacer reparaciones que le corresponden, el arrendatario puede tener derecho a exigirlas judicialmente o incluso a descontar su costo del arriendo bajo ciertas condiciones. Para entender bien qué mantenciones corresponden a cada parte, revisa la guía sobre [mantenciones: qué le corresponde al arrendatario y qué al arrendador según la ley](/blog/mantenciones-arrendatario-arrendador-ley-chile).

### 3. Devolución íntegra de la garantía

Al término del contrato, el arrendatario tiene derecho a recuperar la garantía que pagó al inicio, siempre que haya cumplido con sus obligaciones: pagar la renta, restituir el inmueble en buenas condiciones y no tener deudas de servicios o gastos comunes.

El arrendador no puede retener la garantía por deterioros que sean consecuencia del uso normal del inmueble —eso se conoce como "desgaste natural". Solo puede retener o descontar montos por daños que excedan ese desgaste normal o por rentas impagas.

Para entender cómo funciona la devolución y qué pasa si hay disputas, la guía sobre [la garantía de arriendo: cuánto es y cómo funciona](/blog/garantia-arriendo-cuanto-es-como-funciona) tiene los detalles del proceso.

### 4. Privacidad y aviso previo antes de visitas o inspecciones

El inmueble que arriendas es tu hogar. El arrendador no tiene derecho a entrar cuando quiera, ni a hacer visitas sorpresa sin tu autorización. Si el arrendador quiere inspeccionar la propiedad, mostrarla a posibles nuevos arrendatarios o hacer reparaciones, debe coordinarlo contigo con tiempo razonable.

Aunque la ley no establece un plazo exacto de aviso, la práctica habitual en Chile y los estándares de respeto a la privacidad implican notificarte con al menos 24 a 48 horas de anticipación. Si el contrato establece un plazo distinto, ese es el que aplica. Revisar el contrato siempre es el primer paso.

### 5. Recibir el inmueble en condiciones habitables

El arrendador debe entregar la propiedad en condiciones de ser usada para el fin pactado. Si hay problemas estructurales, instalaciones que no funcionan, o problemas de habitabilidad evidentes, el arrendatario puede exigir que se resuelvan antes de la entrega efectiva o en un plazo acordado.

## Deberes del arrendatario

### 1. Pagar la renta a tiempo

El deber más básico: pagar el arriendo en el plazo y forma establecidos en el contrato. En Chile, la renta se paga usualmente de forma mensual. Si el contrato dice que hay que pagar los primeros cinco días de cada mes, hay que cumplirlo.

El no pago de la renta es la causal más frecuente de término de arriendo y de juicios de arrendamiento. Dos o más meses impagos suelen dar al arrendador fundamentos para iniciar un proceso de desahucio.

### 2. Cuidar la propiedad

El arrendatario debe usar el inmueble con la diligencia que corresponde a un buen padre de familia —esa es la expresión que usa el Código Civil. En términos prácticos: no hacer modificaciones no autorizadas, no sobrecargar la capacidad del inmueble, y en general, tratar la propiedad como propia.

Si el arrendatario causa daños por mal uso —más allá del deterioro natural— debe responder por ellos. Esta es una discusión frecuente al momento de la devolución del inmueble, y la mejor forma de resolverla es contar con documentación fotográfica del estado inicial.

### 3. Hacer las reparaciones locativas

La ley establece que ciertas reparaciones menores —llamadas locativas— son de cargo del arrendatario. Estas corresponden típicamente a los deterioros que se producen por el uso ordinario del inmueble: desperfectos pequeños de pintura, llaves o grifos que gotean por desgaste de uso, chapa de una puerta que no cierra bien, entre otros.

La distinción entre reparaciones locativas (del arrendatario) y reparaciones de conservación (del arrendador) no siempre es obvia. Si hay duda, lo más prudente es consultarlo antes de actuar para evitar que el arrendador diga que interviniste sin autorización o que el arrendatario alegue que el arrendador no cumplió. Para explorar esta distinción con más detalle, la guía sobre [mantenciones: qué le corresponde a cada parte](/blog/mantenciones-arrendatario-arrendador-ley-chile) es un buen punto de partida.

### 4. No cambiar el destino del inmueble

Si arrendaste para uso habitacional, no puedes usar el inmueble como bodega comercial, como local de ventas, o para cualquier otro fin distinto al pactado. El uso debe ser el que establece el contrato. Si quieres hacer actividades adicionales en el inmueble —como trabajar desde casa con clientes que llegan al departamento, por ejemplo— conviene aclararlo con el arrendador.

### 5. Respetar el reglamento de copropiedad

Si el inmueble está en un edificio o condominio, el arrendatario también debe cumplir el reglamento de copropiedad. Eso incluye normas de convivencia, uso de áreas comunes, restricciones de ruidos, reglas sobre mascotas, estacionamientos, entre otras. El incumplimiento del reglamento no solo puede generar conflictos con los vecinos: también puede ser un motivo de incumplimiento del contrato de arriendo.

### 6. Restituir el inmueble al término del contrato

Al final del arriendo, el arrendatario debe devolver el inmueble en el mismo estado en que lo recibió, salvo el deterioro por uso normal. Esto implica dejar la propiedad limpia, con todos los elementos que estaban al inicio (llaves, controles, accesorios) y sin daños que excedan el desgaste natural.

El acta de entrega inicial es determinante en este momento: fija el estado de referencia desde el cual se evalúa si hubo deterioro adicional. Si no hay acta, la discusión se vuelve subjetiva y difícil de resolver.

[Crea tu acta de entrega en CertiFoto](/dashboard) antes de recibir o entregar el inmueble. Las fotos quedan con hash SHA-256 y el certificado PDF es verificable en cualquier momento: tienes respaldo objetivo del estado de la propiedad en esa fecha.

## Cláusulas que pueden limitar tus derechos: cuándo son abusivas

Algunos contratos incluyen cláusulas que intentan restringir derechos que la ley reconoce al arrendatario. Por ejemplo, cláusulas que eliminan el derecho a recibir la garantía de vuelta, que permiten al arrendador entrar al inmueble sin aviso, o que establecen multas desproporcionadas. Algunas de esas cláusulas pueden ser nulas o abusivas. Para identificarlas, revisa la guía sobre [cláusulas abusivas en contratos de arriendo](/blog/clausulas-abusivas-contrato-arriendo).

## En resumen

Como arrendatario en Chile tienes derechos sólidos: uso pacífico del inmueble, reparaciones de parte del arrendador cuando corresponda, devolución de la garantía y privacidad. Pero también tienes deberes: pagar a tiempo, cuidar la propiedad, hacer las reparaciones que te tocan y devolver el inmueble en buen estado.

Conocer este marco te pone en mejor posición para negociar, para exigir lo que te corresponde y para protegerte si surge un conflicto. Y documentar el estado del inmueble desde el primer día —con fotos certificadas y una fecha verificable— es la forma más concreta de respaldar tus derechos si las cosas se complican.

## Preguntas frecuentes

### ¿Cuáles son los derechos básicos del arrendatario en Chile?

Entre otros, el derecho al goce pacífico del inmueble, a que el arrendador realice las reparaciones necesarias, a la devolución de la garantía cuando corresponda y al respeto de su privacidad. La Ley 18.101 y las normas del Código Civil sobre arrendamiento sirven de base a estos derechos.

### ¿Puede el arrendador entrar al inmueble cuando quiera?

No. El arrendatario tiene derecho a usar la propiedad sin perturbaciones, por lo que el arrendador no puede ingresar sin aviso ni autorización, salvo lo que el contrato razonablemente permita (por ejemplo, visitas acordadas para reparaciones o para mostrarla al final del arriendo). Una cláusula que autorice el ingreso libre y sin aviso es cuestionable.

### ¿Qué deberes tiene el arrendatario?

Pagar la renta y las cuentas pactadas a tiempo, cuidar la propiedad como un buen administrador, hacer las reparaciones locativas que le corresponden, no destinar el inmueble a un uso distinto al autorizado y restituirlo al término en el estado convenido, salvo el desgaste normal.

### ¿Cómo hago valer mis derechos si el arrendador no cumple?

Primero deja constancia escrita de tus reclamos (por ejemplo, por correo electrónico) para crear trazabilidad. Si no hay solución, puedes recurrir al Juzgado de Policía Local o al tribunal competente según el caso. Tener evidencia fechada y documentos ordenados fortalece tu posición.`,
  },

  {
    slug: "que-hacer-si-arrendatario-niega-danos",
    title: "¿Qué hacer si el arrendatario niega los daños? Guía paso a paso para arrendadores",
    excerpt:
      "La frase más temida al cierre de un arriendo: 'eso ya estaba así'. Te explicamos cómo documentar, comunicar y recuperar los costos cuando hay disputas de daños.",
    date: "2026-06-05",
    author: "Equipo CertiFoto",
    category: "Guías",
    readMinutes: 8,
    content: `Terminó el arriendo, recorriste la propiedad y encontraste daños que no estaban al inicio: una quemadura en la cubierta de la cocina, una mancha profunda en la alfombra, el espejo del baño partido. Le comentas al arrendatario y escuchas la frase más frecuente en arriendos chilenos: "eso ya estaba así cuando llegué".

En ese momento tienes dos opciones: resignarte y devolver la garantía completa, o tener la evidencia para respaldar el descuento.

Esta guía explica qué hacer cuando el arrendatario niega los daños, desde la primera conversación hasta el Juzgado de Policía Local si es necesario.

## Por qué la negación suele funcionar sin documentación

Cuando no hay acta de entrega con fotos respaldadas, la disputa es palabra contra palabra. Y en esas condiciones, el arrendatario tiene una ventaja estructural: no tiene que probar que el daño era preexistente; solo tiene que crear duda suficiente. El arrendador, en cambio, debe demostrar que el daño es nuevo.

Sin evidencia del estado inicial, esa demostración es casi imposible. La memoria humana es selectiva y poco confiable para este tipo de detalle, y los tribunales lo saben.

Si tienes un acta de entrega con fotos detalladas, timestamp confiable y hash de integridad, la situación se invierte: ahora es el arrendatario quien tiene que explicar la diferencia entre lo que muestra el acta y el estado actual.

## Antes de cualquier conversación: reúne la evidencia

Antes de confrontar al arrendatario, organiza tu evidencia. No es para intimidar, es para que la conversación sea sobre hechos, no sobre opiniones.

Lo que necesitas tener ordenado:

- El acta de entrega original con fotos del estado inicial.
- Fotos del estado actual, tomadas el día de la devolución.
- La lista específica de daños que estás imputando.
- Para cada daño: foto del estado inicial (del acta) vs. foto actual.

Si usaste CertiFoto u otra herramienta con hash criptográfico, cada foto del acta de entrega tiene su huella SHA-256, que demuestra que la imagen no fue alterada desde que se tomó. Eso hace muy difícil argumentar que "esa foto no es de cuando llegué".

Si tu acta es un Word con fotos pegadas, todavía sirve, pero es más fácil de cuestionar. Úsalo como base y complementa con emails o mensajes de esa época si los tienes.

## Paso 1: La conversación directa y documentada

Antes de descontar un peso, comunícate por escrito con el arrendatario. No basta con decírselo en persona o por teléfono.

Envía un correo o mensaje con al menos:

- La lista específica de los daños encontrados.
- Para cada daño, foto del estado inicial y foto actual.
- El monto estimado de reparación (con cotización si ya la tienes).
- Un plazo para responder (7 a 10 días es razonable).
- Una invitación a revisitar la propiedad juntos si quiere verificar.

El tono debe ser descriptivo, no acusatorio. "Se observa una quemadura de aproximadamente 8 cm en la cubierta de la cocina que no figura en el acta de entrega" es mucho más sólido que "destrozaste la cocina".

## Paso 2: La revisión conjunta (si acepta)

Si el arrendatario quiere revisar la propiedad, acepta. Hazlo con las fotos del acta de entrega en mano y compara cada punto en el lugar.

Algunas reglas prácticas para esta revisión:

- Lleva una copia impresa o digital del acta de entrega para comparar in situ.
- Documenta la revisión con fotos adicionales.
- Si hay acuerdo en algún punto, déjalo por escrito en el momento (incluso un mensaje de WhatsApp confirmando es mejor que nada).
- Si no hay acuerdo, déjalo registrado como punto en disputa.

No firmes nada bajo presión. Si el arrendatario propone soluciones o montos distintos, tienes derecho a pensarlo.

## Paso 3: Obtén cotizaciones formales

Para retener parte de la garantía debes justificar el monto con cotizaciones reales. No puedes inventar cifras ni usar precios de lista internos.

Busca al menos dos cotizaciones independientes para cada reparación. Las cotizaciones deben indicar:

- Descripción del trabajo.
- Materiales y mano de obra.
- Nombre del prestador y fecha.

Esto cumple dos funciones: justifica el monto ante el arrendatario, y es la prueba que necesitas si terminas en el JPL.

## Paso 4: Notificación formal de descuentos

Con la evidencia y las cotizaciones listas, envía una notificación formal por escrito al arrendatario antes de hacer cualquier descuento. El contenido mínimo:

- Detalle de cada daño con fotos comparativas.
- Monto descontado por ítem con justificación.
- Monto total de la garantía a devolver (si aplica descuento parcial).
- Plazo en que se hará el depósito.
- Adjunta las cotizaciones.

Envíalo por correo electrónico y guarda el comprobante. Si el arrendatario no responde, igual tienes constancia de que notificaste.

## La diferencia entre daño imputable y desgaste normal

Este punto es crítico, porque descontar por desgaste normal es uno de los errores más comunes y una de las causas frecuentes de reclamos en el JPL.

Daño imputable al arrendatario (puedes descontar):

- Quemaduras en cubierta de cocina o en pisos.
- Hoyos grandes en muros (más allá de marcas de clavos).
- Manchas profundas en alfombras o pisos que no responden a limpieza.
- Vidrios quebrados durante el arriendo.
- Muebles rotos o con daños que exceden el uso normal.
- Componentes faltantes que se entregaron (llaves, controles, electrodomésticos amoblados).

Desgaste normal (no puedes descontar):

- Pintura levemente amarillada o con marcas tenues de roce.
- Desgaste superficial de pisos flotantes por años de uso.
- Marcas leves de muebles en paredes o pisos.
- Ampolletas quemadas y consumibles menores.
- Grietas pequeñas por contracción térmica.
- Manchas de agua en tinas o lavamanos que responden a limpieza.

Si descontas por desgaste normal, el JPL suele fallar en contra del arrendador.

## Cuándo ir al Juzgado de Policía Local

Si no hay acuerdo después de notificar formalmente y el arrendatario reclama la devolución completa, el JPL es el tribunal competente. El proceso es:

- La demanda puede presentarla cualquiera de las partes (arrendador o arrendatario).
- No es obligatorio tener abogado para montos menores.
- El juicio es breve: un comparendo donde cada parte presenta su evidencia.
- El juez falla en base a los documentos y testimonios presentados.

Tu posición ante el JPL depende directamente de la calidad de tu evidencia: acta de entrega con fotos, cotizaciones de reparación, y la comunicación escrita con el arrendatario. Con esos tres elementos bien organizados, estás en buena posición.

Sin acta de entrega, la posición se debilita considerablemente. El JPL tiende a dar el beneficio de la duda al arrendatario en ausencia de prueba del estado inicial.

## Cómo evitarlo la próxima vez

La mejor prevención es una acta de entrega bien hecha antes de que el arrendatario ponga un pie en la propiedad. Si tienes fotos detalladas de cada ambiente, huellas digitales criptográficas de cada imagen y la firma de ambas partes en el mismo PDF, la conversación de "eso ya estaba así" simplemente no puede prosperar.

CertiFoto fue diseñado exactamente para esto: cada foto queda con su hash SHA-256 y metadata EXIF, y el PDF es auto-verificable. El arrendatario ve en el acta el estado inicial y no puede argumentar que fue alterado. Si quieres probar el flujo para tu próximo arriendo, puedes crear una acta gratis sin registrarte.

## En resumen

Cuando el arrendatario niega daños: organiza tu evidencia antes de hablar, comunícate por escrito, obtén cotizaciones formales, y notifica el descuento con detalle. El JPL es el último recurso, pero requiere evidencia sólida para prosperar. La mejor inversión es una acta de entrega bien hecha desde el primer día.

## Preguntas frecuentes

### El arrendatario dice "eso ya estaba así". ¿Cómo lo desmiento?

Con evidencia del estado inicial. Si tienes un acta de entrega con fotos fechadas al comienzo del arriendo y otra al momento de la devolución, puedes comparar y mostrar que el daño no existía antes. Sin ese registro, la afirmación queda como palabra contra palabra y el tribunal decide según la sana crítica.

### ¿Puedo descontar los daños directamente de la garantía?

Puedes imputar a la garantía los daños que excedan el desgaste normal, pero el descuento debe corresponder a deterioros reales y demostrables. Si el arrendatario los discute, conviene tener fotos, cotizaciones o boletas que respalden el monto, porque un descuento sin sustento puede terminar en reclamo ante el Juzgado de Policía Local.

### ¿Cómo debo comunicar los descuentos al arrendatario?

Por escrito y de forma detallada: qué daño, dónde, con qué evidencia y a qué costo. Enviarlo por un medio que deje constancia (correo electrónico) crea trazabilidad. Una comunicación clara y documentada reduce el conflicto y, si llega a tribunales, demuestra que actuaste de buena fe.

### ¿Qué hago si no llegamos a acuerdo por los daños?

Si la negociación no prospera, la vía es el Juzgado de Policía Local o el tribunal competente, donde presentarás tu evidencia. Por eso la documentación previa es decisiva: actas, fotos comparables y respaldos del costo de reparación son lo que inclina la balanza en una disputa de daños.`,
  },
  {
    slug: "como-recuperar-garantia-arriendo-chile",
    title: "Cómo recuperar la garantía de arriendo en Chile: plazos, derechos y pasos a seguir",
    excerpt:
      "El arrendador no te devuelve la garantía o te hace descuentos que no corresponden. Te explicamos qué dice la Ley 18.101, qué plazos tienes y cómo actuar.",
    date: "2026-05-30",
    author: "Equipo CertiFoto",
    category: "Guías",
    readMinutes: 7,
    content: `Terminaste el arriendo, devolviste la propiedad en buen estado y esperas que te devuelvan la garantía. Pasan los días y no llega nada. O llega un email con un listado de "daños" que nunca existieron. O te devuelven solo la mitad sin explicación.

Esta situación es más común de lo que debería ser. En esta guía te explicamos qué dice la ley, qué plazos rigen, qué hacer paso a paso y cuándo vale la pena ir al Juzgado de Policía Local.

## Lo que dice la Ley 18.101

La Ley 18.101 sobre arrendamiento de predios urbanos en Chile establece que el depósito de garantía debe devolverse en un plazo de 60 días contados desde la restitución del inmueble.

Ese es el plazo legal. No es "cuando el arrendador quiera" ni "una vez que revise todos los gastos". Son 60 días desde que entregaste las llaves.

El arrendador puede retener parte del depósito si:

- Hay daños imputables al arrendatario que excedan el desgaste normal por uso.
- Hay cuentas pendientes de servicios básicos que corresponden al período de arriendo.
- El contrato establece alguna condición específica justificada.

Lo que no puede descontar:

- Desgaste normal por uso adecuado (pintura envejecida, marcas leves, alfombra gastada por años).
- Reparaciones que corresponden al arrendador (filtraciones estructurales, fallas técnicas de electrodomésticos).
- Gastos de limpieza rutinaria si el departamento fue devuelto limpio.
- Montos inventados sin cotización que los respalde.

## Los primeros pasos cuando el plazo vence

Si llegaron los 60 días y no tienes respuesta:

**Paso 1 — Comunicación escrita.**
Envía un email o mensaje de texto al arrendador (o corredor) recordando el vencimiento del plazo y solicitando la devolución. Guarda el comprobante. Esto crea un registro de que reclamaste a tiempo.

**Paso 2 — Plazo adicional voluntario.**
En la práctica, muchos arriendos se resuelven con un poco más de tiempo y buena comunicación. Dale 5 a 7 días adicionales antes de escalar. Pero nunca en silencio: el reclamo escrito debe quedar.

**Paso 3 — Escalada formal.**
Si no hay respuesta o te ofrecen descuentos que no corresponden, tienes dos vías:

- SERNAC: puedes presentar un reclamo formal si el arrendador es una inmobiliaria o empresa. Para arrendadores particulares, el alcance de SERNAC es limitado.
- Juzgado de Policía Local (JPL): la vía más directa para conflictos entre particulares sobre garantías de arriendo.

## Cómo funciona el JPL para recuperar la garantía

El Juzgado de Policía Local es el tribunal que maneja conflictos de arriendo en Chile. Para iniciar el proceso:

- Puedes presentar la demanda directamente, sin necesidad de abogado para montos menores.
- La demanda debe ir al JPL de la comuna donde está el inmueble.
- Necesitas llevar: copia del contrato de arriendo, evidencia de la restitución del inmueble (fecha de entrega de llaves), evidencia de que solicitaste la devolución y no fue respondida, y cualquier documentación sobre el estado de la propiedad al devolver.

El proceso es relativamente rápido: se fija una audiencia, ambas partes presentan su posición, y el juez falla. Para montos bajos (hasta un par de meses de canon) no suele valer contratar abogado, pero para montos mayores puede ser conveniente.

**Importante:** si el arrendador propone descuentos que no corresponden, el JPL puede ordenar la devolución completa más intereses y costas si el juez considera que hubo mala fe. El registro de tus comunicaciones escritas vale mucho acá.

## Qué documentos necesitas tener listos

Para tener una posición sólida, ya sea para negociar o para ir al JPL, necesitas:

- Copia del contrato de arriendo (firmado por ambas partes).
- Recibo o comprobante del pago de la garantía al inicio del arriendo.
- Evidencia de la fecha en que entregaste las llaves (email de confirmación, mensaje, acta de devolución).
- Acta de entrega original si la tienen (prueba del estado inicial).
- Acta de devolución si se firmó al devolver (prueba del estado al terminar).
- Registro escrito de tus comunicaciones reclamando la garantía.

Si no tienes acta de entrega ni de devolución, la situación es más difícil pero no imposible. El contrato, los correos y testigos sirven como respaldo.

## Si el arrendador dice que hay daños que tú niegas

Esta es la variante más complicada. El arrendador retiene parte de la garantía alegando daños que tú crees que eran preexistentes o que corresponden a desgaste normal.

Qué hacer:

**1. Pide el detalle por escrito.** Tienes derecho a saber exactamente qué se descuenta y por qué. Si el arrendador se niega a enviarlo en detalle, eso ya te dice algo.

**2. Pide las cotizaciones.** El arrendador debe justificar los montos con cotizaciones reales. Cifras inventadas no son válidas.

**3. Compara contra el acta de entrega.** Si tienes el acta de entrega firmada al inicio, compara cada punto: si el "daño" ya estaba documentado como preexistente, no te pueden cobrar.

**4. Diferencia desgaste normal de daño imputable.** El arrendador no puede cobrarte por envejecimiento natural. Pintura amarillada en paredes antiguas, alfombra con desgaste homogéneo por años de uso, marcas suaves por mobilisado — eso es desgaste, no daño.

**5. Propón un monto de acuerdo.** Si hay daños reales mezclados con cobros injustificados, a veces conviene negociar un monto intermedio antes de ir a tribunales. El JPL toma tiempo, y para montos pequeños puede no valer la pena.

## La importancia del acta de devolución

Si no firmaste un acta de devolución el día que devolviste las llaves, el arrendador tiene más espacio para alegar daños que no existían. Si firmaste una, y queda registro del estado en que entregaste, esa es tu mejor defensa.

Idealmente el acta de devolución tiene:

- Fotos por ambiente del estado al devolver.
- Lecturas de medidores.
- Listado de llaves y controles entregados.
- Firma de ambas partes.

Sin eso, la conversación vuelve a ser palabra contra palabra, y en ausencia de prueba el tribunal tiende a buscar una solución intermedia que puede no favorecerte.

## Cómo prepararte para el próximo arriendo

Si ya pasaste por esto una vez, la mejor inversión para el próximo arriendo es un acta de devolución bien hecha. El mismo día que devuelves las llaves, documentas el estado de la propiedad por ambiente, con fotos que quedan respaldadas con hash criptográfico y timestamp verificable, y las firmas de ambas partes.

Con eso en mano, cualquier descuento posterior que no corresponda es fácil de refutar. Y cualquier arrendador razonable lo sabe.

CertiFoto te permite crear esa acta de devolución (o de entrega) gratis, sin registro previo. La certificación es solo si quieres el PDF formal con sello; el flujo de documentación base es completamente gratuito.

## En resumen

La Ley 18.101 te da 60 días de plazo. Reclama por escrito, guarda los comprobantes, y si no hay respuesta o los descuentos no corresponden, el JPL es tu vía. Para ir al JPL necesitas evidencia: contrato, comprobante de pago de garantía, registro de la restitución y ojalá un acta de devolución con fotos. La próxima vez, arma el acta de devolución el mismo día que devuelves las llaves.

## Preguntas frecuentes

### ¿En qué casos el arrendador puede retener mi garantía?

Puede retenerla, total o parcialmente, para cubrir rentas o cuentas impagas y daños que excedan el desgaste normal por uso. No procede retenerla por deterioro razonable de la propiedad ni por conceptos que no estén respaldados. Cualquier descuento debería poder justificarse con evidencia.

### ¿Qué dice la Ley 18.101 sobre la devolución de la garantía?

La Ley 18.101 regula el arrendamiento de predios urbanos y el marco general de la relación. La devolución de la garantía se rige por lo pactado y por estas reglas: si el arrendador retiene sin causa justificada, el arrendatario puede reclamar la restitución por la vía judicial correspondiente.

### ¿Qué hago si el arrendador no me devuelve la garantía?

Primero, requiérelo por escrito dejando constancia (por correo electrónico) y pide el detalle de cualquier descuento. Si no hay respuesta o los descuentos no corresponden, puedes demandar en el Juzgado de Policía Local. Llevar fotos del estado de entrega y devolución y los comprobantes de pago fortalece tu caso.

### ¿Cómo me aseguro de recuperar la garantía completa?

Documentando el estado del inmueble al inicio y al final con actas y fotos fechadas, pagando las cuentas al día y entregando la propiedad limpia y sin daños imputables. Mientras mejor sea tu evidencia del estado en que devolviste, menos margen hay para descuentos discutibles.`,
  },
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

Hacer una acta de entrega bien hecha no toma mucho más tiempo que hacerla mal, pero la diferencia se nota cuando llega el momento de devolver la propiedad. Una buena documentación al inicio es la mejor garantía para todas las partes.

## Preguntas frecuentes

### ¿Qué debe contener un acta de entrega de arriendo?

La individualización de las partes y del inmueble, una descripción del estado por ambiente (muros, pisos, baños, cocina), el inventario de bienes si está amoblado, las lecturas de medidores, las llaves y controles entregados, y fotos enumeradas que respalden cada punto. Cuanto más detalle, menos espacio para discutir al final.

### ¿Es obligatorio que el acta sea ante notario?

No es obligatorio. Un acta firmada por ambas partes ya tiene valor probatorio. El notario o un ministro de fe aporta una formalidad adicional, útil en propiedades de alto valor o cuando hay desconfianza, pero para la mayoría de los arriendos un acta bien hecha y firmada es suficiente.

### ¿Tiene validez un acta de entrega digital?

Sí. La Ley 19.799 reconoce validez a los documentos electrónicos, especialmente cuando incorporan elementos de integridad como hash y timestamp. Un acta digital bien estructurada suele aceptarse en el Juzgado de Policía Local, y su solidez técnica puede darle más peso que a un documento impreso.

### ¿Qué pasa si el arrendatario se niega a firmar el acta?

Si rechaza firmar, el acta pierde valor de mutuo acuerdo, pero conviene dejar constancia escrita de la negativa y enviar copia por un medio que deje trazabilidad antes de entregar las llaves. Lo prudente es no entregar la propiedad sin un acta firmada, porque sin ella se debilita la prueba del estado inicial.`,
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

La acta de entrega y la acta de devolución son documentos hermanos pero distintos. Hacer ambas bien y poder compararlas es lo que convierte el arriendo en un proceso ordenado en lugar de un terreno fértil para conflictos.

## Preguntas frecuentes

### ¿Cuál es la diferencia entre acta de entrega y acta de devolución?

El acta de entrega registra el estado del inmueble al inicio del arriendo, cuando el arrendador entrega las llaves. El acta de devolución registra el estado al término, cuando el arrendatario restituye la propiedad. Comparar ambas es lo que permite identificar qué cambió durante el arriendo.

### ¿Por qué necesito las dos actas y no solo una?

Porque una sola foto en el tiempo no prueba un cambio. La de entrega fija el punto de partida y la de devolución el punto final; sin las dos, es difícil sostener que un daño apareció durante el arriendo. Juntas, reducen al mínimo la discusión sobre la garantía.

### ¿Cómo deben compararse ambas actas?

Idealmente con la misma estructura por ambiente y fotos tomadas desde ángulos equivalentes, de modo que cada punto del inicio tenga su correlato al final. Mantener el mismo orden y nivel de detalle facilita ver diferencias reales y distinguir el desgaste normal del daño imputable.

### ¿Tienen el mismo valor legal una y otra?

Ambas tienen valor probatorio si están firmadas por las partes y bien documentadas. Si son digitales, la Ley 19.799 respalda su validez cuando incorporan integridad técnica. En una disputa, el tribunal valorará el conjunto de la evidencia según la sana crítica.`,
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

Si vas a documentar un arriendo, no basta con tomar fotos: hay que preservar su metadata y calcular su huella digital. Con eso, una foto se convierte en evidencia técnica sólida que es mucho más difícil de cuestionar que una simple imagen sin respaldo.

## Preguntas frecuentes

### ¿Basta con tomar fotos del inmueble para tener prueba?

No del todo. Una foto suelta prueba poco si no se puede acreditar cuándo se tomó y que no fue alterada. Para que tenga valor como evidencia conviene preservar la metadata (fecha, dispositivo) y, mejor aún, respaldarla con elementos de integridad como un hash y un timestamp verificables.

### ¿Por qué se pierde la metadata al enviar fotos por WhatsApp?

Porque las apps de mensajería suelen comprimir las imágenes y eliminar gran parte de los metadatos originales. Por eso una foto reenviada por chat pesa menos como prueba que el archivo original. Si necesitas compartir, envíala como "documento" o "archivo" para conservar el original.

### ¿Qué hace que una foto sea más sólida ante un tribunal?

Que se pueda demostrar su integridad y su fecha: el archivo original con su metadata, un hash que acredite que no se modificó y un timestamp que fije el momento. La Ley 19.799 respalda la validez de documentos electrónicos con estas características, y el tribunal los valora según la sana crítica.

### ¿Cómo organizo el respaldo fotográfico de un arriendo?

Toma fotos suficientes de cada ambiente al inicio y al final, consérvalas en su formato original y respáldalas con integridad técnica. Asociarlas a un acta de entrega y de devolución, ordenadas por ambiente, convierte un conjunto de imágenes en evidencia útil para discutir daños y garantía.`,
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

La IA puede hacer que documentar un arriendo sea mucho más rápido y ordenado, pero no reemplaza el ojo humano ni el criterio de las partes. Bien usada, es una ayuda enorme. Mal entendida, puede generar falsas certezas. En CertiFoto la usamos siempre como asistencia, nunca como juicio.

## Preguntas frecuentes

### ¿Para qué sirve la inteligencia artificial en un acta de arriendo?

Puede ayudar a describir lo que aparece en las fotos, ordenar la evidencia por ambiente y revisar que no falten registros importantes. Es una herramienta de apoyo que agiliza la redacción del acta, no un sustituto del criterio de las partes ni de la inspección presencial.

### ¿La IA reemplaza el acta firmada por las partes?

No. El valor probatorio del acta proviene de que las partes la firmen y de la evidencia que la respalda (fotos con integridad, lecturas, inventario). La IA puede facilitar el proceso, pero la conformidad de arrendador y arrendatario sigue siendo lo que le da fuerza al documento.

### ¿Qué límites tiene usar IA para documentar daños?

La IA puede equivocarse al interpretar una imagen o pasar por alto un detalle, por lo que sus descripciones deben revisarse. La decisión sobre qué es daño imputable o desgaste normal no se delega en la herramienta: es un análisis que, en disputa, evalúa el tribunal según la sana crítica.

### ¿La IA afecta la validez legal del acta?

No la afecta por sí sola. Lo relevante para la validez sigue siendo la firma de las partes y la integridad de la evidencia, que la Ley 19.799 reconoce en documentos electrónicos con hash y timestamp. La IA es un medio para preparar mejor ese documento, no un requisito legal.`,
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

La garantía del arriendo no tiene por qué ser fuente de conflicto. Con buena documentación al inicio, mantenciones durante el contrato y una devolución ordenada, las dos partes pueden quedar tranquilas. La clave está en preparar la evidencia desde el primer día, no recolectarla cuando ya hay una disputa.

## Preguntas frecuentes

### ¿Por qué la devolución de la garantía genera tantos conflictos?

Porque al final del arriendo se discute qué deterioro es desgaste normal y qué es daño imputable, y sin un registro del estado inicial cada parte recuerda las cosas a su favor. La forma más simple de evitarlo es documentar desde el primer día con un acta de entrega y fotos fechadas.

### ¿Qué descuentos a la garantía son legítimos?

Los que correspondan a rentas o cuentas impagas y a daños que excedan el desgaste normal por uso. No es legítimo descontar por deterioro razonable ni por conceptos sin respaldo. Cualquier descuento debería poder justificarse con evidencia concreta.

### ¿Cómo me preparo desde el inicio para no discutir al final?

Haciendo un acta de entrega detallada con fotos por ambiente, lecturas de medidores e inventario si está amoblado. Al término, una acta de devolución comparable permite mostrar diferencias reales. Tener ambos registros reduce drásticamente el margen de discusión sobre la garantía.

### ¿Qué hago si no logramos ponernos de acuerdo por la garantía?

Si la negociación falla, la vía es el Juzgado de Policía Local o el tribunal competente. Llevar las actas, las fotos comparables y los comprobantes de pago fortalece tu posición, porque el tribunal valora la evidencia según la sana crítica y privilegia lo que esté bien documentado.`,
  },
  {
    slug: "humedad-hongos-departamento-chile",
    title: "Humedad y hongos en el departamento: cómo prevenirlos y cómo enfrentarlos",
    excerpt:
      "El problema número uno en muchos departamentos chilenos. Te explicamos las causas, qué prevenir tú mismo y cuándo el arrendador está obligado a responder.",
    date: "2026-05-22",
    author: "Equipo CertiFoto",
    category: "Mantención",
    readMinutes: 7,
    content: `Si vives en Santiago, Concepción, Valdivia o cualquier ciudad chilena con inviernos húmedos, lo más probable es que tarde o temprano te topes con manchas oscuras en la esquina de un muro, marcas blanquecinas detrás de un mueble o ese olor inconfundible a "depto guardado".

La humedad es el deterioro más común en departamentos chilenos, y entender por qué aparece y a quién le corresponde resolverla es clave para no terminar peleando con el arrendador (o, si eres dueño, gastando de más en reparaciones evitables).

## Las tres causas más frecuentes

No toda humedad es igual. Saber distinguirlas te ahorra mucho.

- **Condensación interna.** Es la más común. Se produce cuando el vapor del baño, la cocina o la ropa secándose dentro encuentra una superficie fría (típicamente muros perimetrales, esquinas o detrás de muebles) y se transforma en agua. Aparece en forma de gotas en las ventanas y manchas oscuras en las esquinas superiores de los muros.
- **Filtración desde fuera.** Lluvia o nieve que entra por una falla en la envolvente del edificio: techumbre, fisuras en muros exteriores, ventanas mal selladas, terrazas con grietas. Las manchas suelen ser más localizadas y crecen después de cada lluvia.
- **Humedad por capilaridad.** Agua que sube desde el suelo por los muros. Más típica en primeros pisos o departamentos con problemas de impermeabilización en cimientos. Las manchas aparecen en la parte baja de los muros.

Identificar la causa es el primer paso porque la solución cambia radicalmente. Una condensación se previene con ventilación; una filtración requiere reparar el edificio.

## Lo que puedes hacer tú mismo

La mayoría de los casos en Chile son condensación, y se previenen con cosas simples:

- **Ventilar 10 minutos al día.** Abrir ventanas opuestas para generar corriente, incluso en invierno. Es el cambio con mayor impacto.
- **Encender extractor del baño durante y 15 minutos después de la ducha.** Si no tiene extractor, dejar la puerta abierta y abrir una ventana cercana.
- **No secar ropa adentro.** Si no tienes opción, usar una habitación específica con la ventana entreabierta y la puerta cerrada.
- **Despegar los muebles 5 cm de los muros perimetrales.** Permite que el aire circule y evita las manchas detrás del clóset o el sofá.
- **Usar deshumidificador en zonas críticas.** Especialmente en dormitorios y baños sin ventana.
- **Revisar sellos de ventanas en otoño.** Goma rota o silicona desprendida = entrada de aire frío que condensa.

## Cuándo es responsabilidad del arrendador

Acá es donde a muchos arrendatarios les cobran cosas que no corresponden, y a muchos arrendadores les cuesta resolver problemas que sí son suyos.

**Es responsabilidad del arrendador (reparación necesaria) cuando:**

- Hay filtración estructural del edificio (techumbre, muros exteriores, terrazas).
- Hay un defecto constructivo: aislación deficiente, ventilación insuficiente diseñada de fábrica.
- La humedad existía antes de que el arrendatario llegara y se documentó en la acta de entrega.
- Aparece en zonas donde el arrendatario no puede haber influido (subterráneo, muro medianero con otro depto).

**Es responsabilidad del arrendatario cuando:**

- No ventila y la condensación produce manchas evitables.
- Seca ropa adentro sistemáticamente y aparecen hongos.
- Tapa rejillas de ventilación.
- No reporta una filtración menor que después crece.

Cuando hay duda, lo que decide es la **evidencia documental al inicio del arriendo**: una acta de entrega con fotos detalladas de cada muro evita el 80% de estas discusiones.

## Qué hacer si ya hay hongos

Si las manchas ya aparecieron, lo primero es identificar la causa (con un profesional si hace falta) y atacarla. Limpiar sin resolver el origen es perder el tiempo, vuelven en semanas.

- Manchas pequeñas y superficiales: limpieza con cloro diluido (1 parte cloro, 3 partes agua), guantes y mascarilla, y secado con ventilación.
- Manchas extensas o profundas: requiere especialista, posiblemente cambiar tabiquería interior o tratamientos antihumedad.
- Bajo ningún punto pintar encima sin tratar: queda peor en dos meses.

## Documentar es protegerte

Tanto si eres arrendador como arrendatario, dejar fotos fechadas del estado actual de muros y esquinas es la mejor defensa. Si las cosas escalan a una disputa por la garantía o a una reclamación al edificio, contar con un acta con fotos respaldadas (hash criptográfico + fecha + descripción del estado) es la diferencia entre demostrar y suponer.

En CertiFoto cada foto que subes queda con su huella SHA-256 y sus metadatos EXIF, así puedes probar **cuándo** estaba en ese estado un muro o una esquina. Útil para entregar, recibir o documentar un avance del problema durante el arriendo.

## En resumen

La humedad casi siempre se previene, pocas veces es culpa única de una de las partes, y casi siempre se resuelve mucho mejor cuando hay buena evidencia desde el primer día. Ventila, observa, reporta a tiempo y documenta. Y si ya hay manchas, identifica la causa antes de pintar.

## Preguntas frecuentes

### ¿De quién es la responsabilidad por la humedad en un arriendo?

Depende de la causa. Si la humedad proviene de una falla estructural o de una reparación necesaria del inmueble, suele ser de cargo del arrendador. Si se origina en la falta de ventilación o mal uso del arrendatario, puede ser responsabilidad de este. Documentar el estado al inicio ayuda a determinar el origen.

### ¿Qué puedo prevenir yo mismo como arrendatario?

Ventilar a diario, evitar tender ropa en exceso dentro del inmueble sin ventilación, revisar logia y baños, y avisar a tiempo cualquier filtración. Muchas situaciones de humedad por condensación se manejan con ventilación adecuada, lo que también evita que se te atribuya un daño al final del arriendo.

### ¿Cuándo está obligado el arrendador a reparar?

Cuando se trata de reparaciones necesarias para mantener el inmueble en estado de servir para el arriendo, como filtraciones por cañerías o problemas estructurales. Conviene notificar por escrito (correo electrónico) dejando constancia, para acreditar que se avisó y desde cuándo el arrendador conocía el problema.

### ¿Cómo evito que me cobren la humedad al devolver el departamento?

Registrando en el acta de entrega cualquier signo de humedad existente al inicio y documentando con fotos. Si surge durante el arriendo, deja trazabilidad de tus avisos. Así se distingue un problema preexistente o estructural de un daño atribuible a tu uso, evitando descuentos injustos de la garantía.`,
  },
  {
    slug: "mantenciones-arrendatario-arrendador-ley-chile",
    title: "Mantenciones del arrendatario vs del arrendador: qué dice la ley chilena",
    excerpt:
      "Reparaciones locativas, reparaciones necesarias y la zona gris. Una guía honesta sobre quién paga qué en un arriendo en Chile.",
    date: "2026-05-15",
    author: "Equipo CertiFoto",
    category: "Mantención",
    readMinutes: 8,
    content: `Una de las preguntas más repetidas en cualquier arriendo en Chile es la misma: "¿Esto lo paga el arrendatario o el arrendador?". Una mancha en el techo, un calefont que dejó de funcionar, una cerradura que se desgastó, una llave que gotea. La respuesta corta es que la ley distingue dos categorías de reparaciones, y entenderlas evita la mayor parte de las discusiones.

> Esta nota es informativa, no asesoría legal. Para casos contenciosos siempre conviene consultar a un abogado o llevar el caso a la Dirección del Trabajo o a un juez de policía local según corresponda.

## El marco legal en pocas palabras

Las normas relevantes son el **Código Civil** (artículos 1927 a 1942 sobre arrendamiento de cosas) y la **Ley 18.101** (sobre arrendamiento de predios urbanos). En 2022 se promulgó además la **Ley 21.461** ("Devuélveme mi casa"), que cambió principalmente el procedimiento de restitución pero no las obligaciones de mantención.

De ahí salen dos conceptos clave:

- **Reparaciones locativas:** las que corresponden al arrendatario.
- **Reparaciones necesarias:** las que corresponden al arrendador.

## Qué le toca al arrendatario (reparaciones locativas)

Son las reparaciones menores que el Código Civil define como derivadas del uso normal y razonable de la propiedad. La regla general: lo que se daña por el uso cotidiano lo arregla quien lo usa.

Algunos ejemplos típicos:

- **Vidrios quebrados** durante el arriendo (salvo causa externa demostrable).
- **Cerraduras y chapas** desgastadas por el uso.
- **Manillas, picaportes y bisagras** que se sueltan o rompen.
- **Sifones de baño y cocina** tapados por uso.
- **Tapas de WC, llaves de agua simples, flotadores** que se desgastan.
- **Cambio de ampolletas, fluorescentes y tubos LED** comunes.
- **Pintura mínima** de retoque al término del arriendo, según se haya acordado en el contrato.
- **Manchas en muros producto del uso normal** (humedad por mala ventilación, marcas de muebles), siempre que no sean defectos estructurales.
- **Mantención mínima de jardín** si la propiedad tiene jardín y el contrato lo establece.

## Qué le toca al arrendador (reparaciones necesarias)

Son las reparaciones que aseguran que la propiedad siga sirviendo para lo que fue arrendada. Si no se hacen, el inmueble deja de cumplir su función básica.

Algunos ejemplos:

- **Filtraciones desde techos, muros exteriores o terrazas comunes.**
- **Problemas estructurales:** muros con humedad por mala impermeabilización, fisuras, asentamientos.
- **Cañerías rotas dentro de los muros** o sistemas de agua principales.
- **Sistema eléctrico defectuoso** que no es producto del mal uso.
- **Calefont, termo o caldera con falla técnica** (no por mal uso).
- **Defectos preexistentes** que estaban antes de la entrega y no se documentaron como problema del arrendatario.
- **Reemplazo de electrodomésticos amoblados** por desgaste o falla técnica.
- **Mantenciones obligatorias por ley:** revisión de gas cada 2 años (sello verde SEC), por ejemplo.

## La zona gris (donde están la mayoría de las peleas)

Hay casos que no son obvios y donde el contrato y la documentación cobran importancia. Algunos ejemplos:

- **Hongos por mala ventilación:** si el departamento tiene ventilación adecuada pero el arrendatario no ventila, es locativa. Si la ventilación del diseño es deficiente, es del arrendador. Por eso documentar es clave.
- **Manchas en alfombra/piso:** desgaste normal vs daño por descuido. Una mancha de vino seca en un punto es del arrendatario; pisos desgastados por años de uso son del arrendador.
- **Calefont que deja de funcionar:** mantención preventiva del arrendatario (limpieza, revisión); reparación por falla del arrendador.
- **Plagas:** depende. Si llegaron desde un departamento vecino o desde el exterior, del arrendador. Si las trajo el arrendatario o las propagó por mala higiene, son suyas.

En todos estos casos, la regla práctica es: **lo que esté documentado en la acta de entrega como problema preexistente no es del arrendatario; lo que apareció después y no se reportó a tiempo, tiende a serle imputable.**

## La importancia de reportar a tiempo

El Código Civil establece que el arrendatario tiene la obligación de **avisar al arrendador** sobre daños o reparaciones que detecte. Si no avisa y el problema empeora, puede terminar siendo responsable de la magnitud adicional.

Ejemplo típico: una filtración menor que el arrendatario no reporta. Seis meses después, el muro tiene daño estructural. La filtración era responsabilidad del arrendador, pero el agravamiento por falta de aviso oportuno puede recaer en el arrendatario.

**Buena práctica:** cualquier problema relevante se reporta por escrito (email, WhatsApp con confirmación) y se documenta con fotos fechadas.

## Cómo evitar el 80% de las disputas

Tres cosas en concreto:

1. **Acta de entrega bien hecha**, con fotos detalladas y firmada por ambas partes. Define qué problemas existen al inicio y qué no.
2. **Reportes documentados durante el arriendo**: nada de "te lo dije por teléfono". Email o mensaje que quede.
3. **Acta de devolución comparada contra la de entrega**: foto contra foto, ambiente por ambiente.

Cuando hay evidencia objetiva, la mayoría de las discusiones se resuelven sin necesidad de llegar a tribunales. Cuando no la hay, se transforman en un "él dijo, ella dijo" que no le sirve a nadie.

## En resumen

La ley chilena distingue reparaciones locativas (arrendatario) y necesarias (arrendador), pero la zona gris es grande. Lo que decide en la práctica es la **documentación**: lo que está en una acta de entrega firmada con respaldo fotográfico es muy difícil de discutir, y lo que se reporta a tiempo deja de ser problema futuro. CertiFoto está pensado exactamente para eso: dejar la evidencia desde el primer día, con respaldo técnico que aguanta una conversación seria.

## Preguntas frecuentes

### ¿Qué reparaciones le corresponden al arrendatario?

Por regla general, las reparaciones locativas: aquellos deterioros menores que provienen del uso normal y que la ley pone de cargo del arrendatario, como ciertos arreglos de uso corriente. El arrendatario debe cuidar la propiedad como un buen administrador y mantener lo que corresponde a la ocupación diaria.

### ¿Qué reparaciones debe asumir el arrendador?

Las reparaciones necesarias para que el inmueble siga sirviendo al fin del arriendo, como problemas estructurales o de instalaciones. El arrendador debe mantener la propiedad en estado de ser usada, salvo los deterioros que sean responsabilidad del arrendatario por su uso.

### ¿Qué pasa con la "zona gris" donde no está claro quién paga?

Existen casos intermedios donde la responsabilidad depende del origen del daño y de lo pactado. Lo prudente es definir estos puntos en el contrato y, ante una reparación dudosa, dejar por escrito la comunicación entre las partes. Si hay disputa, el tribunal evalúa caso a caso según la sana crítica.

### ¿Cómo evito conflictos por mantenciones al final del arriendo?

Documentando el estado inicial con un acta de entrega y avisando por escrito las reparaciones que surjan durante el arriendo. Tener trazabilidad de quién avisó qué y cuándo permite atribuir cada arreglo a la parte correcta y evita que todo se descuente de la garantía al final.`,
  },
  {
    slug: "checklist-mantencion-departamento-anual",
    title: "Checklist anual de mantención de un departamento, por temporada",
    excerpt:
      "Una propiedad bien mantenida se valoriza, se devuelve sin discusiones y rinde más. Esta lista por temporada cubre lo esencial.",
    date: "2026-05-10",
    author: "Equipo CertiFoto",
    category: "Mantención",
    readMinutes: 6,
    content: `Mantener un departamento no es tener que llamar al maestro cada tres meses. Es hacer revisiones simples en el momento correcto del año para que los problemas no se acumulen. Esta es la lista que recomendamos seguir, ordenada por temporada para que no se te olvide.

Sirve igual si eres dueño que la habitas, dueño que la arriendas o arrendatario que quiere devolver una propiedad en mejores condiciones que como la recibió.

## Otoño (marzo–mayo): preparar para la lluvia

Lo más importante del año en Chile, porque viene el invierno y todo lo que falle ahora se nota peor en julio.

- **Revisar sellos de ventanas y puertas.** Goma rota o silicona desprendida = entrada de aire frío + posible filtración. Reemplazar con kit de hardware store.
- **Limpiar canaletas y desagües de balcón o terraza.** Hojas acumuladas son la causa #1 de filtraciones invernales.
- **Probar la calefacción antes de necesitarla.** Encender estufa, calefactor central o piso radiante. Si falla, mejor saberlo en abril que en junio.
- **Revisar el calefont o termo.** Pilotos, llama estable, sin ruidos raros, agua caliente sale rápido.
- **Verificar sello verde de gas SEC** (cada 2 años). Si vence, agendar la revisión.
- **Sellar grietas o fisuras visibles** en muros exteriores antes de que el agua entre.
- **Revisar deshumidificadores.** Vaciarlos, limpiar filtros, dejarlos operativos.

## Invierno (junio–agosto): vigilancia activa

Es la temporada donde aparecen los problemas, así que más vale revisar seguido que reaccionar tarde.

- **Inspeccionar muros y techo después de cada lluvia fuerte.** Cualquier mancha nueva o mancha que crece se reporta de inmediato.
- **Mantener ventilación a pesar del frío.** 10 minutos diarios, ventanas opuestas. La calefacción cierra todo y la condensación se dispara.
- **Vigilar las esquinas y zonas detrás de muebles.** Los hongos aparecen primero donde no se ven.
- **Limpiar filtros de calefactores y aire acondicionado.** Polvo acumulado = consumo más alto y aire menos sano.
- **Si hay terraza o balcón:** revisar sumideros después de lluvia, evitar que se acumule agua.

## Primavera (septiembre–noviembre): puesta a punto

Buena ventana para hacer las reparaciones que aguantaron el invierno.

- **Pintura de retoque** donde haya manchas, escarapelado o golpes.
- **Revisión eléctrica.** Enchufes que calientan, interruptores que fallan, lámparas que parpadean. Un electricista en una mañana resuelve la mayoría.
- **Limpieza profunda de baños y cocina.** Sifones, gomas de lavadora, juntas de cerámica. Acumulan suciedad que después es difícil de remover.
- **Revisar la presión de agua.** Si bajó, suele ser filtro tapado en llaves o duchas.
- **Servicio técnico a electrodomésticos clave:** lavadora, secadora, lavavajillas si los hay. Una limpieza anual alarga la vida útil años.

## Verano (diciembre–febrero): aprovechar para lo grande

Tiempo seco y temperaturas altas hacen ideal cualquier obra mayor.

- **Pintar muros completos** si hace falta.
- **Reparar terrazas, balcones o jardineras** que requieran intervención.
- **Cambiar mosquiteros** dañados y revisar ventanas correderas.
- **Limpieza profunda de tapices, cortinas y alfombras.** Lo seco ayuda al secado.
- **Revisar el aire acondicionado** antes de las olas de calor. Carga de gas si la requiere.
- **Si tienes piscina o quincho en el edificio:** suele ser el momento donde más se usa, revisar reglamento de la comunidad.

## Trimestral (cada 3 meses, sin importar la estación)

Cosas que no esperan a una temporada:

- Limpiar sifones de cocina, lavamanos y duchas.
- Revisar mangueras de lavadora y lavaplatos (las gomas se cristalizan).
- Verificar detectores de humo (si los hay) y cambiar pilas.
- Limpiar filtros de campanas extractoras.
- Revisar que no haya goteos en llaves o WC (uno chico te puede subir mucho la cuenta).

## Anual (una vez al año, idealmente en otoño)

- Sello verde de gas (cada 2 años en realidad, pero se chequea anual).
- Mantención del calefont/termo: limpieza interna.
- Revisión del sistema eléctrico por electricista certificado, especialmente en propiedades con +10 años.
- Aplicación de impermeabilizante en terrazas y balcones expuestos.
- Mantención de electrodomésticos amoblados.

## Documentar la mantención también vale

Sobre todo si eres arrendador o si eres arrendatario y vas a devolver la propiedad: dejar registro de las mantenciones que hiciste es una forma simple de demostrar que cuidaste el inmueble. Una foto con fecha cuando limpiaste los sifones, una factura del electricista, una imagen del sello verde de gas vigente.

CertiFoto puede usarse no solo para actas de entrega o devolución: puedes crear actas de **inspección** durante el arriendo, con fotos respaldadas y descripción del estado, como un registro técnico del cuidado dado a la propiedad. Útil tanto para defender la garantía como para justificar un reajuste de canon en arriendos largos.

## En resumen

Una propiedad bien mantenida sale gratis: lo que gastas en mantenciones simples lo ahorras en reparaciones grandes evitadas. Esta lista por temporada cubre lo esencial. Imprímela, pégala en el refrigerador y revisa qué te toca cada vez que cambia el clima.

## Preguntas frecuentes

### ¿Por qué conviene hacer mantención anual a un departamento arrendado?

Porque una propiedad bien mantenida se conserva mejor, se devuelve con menos discusiones y mantiene su valor. Revisar por temporada permite detectar a tiempo filtraciones, humedad o desgastes antes de que se conviertan en daños mayores y más caros de reparar.

### ¿Quién debe hacer la mantención, el arrendador o el arrendatario?

Depende del tipo de tarea. El arrendatario asume el cuidado de uso corriente y las reparaciones locativas; el arrendador, las reparaciones necesarias del inmueble. Una checklist ayuda a que cada parte cumpla lo suyo y a dejar registro de lo realizado.

### ¿Cómo registro las mantenciones para evitar discusiones?

Guarda fotos fechadas y comprobantes de los trabajos realizados, y deja constancia escrita de los avisos que envíes a la otra parte. Asociar estos registros al acta de entrega facilita demostrar, al término del arriendo, en qué estado se mantuvo la propiedad y quién hizo qué.

### ¿La mantención influye en la devolución de la garantía?

Sí. Llegar al término del arriendo con la propiedad mantenida y con respaldo de los cuidados realizados reduce el margen para descuentos por supuestos daños. La discusión por la garantía es más simple cuando hay evidencia de que el inmueble se cuidó durante todo el periodo.`,
  },
  {
    slug: "devolver-departamento-sin-perder-garantia",
    title: "Cómo devolver el departamento sin perder la garantía",
    excerpt:
      "El último mes de arriendo es el más importante. Una guía práctica para preparar la devolución y minimizar descuentos de la garantía.",
    date: "2026-05-05",
    author: "Equipo CertiFoto",
    category: "Mantención",
    readMinutes: 7,
    content: `Estás por terminar tu arriendo y te toca el momento más sensible: devolver la propiedad y recuperar la garantía. Para muchos arrendatarios este es el único punto donde la relación con el arrendador se complica, y casi siempre es por cosas que se pudieron haber resuelto antes.

Esta es la preparación que recomendamos hacer entre 30 y 60 días antes de la entrega de llaves.

## 60 días antes: la inspección honesta

Recorre la propiedad como si fueras el arrendador. Mira todo con ojo crítico: muros, techo, pisos, ventanas, baños, cocina, electrodomésticos, terraza. Anota cada cosa que esté distinta a como la recibiste.

- Manchas que aparecieron durante el arriendo.
- Marcas de muebles, golpes en muros, raspones.
- Ampolletas quemadas o luminarias que dejaron de funcionar.
- Llaves que gotean, descargas que fallan, manillas sueltas.
- Vidrios rajados o trizados.
- Cerraduras y chapas con desgaste mayor.
- Hongos o humedad que apareció.

La idea no es deprimirte, es saber con qué estás trabajando. Tener la lista en la mano te permite priorizar y presupuestar.

## 45 días antes: lo que SÍ debes arreglar

No todo se arregla y no todo cuesta lo mismo. Hay reparaciones que son razonables que tú hagas (locativas, según vimos en otra nota) y conviene resolverlas antes de la entrega:

- **Vidrios quebrados:** vidriero a domicilio, suele costar menos que el descuento que te haría el arrendador con una empresa.
- **Cerraduras y manillas:** ferretería + media hora de tu tiempo.
- **Ampolletas quemadas:** evidente, pero muchos olvidan dejarlas todas operativas.
- **Sifones tapados:** desarmar, limpiar, volver a armar. Sin químicos agresivos.
- **Llaves goteando:** muchas veces es solo una goma de $500.
- **Pintura de retoque** en marcas puntuales: parche pequeño con el color exacto si lo tienes, no improvises un color "parecido".
- **Manchas evidentes en muros:** limpiar antes de pintar, en muchos casos se quita con un detergente suave.

Si la lista es larga, considera un maestro de confianza por una jornada. Suele salir más barato que el descuento posterior.

## 45 días antes: lo que NO debes hacer

Igual de importante: hay cosas donde intentar arreglar termina costando más caro.

- **No pintes muros completos sin acordar con el arrendador.** Un color o calidad distinta a la original deja peor que la mancha original.
- **No intentes reparaciones eléctricas o de gas** que no sean cambiar una ampolleta o un tubo. Mal hechas, no solo no las pagan: te las descuentan por mal estado.
- **No tapes con relleno o pasta cosas que requieren maestro.** Se ve y queda peor.
- **No uses productos abrasivos en superficies delicadas.** Una marca pequeña en una cubierta de cuarzo es mejor que un raspón que tú hiciste tratando de limpiarla con un químico fuerte.

Cuando dudes, fotografía y consulta. El arrendador prefiere conversar antes que descubrir el desastre el día de la entrega.

## 30 días antes: comunicar y coordinar

Esta es la conversación que muchos arrendatarios postergan y que cambia el resultado de la entrega:

- **Avísale al arrendador o corredor** la fecha exacta en que vas a entregar.
- **Pídele una pre-inspección** unos días antes. Muchos aceptan, y te permite saber qué piensa cobrarte y resolverlo con tiempo.
- **Lleva una copia de la acta de entrega** que firmaron al inicio. Vas a necesitarla para comparar.
- **Confirma cómo se devolverá la garantía:** plazo, medio de pago, descuentos esperados si los hay.

## Una semana antes: limpieza profunda

Una propiedad limpia se ve dramáticamente mejor que una sucia con los mismos desperfectos. Vale mucho la pena.

- Contratar un servicio de limpieza profunda o dedicarle un fin de semana completo.
- **Foco especial:** baños, cocina, gomas de electrodomésticos, ventanas (vidrio y marco), terrazas.
- Mover muebles para limpiar detrás (especialmente sofás contra muros).
- Limpieza de filtros: campana, aire acondicionado, deshumidificador.
- Pulir grifería con limpia-cromos.

## El día de la entrega: hacer una acta de devolución

Acá es donde se evita la mayoría de los conflictos.

- Recorre la propiedad **junto con el arrendador o corredor**, no a distancia.
- Fotografía cada ambiente con la misma estructura que la acta de entrega original.
- Si hay diferencias, conversalas en el momento y déjalas por escrito como observación.
- Lee los medidores y déjalo registrado.
- Entrega llaves, controles y elementos que recibiste, contándolos.
- Firma la acta de devolución solo cuando estés conforme.

Hacerlo con una herramienta como CertiFoto suma respaldo técnico: cada foto queda con su hash SHA-256, sus metadatos EXIF y la firma de las partes en el mismo PDF. Si hay disputa después, tu evidencia es objetiva y verificable.

## Qué hacer si hay desacuerdo

A veces, a pesar de todo, el arrendador propone un descuento que no te parece. Antes de pelear:

- **Pide el detalle por escrito:** qué cobra, por qué y con qué justificación.
- **Pide cotizaciones de respaldo.** El arrendador no puede inventar montos.
- **Compara contra la acta de entrega.** Si el defecto estaba antes, está documentado.
- **Diferencia desgaste normal vs daño imputable.** Una alfombra de 5 años no se devuelve nueva.
- **Si no hay acuerdo:** la vía formal es la Dirección del Trabajo (en algunos casos) o un juzgado de policía local. Suele ser desproporcionado para montos menores, así que la mayoría termina conversando.

## En resumen

La mejor estrategia para no perder la garantía empieza 60 días antes, no el día de la entrega. Inspecciona, arregla lo razonable, no pretendas arreglar lo que no sabes, comunícate temprano y haz una acta de devolución bien hecha. La diferencia entre recuperar tu garantía completa o quedar peleando casi siempre se construye en esas seis semanas finales.

## Preguntas frecuentes

### ¿Cómo preparo la devolución del departamento para no perder la garantía?

Limpia a fondo, repara los deterioros menores que te correspondan, paga las cuentas al día y reúne tus comprobantes. Lo más importante es comparar el estado actual con el acta de entrega del inicio y dejar registro con fotos al momento de devolver, para demostrar que restituyes en buenas condiciones.

### ¿Qué descuentos puede hacerme el arrendador al devolver?

Puede imputar a la garantía rentas o cuentas impagas y daños que excedan el desgaste normal. No corresponde que descuente por desgaste razonable del uso. Si hace descuentos, conviene pedir el detalle y la evidencia, porque un descuento sin respaldo puede reclamarse en el Juzgado de Policía Local.

### ¿Por qué es clave el acta de devolución?

Porque fija el estado final del inmueble y, comparada con el acta de entrega, demuestra qué cambió durante el arriendo. Sin ese registro, la discusión sobre daños queda como palabra contra palabra y el tribunal decide según la sana crítica de la evidencia disponible.

### ¿Qué hago si el arrendador retiene la garantía sin justificación?

Requiérelo por escrito (correo electrónico) pidiendo el detalle de los descuentos y la devolución. Si no hay respuesta o los descuentos no corresponden, puedes reclamar judicialmente. Tus fotos de entrega y devolución y los comprobantes de pago son la evidencia que respalda tu derecho a recuperarla.`,
  },
  {
    slug: "evidencia-whatsapp-juicios-familia-chile",
    title: "Evidencia de WhatsApp en juicios de familia en Chile: cómo presentarla correctamente",
    excerpt:
      "Conversaciones de WhatsApp pueden ser prueba clave en juicios de familia, pero solo si se presentan con respaldo técnico adecuado. Te explicamos cómo hacerlo bien.",
    date: "2026-06-12",
    author: "Equipo CertiFoto",
    category: "Evidencia Digital",
    readMinutes: 9,
    content: `En los tribunales de familia de Chile las conversaciones de WhatsApp se han convertido en una de las pruebas más frecuentes. Amenazas, acuerdos de pensión, coordinación de visitas, confesiones, mensajes que demuestran abandono o violencia psicológica. Todo pasa por WhatsApp, y cuando la relación se rompe, esos mensajes se transforman en evidencia.

El problema es que la mayoría de las personas presenta esa evidencia de la peor forma posible: capturas de pantalla sin contexto, impresas en papel, sin respaldo técnico y sin cadena de custodia. El resultado es que la contraparte las impugna, el juez las mira con desconfianza, y una prueba que podría haber sido determinante termina pesando poco o nada.

En esta guía te explicamos cómo presentar correctamente conversaciones de WhatsApp como prueba en juicios de familia en Chile, qué dice la ley, qué errores evitar y cómo el respaldo forense marca la diferencia.

## Por qué WhatsApp es tan relevante en juicios de familia

Los juicios de familia en Chile cubren materias sensibles: pensión de alimentos, cuidado personal de hijos, régimen de relación directa y regular, violencia intrafamiliar, medidas de protección. En todos estos casos, la comunicación entre las partes suele pasar por WhatsApp.

Un mensaje donde el padre reconoce que no ha pagado la pensión en tres meses puede ser más contundente que un testigo. Un audio donde alguien amenaza a su ex pareja es evidencia directa de violencia psicológica. Una conversación donde se acuerda un monto de pensión informal sirve para demostrar capacidad económica.

Los tribunales de familia lo saben, y por eso aceptan este tipo de prueba. Pero aceptarla no significa que la valoren automáticamente. El peso que le den depende de cómo se presente.

## Qué dice la ley chilena sobre evidencia digital

En materia de familia, la Ley 19.968 (que crea los Tribunales de Familia) establece un sistema de libertad probatoria: las partes pueden valerse de cualquier medio de prueba producido en conformidad a la ley. No hay un listado cerrado de pruebas admisibles, lo que significa que mensajes de WhatsApp, audios, fotos y videos digitales son admisibles en principio.

La Ley 19.799 sobre documentos electrónicos y firma electrónica complementa este marco. Establece que los documentos electrónicos tienen validez jurídica y que la firma electrónica simple (como la aceptación implícita en una conversación de WhatsApp) tiene valor probatorio que el tribunal aprecia según las reglas de la sana crítica.

En la práctica, esto significa que el juez puede admitir una conversación de WhatsApp como prueba, pero su valoración dependerá de:

- Si se puede verificar su autenticidad (que no fue fabricada ni editada).
- Si se puede establecer quién envió cada mensaje.
- Si se presenta con contexto suficiente (no fragmentos sueltos).
- Si la contraparte tiene la oportunidad de contradecirla.

## Los errores más comunes al presentar WhatsApp como prueba

Hay un patrón que se repite en los tribunales de familia y que debilita la prueba innecesariamente:

- Presentar capturas de pantalla sueltas. Una captura de pantalla es una imagen que cualquiera puede fabricar en cinco minutos con herramientas de edición básicas. Sin respaldo adicional, su valor probatorio es bajo. El juez no tiene forma de saber si el mensaje realmente existió o si la captura fue manipulada.

- Imprimir las capturas en blanco y negro. Además de perder calidad, una impresión en papel pierde toda la metadata digital. Es la forma más débil de presentar evidencia electrónica.

- Presentar mensajes fuera de contexto. Mostrar un mensaje aislado sin la conversación completa permite que la contraparte argumente que el contexto cambia el sentido. Si alguien dice "no voy a pagar más" pero el mensaje siguiente dice "hasta que me den el recibo correcto", el sentido es completamente distinto.

- No preservar la conversación original. Muchas personas borran conversaciones por rabia o por espacio en el teléfono, y después se dan cuenta de que las necesitaban. Una vez borradas de WhatsApp, recuperarlas es técnicamente complejo y costoso.

- No acreditar la identidad del remitente. Que un contacto se llame "Juan" en tu teléfono no prueba que el mensaje lo envió Juan Pérez Soto, RUT 12.345.678-9. La identificación del titular del número es un paso que muchos omiten.

## Cómo presentar WhatsApp correctamente: paso a paso

La presentación adecuada de una conversación de WhatsApp como prueba en un juicio de familia requiere varios pasos que construyen lo que se llama la cadena de custodia digital.

- Preservar la conversación completa. No edites, no borres, no selecciones solo los mensajes que te convienen. Exporta la conversación completa usando la función de WhatsApp "Exportar chat" (que genera un archivo .txt con todos los mensajes y permite adjuntar los medios). Guarda el archivo original sin modificarlo.

- Certificar las capturas de pantalla. Si necesitas capturas visuales (porque el archivo .txt no muestra el formato visual), tómalas de forma sistemática: pantalla completa, mostrando el nombre del contacto, la fecha, la hora de cada mensaje, y el estado de los mensajes (un tick, dos ticks, dos ticks azules). Cada captura debe certificarse con hash criptográfico y timestamp verificable.

- Identificar al remitente. Vincula el número de teléfono con la persona. Esto puede hacerse con la agenda de contactos, con el registro del número en la compañía telefónica, o con otros mensajes donde la persona se identifica explícitamente.

- Contextualizar la evidencia. Presenta la conversación completa o al menos un segmento lo suficientemente amplio para que el juez entienda el contexto. Si son mensajes de distintas fechas, ordénalos cronológicamente y explica la secuencia.

- Respaldar con hash criptográfico. Cada archivo (capturas, audios, videos, el .txt exportado) debe tener su hash SHA-256 calculado al momento de la preservación. Esto prueba que el archivo no fue modificado después de esa fecha. Si la contraparte cuestiona la autenticidad, puedes recalcular el hash y demostrar que coincide.

- Generar un informe consolidado. Un PDF que incluya las capturas, los hashes, las fechas de preservación, la identificación de las partes y una descripción del contexto. Este es el documento que se presenta al tribunal.

## El rol del perito informático

En casos complejos o donde la contraparte impugna fuertemente la evidencia, el tribunal puede solicitar o las partes pueden ofrecer un peritaje informático. El perito revisa el dispositivo original, verifica la autenticidad de los mensajes, analiza la metadata y emite un informe técnico.

Sin embargo, el peritaje informático es caro y no siempre es necesario. Para la mayoría de los casos en tribunales de familia, una certificación digital bien hecha con hashes y timestamps es suficiente para que el juez valore la prueba favorablemente.

La diferencia clave es que el peritaje analiza el dispositivo original, mientras que la certificación digital preserva la evidencia tal como está en un momento dado. Idealmente se hacen ambas cosas, pero si el presupuesto es limitado, la certificación es el mínimo indispensable.

## Audios de WhatsApp: una prueba especialmente poderosa

Los mensajes de voz de WhatsApp tienen una particularidad que los hace especialmente valiosos como prueba: contienen la voz de la persona. A diferencia de un mensaje de texto (donde se puede argumentar que otra persona usó el teléfono), un audio con la voz reconocible del remitente es muy difícil de negar.

En casos de violencia intrafamiliar, los audios con amenazas, insultos o confesiones suelen ser la prueba más contundente. Para presentarlos correctamente:

- Exporta el audio original (archivo .opus o .ogg que genera WhatsApp).
- Calcula su hash SHA-256 inmediatamente.
- No lo conviertas a otro formato ni lo edites.
- Si es necesaria una transcripción, hazla de forma textual completa, sin omisiones.
- Incluye en el informe el hash del archivo de audio y la transcripción.

## Qué hacer si la contraparte niega los mensajes

Es habitual que la contraparte niegue haber enviado ciertos mensajes o argumente que fueron fabricados. En ese escenario, la fortaleza de tu evidencia depende del respaldo técnico que tengas.

Si presentas capturas de pantalla sin hash ni timestamp, la negación tiene peso. El juez no puede distinguir entre una captura real y una fabricada.

Si presentas capturas certificadas con hash SHA-256, timestamp verificable y la exportación .txt completa de la conversación, la negación pierde fuerza. La contraparte tendría que demostrar cómo se fabricó toda esa evidencia consistente, lo cual es técnicamente muy difícil.

En casos extremos, el juez puede ordenar que se exhiba el teléfono original o solicitar información a WhatsApp (Meta) mediante exhorto internacional, aunque esto último es lento y rara vez se usa en tribunales de familia.

## Cuándo preservar la evidencia: antes de que sea tarde

El error más costoso es no preservar la evidencia a tiempo. WhatsApp permite borrar mensajes para ambas partes, los teléfonos se pierden o se cambian, y las conversaciones se borran por espacio o por impulso emocional.

La regla práctica es: en el momento en que pienses que una conversación podría ser relevante en un proceso judicial, presérvala inmediatamente. No mañana, no la próxima semana. Ahora. Exporta el chat, toma las capturas, calcula los hashes y guarda todo en un lugar seguro.

CertiFoto permite hacer exactamente esto: subes las capturas de pantalla o los archivos exportados, la plataforma calcula automáticamente el hash SHA-256 de cada uno, registra la fecha y hora de la certificación, y genera un PDF con todo el respaldo técnico necesario para presentar en tribunales. El proceso toma minutos, no horas, y el costo es una fracción de lo que cobra un perito informático.

## Preguntas frecuentes

### ¿Puedo grabar una llamada de WhatsApp y usarla como prueba?

En Chile, la grabación de una conversación propia (donde tú eres parte) es lícita y admisible como prueba. La Ley 19.974 prohíbe la interceptación de comunicaciones ajenas, pero si tú participas en la llamada, puedes grabarla sin consentimiento de la otra parte. El tribunal valorará la grabación según la sana crítica.

### ¿Los mensajes eliminados se pueden recuperar?

Depende. Si la otra parte eliminó mensajes "para todos", puede que aún existan en tu teléfono si no actualizaste la app a tiempo. Las copias de seguridad de WhatsApp (Google Drive o iCloud) pueden contener mensajes eliminados si el respaldo se hizo antes de la eliminación. Un perito informático puede intentar la recuperación, pero no siempre es posible y el costo es significativo.

### ¿Sirven las capturas de pantalla de estados o historias de WhatsApp?

Sí, pero tienen el mismo problema de cualquier captura: sin respaldo técnico, su valor es bajo. Si un estado de WhatsApp es relevante (por ejemplo, muestra el estilo de vida del demandado en un juicio de pensión), captura y certifícalo inmediatamente, porque los estados desaparecen en 24 horas.

### ¿Qué pasa si la otra parte tiene un teléfono distinto al que aparece en la conversación?

Si la contraparte cambió de número, la vinculación entre el número antiguo y la persona puede hacerse con el contrato de la compañía telefónica, con otros mensajes donde se identificó, o con testigos que confirmen que ese era su número. La identificación del titular es un paso que el abogado debe preparar.

## Conclusión

Las conversaciones de WhatsApp son evidencia legítima y poderosa en juicios de familia en Chile, pero solo si se presentan con el respaldo técnico adecuado. Capturas sueltas impresas en papel son la forma más débil; archivos originales certificados con hash criptográfico y timestamp son la forma más fuerte.

La diferencia entre ganar y perder un punto probatorio muchas veces está en haber preservado la evidencia a tiempo y con el formato correcto. No esperes a que el abogado te lo pida: si tienes conversaciones que podrían ser relevantes, certifícalas ahora.

CertiFoto te permite certificar capturas de pantalla, audios y archivos exportados de WhatsApp en minutos, con hash SHA-256, timestamp verificable y un PDF listo para presentar en tribunales. Es la forma más rápida y económica de convertir una conversación de WhatsApp en evidencia técnicamente sólida.`,
  },
  {
    slug: "captura-de-pantalla-como-prueba-validez-chile",
    title: "¿Una captura de pantalla sirve como prueba en Chile? Valor legal, metadatos y cadena de custodia",
    excerpt:
      "Una captura de pantalla puede ser prueba válida en un juicio chileno, pero su peso depende de los metadatos, el hash y la cadena de custodia digital. Te explicamos cómo lograr que el tribunal la valore.",
    date: "2026-06-16",
    author: "Equipo CertiFoto",
    category: "Evidencia Digital",
    readMinutes: 11,
    content: `Hoy casi cualquier conflicto deja rastro digital: una transferencia que nunca llegó, una amenaza por mensaje, una publicación que difama, un correo que confirma un acuerdo, una foto que muestra un daño. Lo primero que hace la mayoría de las personas es tomar una captura de pantalla. Es rápido, es intuitivo y queda guardado en el teléfono. El problema aparece después: cuando esa captura tiene que servir como prueba en un tribunal y la contraparte simplemente dice "esa imagen está editada".

La pregunta de fondo es sencilla y la recibimos todo el tiempo: ¿una captura de pantalla sirve realmente como prueba en Chile? La respuesta corta es sí, pero con un matiz enorme. Una captura por sí sola es una de las pruebas más débiles que existen. Una captura respaldada con metadatos, hash criptográfico y cadena de custodia puede transformarse en evidencia sólida. Esta guía explica esa diferencia y cómo cruzar de un lado al otro.

> Esta nota es informativa y no constituye asesoría legal. Para tu caso particular, consulta a un abogado.

## Qué dice la ley chilena sobre las pruebas digitales

En Chile no existe una ley única que regule "la captura de pantalla". Lo que existe es un conjunto de normas que, leídas en conjunto, permiten que una imagen digital se incorpore a un juicio como prueba.

La Ley 19.799 sobre documentos electrónicos y firma electrónica es la base. Reconoce que los documentos electrónicos tienen validez jurídica y producen efectos legales. Una captura de pantalla es, técnicamente, un documento electrónico, por lo que entra dentro de esta categoría.

El Código de Procedimiento Civil regula cómo se presentan los documentos en juicio. Las capturas suelen incorporarse como prueba documental, normalmente impresas o como soporte digital acompañado al expediente. El punto clave del CPC es el de la objeción de documentos: la contraparte tiene un plazo para objetar la autenticidad o integridad de lo presentado, y aquí es donde una captura sin respaldo se cae.

En materia de familia, la Ley 19.968 establece libertad probatoria: las partes pueden usar cualquier medio de prueba obtenido lícitamente, y el tribunal valora según las reglas de la sana crítica. En materia penal y laboral rige una lógica parecida de valoración según la sana crítica.

La conclusión jurídica es importante: en Chile la captura de pantalla es admisible. Lo que está en juego no es si el tribunal la deja entrar, sino cuánto peso le da. Y ese peso depende casi por completo de cómo se preservó.

## Por qué una captura "a secas" vale poco

El juez sabe algo que conviene tener claro: una captura de pantalla es trivial de fabricar. Con herramientas de edición básicas, en minutos, cualquiera puede cambiar el texto de un mensaje, alterar un monto, modificar una fecha o inventar una conversación completa. Existen incluso aplicaciones diseñadas para generar conversaciones falsas de WhatsApp con fines de broma.

Por eso, cuando se presenta una captura suelta y la contraparte la objeta diciendo que está editada, el tribunal queda en una posición incómoda: no tiene forma técnica de distinguir entre una imagen auténtica y una fabricada. En ese escenario, lo prudente para el juez es restarle valor.

A esto se suma un problema silencioso: al tomar una captura, recortarla, reenviarla por WhatsApp o pegarla en un documento, se pierden los metadatos originales y la imagen se vuelve todavía más difícil de autenticar. La prueba se degrada en cada paso.

## Metadatos EXIF: la información invisible de una foto

Cuando hablamos de fotografías digitales (no de capturas de pantalla, sino de fotos tomadas con la cámara del teléfono), entra en juego un elemento técnico decisivo: los metadatos EXIF.

EXIF es información que la cámara guarda automáticamente dentro del archivo de imagen. Puede incluir:

- La fecha y hora exactas en que se tomó la foto.
- El modelo de teléfono o cámara que la capturó.
- Las coordenadas GPS del lugar (si la geolocalización estaba activada).
- Parámetros técnicos como la apertura, el ISO o si se usó flash.

Estos metadatos son valiosísimos como prueba. Para certificar un daño en un accidente, demostrar el estado de una propiedad en una fecha concreta o acreditar dónde y cuándo ocurrió algo, los EXIF aportan contexto que el ojo no ve.

El problema es que son frágiles. Si envías una foto por WhatsApp, la aplicación la comprime y elimina la mayoría de los metadatos. Si la subes a redes sociales, ocurre lo mismo. Cuando llega el momento de usarla como prueba, esa foto ya perdió la información que la hacía valiosa. Por eso, una foto que podría ser determinante debe preservarse desde el archivo original, sin reenviarla ni comprimirla.

Una aclaración técnica importante: una captura de pantalla normalmente no conserva los EXIF de la imagen original que aparece en la pantalla. Una captura solo registra los píxeles mostrados. Esa es otra razón por la que, cuando es posible, conviene preservar el archivo original además de la captura.

## La cadena de custodia digital

El concepto que conecta todo esto es la cadena de custodia digital. En el mundo físico, la cadena de custodia es el registro de quién tuvo una evidencia, cuándo y qué se hizo con ella, para garantizar que no fue alterada. En el mundo digital ocurre lo mismo, con herramientas distintas.

Los tres pilares de una buena cadena de custodia digital son:

- El hash criptográfico. Un hash (por ejemplo SHA-256) es una huella digital única del archivo. Si el archivo cambia aunque sea un solo píxel, el hash cambia por completo. Calcular el hash al momento de preservar la evidencia permite demostrar más adelante que el archivo no fue modificado: basta recalcularlo y comprobar que coincide.

- El timestamp verificable. Es el sello de tiempo que prueba que el archivo existía en un momento determinado. Acredita que la evidencia se preservó en una fecha concreta y no fue creada después, a conveniencia.

- El registro de integridad. Un documento que reúne el hash, la fecha y hora de preservación, la descripción del archivo y la identificación de quién lo certificó. Es lo que convierte un montón de imágenes sueltas en un conjunto probatorio ordenado.

Cuando una captura de pantalla o una foto se presenta con estos tres elementos, la objeción "está editada" pierde fuerza. La contraparte tendría que explicar cómo se fabricó una evidencia que tiene hash coincidente y sello de tiempo anterior al conflicto, lo cual es técnicamente muy difícil.

## Casos donde las capturas y fotos son prueba clave

Las situaciones en que esta evidencia resulta decisiva son cada vez más frecuentes en Chile:

- Conflictos laborales. Capturas de correos, mensajes del jefe fuera de horario, instrucciones por chat, comprobantes de pago o su ausencia. En sede laboral, donde rige la sana crítica, una conversación bien preservada puede acreditar acoso, despido injustificado o el contenido real de un acuerdo.

- Accidentes y daños. Fotos del estado de un vehículo, de una propiedad inundada, de lesiones o de los daños tras un siniestro. Aquí los EXIF que acreditan fecha y lugar son especialmente valiosos para una compañía de seguros o un juicio civil.

- Juzgados de Policía Local. En infracciones de tránsito, choques menores, ruidos molestos o conflictos vecinales, las fotos y videos suelen ser la prueba principal. Una imagen certificada tiene mucho más peso que una mostrada desde el teléfono.

- Estafas y transferencias. Capturas de comprobantes, de conversaciones donde se prometió algo, de publicaciones de venta. Preservarlas a tiempo, antes de que el estafador borre su cuenta, es muchas veces la única evidencia que queda.

- Difamación e injurias en redes. Publicaciones que pueden borrarse en cualquier momento. Capturarlas y certificarlas de inmediato evita que la prueba desaparezca.

## El error más caro: no preservar a tiempo

Hay un patrón que se repite en todos estos casos: la persona piensa "después la guardo bien" y para cuando el conflicto escala, el mensaje fue borrado, la cuenta desapareció, la foto se reenvió mil veces y perdió sus metadatos, o el teléfono se cambió.

La regla práctica es simple: en el momento en que sospechas que algo podría terminar en un tribunal, presérvalo de inmediato. No mañana. Captura, conserva el archivo original cuando exista, y certifícalo con hash y timestamp lo antes posible. La evidencia digital es perecible.

## Cómo certificar una captura correctamente

El proceso para convertir una captura débil en una prueba sólida no requiere ser perito informático:

- Conserva el original. Si es una foto, guarda el archivo tal como salió de la cámara, sin reenviarlo. Si es una conversación, exporta el chat completo además de tomar capturas.
- Captura con contexto. Pantalla completa, mostrando nombre, fecha, hora y todo lo necesario para entender la secuencia. Nada de recortes que dejen fuera información.
- Calcula el hash. Obtén el SHA-256 de cada archivo al momento de preservarlo.
- Sella la fecha. Registra un timestamp verificable de la preservación.
- Genera un informe. Un documento que reúna las imágenes, los hashes, las fechas y la descripción del contexto, listo para acompañar al expediente.

## Cuándo conviene un peritaje informático

En casos donde la contraparte impugna con fuerza la autenticidad, o donde se discute si un mensaje fue realmente enviado desde cierto dispositivo, el tribunal puede ordenar o las partes ofrecer un peritaje informático. El perito examina el dispositivo original, analiza la metadata a fondo y emite un informe técnico.

El peritaje es la herramienta más robusta, pero también la más cara y lenta. Para la gran mayoría de los conflictos cotidianos, una certificación digital bien hecha con hash y timestamp es suficiente para que el tribunal valore la prueba favorablemente, a una fracción del costo. Lo ideal es escalar al peritaje solo cuando el caso lo justifica.

## En resumen

Una captura de pantalla sí sirve como prueba en Chile, pero su valor real lo determina la forma en que se preservó. Una imagen suelta, recortada y reenviada vale poco frente a una objeción. Una imagen respaldada con metadatos, hash criptográfico, timestamp y un informe de integridad se vuelve muy difícil de desacreditar.

La diferencia entre ganar y perder un punto probatorio casi siempre se decide antes de pisar el tribunal: en el momento en que decides preservar bien la evidencia, o dejarla a su suerte en la galería del teléfono.

CertiFoto te permite certificar capturas de pantalla y fotografías en minutos: la plataforma calcula el hash SHA-256 de cada archivo, registra la fecha y hora de la certificación y genera un PDF con todo el respaldo técnico necesario para presentar en tribunales chilenos. Es la forma más rápida y económica de convertir una captura común en evidencia digital sólida.

## Preguntas frecuentes

### ¿Una captura de pantalla sirve como prueba en un juicio en Chile?

Puede servir, pero su peso depende de cómo se respalde. Una captura suelta e impresa es la forma más débil de evidencia, porque es fácil de cuestionar. Su valor aumenta cuando se acompaña de metadatos, un hash que acredite que no fue alterada y una cadena de custodia clara.

### ¿Qué papel cumplen los metadatos y el hash?

Los metadatos aportan información como la fecha y el origen, y el hash es una huella digital que permite verificar que el archivo no se modificó después. Juntos respaldan la integridad y la fecha de la captura. La Ley 19.799 reconoce validez a documentos electrónicos con estas características.

### ¿Qué es la cadena de custodia digital y por qué importa?

Es el registro de cómo se obtuvo, guardó y presentó la evidencia, de modo que se pueda confiar en que no fue manipulada en el camino. Una cadena de custodia ordenada hace que el tribunal valore mejor la captura, porque reduce las dudas sobre su autenticidad.

### ¿Cómo logro que el tribunal le dé peso a mi captura?

Preservando el archivo original, certificándolo con hash y timestamp lo antes posible y conservando la trazabilidad de su origen. Mientras mejor documentada esté la integridad y la fecha, mayor será el peso que el tribunal pueda darle al valorarla según la sana crítica.`,
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
