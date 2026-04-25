"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log al consola; en produccion idealmente a un servicio (Sentry)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full bg-amber-50 border border-amber-200 inline-flex p-4 mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Algo salio mal
        </h1>
        <p className="text-gray-600 leading-relaxed mb-1">
          Ocurrio un error inesperado al cargar esta seccion.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Tus datos guardados localmente no se vieron afectados.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6">
            Codigo del error: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-10">
          Si el error persiste, contactanos en{" "}
          <a
            href="mailto:contacto@certifoto.cl"
            className="text-accent-dark hover:underline"
          >
            contacto@certifoto.cl
          </a>
          .
        </p>
      </div>
    </div>
  );
}
