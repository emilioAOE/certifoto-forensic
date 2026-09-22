import { CorredoresPage, FAQ_CORREDORES } from "@/components/marketing/CorredoresPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema } from "@/lib/structured-data";

export const metadata = {
  title: "Actas de entrega para corredores de propiedades",
  description:
    "La entrega profesional en 10 minutos: la IA lee el contrato y describe las fotos, el acta sale sellada con tu nombre y se envía por correo a las partes. Packs para corredores y administradoras desde $998 por certificación.",
  alternates: { canonical: "/corredores" },
  openGraph: {
    type: "website",
    title: "CertiFoto para corredores: la entrega profesional en 10 minutos",
    description:
      "Acta de entrega con fotos certificadas, sellada con tu nombre y enviada a propietario y arrendatario. Crear es gratis; pagas al certificar.",
    url: "https://www.certifoto.cl/corredores",
  },
};

export default function Corredores() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ_CORREDORES)} />
      <CorredoresPage />
    </>
  );
}
