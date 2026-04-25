"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { cn } from "@/lib/cn";

interface Plan {
  name: string;
  price: string;
  unit: string;
  description: string;
  cta: string;
  ctaHref: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    name: "Personal",
    price: "Gratis",
    unit: "",
    description: "Para arrendadores o arrendatarios que necesitan documentar su propiedad ocasionalmente.",
    cta: "Empezar ahora",
    ctaHref: "/dashboard",
    features: [
      "Actas ilimitadas",
      "Subida de fotos por ambiente",
      "Descripciones asistidas con IA",
      "Respaldo forense de cada foto",
      "Firma digital simple",
      "PDF formal listo para descargar",
      "Almacenamiento local privado",
    ],
  },
  {
    name: "Pro Corredores",
    price: "$14.990",
    unit: "/ mes",
    description: "Para corredores independientes que documentan multiples propiedades cada mes.",
    cta: "Solicitar acceso anticipado",
    ctaHref: "/contacto",
    highlighted: true,
    badge: "Recomendado",
    features: [
      "Todo lo del plan Personal",
      "Hasta 50 actas por mes",
      "Cuenta con sincronizacion en la nube",
      "Plantillas de actas personalizables",
      "Logo y marca propia en el PDF",
      "Invitaciones a partes via email/WhatsApp",
      "Comparacion entrega vs devolucion (proximamente)",
      "Soporte prioritario",
    ],
  },
  {
    name: "Business",
    price: "Conversemos",
    unit: "",
    description: "Para corredoras y administradoras con multiples ejecutivos y carteras grandes.",
    cta: "Hablemos",
    ctaHref: "/contacto",
    features: [
      "Todo lo del plan Pro",
      "Actas ilimitadas",
      "Multi-usuario con roles y permisos",
      "Dashboard gerencial",
      "Marca blanca completa",
      "API de integracion (CRM/ERP)",
      "Auditoria avanzada",
      "Soporte dedicado y onboarding",
    ],
  },
];

export function PreciosPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Planes
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Un plan para cada necesidad
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Empieza gratis. Si lo usas profesionalmente y necesitas mas
            funciones, tenemos planes pensados para corredores y administradoras.
          </p>
        </div>
      </section>

      {/* Pricing grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl border bg-white p-7 flex flex-col",
                plan.highlighted
                  ? "border-accent shadow-lg shadow-accent/10 relative"
                  : "border-gray-200"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed min-h-[3rem]">
                {plan.description}
              </p>

              <div className="mt-6 mb-2">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">
                  {plan.price}
                </span>
                {plan.unit && (
                  <span className="text-sm text-gray-500 ml-1">{plan.unit}</span>
                )}
              </div>

              <Link
                href={plan.ctaHref}
                className={cn(
                  "mt-4 inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
                  plan.highlighted
                    ? "bg-accent text-white hover:bg-accent-dim"
                    : "bg-gray-100 text-gray-900 border border-gray-200 hover:border-accent hover:text-accent-dark"
                )}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <ul className="mt-6 space-y-2.5 pt-6 border-t border-gray-100">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-accent-dark shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ corto */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
          Dudas frecuentes sobre planes
        </h2>
        <div className="space-y-6">
          <FaqMini
            q="¿Tengo que pagar para empezar?"
            a="No. Puedes usar el plan Personal gratis sin tarjeta de credito ni periodo de prueba limitado."
          />
          <FaqMini
            q="¿Cuando estaran disponibles los planes Pro y Business?"
            a="Estamos en pruebas privadas con un grupo de corredores. Si te interesa acceso anticipado, contactanos y te avisamos cuando este disponible."
          />
          <FaqMini
            q="¿Como se factura?"
            a="Los planes Pro se cobran mensualmente con boleta o factura electronica. El plan Business se ajusta segun tamaño y se factura mensual o anualmente."
          />
          <FaqMini
            q="¿Puedo cambiar de plan?"
            a="Si, en cualquier momento. Si subes de plan se prorratea desde el dia. Si bajas, se aplica desde el siguiente periodo."
          />
        </div>
      </section>

      <LandingFooter />
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
