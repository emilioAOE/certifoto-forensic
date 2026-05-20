import { FaqPage } from "@/components/marketing/FaqPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema } from "@/lib/structured-data";
import { faqFlatQA } from "@/lib/faq-data";

export const metadata = {
  title: "Preguntas frecuentes",
  description: "Resolvemos las dudas más comunes sobre actas digitales, firma, evidencia fotográfica e inteligencia artificial en CertiFoto.",
  alternates: { canonical: "/faq" },
};

export default function Faq() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqFlatQA())} />
      <FaqPage />
    </>
  );
}
