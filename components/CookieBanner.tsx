"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { pixelActivo } from "@/lib/meta-pixel";

const STORAGE_KEY = "certifoto:cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Mostrar despues de un pequeno delay para no chocar con el LCP
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "accepted");
    }
    setVisible(false);
  };

  const dismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    }
    setVisible(false);
  };

  if (!visible) return null;

  const pixel = pixelActivo();

  // En el celular es una franja de una línea: la tarjeta de antes tapaba un
  // cuarto de la pantalla justo donde debía verse el botón principal.
  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed z-50 bg-white shadow-lg border-gray-200 inset-x-0 bottom-0 border-t px-4 py-2.5 sm:inset-x-auto sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:rounded-xl sm:border sm:p-5"
    >
      <div className="flex items-center sm:items-start gap-3">
        <div className="hidden sm:block rounded-md bg-accent-softer p-2 shrink-0">
          <Cookie className="h-4 w-4 text-accent-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="hidden sm:block text-sm font-semibold text-gray-900 mb-1">
            Usamos cookies técnicas
          </p>
          <p className="text-[11px] sm:text-xs text-gray-600 leading-snug sm:leading-relaxed">
            <span className="sm:hidden">
              {pixel
                ? "Cookies técnicas y píxel de Meta para medir campañas."
                : "Solo usamos cookies técnicas necesarias."}
            </span>
            <span className="hidden sm:inline">
              {pixel
                ? "Usamos cookies técnicas para que la plataforma funcione y el píxel de Meta para medir nuestras campañas en Instagram. No vendemos tus datos."
                : "Solo usamos cookies estrictamente necesarias para que la plataforma funcione. No usamos cookies publicitarias ni de seguimiento."}
            </span>{" "}
            <Link
              href="/privacidad"
              className="text-accent-dark hover:underline font-medium"
            >
              Más info
            </Link>
            .
          </p>
        </div>
        <button
          onClick={accept}
          className="sm:hidden inline-flex items-center rounded-md bg-accent text-white px-3 py-1.5 text-xs font-semibold shrink-0"
        >
          Entendido
        </button>
        <button
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="hidden sm:block text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="hidden sm:flex justify-end mt-3">
        <button
          onClick={accept}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-1.5 text-xs font-semibold hover:bg-accent-dim transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
