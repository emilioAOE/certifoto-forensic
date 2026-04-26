"use client";

import { useEffect, useState } from "react";
import { HardDrive, AlertCircle } from "lucide-react";
import { getStorageQuota, type StorageQuota } from "@/lib/storage-idb";
import { subscribeToStorageChanges } from "@/lib/storage";
import { cn } from "@/lib/cn";

/**
 * Muestra un mini-indicador de cuanto espacio del navegador esta usando
 * CertiFoto. Si supera 80% advierte al usuario.
 */
export function StorageIndicator() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);

  const refresh = async () => {
    setQuota(await getStorageQuota());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStorageChanges(() => {
      refresh();
    });
    // Re-check periodicamente (la cuota puede cambiar mientras la app esta abierta)
    const interval = setInterval(refresh, 30_000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  if (!quota || !quota.available) return null;

  const usageMb = (quota.usage / 1024 / 1024).toFixed(1);
  const quotaMb = (quota.quota / 1024 / 1024).toFixed(0);
  const isWarning = quota.percent >= 80;
  const isCritical = quota.percent >= 95;

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-3",
        isCritical
          ? "border-red-200 bg-red-50"
          : isWarning
          ? "border-amber-200 bg-amber-50"
          : "border-gray-200"
      )}
      title={`${usageMb} MB usados de ${quotaMb} MB disponibles en tu navegador`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {isWarning ? (
          <AlertCircle
            className={cn(
              "h-3.5 w-3.5",
              isCritical ? "text-red-600" : "text-amber-600"
            )}
          />
        ) : (
          <HardDrive className="h-3.5 w-3.5 text-gray-500" />
        )}
        <span
          className={cn(
            "text-xs font-medium",
            isCritical
              ? "text-red-700"
              : isWarning
              ? "text-amber-700"
              : "text-gray-700"
          )}
        >
          {isCritical
            ? "Espacio casi agotado"
            : isWarning
            ? "Espacio limitado"
            : "Almacenamiento del navegador"}
        </span>
        <span className="text-[10px] text-gray-500 ml-auto font-mono">
          {usageMb} MB / {quotaMb} MB
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            isCritical
              ? "bg-red-600"
              : isWarning
              ? "bg-amber-500"
              : "bg-accent"
          )}
          style={{ width: `${Math.min(quota.percent, 100)}%` }}
        />
      </div>

      {isWarning && (
        <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
          {isCritical
            ? "Exporta y elimina actas viejas para liberar espacio antes de subir nuevas fotos."
            : "Considera exportar tus actas viejas para mantener espacio disponible."}
        </p>
      )}
    </div>
  );
}
