"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled }: DropZoneProps) {
  const toast = useToast();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      const files: File[] = [];
      const oversized: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        if (f.size > MAX_FILE_SIZE_BYTES) {
          oversized.push(f.name);
          continue;
        }
        files.push(f);
      }
      if (oversized.length > 0) {
        toast.warn(
          `${oversized.length} archivo(s) descartado(s)`,
          `Exceden el limite de ${formatBytes(MAX_FILE_SIZE_BYTES)}: ${oversized.join(", ")}`
        );
      }
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected, disabled, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-200 text-center",
        dragOver
          ? "border-accent bg-accent/5 scale-[1.01]"
          : "border-gray-200 hover:border-gray-300 bg-gray-50",
        disabled && "opacity-50 pointer-events-none"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "rounded-full p-4 transition-colors",
            dragOver ? "bg-accent/20" : "bg-gray-100"
          )}
        >
          {dragOver ? (
            <ImagePlus className="h-8 w-8 text-accent" />
          ) : (
            <Upload className="h-8 w-8 text-muted" />
          )}
        </div>

        <div>
          <p className="text-gray-800 font-medium">
            Arrastra fotos aqui o{" "}
            <button
              type="button"
              className="text-accent hover:text-accent-dim underline underline-offset-2"
              onClick={() => inputRef.current?.click()}
            >
              selecciona archivos
            </button>
          </p>
          <p className="text-xs text-muted mt-2">
            JPEG, PNG, TIFF, HEIF, WebP, AVIF — Max {formatBytes(MAX_FILE_SIZE_BYTES)} por archivo
          </p>
        </div>
      </div>
    </div>
  );
}
