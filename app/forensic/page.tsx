import { CertificateVerifier } from "@/components/verify/CertificateVerifier";

export const metadata = {
  title: "Verificar certificado",
  description:
    "Comprueba la autenticidad e integridad de un certificado .certifoto emitido por CertiFoto.",
};

export default function ForensicPage() {
  return <CertificateVerifier />;
}
