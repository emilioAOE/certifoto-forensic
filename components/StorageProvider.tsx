"use client";

import { useEffect, useState } from "react";
import { hydrateStorage, getHydrationError } from "@/lib/storage";
import { Loader2, AlertTriangle } from "lucide-react";

/**
 * Wrapper que hidrata el cache de storage desde IndexedDB antes de renderizar
 * los hijos. Mantiene la API sincrona del resto de la app.
 *
 * Si la hidratacion tarda <100ms (caso comun) la pantalla de carga ni se nota.
 * Si IDB falla, mostramos un mensaje pero igual dejamos pasar a la app
 * (cache vacio in-memory para que algunas funciones sigan operativas).
 */
export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    hydrateStorage()
      .then(() => {
        if (cancelled) return;
        setReady(true);
        const err = getHydrationError();
        if (err) setError(err);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2
            className="h-6 w-6 text-accent animate-spin mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-500">Cargando tu plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center gap-2 justify-center">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            No se pudo cargar el almacenamiento local. Tus datos en memoria
            funcionaran solo durante esta sesion.
          </span>
        </div>
      )}
      {children}
    </>
  );
}
