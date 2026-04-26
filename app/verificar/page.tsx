import { VerificarPage } from "@/components/verify/VerificarPage";

export const metadata = {
  title: "Verificar acta firmada",
  description:
    "Importa un archivo .certifoto para verificar y firmar localmente. Util para corredores que reciben actas de arrendatarios para revisar.",
};

export default function Verificar() {
  return <VerificarPage />;
}
