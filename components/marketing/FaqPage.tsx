"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowRight, MessageCircle } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { cn } from "@/lib/cn";
import { FAQ_SECTIONS, type FaqItem, type FaqSection } from "@/lib/faq-data";

export function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Centro de ayuda
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Preguntas frecuentes
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Resolvemos las dudas más comunes sobre actas digitales, firma,
            evidencia fotográfica e inteligencia artificial.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {FAQ_SECTIONS.map((section, sIdx) => (
          <SectionBlock key={sIdx} section={section} />
        ))}
      </section>

      {/* Contact CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-accent-light bg-accent-softer p-8 text-center">
          <MessageCircle className="h-8 w-8 text-accent-dark mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Quedaste con dudas?
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Ingresa a la plataforma y empieza a probar gratis, o{" "}
            <a href="/contacto" className="text-accent-dark hover:underline">escríbenos</a>.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-accent hover:text-accent-dark transition-colors"
            >
              Contáctanos
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
            >
              Ingresar a la plataforma
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function SectionBlock({ section }: { section: FaqSection }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {section.title}
        </h2>
        {section.description && (
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
        )}
      </div>

      <div className="space-y-2">
        {section.items.map((item, idx) => (
          <FaqAccordion key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border bg-white transition-colors",
        open ? "border-accent-light" : "border-gray-200 hover:border-gray-300"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
      >
        <span className="text-base font-semibold text-gray-900">{item.q}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          {Array.isArray(item.a) ? (
            <ul className="space-y-1.5 text-sm text-gray-700 leading-relaxed">
              {item.a.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent-dark mt-0.5">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
          )}
        </div>
      )}
    </div>
  );
}
