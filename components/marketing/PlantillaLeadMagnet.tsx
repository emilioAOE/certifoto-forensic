"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, CheckCircle, FileText, ArrowRight } from "lucide-react";

const PDF_URL = "/plantilla-acta-entrega-certifoto.pdf";
const LS_KEY = "certifoto_plantilla_descargada";

function triggerDownload() {
  const a = document.createElement("a");
  a.href = PDF_URL;
  a.download = "plantilla-acta-entrega-certifoto.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function PlantillaLeadMagnet() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya la descargó antes, mostramos el estado de descarga directa.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(LS_KEY)) setDone(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un email válido.");
      return;
    }
    if (!consent) {
      setError("Necesitamos tu autorización para enviarte la plantilla.");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company, // honeypot
          source: "plantilla-acta-entrega",
        }),
      });
    } catch {
      // No bloqueamos la descarga por un fallo de red.
    } finally {
      try {
        localStorage.setItem(LS_KEY, email.trim() || "1");
      } catch {
        /* ignore */
      }
      setLoading(false);
      setDone(true);
      triggerDownload();
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-accent-light bg-accent-softer p-6 sm:p-8 text-center">
        <div className="rounded-full bg-white border border-accent-light inline-flex p-3 mb-4">
          <CheckCircle className="h-8 w-8 text-accent-dark" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ¡Tu plantilla está lista!
        </h3>
        <p className="text-sm text-gray-600 mb-5 max-w-sm mx-auto">
          La descarga debería haber comenzado. Si no, usa el botón de abajo.
        </p>
        <button
          onClick={triggerDownload}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
        >
          <Download className="h-4 w-4" />
          Descargar plantilla (PDF)
        </button>
        <div className="mt-6 pt-5 border-t border-accent-light/60">
          <p className="text-sm text-gray-600 mb-3">
            ¿Quieres que tu acta tenga respaldo forense y firma de las partes?
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark hover:text-accent"
          >
            Crear un acta en CertiFoto, gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-lg bg-accent-softer text-accent-dark p-2.5">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            Descarga la plantilla gratis
          </h3>
          <p className="text-xs text-gray-500">
            Te la enviamos y la descargas al instante.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot: oculto para humanos */}
        <div className="hidden" aria-hidden="true">
          <label>
            No completar
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Nombre (opcional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="tucorreo@ejemplo.cl"
          />
        </div>

        <label className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
          />
          <span>
            Autorizo a CertiFoto a enviarme la plantilla y comunicaciones
            ocasionales. Puedo darme de baja cuando quiera. Ver{" "}
            <Link
              href="/privacidad"
              className="text-accent-dark underline underline-offset-2"
            >
              política de privacidad
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Preparando tu descarga…"
          ) : (
            <>
              <Download className="h-4 w-4" />
              Quiero la plantilla gratis
            </>
          )}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          PDF · 6 páginas · listo para imprimir o completar en pantalla.
        </p>
      </form>
    </div>
  );
}
