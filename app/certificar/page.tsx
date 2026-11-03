import Link from "next/link";
import { ArrowRight, Camera, CheckCircle, FileText, Mail, ShieldCheck, Sparkles, X } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CertificadoExpress } from "@/components/express/CertificadoExpress";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema } from "@/lib/structured-data";
import { PRECIO_EXPRESS_CLP, formatCLP } from "@/lib/packs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";
const PRECIO = formatCLP(PRECIO_EXPRESS_CLP);

const FAQ = [
  {
    question: "¿Qué recibo exactamente?",
    answer: `Un PDF con los datos de la propiedad y las partes, las fotos ordenadas por ambiente con una descripción objetiva de cada una, la fecha y la huella digital (SHA-256) de cada foto y del documento completo, y un código QR para verificarlo. Lo descargas al instante y te llega por correo. Cuesta ${PRECIO}, pago único.`,
  },
  {
    question: "¿Necesito crear una cuenta?",
    answer: "No. Solo tu correo, para enviarte el certificado. Si después quieres hacer varias actas, firmas en pantalla o comparar la entrega con la devolución, existe la versión con cuenta para corredores.",
  },
  {
    question: "¿Sirve como prueba?",
    answer: "Es tu registro del estado de la propiedad en una fecha, con huella verificable de cada foto: si alguien altera una imagen o el PDF, la huella deja de coincidir, y cualquiera puede comprobarlo en certifoto.cl/forensic. No incluye la firma de la otra parte; conviene enviárselo el mismo día para que ambos tengan el mismo registro.",
  },
  {
    question: "¿Y si no tengo el contrato?",
    answer: "No es obligatorio. Con el contrato la IA completa la dirección, las partes y los RUT; sin él, los escribes tú en la pantalla de revisión. Las fotos son lo importante.",
  },
  {
    question: "¿Puedo pagar con transferencia?",
    answer: "Sí. El pago es por Flow: tarjeta de crédito o débito, transferencia bancaria y otros medios. No guardamos datos de tu tarjeta.",
  },
];

export const metadata = {
  title: `Certificado de entrega de propiedad por ${PRECIO}: sube el contrato y las fotos`,
  description: `Sube el contrato y las fotos de la propiedad y recibe un acta de entrega certificada en PDF: fotos con fecha y huella verificables, descripción con IA y código QR. ${PRECIO}, sin cuenta, en 10 minutos.`,
  alternates: { canonical: "/certificar" },
  openGraph: {
    type: "website",
    title: `Tu acta de entrega certificada por ${PRECIO}`,
    description: "Sube el contrato y las fotos. Recibes el PDF al instante y en tu correo, con fecha y huella verificables en cada foto.",
    url: `${SITE_URL}/certificar`,
  },
};

export default function CertificarPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={faqPageSchema(FAQ)} />
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-softer border border-accent-light px-3 py-1 text-xs font-medium text-accent-dark mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Certificado express · {PRECIO} · sin cuenta</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Tu acta de entrega, <span className="text-accent">certificada</span>, por {PRECIO}
            </h1>
            <p className="text-lg text-gray-600 mt-5 leading-relaxed max-w-2xl">
              Sube el contrato y las fotos de la propiedad. La IA arma el acta, la revisas, pagas y recibes el PDF al
              instante y en tu correo. Cada foto queda con fecha y huella digital verificables.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-2xl">
              <Paso icon={<FileText className="h-4 w-4" />} n={1} texto="Sube el contrato (opcional) y las fotos" />
              <Paso icon={<Camera className="h-4 w-4" />} n={2} texto="La IA ordena y describe; tú revisas" />
              <Paso icon={<Mail className="h-4 w-4" />} n={3} texto={`Pagas ${PRECIO} y recibes el PDF`} />
            </div>
          </div>
        </div>
      </section>

      {/* El flujo */}
      <section className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <CertificadoExpress />
      </section>

      {/* Plantilla vs certificado */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-center mb-8">
            ¿Plantilla gratis o certificado?
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Plantilla en PDF</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">Gratis</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <Fila ok>La imprimes y la llenas a mano el día de la entrega</Fila>
                <Fila ok>Checklist por ambiente, medidores, llaves e inventario</Fila>
                <Fila ok>Firmas en papel de ambas partes</Fila>
                <Fila>Las fotos van aparte, sin fecha verificable</Fila>
                <Fila>Nada que un tercero pueda comprobar</Fila>
              </ul>
              <Link href="/plantilla" className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-gray-700 hover:text-accent-dark">
                Descargar la plantilla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-accent bg-white p-6 shadow-lg shadow-accent/10">
              <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-1">Certificado express</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">{PRECIO} <span className="text-sm font-normal text-gray-500">pago único</span></p>
              <ul className="space-y-2 text-sm text-gray-700">
                <Fila ok>Solo subes el contrato y las fotos: la IA arma el acta</Fila>
                <Fila ok>Cada foto con fecha y huella SHA-256 verificables</Fila>
                <Fila ok>Descripción objetiva del estado de cada foto</Fila>
                <Fila ok>PDF sellado con código QR; cualquiera lo verifica</Fila>
                <Fila ok>Al instante y en tu correo, sin cuenta</Fila>
              </ul>
              <a href="#express" className="inline-flex items-center gap-1.5 mt-5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim">
                Hacer mi certificado <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6 max-w-2xl mx-auto">
            ¿Corredor o administradora? Con cuenta hay firmas en pantalla, comparación entrega/devolución y packs desde{" "}
            {formatCLP(998)} por acta:{" "}
            <Link href="/corredores" className="underline">ver la versión para corredores</Link>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Preguntas frecuentes</h2>
        <dl className="space-y-6">
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="text-base font-semibold text-gray-900">{item.question}</dt>
              <dd className="mt-1.5 text-sm text-gray-600 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-xs text-gray-500 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
          Para leer el contrato y describir las fotos enviamos esas imágenes a nuestro proveedor de IA, que no las usa
          para entrenar modelos. Las fotos y el PDF se guardan 90 días para que puedas recuperarlos; la huella del
          documento queda registrada de forma permanente para verificarlo.
        </p>
      </section>

      <LandingFooter />
    </div>
  );
}

function Paso({ icon, n, texto }: { icon: React.ReactNode; n: number; texto: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-800">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white text-[11px] font-bold shrink-0">{n}</span>
      <span className="text-accent-dark">{icon}</span>
      <span>{texto}</span>
    </div>
  );
}

function Fila({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" /> : <X className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />}
      <span className={ok ? "" : "text-gray-500"}>{children}</span>
    </li>
  );
}
