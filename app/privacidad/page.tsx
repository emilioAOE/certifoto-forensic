import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata = {
  title: "Politica de privacidad - CertiFoto",
};

const CONTENT = `En CertiFoto nos importa tu privacidad. Esta politica explica que datos manejamos, como los manejamos y que opciones tienes.

## 1. Que datos recolectamos

### Cuando usas la plataforma sin cuenta

- Datos de actas, propiedades y partes que ingresas.
- Fotografias que cargas.
- Firmas digitales que generes.

Todos estos datos se almacenan localmente en tu navegador (LocalStorage). CertiFoto no los recibe en sus servidores.

### Datos tecnicos minimos

Cuando visitas el sitio, nuestro proveedor de hosting registra datos tecnicos basicos como direccion IP, navegador y paginas visitadas, igual que cualquier sitio web. Esto se utiliza para fines estadisticos y de seguridad.

### Cuando nos contactas

Si nos escribes a traves del formulario de contacto, recibimos tu nombre, email y mensaje. Usamos esa informacion solo para responderte.

## 2. Para que usamos los datos

- Prestar el servicio de creacion de actas digitales.
- Generar el respaldo forense (hash, metadatos) que es parte del servicio.
- Responder consultas que nos hagan llegar.
- Mejorar la plataforma con base en estadisticas agregadas.

No vendemos ni compartimos datos con terceros para fines de marketing.

## 3. Inteligencia artificial

Cuando una funcion de IA requiere procesar una imagen, podemos enviar esa imagen a un proveedor de servicios de IA (modelos de vision computacional). Trabajamos solo con proveedores que cumplen con politicas estrictas de privacidad y que se comprometen a no usar el contenido para entrenar sus modelos.

## 4. Cookies

CertiFoto usa cookies tecnicas estrictamente necesarias para que el sitio funcione. No utilizamos cookies de seguimiento publicitario.

Si en el futuro implementamos analiticas, te informaremos y te daremos la opcion de aceptar o rechazar.

## 5. Tus derechos

En cualquier momento puedes:

- Acceder a tus datos: estan en tu navegador, los puedes ver desde la plataforma.
- Eliminarlos: cada acta tiene un boton de eliminar; tambien puedes limpiar todo el almacenamiento del navegador.
- Pedirnos informacion: escribenos a contacto@certifoto.cl si tienes dudas.

## 6. Seguridad

Aplicamos medidas razonables para proteger los datos:

- Conexiones cifradas con HTTPS.
- Calculo de hashes criptograficos para verificar integridad.
- Almacenamiento local por defecto, evitando enviar datos innecesariamente a servidores.

Ningun sistema es 100% seguro, pero hacemos todo lo posible para minimizar riesgos.

## 7. Niños

CertiFoto no esta destinado a menores de edad. No recolectamos datos de menores de manera consciente.

## 8. Cambios a esta politica

Podemos actualizar esta politica. Las modificaciones se publicaran aqui con la fecha de ultima actualizacion.

## 9. Contacto

Para preguntas sobre privacidad o ejercer derechos sobre tus datos, escribenos a contacto@certifoto.cl.`;

export default function Privacidad() {
  return (
    <LegalPage
      title="Politica de privacidad"
      subtitle="Como manejamos los datos en CertiFoto"
      lastUpdated="abril 2026"
      content={CONTENT}
    />
  );
}
