import { PreciosPage } from "@/components/marketing/PreciosPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { pricingProductSchema } from "@/lib/structured-data";

export const metadata = {
  title: "Precios",
  description:
    "Packs de certificaciones one-time. Crea actas gratis; paga solo cuando certificas. Precio de lanzamiento −50%: desde $1.490 CLP (1 cert) hasta $49.900 (50 certs).",
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
