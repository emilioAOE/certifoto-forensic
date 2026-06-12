import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Términos de uso",
  description:
    "Términos y condiciones de uso de CertiFoto, plataforma de actas digitales para arriendos en Chile.",
  alternates: { canonical: "/terminos" },
};

const CONTENT = `Bienvenido a CertiFoto. Estos términos regulan el uso de nuestra plataforma. Al ingresar y utilizar el servicio aceptas estas condiciones.

## 1. Sobre el servicio

CertiFoto es una plataforma para la creación de actas digitales del estado de propiedades arrendadas. Permite cargar fotografías, agregar descripciones asistidas con inteligencia artificial, recolectar firmas digitales y generar documentos en formato PDF.

CertiFoto es una herramienta de respaldo documental. No constituye un servicio jurídico, notarial ni pericial profesional.

## 2. Naturaleza del registro generado

Los documentos generados por CertiFoto son registros digitales con respaldo técnico. Su valor probatorio depende del caso, las partes involucradas y la valoración que haga, en su caso, una autoridad competente.

CertiFoto no garantiza ni promete validez legal absoluta de los documentos generados. Recomendamos asesoría legal profesional para casos contenciosos.

## 3. Inteligencia artificial

Las descripciones generadas con inteligencia artificial son referenciales y deben ser revisadas por las partes antes de firmar. La IA no atribuye responsabilidades ni determina culpas. Las decisiones finales sobre el contenido del acta son responsabilidad de las partes humanas.

## 4. Privacidad y datos

Mientras se utilice CertiFoto sin cuenta, los datos se almacenan localmente en el navegador del usuario. CertiFoto no recibe ni almacena estos datos en servidores externos.

Si en el futuro se ofrece un servicio con cuenta y sincronización en la nube, será con consentimiento explícito y conforme a nuestra política de privacidad.

## 5. Responsabilidad del usuario

El usuario es responsable de:

- La veracidad de los datos ingresados.
- La autenticidad de las fotografías cargadas.
- Obtener el consentimiento de las personas que figuran en el acta.
- Cumplir con las leyes aplicables al uso del servicio.
- Conservar copia del PDF generado.

## 6. Propiedad intelectual

El usuario conserva todos los derechos sobre el contenido que carga (fotos, datos, observaciones). CertiFoto solo procesa este contenido para prestar el servicio.

La marca, software y diseño de CertiFoto son de su propiedad y están protegidos por las leyes aplicables.

## 7. Limitación de responsabilidad

CertiFoto se entrega "tal cual" sin garantías de ningún tipo. En la máxima medida permitida por la ley, no nos hacemos responsables de daños indirectos, lucro cesante, pérdida de datos o cualquier otro perjuicio derivado del uso del servicio.

## 8. Modificaciones

Podemos actualizar estos términos. Las modificaciones se publicarán en esta página con la fecha de última actualización. El uso continuado del servicio implica aceptación de los términos vigentes.

## 9. Contacto

Para consultas sobre estos términos usa el formulario de contacto en /contacto.`;

export default function Terminos() {
  return (
    <LegalPage
      title="Términos de uso"
      subtitle="Condiciones generales del servicio CertiFoto"
      lastUpdated="abril 2026"
      content={CONTENT}
    />
  );
}
