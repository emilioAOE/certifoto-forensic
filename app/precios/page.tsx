import { PreciosPage } from "@/components/marketing/PreciosPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { pricingProductSchema } from "@/lib/structured-data";

export const metadata = {
  title: "Precios",
  description:
    "Packs de certificaciones one-time. Crea actas gratis; paga solo cuando certificas. Desde $2.990 CLP (1 cert) hasta $99.900 (50 certs).",
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
