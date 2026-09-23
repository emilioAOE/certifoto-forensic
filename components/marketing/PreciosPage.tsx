"use client";

import Link from "next/link";
import { ArrowRight, Lock, Award, Coins } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PacksGrid } from "./PacksGrid";

export function PreciosPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Packs de certificaciones
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Crea actas <span className="text-accent">gratis</span>.<br />
            Paga solo cuando certificas.
          </h1>
          <p className="text-lg text-gray-600 mt-4 leading-relaxed">
            La app es gratis e ilimitada. Cuando un acta está lista para
            entregarse formalmente al cliente, la certificas — se sella el
            documento, se quita la marca de agua y queda inmutable. Cada
            certificación consume 1 crédito de tu pack.
          </p>
        </div>
      </section>

      {/* Como funciona el modelo */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-4">
          <ExplainCard
            icon={<Coins className="h-5 w-5" />}
            step="1"
            title="Compra un pack"
            description="Pago único, sin suscripción. Mientras más grande el pack, menor el precio por certificación."
          />
          <ExplainCard
            icon={<Lock className="h-5 w-5" />}
            step="2"
            title="Trabaja gratis"
            description="Crea, edita y revisa actas todo lo que necesites. Sube el contrato y las fotos, recoge las firmas y mira la vista previa en pantalla. Sin límites mientras estén en borrador."
          />
          <ExplainCard
            icon={<Award className="h-5 w-5" />}
            step="3"
            title="Certifica al final"
            description="Cuando el acta está lista, la sellas con 1 crédito. Ahí se desbloquea: descarga del PDF sin marca de agua, envío por correo a las partes, QR de verificación y sello inmutable."
          />
        </div>
      </section>

      {/* Pricing grid */}
      <section className="max-w-6xl mx-auto px-4 pt-4 pb-16">
        <PacksGrid />
        <p className="text-center text-xs text-muted mt-6 max-w-xl mx-auto leading-relaxed">
          Precios en pesos chilenos (CLP). Pago único por pack — los créditos
          no caducan y se acumulan.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
          Dudas frecuentes sobre los packs
        </h2>
        <div className="space-y-6">
          <FaqMini
            q="¿Tengo que pagar para empezar?"
            a="No. La app es gratis para crear, editar y revisar actas, con vista previa del PDF en pantalla. Pagas al certificar: es lo que desbloquea la descarga del PDF y el envío por correo."
          />
          <FaqMini
            q="¿Qué significa exactamente certificar un acta?"
            a="Sellar el documento y desbloquearlo. Se calcula un hash SHA-256 final, se elimina la marca de agua, se inserta un QR de verificación y el acta queda inmutable. Desde ese momento puedes descargar el PDF y enviarlo por correo; cualquiera puede verificarlo en certifoto.cl/forensic. Requiere 1 crédito."
          />
          <FaqMini
            q="¿Caducan los créditos?"
            a="No. Una vez que compras un pack, los créditos no caducan. Úsalos a tu ritmo."
          />
          <FaqMini
            q="¿Cómo me cobran?"
            a="Con tarjeta o transferencia a través de Flow, directamente desde esta página. Los créditos quedan en tu cuenta al instante. Si prefieres coordinar el pago por otra vía, escríbenos desde el formulario de contacto."
          />
          <FaqMini
            q="¿Qué pasa si limpio mi navegador o cambio de equipo?"
            a="Nada. Los créditos viven en tu cuenta, no en el navegador: inicias sesión con tu correo desde cualquier dispositivo y ahí están. Tus actas también se respaldan en la nube cuando inicias sesión."
          />
          <FaqMini
            q="¿Y si necesito más de 50 certificaciones al mes?"
            a="Contáctanos a través del formulario en /contacto. Para corredoras y administradoras grandes preparamos paquetes a medida con marca propia y panel multi-usuario."
          />
          <FaqMini
            q="¿Puedo regalar o transferir créditos?"
            a="Por ahora los créditos viven asociados al navegador donde compraste el pack. Si necesitas transferirlos, escríbenos y lo hacemos manualmente."
          />
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Empieza gratis
          </h2>
          <p className="text-gray-300 mt-3 max-w-xl mx-auto">
            Crea tu primera acta en minutos. Compras un pack solo cuando
            necesites certificarla.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-dim transition-colors"
            >
              Ingresar a la plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/20 text-white px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Preguntas frecuentes
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function ExplainCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-md bg-accent-softer text-accent-dark p-2">
          {icon}
        </div>
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          Paso {step}
        </span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FaqMini({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{q}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
    </div>
  );
}
