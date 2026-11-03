import { PreciosPage } from "@/components/marketing/PreciosPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { pricingProductSchema } from "@/lib/structured-data";

export const metadata = {
  title: "Precios",
  description:
    "Certificado de entrega por $2.000, sin cuenta: subes el contrato y las fotos y recibes el PDF. Para corredores, packs de 10 y 50 certificaciones desde $998 por acta.",
  alternates: { canonical: "/precios" },
};

export default function Precios() {
  return (
    <>
      <JsonLd data={pricingProductSchema()} />
      <PreciosPage />
    </>
  );
}
