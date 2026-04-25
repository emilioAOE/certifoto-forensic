import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Politica de privacidad",
  description:
    "Como CertiFoto trata los datos personales conforme a la Ley 19.628 de Chile. Datos almacenados localmente, sin compartir con terceros.",
};

const CONTENT = `En CertiFoto nos importa tu privacidad. Esta politica explica que datos manejamos, como los manejamos y que derechos tienes. Esta politica esta alineada con la Ley N° 19.628 sobre Proteccion de la Vida Privada de Chile.

## 1. Responsable del tratamiento

CertiFoto es una iniciativa con domicilio en Santiago, Chile. Para preguntas o ejercer derechos sobre tus datos, contactanos en contacto@certifoto.cl.

## 2. Que datos recolectamos

### Cuando usas la plataforma sin cuenta

- Datos de actas, propiedades y partes que ingresas (direccion, RUT, email, telefono cuando aplica).
- Fotografias que cargas, junto con sus metadatos EXIF.
- Firmas digitales que generes (imagen de la firma + metadatos: fecha, hora, navegador).
- Hashes criptograficos calculados de cada foto y del documento completo.

Todos estos datos se almacenan localmente en tu navegador (LocalStorage). CertiFoto no los recibe ni los almacena en sus servidores. Si limpias el almacenamiento de tu navegador, los datos se pierden.

### Datos tecnicos minimos

Nuestro proveedor de hosting (Vercel) registra datos tecnicos basicos como direccion IP, navegador y paginas visitadas, igual que cualquier sitio web. Esto se utiliza para fines estadisticos agregados y de seguridad.

### Cuando nos contactas

Si nos escribes por el formulario de contacto, recibimos tu nombre, email, telefono y mensaje. Usamos esa informacion solo para responderte. No la usamos para marketing salvo que nos lo autorices expresamente.

### Datos sensibles (firmas, RUT)

Las firmas digitales son datos biometricos en sentido amplio (signature_pad genera una imagen del trazado). Los RUT pueden considerarse datos personales especiales. CertiFoto los procesa exclusivamente en tu navegador. Si compartes el PDF generado con terceros, eres responsable de su uso posterior.

## 3. Bases legales del tratamiento

Tratamos tus datos con las siguientes bases:

- **Consentimiento:** al usar la plataforma autorizas el procesamiento descrito.
- **Ejecucion de un servicio:** para generar las actas que tu solicitas.
- **Interes legitimo:** para mejorar la plataforma con base en estadisticas anonimas.

## 4. Para que usamos los datos

- Prestar el servicio de creacion de actas digitales.
- Generar el respaldo forense (hash, metadatos EXIF) que es parte del valor del servicio.
- Responder consultas que nos hagan llegar.
- Mejorar la plataforma con base en estadisticas agregadas y anonimas.

**No vendemos, alquilamos ni compartimos datos personales con terceros para fines comerciales o de marketing.**

## 5. Inteligencia artificial

Cuando una funcion de IA requiere procesar una imagen, podemos enviar esa imagen a un proveedor de servicios de IA (modelos de vision computacional). Trabajamos solo con proveedores que cumplen con politicas estrictas de privacidad y que se comprometen contractualmente a no usar el contenido para entrenar sus modelos.

Las descripciones generadas por IA son **referenciales** y no atribuyen responsabilidades. Las partes deben revisarlas antes de firmar.

## 6. Cookies y almacenamiento local

CertiFoto usa:

- **Cookies tecnicas estrictamente necesarias** para que el sitio funcione.
- **LocalStorage** para guardar tus actas localmente (no es una cookie pero sirve a un proposito similar).
- **Vercel Analytics** para metricas anonimas y agregadas. No identifica usuarios individuales y no requiere consentimiento bajo la mayoria de jurisdicciones.

No usamos cookies de seguimiento publicitario, remarketing ni perfiles para ventas a terceros.

Puedes limpiar el almacenamiento del sitio en cualquier momento desde la configuracion de tu navegador.

## 7. Tus derechos (ARCO + portabilidad)

Tienes derecho a:

- **Acceso:** saber que datos tuyos estamos procesando. Como los datos viven en tu navegador, los puedes ver directamente desde la plataforma.
- **Rectificacion:** corregir datos imprecisos. Puedes editar cualquier acta antes de cerrarla.
- **Cancelacion / Eliminacion:** cada acta tiene un boton de eliminar; tambien puedes limpiar todo el almacenamiento del navegador. Si nos enviaste un email, podemos eliminarlo escribiendonos.
- **Oposicion:** puedes dejar de usar la plataforma en cualquier momento.
- **Portabilidad:** las actas se exportan como PDF/JSON; en el futuro habra un export ZIP completo.

Para ejercer cualquier derecho, escribe a contacto@certifoto.cl. Respondemos en un plazo maximo de 15 dias habiles.

## 8. Retencion de datos

- **Datos en tu navegador:** se mantienen indefinidamente hasta que tu los elimines o limpies el almacenamiento del browser.
- **Datos de contacto:** los conservamos mientras dure la conversacion, y hasta 2 anos despues para referencia.
- **Logs tecnicos del hosting:** segun politicas de Vercel (~30 dias por defecto).

## 9. Seguridad

Aplicamos medidas razonables para proteger los datos:

- Conexiones cifradas con HTTPS/TLS.
- Calculo de hashes criptograficos SHA-256 para verificar integridad.
- Almacenamiento local por defecto, evitando enviar datos innecesariamente a servidores externos.
- Procesamiento client-side de fotografias.

Ningun sistema es 100% seguro. Tu tambien eres responsable de la seguridad de tu dispositivo y de no compartir tu navegador con terceros si guardas actas con datos sensibles.

## 10. Transferencia internacional

Vercel tiene servidores fuera de Chile. Al usar el sitio aceptas que datos tecnicos minimos puedan transferirse a paises con regulaciones distintas (principalmente EE.UU. y Europa). Vercel tiene certificaciones de privacidad y cumple con GDPR.

Para los datos de la aplicacion (actas, fotos, firmas), permanecen en tu navegador y no salen de tu dispositivo.

## 11. Niños

CertiFoto no esta destinado a menores de 18 años. No recolectamos datos de menores de manera consciente. Si crees que un menor uso la plataforma, contactanos.

## 12. Cambios a esta politica

Podemos actualizar esta politica. Las modificaciones se publicaran aqui con la fecha de ultima actualizacion. El uso continuado de la plataforma despues del cambio implica aceptacion.

## 13. Contacto

Para preguntas, ejercicio de derechos o reclamos:

- Email: contacto@certifoto.cl
- Asunto sugerido: "Privacidad" o "Datos personales"

En Chile, ante la falta de respuesta o respuesta insatisfactoria, puedes acudir al Consejo para la Transparencia o tribunales competentes.`;

export default function Privacidad() {
  return (
    <LegalPage
      title="Politica de privacidad"
      subtitle="Como manejamos los datos en CertiFoto, conforme a la Ley 19.628 de Chile"
      lastUpdated="abril 2026"
      content={CONTENT}
    />
  );
}
