import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CertificadoListo } from "@/components/express/CertificadoListo";

export const metadata = {
  title: "Tu certificado de entrega",
  robots: { index: false, follow: false },
};

export default function CertificarListoPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <section className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <CertificadoListo />
      </section>
      <LandingFooter />
    </div>
  );
}
