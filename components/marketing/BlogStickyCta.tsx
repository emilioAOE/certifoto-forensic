"use client";

/**
 * Barra fija inferior en los artículos (solo móvil): aparece cuando el lector
 * lleva un tercio del artículo y se puede cerrar. En móvil el CTA del texto
 * queda lejos; esta barra es la salida más corta del blog a la app.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { track } from "@/lib/expansiel-analytics";

const LS_KEY = "cf_blog_sticky_cerrado";

export function BlogStickyCta({ slug }: { slug: string }) {
  const [visible, setVisible] = useState(false);
  const [cerrado, setCerrado] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LS_KEY)) return;
    } catch {
      /* sin storage: se muestra igual */
    }
    setCerrado(false);
    const onScroll = () => {
      const doc = document.documentElement;
      const avance = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      setVisible(avance > 0.33);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (cerrado || !visible) return null;

  const cerrar = () => {
    setCerrado(true);
    try {
      sessionStorage.setItem(LS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-3 py-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 leading-tight">
            Crea tu acta de entrega gratis
          </p>
          <p className="text-[11px] text-gray-500 leading-tight">
            Fotos con fecha y huella verificable · 10 min
          </p>
        </div>
        <Link
          href="/dashboard"
          onClick={() =>
            track("blog_cta_click", { destino: "/dashboard", articulo: slug, posicion: "sticky" })
          }
          className="inline-flex items-center gap-1 rounded-md bg-accent text-white px-3 py-2 text-xs font-semibold whitespace-nowrap"
        >
          Crear acta
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="p-1.5 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
