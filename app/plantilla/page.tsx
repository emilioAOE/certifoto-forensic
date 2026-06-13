import Link from "next/link";
import {
  CheckCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  PenLine,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PlantillaLeadMagnet } from "@/components/marketing/PlantillaLeadMagnet";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

export const metadata = {
  title: "Plantilla gratis: acta de entrega de propiedad (PDF descargable)",
  description:
    "Descarga gratis una plantilla en PDF de acta de entrega de propiedad para arriendo o compraventa en Chile: checklist por ambiente, medidores, llaves, inventario y firmas. Lista para imprimir o completar.",
  alternates: { canonical: "/plantilla" },
  openGraph: {
    type: "website",
    title: "Plantilla gratis: acta de entrega de propiedad (PDF)",
    description:
      "Plantilla en PDF de acta de entrega para arriendo o compraventa en Chile. Checklist por ambiente, medidores, llaves, inventario y firmas. Descárgala gratis.",
    url: `${SITE_URL}/plantilla`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Plantilla gratis: acta de entrega de propiedad (PDF)",
    description:
      "Checklist por ambiente, medidores, llaves, inventario y firmas. Descárgala gratis.",
  },
};

const INCLUYE = [
  "Identificación del acta (entrega, devolución, inspección o inventario)",
  "Datos de las partes: arrendador, arrendatario, corredor o testigo",
  "Contrato, renta y garantía",
  "Estado por ambiente con checklist Bueno / Regular / Malo",
  "Lecturas de medidores (luz, agua, gas)",
  "Llaves y controles entregados",
  "Inventario para propiedades amobladas",
  "Daños preexistentes y observaciones",
  "Declaración de conformidad y firmas de ambas partes",
];

export default function PlantillaPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-softer border border-accent-light px-3 py-1 text-xs font-medium text-accent-dark mb-5">
              <FileText className="h-3.5 w-3.5" />
              <span>Descarga gratuita · PDF · Chile</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Plantilla de acta de entrega de propiedad
            </h1>

            <p className="text-lg text-gray-600 mt-5 leading-relaxed max-w-xl">
              Una plantilla en PDF lista para imprimir o completar en pantalla,
              pensada para arriendos y compraventas en Chile. Documenta el estado
              del inmueble el día de la entrega de llaves y evita discusiones al
              final del contrato.
            </p>

            <div className="mt-8 space-y-2.5">
              {INCLUYE.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 w-full">
            <PlantillaLeadMagnet />
          </div>
        </div>
      </section>

      {/* Cómo usarla */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Cómo usarla
          </p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Tres pasos para una entrega sin discusiones
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Step
            icon={<ClipboardList className="h-6 w-6" />}
            n={1}
            title="Imprime o ábrela"
            description="Lleva la plantilla a la entrega de llaves. Recórrela junto a la otra parte, ambiente por ambiente."
          />
          <Step
            icon={<PenLine className="h-6 w-6" />}
            n={2}
            title="Completa el estado"
            description="Marca Bueno, Regular o Malo en cada elemento, anota defectos preexistentes y registra medidores y llaves."
          />
          <Step
            icon={<CheckCircle className="h-6 w-6" />}
            n={3}
            title="Firmen ambas partes"
            description="La firma de ambas partes deja constancia de que aceptan el estado documentado el día de la entrega."
          />
        </div>
      </section>

      {/* Upsell forense */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-accent-light bg-white p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-accent-softer text-accent-dark p-3 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                  ¿Y si la quieres con respaldo forense?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  La plantilla en papel es un gran punto de partida. Pero una
                  foto pegada en un documento pierde su fecha y se puede
                  cuestionar. Con CertiFoto cada foto queda con su huella
                  criptográfica SHA-256, metadatos EXIF y fecha verificable, y
                  obtienes un PDF auto-verificable que prueba que nada se alteró.
                  Crear el acta es gratis y no necesitas registrarte.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
                  >
                    Crear mi acta gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/blog/acta-entrega-propiedad-arriendo-que-incluir"
                    className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent transition-colors"
                  >
                    Cómo hacer un acta que sirva de prueba
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function Step({
  icon,
  n,
  title,
  description,
}: {
  icon: React.ReactNode;
  n: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg bg-accent-softer text-accent-dark p-2.5">
          {icon}
        </div>
        <span className="text-xs font-bold text-accent-dark">Paso {n}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
