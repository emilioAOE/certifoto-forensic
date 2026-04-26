"use client";

import { useState } from "react";
import type { PhotoAnalysis } from "@/lib/types";
import { FileJson, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

interface ExportButtonsProps {
  analyses: PhotoAnalysis[];
}

export function ExportButtons({ analyses }: ExportButtonsProps) {
  const toast = useToast();
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
      thumbnail: {
        ...a.thumbnail,
        dataUrl: a.thumbnail.dataUrl ? "[base64 data]" : null,
      },
      consistency: a.consistency,
      makerNotesPresent: a.makerNotesPresent,
      rawExif: a.rawExif,
      analyzedAt: a.analyzedAt,
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certifoto-analisis-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatePdf = async () => {
    setGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = margin;

      const statusIcon: Record<string, string> = {
        pass: "[OK]",
        warn: "[!]",
        fail: "[X]",
        info: "[i]",
        unknown: "[?]",
      };

      const checkNewPage = (needed: number) => {
        const pageH = doc.internal.pageSize.getHeight();
        if (y + needed > pageH - 20) {
          doc.addPage();
          y = margin;
        }
      };

      const drawRow = (label: string, value: string | null | undefined, mono = false) => {
        if (!value) return;
        checkNewPage(6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin, y);
        doc.setTextColor(30, 30, 30);
        if (mono) doc.setFont("courier", "normal");
        const maxW = contentW - 55;
        const lines = doc.splitTextToSize(value, maxW);
        doc.text(lines, margin + 55, y);
        y += Math.max(lines.length * 3.5, 5);
      };

      const drawSectionTitle = (title: string) => {
        checkNewPage(12);
        y += 3;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 3.5, contentW, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(10, 14, 23);
        doc.text(title, margin + 3, y);
        y += 7;
      };

      // === COVER PAGE ===
      doc.setDrawColor(0, 204, 106);
      doc.setLineWidth(0.8);
      doc.line(margin, 25, pageW - margin, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(10, 14, 23);
      doc.text("CertiFoto Forensic", margin, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Informe de Analisis de Metadata de Imagenes", margin, 33);

      y = 45;
      drawRow("Fecha del informe", new Date().toLocaleString("es-CL"));
      drawRow("Total de imagenes", String(analyses.length));

      y += 10;
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const disclaimer = doc.splitTextToSize(
        "Este informe fue generado automaticamente por CertiFoto Forensic. Contiene un analisis de la metadata disponible en cada imagen, incluyendo datos EXIF, GPS, IPTC/XMP, perfiles de color, hashes criptograficos y verificaciones de integridad. Toda la informacion fue extraida directamente de los archivos sin modificacion.",
        contentW
      );
      doc.text(disclaimer, margin, y);

      // === ONE PAGE PER PHOTO ===
      for (let i = 0; i < analyses.length; i++) {
        const photo = analyses[i];
        const f = photo.file;
        const d = photo.exifDevice;
        const c = photo.exifCapture;
        const t = photo.exifTemporal;
        const g = photo.gps;

        doc.addPage();
        y = margin;

        // Photo title
        doc.setDrawColor(0, 204, 106);
        doc.setLineWidth(0.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(10, 14, 23);
        doc.text(`Foto ${i + 1}: ${f.name}`, margin, y);
        y += 2;
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        // File Data
        drawSectionTitle("Datos del Archivo");
        drawRow("Nombre", f.name);
        drawRow("Tamano", `${f.sizeHuman} (${f.size.toLocaleString()} bytes)`);
        drawRow("Tipo MIME", f.mimeType);
        drawRow("Dimensiones", f.width && f.height ? `${f.width} x ${f.height} px` : null);
        drawRow("SHA-256", f.sha256, true);
        drawRow("pHash", f.phash, true);

        // Device
        drawSectionTitle("Dispositivo");
        drawRow("Fabricante", d.make);
        drawRow("Modelo", d.model);
        drawRow("Lente", d.lensModel);
        drawRow("Software", d.software);
        drawRow("N/S", d.serialNumber);

        // Capture
        drawSectionTitle("Parametros de Captura");
        drawRow("Apertura", c.fNumber !== null ? `f/${c.fNumber}` : null);
        drawRow("Exposicion", c.exposureTimeFormatted);
        drawRow("ISO", c.iso !== null ? String(c.iso) : null);
        drawRow("Focal", c.focalLength !== null ? `${c.focalLength} mm` : null);
        drawRow("Flash", c.flash);
        drawRow("Balance blancos", c.whiteBalance);

        // Dates
        drawSectionTitle("Fechas");
        drawRow("Original", t.dateTimeOriginal);
        drawRow("Digitalizada", t.dateTimeDigitized);
        drawRow("Modificacion", t.dateTime);
        drawRow("Offset TZ", t.offsetTimeOriginal);

        // GPS
        if (g.latitude !== null && g.longitude !== null) {
          drawSectionTitle("Geolocalizacion");
          drawRow("Latitud", String(g.latitude));
          drawRow("Longitud", String(g.longitude));
          drawRow("Altitud", g.altitude !== null ? `${g.altitude} m` : null);
          drawRow("Google Maps", g.googleMapsUrl);
        }

        // Consistency
        drawSectionTitle("Senales de Integridad");
        for (const check of photo.consistency) {
          checkNewPage(6);
          doc.setFontSize(8);
          doc.setTextColor(30, 30, 30);
          doc.text(
            `${statusIcon[check.status] || "[?]"} ${check.label}: ${check.detail}`,
            margin + 3,
            y
          );
          y += 5;
        }
      }

      // Footer on each page
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 150);
        doc.text("CertiFoto Forensic — Informe Pericial", margin, pageH - 8);
        doc.text(`Pagina ${p} de ${totalPages}`, pageW - margin - 25, pageH - 8);
      }

      doc.save(`certifoto-informe-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF descargado");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error(
        "No se pudo generar el PDF",
        "Intenta descargar el JSON como alternativa."
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={downloadJson}
        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 transition-colors"
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
