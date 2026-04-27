"use client";

import { useEffect, useRef } from "react";
import {
  Sparkles,
  Shield,
  AlertTriangle,
  X,
} from "lucide-react";
import type { PhotoEvidence } from "@/lib/acta-types";
import {
  DAMAGE_TYPE_LABEL,
  DAMAGE_SEVERITY_LABEL,
  DAMAGE_SEVERITY_COLOR,
} from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

interface PhotoDetailModalProps {
  photo: PhotoEvidence;
  onClose: () => void;
}

/**
 * Modal de detalle de una foto. Muestra imagen, analisis IA, respaldo
 * forense y advertencias. Soporta Escape para cerrar.
 */
export function PhotoDetailModal({ photo, onClose }: PhotoDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de foto ${photo.fileName}`}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full bg-white border border-gray-200 rounded-lg overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {photo.fileName}
          </h3>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-h-[80vh] overflow-y-auto">
          {/* Image */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.dataUrl}
              alt={photo.fileName}
              className="w-full rounded-lg"
            />
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm">
            {/* AI */}
            {photo.aiAnalysis && (
              <div className="rounded-md bg-purple-50 border border-purple-200 p-3">
                <div className="flex items-center gap-1 mb-1.5 text-xs text-purple-700 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Analisis IA
                </div>
                <p className="text-gray-700 leading-relaxed mb-2">
                  {photo.aiAnalysis.caption}
                </p>
                <p className="text-xs text-gray-500">
                  Estado: {photo.aiAnalysis.conditionSummary}
                </p>
                {photo.aiAnalysis.damageFindings.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-100 space-y-1">
                    <p className="text-xs text-purple-700 uppercase tracking-wider mb-1">
                      Hallazgos
                    </p>
                    {photo.aiAnalysis.damageFindings.map((f) => (
                      <div key={f.id} className="text-xs">
                        <span
                          className={cn(
                            "font-medium",
                            DAMAGE_SEVERITY_COLOR[f.severity]
                          )}
                        >
                          [{DAMAGE_SEVERITY_LABEL[f.severity]}]
                        </span>{" "}
                        <span className="text-gray-600">
                          {DAMAGE_TYPE_LABEL[f.type]}
                        </span>
                        <p className="text-gray-500 mt-0.5">{f.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Forensic summary */}
            {photo.forensic && (
              <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
                <div className="flex items-center gap-1 mb-2 text-xs text-accent-dark uppercase tracking-wider">
                  <Shield className="h-3 w-3" />
                  Respaldo forense
                </div>
                <div className="space-y-1 text-xs">
                  <KV
                    label="SHA-256"
                    value={photo.forensic.file.sha256.slice(0, 16) + "..."}
                    mono
                  />
                  <KV
                    label="Fecha EXIF"
                    value={photo.forensic.exifTemporal.dateTimeOriginal ?? "—"}
                  />
                  <KV
                    label="GPS"
                    value={
                      photo.forensic.gps.latitude
                        ? `${photo.forensic.gps.latitude.toFixed(
                            4
                          )}, ${photo.forensic.gps.longitude?.toFixed(4)}`
                        : "—"
                    }
                  />
                  <KV
                    label="Camara"
                    value={photo.forensic.exifDevice.model ?? "—"}
                  />
                  <KV label="Fuerza" value={photo.evidenceStrength} />
                </div>
              </div>
            )}

            {/* Warnings */}
            {photo.warnings.length > 0 && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <div className="flex items-center gap-1 mb-1 text-xs text-amber-700 uppercase tracking-wider">
                  <AlertTriangle className="h-3 w-3" />
                  Advertencias
                </div>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {photo.warnings.map((w) => (
                    <li key={w}>· {w.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Subido por {photo.uploadedByName} el{" "}
              {new Date(photo.uploadedAt).toLocaleString("es-CL")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span
        className={cn("text-gray-700 truncate", mono && "font-mono")}
      >
        {value}
      </span>
    </div>
  );
}
