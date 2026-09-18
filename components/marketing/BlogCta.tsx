"use client";

/**
 * CTA contextual para los articulos del blog — el "puente" entre el trafico
 * de lectura (SEO) y la app.
 *
 * Se usa en dos posiciones:
 *  - mid:  a mitad del articulo, oferta de baja friccion (plantilla PDF gratis).
 *  - end:  al cierre, cuando ya leyo todo, oferta principal (crear el acta).
 *
 * Cada clic emite un evento `blog_cta_click` para poder medir si el puente
 * efectivamente convierte.
 */

import Link from "next/link";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";
import { track } from "@/lib/expansiel-analytics";
import type { CtaConfig } from "@/lib/blog-cta";

export function BlogCta({
  config,
  slug,
  compact = false,
}: {
  config: CtaConfig;
  slug: string;
  compact?: boolean;
}) {
  const onClick = (href: string) => {
    track("blog_cta_click", {
      destino: href,
      articulo: slug,
      posicion: compact ? "mid" : "end",
    });
  };

  const Icon = config.icon === "plantilla" ? Download : ShieldCheck;

  if (compact) {
    return (
      <aside className="my-8 rounded-xl border border-accent-light bg-accent-softer p-5 sm:flex sm:items-center sm:gap-5">
        <div className="flex items-start gap-3 sm:flex-1">
          <div className="rounded-lg bg-white border border-accent-light p-2 text-accent-dark shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-snug">
              {config.title}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              {config.description}
            </p>
          </div>
        </div>
        <Link
          href={config.primary.href}
          onClick={() => onClick(config.primary.href)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors whitespace-nowrap shrink-0 w-full sm:w-auto"
        >
          {config.primary.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </aside>
    );
  }

  return (
    <div className="rounded-2xl border border-accent-light bg-accent-softer p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-white border border-accent-light p-3 text-accent-dark shrink-0 hidden sm:block">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
            {config.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {config.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={config.primary.href}
              onClick={() => onClick(config.primary.href)}
              className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
            >
              {config.primary.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {config.secondary && (
              <Link
                href={config.secondary.href}
                onClick={() => onClick(config.secondary!.href)}
                className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent-dark transition-colors"
              >
                {config.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
