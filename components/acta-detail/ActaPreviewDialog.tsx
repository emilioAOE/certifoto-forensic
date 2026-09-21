"use client";

/**
 * Vista previa del acta en pantalla, sin descarga.
 *
 * Modelo de negocio (decisión de Emilio, 2026-09-21): crear y editar el acta es
 * gratis y se ve completa en la app, pero el PDF solo se obtiene al certificar
 * (1 crédito). Antes de eso, este diálogo genera el PDF en memoria (con marca
 * de agua BORRADOR) y lo dibuja página a página en <canvas> con pdf.js: se
 * puede mirar, no guardar. Es un cerrojo de producto, no de seguridad: una
 * captura de pantalla siempre es posible, y lleva marca de agua.
 */

import { useEffect, useRef, useState } from "react";
import { Award, Eye, Loader2, X } from "lucide-react";
import type { Acta, Property } from "@/lib/acta-types";
import { buildActaPdf } from "@/lib/acta-pdf";
import { loadPdfJs } from "@/lib/contract-parser";

interface ActaPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  acta: Acta;
  property: Property;
  /** Lleva al flujo de certificación (cierra el diálogo antes). */
  onCertify: () => void;
  credits: number;
}

export function ActaPreviewDialog({
  open,
  onClose,
  acta,
  property,
  onCertify,
  credits,
}: ActaPreviewDialogProps) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [progreso, setProgreso] = useState<{ pagina: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    const contenedor = pagesRef.current;
    setEstado("cargando");
    setProgreso(null);
    setError(null);

    (async () => {
      try {
        const { blob } = await buildActaPdf(acta, property);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
        if (cancelado || !contenedor) return;
        contenedor.innerHTML = "";
        const ancho = Math.min(contenedor.clientWidth || 720, 900);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelado) return;
          setProgreso({ pagina: i, total: pdf.numPages });
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (ancho * dpr) / base.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.className = "block rounded-md border border-gray-200 bg-white shadow-sm";
          canvas.oncontextmenu = (e) => e.preventDefault();
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          // intent "print": pdf.js no espera requestAnimationFrame, así que
          // termina de dibujar aunque el usuario cambie de pestaña a mitad.
          await page.render({ canvasContext: ctx, viewport, intent: "print" }).promise;
          if (cancelado) return;
          contenedor.appendChild(canvas);
        }
        setEstado("listo");
      } catch (err) {
        console.error("[vista previa]", err);
        setError(err instanceof Error ? err.message : "No se pudo generar la vista previa");
        setEstado("error");
      }
    })();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelado = true;
      window.removeEventListener("keydown", onKey);
      if (contenedor) contenedor.innerHTML = "";
    };
    // El acta y la propiedad no cambian mientras el diálogo está abierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="acta-preview-title"
        className="w-full max-w-4xl h-full max-h-[94vh] bg-gray-100 rounded-xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-amber-700 shrink-0">
            <Eye className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="acta-preview-title" className="text-sm font-semibold text-gray-900">
              Vista previa del acta
            </h2>
            <p className="text-xs text-gray-500 truncate">
              Con marca de agua BORRADOR. Para descargar el PDF y enviarlo por correo, certifica el acta.
            </p>
          </div>
          <button
            type="button"
            onClick={onCertify}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-accent text-white px-3 py-2 text-xs font-semibold hover:bg-accent-dim"
          >
            <Award className="h-3.5 w-3.5" />
            Certificar y descargar (1 crédito)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 select-none">
          {estado === "cargando" && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              {progreso
                ? `Dibujando página ${progreso.pagina} de ${progreso.total}…`
                : "Generando el PDF…"}
            </div>
          )}
          {estado === "error" && (
            <p className="text-sm text-danger text-center py-16" role="alert">
              {error}
            </p>
          )}
          <div ref={pagesRef} className="space-y-4 max-w-[900px] mx-auto" />
        </div>

        <div className="sm:hidden px-4 py-3 bg-white border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onCertify}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent text-white px-3 py-2.5 text-sm font-semibold hover:bg-accent-dim"
          >
            <Award className="h-4 w-4" />
            Certificar y descargar (1 crédito)
          </button>
          {credits > 0 && (
            <p className="text-[11px] text-gray-500 text-center mt-1.5">
              Tienes {credits} crédito{credits === 1 ? "" : "s"} disponible{credits === 1 ? "" : "s"}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
