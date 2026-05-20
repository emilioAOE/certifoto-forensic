"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { hydrateStorage, getHydrationError } from "@/lib/storage";

/**
 * Hidrata el cache de storage desde IndexedDB y expone el estado de
 * preparacion via contexto. NO bloquea el render del arbol: las paginas
 * publicas (landing, FAQ, precios, blog, etc.) se renderizan en el servidor
 * de inmediato — clave para SEO y para que los motores generativos (GEO)
 * lean el contenido sin ejecutar JS.
 *
 * Las paginas de la app (que dependen del cache sincrono) esperan a `ready`
 * a traves de AppShell, que muestra la pantalla de carga solo en esas rutas.
 */

interface StorageReadyState {
  ready: boolean;
  error: string | null;
}

const StorageReadyContext = createContext<StorageReadyState>({
  ready: false,
  error: null,
});

export function useStorageReady(): StorageReadyState {
  return useContext(StorageReadyContext);
}

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

  return (
    <StorageReadyContext.Provider value={{ ready, error }}>
      {children}
    </StorageReadyContext.Provider>
  );
}
