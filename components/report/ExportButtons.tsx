"use client";

import { useState } from "react";
import type { PhotoAnalysis } from "@/lib/types";
import { FileJson, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

interface ExportButtonsProps {
  analyses: PhotoAnalysis[];
}

export function ExportButtons({ analyses }: ExportButtonsProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const downloadJson = () => {
    const data = analyses.map((a) => ({
      file: a.file,
      exifTemporal: a.exifTemporal,
      exifDevice: a.exifDevice,
      exifCapture: a.exifCapture,
      exifImage: a.exifImage,
      gps: a.gps,
      iptc: a.iptc,
      xmp: { ...a.xmp, rawXmp: undefined },
      icc: a.icc,
      c2pa: a.c2pa,
      thumbnail: { ...a.thumbnail, dataUrl: a.thumbnail.dataUrl ? "[base64 data]" : null },
      consistency: a.consistency,
      makerNotesPresent: a.makerNotesPresent,
      rawExif: a.rawExif,
      analyzedAt: a.analyzedAt,
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certifoto-analisis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePdf = async () => {
    setGeneratingPdf(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: analyses.map((a) => ({
            ...a,
            previewUrl: undefined,
            thumbnail: { ...a.thumbnail, dataUrl: a.thumbnail.dataUrl ?? null },
            rawExif: undefined,
            xmp: { ...a.xmp, rawXmp: undefined },
          })),
          generatedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certifoto-informe-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Error al generar el PDF. Intenta descargar el JSON como alternativa.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={downloadJson}
        className="inline-flex items-center gap-2 rounded-lg bg-surface-200 border border-surface-300 px-4 py-2 text-sm text-gray-200 hover:bg-surface-300 transition-colors"
      >
        <FileJson className="h-4 w-4" />
        Descargar JSON
      </button>
      <button
        onClick={generatePdf}
        disabled={generatingPdf}
        className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-sm text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
      >
        {generatingPdf ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Generar PDF
      </button>
    </div>
  );
}
