"use client";

import type { FileEntry } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ConsistencyPanel } from "./ConsistencyPanel";
import { PhotoDetail } from "./PhotoDetail";
import { ChevronDown, ChevronUp, AlertCircle, Camera } from "lucide-react";
import { cn } from "@/lib/cn";

interface PhotoCardProps {
  entry: FileEntry;
  onToggle: () => void;
}

export function PhotoCard({ entry, onToggle }: PhotoCardProps) {
  const { analysis, status, error, expanded } = entry;

  if (status === "error") {
    return (
      <Card className="border-danger/30">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-danger shrink-0" />
          <div>
            <p className="text-sm text-gray-200">{entry.file.name}</p>
            <p className="text-xs text-danger">{error || "Error al analizar"}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (status !== "complete" || !analysis) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Spinner />
          <div>
            <p className="text-sm text-gray-200">{entry.file.name}</p>
            <p className="text-xs text-muted">
              {status === "parsing" ? "Leyendo metadata..." : "Analizando imagen..."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(expanded && "border-accent/30")}>
      {/* Summary header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 text-left"
      >
        {/* Thumbnail preview */}
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-surface-200 border border-surface-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={analysis.previewUrl}
            alt={analysis.file.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-100 truncate">
                {analysis.file.name}
              </p>
              <p className="text-xs text-muted">
                {analysis.file.sizeHuman}
                {analysis.file.width && analysis.file.height && (
                  <> &middot; {analysis.file.width}x{analysis.file.height}</>
                )}
                {analysis.exifDevice.model && (
                  <>
                    {" "}
                    &middot;{" "}
                    <Camera className="inline h-3 w-3 -mt-0.5" />{" "}
                    {analysis.exifDevice.model}
                  </>
                )}
                {analysis.exifTemporal.dateTimeOriginal && (
                  <>
                    {" "}
                    &middot;{" "}
                    {new Date(analysis.exifTemporal.dateTimeOriginal).toLocaleDateString("es-CL")}
                  </>
                )}
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted shrink-0" />
            )}
          </div>

          {/* Compact badges */}
          <ConsistencyPanel checks={analysis.consistency} compact />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && <PhotoDetail analysis={analysis} />}
    </Card>
  );
}
