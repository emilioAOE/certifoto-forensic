#!/usr/bin/env node
/**
 * Genera la plantilla PDF gratuita de "Acta de Entrega de Propiedad" que
 * regalamos a cambio del email (lead magnet). El resultado se escribe en
 * public/plantilla-acta-entrega-certifoto.pdf y se sirve estáticamente.
 *
 * Reproducible: vuelve a correr `node scripts/generate-acta-template.js`
 * cada vez que cambies el diseño. Usa jspdf (misma dependencia que el
 * certificado de la app).
 */

const fs = require("fs");
const path = require("path");

const jspdf = require("jspdf");
const JsPDF = jspdf.jsPDF || jspdf.default || jspdf;

// ---- Paleta (alineada con el verde de marca) ----
const ACCENT = [22, 163, 74]; // emerald-600
const ACCENT_DARK = [21, 128, 61]; // emerald-700
const INK = [17, 24, 39]; // gray-900
const MUTED = [107, 114, 128]; // gray-500
const LINE = [203, 213, 225]; // slate-300
const SOFT = [240, 253, 244]; // emerald-50

// ---- Métricas A4 (mm) ----
const W = 210;
const H = 297;
const M = 15;
const RIGHT = W - M; // 195
const CW = RIGHT - M; // 180

const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
let y = M;

