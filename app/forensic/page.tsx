import { ForensicAnalyzer } from "@/components/ForensicAnalyzer";

export const metadata = {
  title: "Verificar Evidencia - CertiFoto",
  description: "Analisis forense de metadata para verificar autenticidad de imagenes.",
};

export default function ForensicPage() {
  return <ForensicAnalyzer />;
}
