"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Check, Sparkles } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PacksGrid } from "./PacksGrid";
import { PACKS, PRECIO_EXPRESS_CLP, formatCLP } from "@/lib/packs";

/**
 * Dos formas de pagar, para dos públicos:
 *  - Certificado express ($2.000, sin cuenta): quien entrega o recibe una
 *    propiedad una vez. Sube contrato y fotos, paga, recibe el PDF.
 *  - Packs (10 y 50, con cuenta): corredores y administradoras. Firmas en
 *    pantalla, comparación entrega/devolución, menor precio por acta.
 */
export function PreciosPage() {
  const p10 = PACKS.find((p) => p.id === "p10");
  const p50 = PACKS.find((p) => p.id === "p50");

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">Precios</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Un certificado, <span className="text-accent">{formatCLP(PRECIO_EXPRESS_CLP)}</span>.
            <br />
            Packs si haces muchos.
          </h1>
          <p className="text-lg text-gray-600 mt-4 leading-relaxed">
            Pago único, sin suscripción. Cada foto queda con fecha y huella verificables y el PDF se puede comprobar
            en certifoto.cl/forensic sin cuenta.
          </p>
        </div>
      </section>

      {/* Express */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="rounded-2xl border-2 border-accent bg-white p-6 sm:p-10 shadow-lg shadow-accent/10 grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-softer border border-accent-light px-3 py-1 text-xs font-medium text-accent-dark mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Para una entrega o devolución
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Certificado express</h2>
            <p className="text-gray-600 mt-2 leading-relaxed">
              Subes el contrato y las fotos. La IA arma el acta, la revisas, pagas y recibes el PDF al instante y en
              tu correo. Sin crear cuenta.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-gray-700">
              <Item>Lectura del contrato: dirección, partes y RUT se completan solos</Item>
              <Item>Fotos ordenadas por ambiente, con descripción objetiva de cada una</Item>
              <Item>Fecha y huella SHA-256 en cada foto y en el documento</Item>
              <Item>PDF sellado con código QR, verificable por cualquiera</Item>
            </ul>
          </div>
          <div className="md:col-span-2 rounded-xl bg-gray-50 border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-600">Pago único</p>
            <p className="text-5xl font-bold text-gray-900 tracking-tight my-2">{formatCLP(PRECIO_EXPRESS_CLP)}</p>
            <p className="text-xs text-gray-500 mb-5">CLP · tarjeta o transferencia, por Flow</p>
            <Link
              href="/certificar"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-5 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors"
            >
              Hacer mi certificado
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-gray-500 mt-3">En 10 minutos, desde el celular.</p>
          </div>
        </div>
      </section>

      {/* Packs para corredores */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 mb-4">
              <Briefcase className="h-3.5 w-3.5" />
              Para corredores y administradoras
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Packs con cuenta</h2>
            <p className="text-gray-600 mt-3">
              Crear y editar actas es gratis; cada certificación consume 1 crédito. Con cuenta: firmas de las
              partes en pantalla, comparación entrega/devolución, respaldo en la nube y{" "}
              {p10 && p50 ? (
                <>
                  precio por acta de {formatCLP(p10.unitPriceCLP)} (pack de 10) o {formatCLP(p50.unitPriceCLP)} (pack de 50)
                </>
              ) : (
                "menor precio por acta"
              )}
              .
            </p>
          </div>
          <PacksGrid />
          <p className="text-center text-xs text-muted mt-6 max-w-xl mx-auto leading-relaxed">
            Precio de lanzamiento. Los créditos no vencen. Para más volumen, varios usuarios o tu marca en el
            documento,{" "}
            <Link href="/contacto?pack=50" className="underline">escríbenos</Link>.
          </p>
          <p className="text-center mt-4">
            <Link href="/corredores" className="text-sm font-semibold text-accent-dark hover:underline inline-flex items-center gap-1">
              Ver cómo funciona para corredores <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ corta */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Preguntas sobre el precio</h2>
        <dl className="space-y-6">
          <Faq q="¿Qué incluye el certificado express?">
            El acta completa en PDF: propiedad, partes, fotos por ambiente con descripción, fecha y huella de cada
            foto, huella del documento y código QR para verificarlo. Descarga inmediata y envío a tu correo.
          </Faq>
          <Faq q="¿Por qué los packs son más baratos por acta?">
            Porque son para quien certifica muchas: un corredor hace entregas todas las semanas. A cambio exigen
            cuenta, y eso habilita firmas en pantalla, respaldo en la nube y comparación entrega/devolución.
          </Faq>
          <Faq q="¿Qué pasa si no me gusta el resultado?">
            Revisas todo antes de pagar: dirección, partes, fotos y descripciones. Solo pagas cuando el acta está
            como la quieres.
          </Faq>
          <Faq q="¿Emiten boleta o factura?">
            Sí. El pago lo procesa Flow y recibes el comprobante por correo. Si necesitas factura, escríbenos desde
            contacto con los datos de tu empresa.
          </Faq>
        </dl>
      </section>

      <LandingFooter />
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-base font-semibold text-gray-900">{q}</dt>
      <dd className="mt-1.5 text-sm text-gray-600 leading-relaxed">{children}</dd>
    </div>
  );
}
