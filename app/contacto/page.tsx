import { ContactoPage } from "@/components/marketing/ContactoPage";

export const metadata = {
  title: "Contacto",
  description:
    "Contacta a CertiFoto para comprar packs de certificaciones, agendar una demo para corredoras y administradoras, o resolver dudas. Respondemos en menos de 48 horas.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  return <ContactoPage />;
}
