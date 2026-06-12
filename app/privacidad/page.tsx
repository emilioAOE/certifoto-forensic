import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Cómo CertiFoto trata los datos personales conforme a la Ley 19.628 de Chile. Datos almacenados localmente, sin compartir con terceros.",
  alternates: { canonical: "/privacidad" },
};

const CONTENT = `En CertiFoto nos importa tu privacidad. Esta política explica qué datos manejamos, cómo los manejamos y qué derechos tienes. Esta política está alineada con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile.

## 1. Responsable del tratamiento

CertiFoto es una iniciativa con domicilio en Santiago, Chile. Para preguntas o ejercer derechos sobre tus datos, contáctanos a través del formulario en /contacto.

## 2. Qué datos recolectamos

### Cuando usas la plataforma sin cuenta

- Datos de actas, propiedades y partes que ingresas (dirección, RUT, email, teléfono cuando aplica).
- Fotografías que cargas, junto con sus metadatos EXIF.
- Firmas digitales que generes (imagen de la firma + metadatos: fecha, hora, navegador).
- Hashes criptográficos calculados de cada foto y del documento completo.

Todos estos datos se almacenan localmente en tu navegador (LocalStorage). CertiFoto no los recibe ni los almacena en sus servidores. Si limpias el almacenamiento de tu navegador, los datos se pierden.

### Datos técnicos mínimos

Nuestro proveedor de hosting (Vercel) registra datos técnicos básicos como dirección IP, navegador y páginas visitadas, igual que cualquier sitio web. Esto se utiliza para fines estadísticos agregados y de seguridad.

### Cuando nos contactas

Si nos escribes por el formulario de contacto, recibimos tu nombre, email, teléfono y mensaje. Usamos esa información solo para responderte. No la usamos para marketing salvo que nos lo autorices expresamente.

### Datos sensibles (firmas, RUT)

Los RUT y datos de contacto pueden considerarse datos personales. CertiFoto los procesa exclusivamente en tu navegador. Si compartes el PDF generado con terceros, eres responsable de su uso posterior.

## 3. Bases legales del tratamiento

Tratamos tus datos con las siguientes bases:

- **Consentimiento:** al usar la plataforma autorizas el procesamiento descrito.
- **Ejecución de un servicio:** para generar las actas que tú solicitas.
- **Interés legítimo:** para mejorar la plataforma con base en estadísticas anónimas.

## 4. Para qué usamos los datos

- Prestar el servicio de creación de actas digitales.
- Generar el respaldo forense (hash, metadatos EXIF) que es parte del valor del servicio.
- Responder consultas que nos hagan llegar.
- Mejorar la plataforma con base en estadísticas agregadas y anónimas.

**No vendemos, alquilamos ni compartimos datos personales con terceros para fines comerciales o de marketing.**

## 5. Inteligencia artificial

Cuando una función de IA requiere procesar una imagen, podemos enviar esa imagen a un proveedor de servicios de IA (modelos de visión computacional). Trabajamos solo con proveedores que cumplen con políticas estrictas de privacidad y que se comprometen contractualmente a no usar el contenido para entrenar sus modelos.

Las descripciones generadas por IA son **referenciales** y no atribuyen responsabilidades. Las partes deben revisarlas antes de firmar.

## 6. Cookies y almacenamiento local

CertiFoto usa:

- **Cookies técnicas estrictamente necesarias** para que el sitio funcione.
- **LocalStorage** para guardar tus actas localmente (no es una cookie pero sirve a un propósito similar).
- **Vercel Analytics** para métricas anónimas y agregadas. No identifica usuarios individuales y no requiere consentimiento bajo la mayoría de jurisdicciones.

No usamos cookies de seguimiento publicitario, remarketing ni perfiles para ventas a terceros.

Puedes limpiar el almacenamiento del sitio en cualquier momento desde la configuración de tu navegador.

## 7. Tus derechos (ARCO + portabilidad)

Tienes derecho a:

- **Acceso:** saber qué datos tuyos estamos procesando. Como los datos viven en tu navegador, los puedes ver directamente desde la plataforma.
- **Rectificación:** corregir datos imprecisos. Puedes editar cualquier acta antes de cerrarla.
- **Cancelación / Eliminación:** cada acta tiene un botón de eliminar; también puedes limpiar todo el almacenamiento del navegador. Si nos enviaste un email, podemos eliminarlo escribiéndonos.
- **Oposición:** puedes dejar de usar la plataforma en cualquier momento.
- **Portabilidad:** las actas se exportan como PDF/JSON; en el futuro habrá un export ZIP completo.

Para ejercer cualquier derecho, usa el formulario de contacto en /contacto. Respondemos en un plazo máximo de 15 días hábiles.

## 8. Retencion de datos

- **Datos en tu navegador:** se mantienen indefinidamente hasta que tú los elimines o limpies el almacenamiento del browser.
- **Datos de contacto:** los conservamos mientras dure la conversación, y hasta 2 años después para referencia.
- **Logs técnicos del hosting:** según políticas de Vercel (~30 días por defecto).

## 9. Seguridad

Aplicamos medidas razonables para proteger los datos:

- Conexiones cifradas con HTTPS/TLS.
- Cálculo de hashes criptográficos SHA-256 para verificar integridad.
- Almacenamiento local por defecto, evitando enviar datos innecesariamente a servidores externos.
- Procesamiento client-side de fotografías.

Ningún sistema es 100% seguro. Tú también eres responsable de la seguridad de tu dispositivo y de no compartir tu navegador con terceros si guardas actas con datos sensibles.

## 10. Transferencia internacional

Vercel tiene servidores fuera de Chile. Al usar el sitio aceptas que datos técnicos mínimos puedan transferirse a países con regulaciones distintas (principalmente EE.UU. y Europa). Vercel tiene certificaciones de privacidad y cumple con GDPR.

Para los datos de la aplicación (actas, fotos, firmas), permanecen en tu navegador y no salen de tu dispositivo.

## 11. Niños

CertiFoto no está destinado a menores de 18 años. No recolectamos datos de menores de manera consciente. Si crees que un menor usó la plataforma, contáctanos.

## 12. Cambios a esta política

Podemos actualizar esta política. Las modificaciones se publicarán aquí con la fecha de última actualización. El uso continuado de la plataforma después del cambio implica aceptación.

## 13. Contacto

Para preguntas, ejercicio de derechos o reclamos, usa el formulario en /contacto.

En Chile, ante la falta de respuesta o respuesta insatisfactoria, puedes acudir al Consejo para la Transparencia o tribunales competentes.`;

export default function Privacidad() {
  return (
    <LegalPage
      title="Política de privacidad"
      subtitle="Cómo manejamos los datos en CertiFoto, conforme a la Ley 19.628 de Chile"
      lastUpdated="abril 2026"
      content={CONTENT}
    />
  );
}
