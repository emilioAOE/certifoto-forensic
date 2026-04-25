"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

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

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-40 rounded-xl border border-gray-200 bg-white shadow-lg p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-accent-softer p-2 shrink-0">
          <Cookie className="h-4 w-4 text-accent-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Usamos cookies tecnicas
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Solo usamos cookies estrictamente necesarias para que la plataforma
            funcione. No usamos cookies publicitarias ni de seguimiento.{" "}
            <Link
              href="/privacidad"
              className="text-accent-dark hover:underline font-medium"
            >
              Mas info
            </Link>
            .
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex justify-end mt-3">
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
