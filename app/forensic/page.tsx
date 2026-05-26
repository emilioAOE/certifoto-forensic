import { CertificateVerifier } from "@/components/verify/CertificateVerifier";

export const metadata = {
  title: "Verificar certificado",
  description:
    "Comprueba la autenticidad e integridad de un certificado emitido por CertiFoto. Sube el PDF o el archivo .certifoto: la verificación es local en tu navegador y no guardamos nada.",
  alternates: { canonical: "/forensic" },
};

export default function ForensicPage() {
  return <CertificateVerifier />;
}
