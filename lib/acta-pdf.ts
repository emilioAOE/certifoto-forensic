/**
 * Generador de PDF para Actas Digitales.
 * Usa jspdf client-side. Estructura inspirada en informe pericial.
 */

import type { Acta, Property } from "./acta-types";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  PARTY_ROLE_LABEL,
  PROPERTY_TYPE_LABEL,
  CONDITION_LABEL,
  DAMAGE_TYPE_LABEL,
  DAMAGE_SEVERITY_LABEL,
  PDF_DISCLAIMER,
} from "./acta-constants";

export async function generateActaPdf(acta: Acta, property: Property): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ============================================
  // Helpers
  // ============================================
  const checkPage = (needed: number) => {
    if (y + needed > pageH - 25) {
      doc.addPage();
      y = margin;
    }
  };

  const drawRow = (label: string, value: string | null | undefined, mono = false) => {
    if (!value) return;
    checkPage(6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 110);
    doc.text(label, margin, y);
    doc.setTextColor(30, 30, 30);
    if (mono) doc.setFont("courier", "normal");
    const maxW = contentW - 55;
    const lines = doc.splitTextToSize(String(value), maxW);
    doc.text(lines, margin + 55, y);
    y += Math.max(lines.length * 4, 5);
  };

  const drawSectionTitle = (title: string) => {
    checkPage(14);
    y += 4;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, contentW, 7.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(10, 14, 23);
    doc.text(title, margin + 3, y);
    y += 8;
  };

  const drawText = (text: string, fontSize = 9) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, contentW);
    checkPage(lines.length * (fontSize * 0.4) + 2);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.4) + 2;
  };

  const drawDivider = () => {
    checkPage(4);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 3;
  };

  // ============================================
  // COVER PAGE
  // ============================================
  doc.setFillColor(0, 204, 106);
  doc.rect(0, 0, pageW, 4, "F");

  y = 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(10, 14, 23);
  doc.text(ACTA_TYPE_LABEL[acta.type], margin, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text("Registro digital con respaldo forense de evidencia", margin, y);

  y += 12;
  doc.setDrawColor(0, 204, 106);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Acta info
  drawRow("ID del Acta", acta.id, true);
  drawRow("Estado", ACTA_STATUS_LABEL[acta.status]);
  drawRow(
    "Fecha de creacion",
    new Date(acta.createdAt).toLocaleString("es-CL")
  );
  if (acta.inspectionDate) {
    drawRow(
      "Fecha de inspeccion",
      new Date(acta.inspectionDate).toLocaleDateString("es-CL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }
  if (acta.closedAt) {
    drawRow(
      "Fecha de cierre",
      new Date(acta.closedAt).toLocaleString("es-CL")
    );
  }
  if (acta.documentHash) {
    drawRow("Hash del documento", acta.documentHash, true);
  }

  // Property
  drawSectionTitle("Propiedad");
  drawRow(
    "Direccion",
    `${property.address}${property.unit ? ` ${property.unit}` : ""}`
  );
  drawRow("Comuna", property.commune);
  drawRow("Ciudad", property.city);
  drawRow("Pais", property.country);
  drawRow("Tipo", PROPERTY_TYPE_LABEL[property.propertyType]);
  drawRow(
    "Amoblada",
    property.furnished === "yes"
      ? "Si"
      : property.furnished === "partial"
      ? "Parcialmente"
      : "No"
  );
  drawRow(
    "Extras",
    [
      property.parking ? "Estacionamiento" : null,
      property.storageUnit ? "Bodega" : null,
    ]
      .filter(Boolean)
      .join(", ") || null
  );
  drawRow("Codigo interno", property.internalCode);
  drawRow("Rol SII", property.rolSii);
  if (property.observations) {
    drawRow("Observaciones", property.observations);
  }

  // Parties
  drawSectionTitle("Partes");
  for (const party of acta.parties) {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(10, 14, 23);
    doc.text(`· ${party.name || "(sin nombre)"}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.text(
      ` — ${PARTY_ROLE_LABEL[party.role]}`,
      margin + doc.getTextWidth(`· ${party.name || "(sin nombre)"}`) + 1,
      y
    );
    y += 4.5;
    if (party.email || party.phone) {
      doc.setTextColor(140, 140, 140);
      doc.setFontSize(8);
      doc.text(
        [party.email, party.phone].filter(Boolean).join(" · "),
        margin + 4,
        y
      );
      y += 4;
    }
    y += 1;
  }

  // Footer of cover page
  doc.addPage();
  y = margin;

  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  drawSectionTitle("Resumen ejecutivo");

  const totalPhotos = acta.photos.length;
  const totalRooms = acta.rooms.length;
  const totalFindings = acta.photos.reduce(
    (sum, p) => sum + (p.aiAnalysis?.damageFindings.length ?? 0),
    0
  );
  const photosWithExif = acta.photos.filter(
    (p) => p.forensic?.exifTemporal.dateTimeOriginal
  ).length;
  const photosWithGps = acta.photos.filter(
    (p) => p.forensic?.gps.latitude != null
  ).length;

  drawText(
    `Esta acta documenta ${totalRooms} ambiente(s) con un total de ${totalPhotos} fotografia(s). El analisis automatizado con IA detecto ${totalFindings} hallazgo(s) que pueden requerir revision humana. ${photosWithExif} de las fotos contienen fecha EXIF original, y ${photosWithGps} contienen geolocalizacion GPS.`
  );

  if (acta.aiSummary) {
    y += 2;
    drawText(acta.aiSummary);
  }

  if (acta.manualSummary) {
    y += 2;
    drawText("Notas manuales: " + acta.manualSummary);
  }

  // ============================================
  // ROOMS WITH PHOTOS
  // ============================================
  for (const room of acta.rooms) {
    const photos = acta.photos.filter((p) => p.roomId === room.id);

    doc.addPage();
    y = margin;

    drawSectionTitle(`Ambiente: ${room.name}`);
    drawRow(
      "Estado general",
      room.generalCondition !== "no_evaluado"
        ? CONDITION_LABEL[room.generalCondition]
        : "Sin evaluar"
    );
    drawRow("Cantidad de fotos", String(photos.length));
    drawRow("Obligatorio", room.required ? "Si" : "No");

    if (room.aiSummary) {
      y += 2;
      drawDivider();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(110, 80, 200);
      doc.text("Resumen IA:", margin, y);
      y += 4;
      drawText(room.aiSummary, 8.5);
    }

    if (room.manualObservations) {
      y += 2;
      drawDivider();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text("Observaciones manuales:", margin, y);
      y += 4;
      drawText(room.manualObservations, 8.5);
    }

    // Photos for this room
    if (photos.length > 0) {
      y += 3;
      drawDivider();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text("Evidencia fotografica:", margin, y);
      y += 5;

      const photosPerRow = 2;
      const photoW = (contentW - 5) / photosPerRow;
      const photoH = photoW * 0.75;

      let col = 0;
      for (const photo of photos) {
        if (col === 0) checkPage(photoH + 28);

        const x = margin + col * (photoW + 5);

        try {
          doc.addImage(
            photo.dataUrl,
            "JPEG",
            x,
            y,
            photoW,
            photoH,
            undefined,
            "FAST"
          );
        } catch {
          // dataUrl might be PNG or fail
          try {
            doc.addImage(photo.dataUrl, "PNG", x, y, photoW, photoH);
          } catch {
            // skip
          }
        }

        // Caption block
        doc.setFontSize(7);
        doc.setTextColor(110, 110, 110);
        const captionY = y + photoH + 3;
        const fileName = photo.fileName.length > 30
          ? photo.fileName.slice(0, 27) + "..."
          : photo.fileName;
        doc.text(fileName, x, captionY);

        if (photo.aiAnalysis) {
          doc.setFontSize(6.5);
          doc.setTextColor(80, 80, 80);
          const cap = doc.splitTextToSize(photo.aiAnalysis.caption, photoW);
          doc.text(cap.slice(0, 3), x, captionY + 3);
        }

        if (photo.forensic?.file.sha256) {
          doc.setFontSize(6);
          doc.setFont("courier", "normal");
          doc.setTextColor(140, 140, 140);
          doc.text(
            `SHA: ${photo.forensic.file.sha256.slice(0, 24)}...`,
            x,
            captionY + 14
          );
          doc.setFont("helvetica", "normal");
        }

        col++;
        if (col >= photosPerRow) {
          col = 0;
          y += photoH + 22;
        }
      }
      if (col > 0) {
        y += photoH + 22;
        col = 0;
      }
    }

    // Damage findings consolidated
    const allFindings = photos
      .flatMap((p) =>
        (p.aiAnalysis?.damageFindings ?? []).map((f) => ({ ...f, photoName: p.fileName }))
      );

    if (allFindings.length > 0) {
      y += 3;
      drawDivider();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 100, 50);
      doc.text("Hallazgos detectados (referencial):", margin, y);
      y += 5;

      for (const f of allFindings) {
        checkPage(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(150, 80, 50);
        doc.text(`[${DAMAGE_SEVERITY_LABEL[f.severity]}]`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(
          ` ${DAMAGE_TYPE_LABEL[f.type]} — ${f.description}`,
          margin + doc.getTextWidth(`[${DAMAGE_SEVERITY_LABEL[f.severity]}]`) + 1,
          y
        );
        y += 4;
        doc.setFontSize(6.5);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Foto: ${f.photoName} · Confianza: ${(f.confidence * 100).toFixed(0)}%`,
          margin + 3,
          y
        );
        y += 4;
      }
    }
  }

  // ============================================
  // SIGNATURES
  // ============================================
  if (acta.signatures.length > 0) {
    doc.addPage();
    y = margin;
    drawSectionTitle("Firmas");

    for (const sig of acta.signatures) {
      checkPage(45);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 14, 23);
      doc.text(sig.signerName, margin, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(
        `${PARTY_ROLE_LABEL[sig.signerRole]} · ${new Date(sig.signedAt).toLocaleString("es-CL")}`,
        margin,
        y
      );
      y += 4;

      let statusLabel = "";
      let statusColor: [number, number, number] = [110, 110, 110];
      if (sig.status === "signed_conformity") {
        statusLabel = "FIRMADO CONFORME";
        statusColor = [40, 150, 90];
      } else if (sig.status === "signed_with_observations") {
        statusLabel = "FIRMADO CON OBSERVACIONES";
        statusColor = [200, 140, 40];
      } else {
        statusLabel = "RECHAZADO";
        statusColor = [200, 50, 50];
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...statusColor);
      doc.text(statusLabel, margin, y);
      y += 5;

      // Signature image
      if (sig.signatureImageDataUrl) {
        try {
          doc.addImage(sig.signatureImageDataUrl, "PNG", margin, y, 60, 22);
          y += 24;
        } catch {
          y += 2;
        }
      }

      if (sig.observations) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(180, 130, 40);
        doc.text("Observaciones:", margin, y);
        y += 3.5;
        drawText(sig.observations, 8);
      }
      if (sig.rejectionReason) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(180, 50, 50);
        doc.text("Motivo de rechazo:", margin, y);
        y += 3.5;
        drawText(sig.rejectionReason, 8);
      }

      if (sig.documentVersionHash) {
        doc.setFont("courier", "normal");
        doc.setFontSize(6);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Hash al firmar: ${sig.documentVersionHash}`,
          margin,
          y
        );
        y += 3;
      }

      y += 3;
      drawDivider();
    }
  }

  // ============================================
  // TECHNICAL APPENDIX
  // ============================================
  doc.addPage();
  y = margin;
  drawSectionTitle("Anexo tecnico - Trazabilidad de evidencia");

  drawText(
    "Cada fotografia incluida en este acta tiene los siguientes elementos tecnicos calculados al momento de su carga:",
    8
  );
  y += 2;

  for (const photo of acta.photos) {
    checkPage(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    const fileName = photo.fileName.length > 60
      ? photo.fileName.slice(0, 57) + "..."
      : photo.fileName;
    doc.text(fileName, margin, y);
    y += 3.5;

    if (photo.forensic) {
      const f = photo.forensic;
      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(110, 110, 110);
      doc.text(`SHA-256: ${f.file.sha256}`, margin + 3, y);
      y += 3;
      if (f.file.phash) {
        doc.text(`pHash:   ${f.file.phash}`, margin + 3, y);
        y += 3;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      const dims = f.file.width && f.file.height
        ? `${f.file.width}x${f.file.height}`
        : "?";
      doc.text(
        `${(f.file.size / 1024).toFixed(1)} KB · ${dims} · ${f.file.mimeType} · subida ${new Date(photo.uploadedAt).toLocaleString("es-CL")}`,
        margin + 3,
        y
      );
      y += 3;
      if (f.exifTemporal.dateTimeOriginal) {
        doc.text(`Fecha EXIF: ${f.exifTemporal.dateTimeOriginal}`, margin + 3, y);
        y += 3;
      }
      if (f.gps.latitude != null) {
        doc.text(
          `GPS: ${f.gps.latitude.toFixed(6)}, ${f.gps.longitude?.toFixed(6)}`,
          margin + 3,
          y
        );
        y += 3;
      }
      doc.text(
        `Fuerza de evidencia: ${photo.evidenceStrength}${photo.warnings.length > 0 ? ` · advertencias: ${photo.warnings.join(", ")}` : ""}`,
        margin + 3,
        y
      );
      y += 4;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(180, 100, 50);
      doc.text("(sin analisis forense disponible)", margin + 3, y);
      y += 4;
    }
  }

  // ============================================
  // DISCLAIMER
  // ============================================
  y += 5;
  drawSectionTitle("Advertencia");
  drawText(PDF_DISCLAIMER, 8);

  // ============================================
  // AUDIT LOG
  // ============================================
  if (acta.auditLog.length > 0) {
    y += 4;
    drawSectionTitle("Registro de actividad");
    for (const entry of acta.auditLog) {
      checkPage(5);
      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `${new Date(entry.createdAt).toISOString()}  ${entry.action.padEnd(25)}  ${entry.actorName} (${entry.actorRole})`,
        margin,
        y
      );
      y += 3;
    }
  }

  // ============================================
  // FOOTERS
  // ============================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CertiFoto · ${ACTA_TYPE_LABEL[acta.type]} · ID ${acta.id}`,
      margin,
      pageH - 8
    );
    doc.text(`Pagina ${p} de ${totalPages}`, pageW - margin - 25, pageH - 8);
  }

  // Save
  doc.save(`acta-${acta.type}-${acta.id.slice(0, 12)}.pdf`);
}
