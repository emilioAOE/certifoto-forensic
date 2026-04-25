"use client";

import type { ThumbnailData } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Image as ImageIcon, AlertTriangle } from "lucide-react";

interface ThumbnailSectionProps {
  thumbnail: ThumbnailData;
  previewUrl: string;
}

export function ThumbnailSection({ thumbnail, previewUrl }: ThumbnailSectionProps) {
  if (!thumbnail.dataUrl) {
    return (
      <div>
        <SectionHeader
          icon={<ImageIcon className="h-4 w-4" />}
          title="Thumbnail embebido"
        />
        <p className="text-sm text-muted">No se encontro thumbnail EXIF</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        icon={<ImageIcon className="h-4 w-4" />}
        title="Thumbnail embebido"
        subtitle="Comparar con imagen real"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs text-muted uppercase tracking-wider">
            Thumbnail EXIF
          </p>
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail.dataUrl}
              alt="Thumbnail EXIF embebido"
              className="w-full h-auto object-contain"
            />
          </div>
          {thumbnail.width && thumbnail.height && (
            <p className="text-xs text-muted">
              {thumbnail.width} x {thumbnail.height} px
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted uppercase tracking-wider">
            Imagen real
          </p>
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Imagen original"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted mt-2 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Si el thumbnail difiere significativamente de la imagen real, la foto puede haber sido manipulada despues de su captura.
      </p>
    </div>
  );
}
