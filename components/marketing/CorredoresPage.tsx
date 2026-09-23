import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  FileCheck,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PacksGrid } from "@/components/marketing/PacksGrid";
import { PACKS, formatCLP } from "@/lib/packs";

/**
 * Landing para corredores y administradoras: el destino de todo lo que apunte
 * a ese público (grupos de Facebook, academias, gremios, anuncios). El
 * corredor hace entregas todas las semanas y compra packs; el particular
 * arrienda una vez cada tres años. Por eso el mensaje aquí es tiempo,
 * imagen profesional y cero discusiones al devolver la garantía.
 */

const CTA_URL = "/actas/nueva?utm_source=corredores&utm_medium=landing&utm_campaign=corredores";

export const FAQ_CORREDORES = [
  {
    question: "¿El acta sale con mi nombre y el de mi corredora?",
    answer:
      "Sí. El acta registra quién la emite (tú, como corredor o corredora) y las partes: arrendador y arrendatario, o comprador y vendedor, con RUT y correo tomados del contrato.",
  },
  {
    question: "¿El propietario o el arrendatario necesitan cuenta?",
    answer:
      "No. Solo tú usas la plataforma. Cuando certificas, les envías el PDF por correo desde CertiFoto con tu nombre (si responden, te llega a ti), y cualquiera puede comprobar su autenticidad en certifoto.cl/forensic sin registrarse.",
  },
  {
    question: "¿Cuánto cuesta por entrega?",
    answer: `Crear y editar actas es gratis. Cada certificación consume 1 crédito: con el pack de 10 sale a ${formatCLP(PACKS.find((p) => p.id === "p10")?.unitPriceCLP ?? 1249)} y con el de 50 a ${formatCLP(PACKS.find((p) => p.id === "p50")?.unitPriceCLP ?? 998)}, con el precio de lanzamiento. Los créditos no vencen y sirven para cualquier propiedad de tu cartera.`,
  },
  {
    question: "¿Sirve para la devolución al término del contrato?",
    answer:
      "Sí. Se crea un acta de devolución vinculada a la de entrega y se comparan lado a lado: los daños nuevos quedan documentados con fecha y huella. Es lo que cierra la discusión de la garantía en minutos.",
  },
  {
    question: "¿Qué pasa si el propietario duda de las fotos?",
    answer:
      "Cada foto lleva huella SHA-256, fecha y metadatos del equipo, y el PDF completo lleva su propia huella. Si alguien altera una foto, la huella deja de coincidir. Cualquiera puede verificarlo en certifoto.cl/forensic subiendo el PDF.",
  },
  {
    question: "¿Y si administro una cartera grande?",
    answer:
      "El pack de 50 cubre la mayoría de las administradoras. Si necesitas más volumen, varios usuarios o tu propia marca en el documento, escríbenos desde el formulario de contacto y armamos un paquete a medida.",
  },
];

