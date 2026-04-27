"use client";

import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { PhotoEvidence } from "@/lib/acta-types";
import { PhotoDetailModal } from "./PhotoDetailModal";

interface PhotoEvidenceCardProps {
  photo: PhotoEvidence;
  readOnly: boolean;
  onRemove: () => void;
}

/**
 * Card de una foto en la evidencia de un ambiente. Muestra thumbnail,
 * badges (IA, fuerza de evidencia, advertencias) y al click abre el modal
 * de detalle.
 */
export function PhotoEvidenceCard({
  photo,
  readOnly,
  onRemove,
}: PhotoEvidenceCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.dataUrl}
          alt={photo.fileName}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowDetail(true)}
        />

        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-wrap gap-1">
          {photo.aiStatus === "processing" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-600/90 text-white flex items-center gap-1">
              <Loader2 className="h-2 w-2 animate-spin" />
              IA
            </span>
          )}
          {photo.aiStatus === "complete" && photo.aiAnalysis && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-600/90 text-white inline-flex items-center gap-0.5">
              <Sparkles className="h-2 w-2" /> IA
            </span>
          )}
          {photo.evidenceStrength === "fuerte" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-600/90 text-white inline-flex items-center gap-0.5">
              <Shield className="h-2 w-2" /> Fuerte
            </span>
          )}
          {photo.warnings.length > 0 && (
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/90 text-white inline-flex items-center gap-0.5"
              title={photo.warnings.join(", ")}
            >
              <AlertTriangle className="h-2 w-2" />
            </span>
          )}
        </div>

        {/* Damage findings indicator */}
        {photo.aiAnalysis && photo.aiAnalysis.damageFindings.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="text-[9px] bg-red-600/90 text-white px-1.5 py-0.5 rounded truncate">
              {photo.aiAnalysis.damageFindings.length} hallazgo(s)
            </div>
          </div>
        )}

        {/* Remove button */}
        {!readOnly && (
          <button
            onClick={onRemove}
            aria-label={`Eliminar ${photo.fileName}`}
            className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {showDetail && (
        <PhotoDetailModal
          photo={photo}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
