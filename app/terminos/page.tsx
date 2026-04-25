import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Terminos de uso - CertiFoto",
};

const CONTENT = `Bienvenido a CertiFoto. Estos terminos regulan el uso de nuestra plataforma. Al ingresar y utilizar el servicio aceptas estas condiciones.

## 1. Sobre el servicio

CertiFoto es una plataforma para la creacion de actas digitales del estado de propiedades arrendadas. Permite cargar fotografias, agregar descripciones asistidas con inteligencia artificial, recolectar firmas digitales y generar documentos en formato PDF.

CertiFoto es una herramienta de respaldo documental. No constituye un servicio juridico, notarial ni pericial profesional.

## 2. Naturaleza del registro generado

Los documentos generados por CertiFoto son registros digitales con respaldo tecnico. Su valor probatorio depende del caso, las partes involucradas y la valoracion que haga, en su caso, una autoridad competente.

CertiFoto no garantiza ni promete validez legal absoluta de los documentos generados. Recomendamos asesoria legal profesional para casos contenciosos.

## 3. Inteligencia artificial

Las descripciones generadas con inteligencia artificial son referenciales y deben ser revisadas por las partes antes de firmar. La IA no atribuye responsabilidades ni determina culpas. Las decisiones finales sobre el contenido del acta son responsabilidad de las partes humanas.

## 4. Privacidad y datos

Mientras se utilice CertiFoto sin cuenta, los datos se almacenan localmente en el navegador del usuario. CertiFoto no recibe ni almacena estos datos en servidores externos.

Si en el futuro se ofrece un servicio con cuenta y sincronizacion en la nube, sera con consentimiento explicito y conforme a nuestra politica de privacidad.

## 5. Responsabilidad del usuario

El usuario es responsable de:

- La veracidad de los datos ingresados.
- La autenticidad de las fotografias cargadas.
- Obtener el consentimiento de las personas que figuran en el acta.
- Cumplir con las leyes aplicables al uso del servicio.
- Conservar copia del PDF generado.

## 6. Propiedad intelectual

El usuario conserva todos los derechos sobre el contenido que carga (fotos, datos, observaciones). CertiFoto solo procesa este contenido para prestar el servicio.

La marca, software y diseño de CertiFoto son de su propiedad y estan protegidos por las leyes aplicables.

## 7. Limitacion de responsabilidad

CertiFoto se entrega "tal cual" sin garantias de ningun tipo. En la maxima medida permitida por la ley, no nos hacemos responsables de daños indirectos, lucro cesante, perdida de datos o cualquier otro perjuicio derivado del uso del servicio.

## 8. Modificaciones

Podemos actualizar estos terminos. Las modificaciones se publicaran en esta pagina con la fecha de ultima actualizacion. El uso continuado del servicio implica aceptacion de los terminos vigentes.

## 9. Contacto

Para consultas sobre estos terminos puedes contactarnos en contacto@certifoto.cl.`;

export default function Terminos() {
  return (
    <LegalPage
      title="Terminos de uso"
      subtitle="Condiciones generales del servicio CertiFoto"
      lastUpdated="abril 2026"
      content={CONTENT}
    />
  );
}