export function CorredoresPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-softer border border-accent-light px-3 py-1 text-xs font-medium text-accent-dark mb-5">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Para corredores y administradoras de propiedades</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              La entrega profesional,{" "}
              <span className="text-accent">en 10 minutos</span>.
            </h1>
            <p className="text-lg text-gray-600 mt-5 leading-relaxed max-w-2xl">
              Sube el contrato y la IA completa dirección, partes, RUT y fechas.
              Tomas las fotos por ambiente, la IA describe el estado, y el acta
              sale sellada con tu nombre, lista para enviarla por correo al
              propietario y al arrendatario. Cada foto con fecha y huella
              verificables.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={CTA_URL}
                className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors shadow-sm"
              >
                Probar con tu próxima entrega
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#packs"
                className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent transition-colors"
              >
                Ver packs para corredores
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Crear el acta es gratis y no necesitas registrarte para partir. Pagas
              solo al certificar.
            </p>
          </div>
        </div>
      </section>

      {/* Por qué */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
          Lo que cambia para ti
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-10 max-w-2xl">
          Menos tiempo por entrega, mejor imagen ante el propietario y cero
          discusiones al devolver la garantía
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Beneficio
            icon={<Clock className="h-5 w-5" />}
            title="10 minutos, no una tarde"
            text="El contrato en PDF o foto se lee solo. Las fotos se ordenan por ambiente y la IA escribe la descripción objetiva de cada una. Tú revisas y certificas."
          />
          <Beneficio
            icon={<FileCheck className="h-5 w-5" />}
            title="Un acta que se ve profesional"
            text="PDF con portada, datos de la propiedad y las partes, fotos por ambiente, inventario, QR de verificación y anexo técnico. Lleva tu nombre como quien la emite."
          />
          <Beneficio
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Evidencia que nadie discute"
            text="Fecha y huella SHA-256 en cada foto y en el documento. Si el arrendatario dice que la mancha ya estaba, el acta responde por ti."
          />
          <Beneficio
            icon={<Mail className="h-5 w-5" />}
            title="Enviada a las partes en un clic"
            text="Tras certificar, la envías por correo al propietario y al arrendatario en un clic, con tu nombre; las respuestas te llegan a ti. Sin descargar ni adjuntar nada."
          />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-10">
            Cómo funciona en una entrega real
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Paso n={1} icon={<Sparkles className="h-5 w-5" />} title="Sube el contrato">
              La IA lee el PDF o la foto y completa dirección, partes, RUT, renta,
              garantía y fechas. Si ya tienes la propiedad en tu cartera, la
              reutilizas.
            </Paso>
            <Paso n={2} icon={<Building2 className="h-5 w-5" />} title="Recorre y fotografía">
              Fotos por ambiente, medidores, llaves e inventario. La IA reconoce
              el ambiente, describe el estado y marca posibles hallazgos. Tú
              corriges lo que quieras.
            </Paso>
            <Paso n={3} icon={<Users className="h-5 w-5" />} title="Confirma las partes">
              Arrendador y arrendatario ya vienen del contrato, con RUT y correo.
              Agregas al corredor o a un testigo si hace falta.
            </Paso>
            <Paso n={4} icon={<FileCheck className="h-5 w-5" />} title="Certifica y envía">
              Con 1 crédito el acta se sella y se desbloquea: PDF verificable,
              envío por correo a las partes y archivo para comparar al término del
              contrato.
            </Paso>
          </div>
        </div>
      </section>

      {/* Packs */}
      <section id="packs" className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Packs para corredores
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Pago único, los créditos no vencen y sirven para toda tu cartera
          </h2>
          <p className="text-gray-600 mt-3">
            Un crédito por acta certificada. Con el pack de 10, cada entrega sale a{" "}
            <span className="font-semibold text-gray-900">
              {formatCLP(PACKS.find((p) => p.id === "p10")?.unitPriceCLP ?? 1249)}
            </span>
            ; con el de 50, a{" "}
            <span className="font-semibold text-gray-900">
              {formatCLP(PACKS.find((p) => p.id === "p50")?.unitPriceCLP ?? 998)}
            </span>
            . Precio de lanzamiento.
          </p>
        </div>
        <PacksGrid variant="compact" />
        <p className="text-center text-xs text-muted mt-6">
          Pago con tarjeta o transferencia a través de Flow. Los créditos quedan en tu
          cuenta al instante.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
          Preguntas de corredores
        </h2>
        <dl className="space-y-6">
          {FAQ_CORREDORES.map((item) => (
            <div key={item.question}>
              <dt className="text-base font-semibold text-gray-900">{item.question}</dt>
              <dd className="mt-1.5 text-sm text-gray-600 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-accent-light bg-accent-softer p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Pruébalo con tu próxima entrega
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Crea el acta gratis, mira cómo queda y decide si la certificas. Diez
            minutos, desde el celular, sin registro para partir.
          </p>
          <Link
            href={CTA_URL}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            Crear acta de entrega
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function Beneficio({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="rounded-lg bg-accent-softer text-accent-dark p-2.5 inline-flex mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function Paso({
  n,
  icon,
  title,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 flex gap-4">
      <div className="shrink-0">
        <div className="h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
          {n}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5 text-accent-dark">
          {icon}
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
