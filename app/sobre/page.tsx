import { SobrePage } from "@/components/marketing/SobrePage";

export const metadata = {
  title: "Sobre nosotros",
  description: "Por que existe CertiFoto y que problema queremos resolver en el mercado de los arriendos.",
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return <SobrePage />;
}