function setColor(rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}
function setFill(rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setStroke(rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function newPage() {
  doc.addPage();
  y = M + 5;
}

function ensure(h) {
  if (y + h > H - 16) newPage();
}

function sectionHeader(title) {
  ensure(16);
  setFill(ACCENT);
  doc.rect(M, y, CW, 7, "F");
  setColor([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(title.toUpperCase(), M + 3, y + 4.9);
  y += 7 + 4;
  setColor(INK);
}

/** Fila de campos con etiqueta + línea para completar. items: [{label,w}] */
function fieldRow(items) {
  ensure(9);
  let x = M;
  doc.setFontSize(9);
  for (const it of items) {
    const cellW = it.w;
    doc.setFont("helvetica", "bold");
    setColor(MUTED);
    const lbl = it.label + ": ";
    doc.text(lbl, x, y);
    const lw = doc.getTextWidth(lbl);
    setStroke(LINE);
    doc.setLineWidth(0.25);
    const ls = x + lw;
    const le = x + cellW - 3;
    if (le > ls) doc.line(ls, y + 0.8, le, y + 0.8);
    x += cellW;
  }
  y += 8;
  setColor(INK);
}

/** Etiqueta + casillas de opción. */
function checkboxRow(label, options) {
  ensure(8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setColor(MUTED);
  doc.text(label + ": ", M, y);
  let x = M + doc.getTextWidth(label + ": ") + 2;
  doc.setFont("helvetica", "normal");
  setColor(INK);
  for (const o of options) {
    setStroke(MUTED);
    doc.setLineWidth(0.3);
    doc.rect(x, y - 3, 3.4, 3.4);
    doc.text(o, x + 5, y);
    x += 5 + doc.getTextWidth(o) + 9;
  }
  y += 8;
}

/** Línea de párrafo en gris para texto guía. */
function helper(text) {
  ensure(7);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  setColor(MUTED);
  const lines = doc.splitTextToSize(text, CW);
  doc.text(lines, M, y);
  y += lines.length * 4.3 + 2;
  setColor(INK);
}

// Columnas de la tabla de estado por ambiente
const C_EL = M;
const C_B = M + 58;
const C_R = M + 70;
const C_M = M + 82;
const C_OBS = M + 94;
const ROW_H = 7;

function tableHeader() {
  ensure(8);
  setFill([243, 244, 246]); // gray-100
  doc.rect(M, y - 4, CW, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setColor(MUTED);
  doc.text("ELEMENTO", C_EL + 2, y);
  doc.text("B", C_B + 4, y);
  doc.text("R", C_R + 4, y);
  doc.text("M", C_M + 4, y);
  doc.text("OBSERVACIONES", C_OBS + 2, y);
  y += 5;
  setColor(INK);
}

function tableRow(element) {
  ensure(ROW_H);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(INK);
  doc.text(element, C_EL + 2, y);
  // casillas B / R / M
  setStroke(MUTED);
  doc.setLineWidth(0.3);
  doc.rect(C_B + 3, y - 3.2, 3.4, 3.4);
  doc.rect(C_R + 3, y - 3.2, 3.4, 3.4);
  doc.rect(C_M + 3, y - 3.2, 3.4, 3.4);
  // línea para observaciones
  setStroke(LINE);
  doc.setLineWidth(0.25);
  doc.line(C_OBS + 1, y + 0.6, RIGHT, y + 0.6);
  // separador de fila
  setStroke([229, 231, 235]);
  doc.setLineWidth(0.15);
  doc.line(M, y + 2.8, RIGHT, y + 2.8);
  y += ROW_H;
}

function ambienteBlock(defaultName) {
  ensure(ROW_H * 7 + 14);
  // nombre del ambiente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  setColor(ACCENT_DARK);
  doc.text("Ambiente: ", M, y);
  const lw = doc.getTextWidth("Ambiente: ");
  if (defaultName) {
    doc.text(defaultName, M + lw, y);
  } else {
    setStroke(LINE);
    doc.setLineWidth(0.25);
    doc.line(M + lw, y + 0.8, M + 90, y + 0.8);
  }
  setColor(INK);
  y += 5;
  tableHeader();
  const rows = [
    "Pisos",
    "Muros",
    "Techo / cielo",
    "Ventanas / cortinas",
    "Puertas / closet",
    "Luminarias / enchufes",
    "Otros",
  ];
  for (const r of rows) tableRow(r);
  y += 4;
}

function signatureBox(label) {
  const boxW = (CW - 10) / 2;
  return boxW;
}

// =====================================================================
//  PÁGINA 1 — Encabezado e identificación
// =====================================================================

// Marca CertiFoto
setColor(ACCENT_DARK);
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("CertiFoto", M, y + 2);
doc.setFont("helvetica", "normal");
doc.setFontSize(8);
setColor(MUTED);
doc.text("Plantilla gratuita", RIGHT, y + 2, { align: "right" });
y += 8;

// Título
setColor(INK);
doc.setFont("helvetica", "bold");
doc.setFontSize(20);
doc.text("Acta de Entrega de Propiedad", M, y + 4);
y += 9;
doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
setColor(MUTED);
doc.text(
  "Documenta el estado del inmueble el día de la entrega de llaves.",
  M,
  y + 2
);
y += 5;
// regla accent
setStroke(ACCENT);
doc.setLineWidth(0.8);
doc.line(M, y + 2, RIGHT, y + 2);
y += 8;

helper(
  "Consejo: complétala con ambas partes presentes, recorriendo la propiedad ambiente por ambiente. Marca el estado de cada elemento (B = Bueno, R = Regular, M = Malo) y anota todo defecto preexistente. Lo que quede registrado aquí es lo que evita discusiones al devolver la propiedad y al cierre de la garantía."
);

sectionHeader("1. Identificación del acta");
checkboxRow("Tipo de acta", ["Entrega", "Devolución", "Inspección", "Inventario"]);
fieldRow([
  { label: "Fecha", w: 60 },
  { label: "Hora", w: 50 },
  { label: "N° de contrato", w: 70 },
]);
fieldRow([{ label: "Dirección", w: 120 }, { label: "Depto / casa N°", w: 60 }]);
fieldRow([
  { label: "Comuna", w: 70 },
  { label: "Ciudad", w: 60 },
  { label: "Región", w: 50 },
]);
checkboxRow("Tipo de inmueble", ["Departamento", "Casa", "Otro"]);
fieldRow([
  { label: "m² aprox.", w: 40 },
  { label: "Dormitorios", w: 45 },
  { label: "Baños", w: 40 },
  { label: "Estac. N°", w: 55 },
]);
checkboxRow("Amoblado", ["Sí", "No", "Parcial"]);

sectionHeader("2. Partes");
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
setColor(ACCENT_DARK);
ensure(6);
doc.text("Arrendador / Propietario", M, y);
y += 5;
setColor(INK);
fieldRow([{ label: "Nombre", w: 110 }, { label: "RUT", w: 70 }]);
fieldRow([{ label: "Teléfono", w: 80 }, { label: "Email", w: 100 }]);
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
setColor(ACCENT_DARK);
ensure(6);
doc.text("Arrendatario / Comprador", M, y);
y += 5;
setColor(INK);
fieldRow([{ label: "Nombre", w: 110 }, { label: "RUT", w: 70 }]);
fieldRow([{ label: "Teléfono", w: 80 }, { label: "Email", w: 100 }]);
fieldRow([
  { label: "Corredor / Testigo", w: 110 },
  { label: "RUT", w: 70 },
]);

sectionHeader("3. Contrato, renta y garantía");
fieldRow([
  { label: "Inicio contrato", w: 60 },
  { label: "Término", w: 60 },
  { label: "Renta mensual $", w: 60 },
]);
fieldRow([
  { label: "Garantía $", w: 60 },
  { label: "Reajuste", w: 60 },
  { label: "Día de pago", w: 60 },
]);

// =====================================================================
//  ESTADO POR AMBIENTE
// =====================================================================
newPage();
sectionHeader("4. Estado por ambiente");
helper(
  "B = Bueno · R = Regular · M = Malo. Fotografía cada ambiente y cada defecto: una foto vale más que diez descripciones. Usa una hoja por ambiente si necesitas más espacio."
);

const ambientes = [
  "Living - comedor",
  "Cocina",
  "Dormitorio principal",
  "Dormitorio 2",
  "Baño 1",
  "Baño 2",
  "Logia",
  "Terraza / balcón",
  null,
  null,
];
for (const a of ambientes) ambienteBlock(a);

// =====================================================================
//  Medidores, llaves, inventario
// =====================================================================
newPage();
sectionHeader("5. Lecturas de medidores");
fieldRow([
  { label: "Luz N°", w: 60 },
  { label: "Lectura", w: 60 },
  { label: "Fecha", w: 60 },
]);
fieldRow([
  { label: "Agua N°", w: 60 },
  { label: "Lectura", w: 60 },
  { label: "Fecha", w: 60 },
]);
fieldRow([
  { label: "Gas N°", w: 60 },
  { label: "Lectura", w: 60 },
  { label: "Fecha", w: 60 },
]);
fieldRow([{ label: "Gastos comunes al día (certificado)", w: 120 }]);

sectionHeader("6. Llaves y controles entregados");
fieldRow([
  { label: "Llaves puerta principal (cantidad)", w: 100 },
  { label: "Llave bodega", w: 80 },
]);
fieldRow([
  { label: "Llave estacionamiento", w: 90 },
  { label: "Controles de portón", w: 90 },
]);
fieldRow([
  { label: "Tarjetas / accesos", w: 90 },
  { label: "Otros", w: 90 },
]);

sectionHeader("7. Inventario (si está amoblado)");
// mini-tabla inventario
(function inventario() {
  const iEl = M;
  const iCant = M + 90;
  const iEst = M + 115;
  const iObs = M + 140;
  ensure(8);
  setFill([243, 244, 246]);
  doc.rect(M, y - 4, CW, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setColor(MUTED);
  doc.text("ÍTEM", iEl + 2, y);
  doc.text("CANT.", iCant + 1, y);
  doc.text("ESTADO", iEst + 1, y);
  doc.text("OBSERVACIONES", iObs + 1, y);
  y += 5;
  setColor(INK);
  for (let i = 0; i < 6; i++) {
    ensure(7);
    setStroke(LINE);
    doc.setLineWidth(0.25);
    doc.line(iEl, y + 0.6, iCant - 3, y + 0.6);
    doc.line(iCant, y + 0.6, iEst - 3, y + 0.6);
    doc.line(iEst, y + 0.6, iObs - 3, y + 0.6);
    doc.line(iObs, y + 0.6, RIGHT, y + 0.6);
    y += 7;
  }
  y += 2;
})();

// =====================================================================
//  Observaciones, declaración y firmas
// =====================================================================
sectionHeader("8. Daños preexistentes y observaciones generales");
for (let i = 0; i < 5; i++) {
  ensure(7);
  setStroke(LINE);
  doc.setLineWidth(0.25);
  doc.line(M, y + 0.6, RIGHT, y + 0.6);
  y += 7;
}
y += 2;

sectionHeader("9. Declaración y firmas");
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
setColor(INK);
(function declaracion() {
  const txt =
    "Ambas partes declaran haber revisado en conjunto el estado de la propiedad descrito en esta acta y aceptan su contenido como fiel reflejo de las condiciones al momento de la entrega. Los defectos preexistentes registrados no serán imputables al arrendatario al término del contrato.";
  const lines = doc.splitTextToSize(txt, CW);
  ensure(lines.length * 4.3 + 4);
  doc.text(lines, M, y);
  y += lines.length * 4.3 + 8;
})();

(function firmas() {
  ensure(34);
  const boxW = (CW - 12) / 2;
  const yTop = y;
  const xL = M;
  const xR = M + boxW + 12;
  // líneas de firma
  setStroke(MUTED);
  doc.setLineWidth(0.3);
  const yLine = yTop + 16;
  doc.line(xL, yLine, xL + boxW, yLine);
  doc.line(xR, yLine, xR + boxW, yLine);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(INK);
  doc.text("Arrendador / Propietario", xL, yLine + 5);
  doc.text("Arrendatario / Comprador", xR, yLine + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(MUTED);
  doc.text("Nombre y RUT", xL, yLine + 10);
  doc.text("Nombre y RUT", xR, yLine + 10);
  y = yLine + 16;
  // testigo
  ensure(14);
  doc.setLineWidth(0.3);
  setStroke(MUTED);
  doc.line(xL, y + 8, xL + boxW, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(INK);
  doc.text("Testigo (opcional)", xL, y + 13);
  y += 16;
})();

// Callout CertiFoto
(function callout() {
  ensure(26);
  setFill(SOFT);
  setStroke(ACCENT);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, CW, 22, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(ACCENT_DARK);
  doc.text("¿Quieres que esta acta tenga respaldo técnico?", M + 5, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(INK);
  const txt =
    "Con CertiFoto cada foto queda con su huella SHA-256, fecha y metadatos verificables, y obtienes un PDF auto-verificable que prueba que nada se alteró. Crea tu acta gratis (sin registro) en certifoto.cl";
  const lines = doc.splitTextToSize(txt, CW - 10);
  doc.text(lines, M + 5, y + 12);
  y += 24;
})();

// =====================================================================
//  Pie de página en todas las páginas
// =====================================================================
const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  setStroke([229, 231, 235]);
  doc.setLineWidth(0.3);
  doc.line(M, H - 12, RIGHT, H - 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setColor(MUTED);
  doc.text(
    "CertiFoto · Plantilla gratuita de acta de entrega · certifoto.cl",
    M,
    H - 8
  );
  doc.text(`Página ${i} de ${pageCount}`, RIGHT, H - 8, { align: "right" });
}

// ---- Guardar ----
const outPath = path.join(
  process.cwd(),
  "public",
  "plantilla-acta-entrega-certifoto.pdf"
);
const arrayBuffer = doc.output("arraybuffer");
fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
const kb = Math.round(fs.statSync(outPath).size / 1024);
console.log(
  `[acta-template] Escrito ${outPath} (${kb} KB, ${pageCount} páginas)`
);
