/**
 * Extractor de datos de contratos de arriendo.
 *
 * Acepta:
 * - PDF nativo (texto seleccionable) — extrae texto con PDF.js
 * - PDF escaneado (imagen) — render por pagina + OCR con Tesseract.js (es-ES)
 * - Imagenes (jpg/png/etc) — OCR directo
 *
 * Despues aplica heuristicas (regex + busqueda contextual) para identificar:
 *  - Direccion del inmueble + comuna + region
 *  - RUT y nombre del arrendador y arrendatario
 *  - Monto del arriendo, fechas de inicio/termino, garantia
 *
 * Notas:
 * - Tesseract.js carga el modelo de espanol (~12MB) la primera vez que
 *   se usa OCR. Se almacena en cache del navegador.
 * - Las heuristicas estan calibradas para contratos chilenos comunes.
 *   El usuario siempre puede revisar y corregir antes de aplicar.
 */

import { findComunaByName, type Region } from "./chile-comunas";
import { cleanRut, isValidRut, formatRut, parseChileanDate } from "./validators";

export interface ContractExtraction {
  rawText: string;
  property: {
    address: string | null;
    unit: string | null;
    commune: string | null;
    region: Region | null;
    city: string | null;
  };
  landlord: {
    name: string | null;
    rut: string | null;
  };
  tenant: {
    name: string | null;
    rut: string | null;
  };
  contract: {
    monthlyAmount: number | null;
    startDate: string | null; // YYYY-MM-DD
    endDate: string | null; // YYYY-MM-DD
    deposit: number | null; // mes(es) de garantia o monto
  };
  confidence: {
    address: number;
    landlord: number;
    tenant: number;
    contract: number;
    overall: number;
  };
  extractedFrom: {
    pages: number;
    chars: number;
  };
}

// ============================================
// Entry point
// ============================================

export type ExtractStage =
  | "loading_pdf"
  | "reading_native_text"
  | "ocr_loading_model"
  | "ocr_rendering_page"
  | "ocr_recognizing"
  | "parsing"
  | "done";

export interface ExtractProgress {
  stage: ExtractStage;
  /** 0..1 del paso actual */
  pct: number;
  /** Pagina actual (1-indexed) si aplica */
  page?: number;
  /** Total de paginas, si aplica */
  totalPages?: number;
  /** Texto descriptivo para mostrar al usuario */
  message: string;
}

export interface ExtractOptions {
  onProgress?: (progress: ExtractProgress) => void;
  /**
   * Caracteres minimos en el texto nativo para considerarlo valido (no
   * escaneado). Por debajo de este umbral cae al fallback OCR.
   */
  scannedThresholdChars?: number;
}

const DEFAULT_SCANNED_THRESHOLD = 200;

/**
 * Lee un contrato (PDF o imagen) y extrae los datos. Decide automaticamente
 * si usar texto nativo del PDF o caer a OCR (escaneo o imagen).
 */
export async function extractContractData(
  file: File | Blob,
  options: ExtractOptions = {}
): Promise<ContractExtraction> {
  const { onProgress, scannedThresholdChars = DEFAULT_SCANNED_THRESHOLD } =
    options;
  const fileType =
    "type" in file && typeof file.type === "string" ? file.type : "";
  const isImage = fileType.startsWith("image/");

  // Caso 1: imagen → OCR directo
  if (isImage) {
    onProgress?.({
      stage: "ocr_loading_model",
      pct: 0,
      message: "Cargando modelo OCR (espanol). Primera vez ~12MB.",
    });
    const text = await ocrImage(file, (pct) =>
      onProgress?.({
        stage: "ocr_recognizing",
        pct,
        message: `Leyendo imagen con OCR... ${Math.round(pct * 100)}%`,
      })
    );
    onProgress?.({
      stage: "parsing",
      pct: 1,
      message: "Procesando datos extraidos...",
    });
    const result = parseContractText(text, 1);
    onProgress?.({ stage: "done", pct: 1, message: "Listo" });
    return result;
  }

  // Caso 2: PDF — intentamos texto nativo primero
  onProgress?.({
    stage: "loading_pdf",
    pct: 0,
    message: "Abriendo PDF...",
  });
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  onProgress?.({
    stage: "reading_native_text",
    pct: 0,
    totalPages,
    message: "Leyendo texto del PDF...",
  });

  let nativeText = "";
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it: unknown) => {
        const item = it as { str?: string };
        return item.str ?? "";
      })
      .join(" ");
    nativeText += pageText + "\n";
    onProgress?.({
      stage: "reading_native_text",
      pct: i / totalPages,
      page: i,
      totalPages,
      message: `Leyendo pagina ${i}/${totalPages}...`,
    });
  }

  const meaningfulChars = nativeText.replace(/\s/g, "").length;
  const isLikelyScanned = meaningfulChars < scannedThresholdChars;

  if (!isLikelyScanned) {
    // PDF nativo con texto suficiente
    onProgress?.({
      stage: "parsing",
      pct: 1,
      message: "Procesando datos extraidos...",
    });
    const result = parseContractText(nativeText, totalPages);
    onProgress?.({ stage: "done", pct: 1, message: "Listo" });
    return result;
  }

  // PDF escaneado: render cada pagina a canvas y OCR
  onProgress?.({
    stage: "ocr_loading_model",
    pct: 0,
    totalPages,
    message:
      "El PDF parece escaneado. Cargando modelo OCR (primera vez ~12MB)...",
  });

  let ocrText = "";
  for (let i = 1; i <= totalPages; i++) {
    onProgress?.({
      stage: "ocr_rendering_page",
      pct: (i - 1) / totalPages,
      page: i,
      totalPages,
      message: `Preparando pagina ${i}/${totalPages} para OCR...`,
    });
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear contexto canvas");
    await page.render({ canvasContext: ctx, viewport }).promise;

    const pageText = await ocrCanvas(canvas, (pct) =>
      onProgress?.({
        stage: "ocr_recognizing",
        pct: ((i - 1) + pct) / totalPages,
        page: i,
        totalPages,
        message: `OCR pagina ${i}/${totalPages}: ${Math.round(pct * 100)}%`,
      })
    );
    ocrText += pageText + "\n";
  }

  onProgress?.({
    stage: "parsing",
    pct: 1,
    totalPages,
    message: "Procesando datos extraidos del OCR...",
  });
  const result = parseContractText(ocrText, totalPages);
  onProgress?.({ stage: "done", pct: 1, totalPages, message: "Listo" });
  return result;
}

// ============================================
// OCR loader (Tesseract.js)
// ============================================

type TesseractLogger = (m: { status: string; progress: number }) => void;

interface TesseractWorker {
  recognize: (
    image: File | Blob | HTMLCanvasElement | string
  ) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<void>;
}

interface TesseractModule {
  createWorker: (
    lang: string,
    oem?: number,
    options?: { logger?: TesseractLogger }
  ) => Promise<TesseractWorker>;
}

let tesseractWorkerPromise: Promise<TesseractWorker> | null = null;
let activeOcrLogger: TesseractLogger | null = null;

async function getTesseractWorker(): Promise<TesseractWorker> {
  if (tesseractWorkerPromise) return tesseractWorkerPromise;
  tesseractWorkerPromise = (async () => {
    const mod = (await import("tesseract.js")) as unknown as TesseractModule;
    const worker = await mod.createWorker("spa", undefined, {
      logger: (m) => {
        if (activeOcrLogger) activeOcrLogger(m);
      },
    });
    return worker;
  })();
  return tesseractWorkerPromise;
}

async function ocrImage(
  file: File | Blob,
  onProgress: (pct: number) => void
): Promise<string> {
  const worker = await getTesseractWorker();
  activeOcrLogger = (m) => {
    if (m.status === "recognizing text") onProgress(m.progress);
  };
  try {
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    activeOcrLogger = null;
  }
}

async function ocrCanvas(
  canvas: HTMLCanvasElement,
  onProgress: (pct: number) => void
): Promise<string> {
  const worker = await getTesseractWorker();
  activeOcrLogger = (m) => {
    if (m.status === "recognizing text") onProgress(m.progress);
  };
  try {
    const result = await worker.recognize(canvas);
    return result.data.text;
  } finally {
    activeOcrLogger = null;
  }
}

// ============================================
// PDF.js loader
// ============================================

interface PdfJsLib {
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{
          items: unknown[];
        }>;
        getViewport: (params: { scale: number }) => {
          width: number;
          height: number;
        };
        render: (params: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }) => { promise: Promise<void> };
      }>;
    }>;
  };
  GlobalWorkerOptions: { workerSrc: string };
  version: string;
}

let pdfJsCache: PdfJsLib | null = null;

async function loadPdfJs(): Promise<PdfJsLib> {
  if (pdfJsCache) return pdfJsCache;
  // Importacion dinamica para no incluir PDF.js en el bundle inicial
  const mod = (await import("pdfjs-dist")) as unknown as PdfJsLib & {
    default?: PdfJsLib;
  };
  const lib = (mod.default ?? mod) as PdfJsLib;

  // Worker via CDN (PDF.js requiere worker para funcionar bien)
  if (lib.GlobalWorkerOptions && lib.version) {
    lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
  }

  pdfJsCache = lib;
  return lib;
}

// ============================================
// Parsing heuristico
// ============================================

export function parseContractText(
  text: string,
  pages = 1
): ContractExtraction {
  const cleaned = normalizeWhitespace(text);

  const ruts = extractAllRuts(cleaned);
  const { landlordRut, tenantRut } = classifyRuts(cleaned, ruts);

  const landlordName = extractName(cleaned, "arrendador", landlordRut);
  const tenantName = extractName(cleaned, "arrendatario", tenantRut);

  const address = extractAddress(cleaned);
  const communeName = extractCommune(cleaned);
  const communeMatch = communeName ? findComunaByName(communeName) : null;

  const monthlyAmount = extractMonthlyAmount(cleaned);
  const startDate = extractDate(cleaned, ["inicio", "comienza", "rige", "vigencia"]);
  const endDate = extractDate(cleaned, ["termino", "termina", "vence", "expiracion"]);
  const deposit = extractDeposit(cleaned);

  // Confidence scoring (heuristico)
  const confidence = {
    address: address ? 0.7 : 0,
    landlord:
      (landlordRut ? 0.5 : 0) + (landlordName ? 0.4 : 0),
    tenant:
      (tenantRut ? 0.5 : 0) + (tenantName ? 0.4 : 0),
    contract:
      (monthlyAmount ? 0.4 : 0) +
      (startDate ? 0.3 : 0) +
      (deposit !== null ? 0.2 : 0),
    overall: 0,
  };
  confidence.overall =
    (confidence.address +
      confidence.landlord +
      confidence.tenant +
      confidence.contract) /
    4;

  return {
    rawText: cleaned.slice(0, 5000),
    property: {
      address,
      unit: extractUnit(cleaned),
      commune: communeMatch?.name ?? communeName,
      region: communeMatch?.region ?? null,
      city: extractCity(cleaned),
    },
    landlord: {
      name: landlordName,
      rut: landlordRut,
    },
    tenant: {
      name: tenantName,
      rut: tenantRut,
    },
    contract: {
      monthlyAmount,
      startDate,
      endDate,
      deposit,
    },
    confidence,
    extractedFrom: {
      pages,
      chars: cleaned.length,
    },
  };
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractAllRuts(text: string): string[] {
  // Match RUTs con o sin puntos: "12.345.678-9", "12345678-9", "12.345.678-K"
  const matches = text.match(/\b\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3}[\s\-]+[\dkK]\b/g) ?? [];
  return Array.from(
    new Set(
      matches
        .map((r) => formatRut(cleanRut(r)))
        .filter((r) => isValidRut(r))
    )
  );
}

function classifyRuts(
  text: string,
  ruts: string[]
): { landlordRut: string | null; tenantRut: string | null } {
  if (ruts.length === 0) return { landlordRut: null, tenantRut: null };

  // Buscar el primer RUT que aparece DESPUES de la palabra "arrendador"
  let landlordRut: string | null = null;
  let tenantRut: string | null = null;

  const lowerText = text.toLowerCase();
  const landlordIdx = lowerText.indexOf("arrendador");
  const tenantIdx = lowerText.indexOf("arrendatario");

  for (const rut of ruts) {
    const rutPos = lowerText.indexOf(cleanRut(rut).toLowerCase());
    if (rutPos === -1) continue;

    // Asignar al rol cuya palabra clave aparece mas cerca antes del RUT
    const distFromLandlord =
      landlordIdx >= 0 && landlordIdx < rutPos ? rutPos - landlordIdx : Infinity;
    const distFromTenant =
      tenantIdx >= 0 && tenantIdx < rutPos ? rutPos - tenantIdx : Infinity;

    if (distFromLandlord < distFromTenant && !landlordRut) {
      landlordRut = rut;
    } else if (distFromTenant < distFromLandlord && !tenantRut) {
      tenantRut = rut;
    } else if (!landlordRut) {
      landlordRut = rut;
    } else if (!tenantRut) {
      tenantRut = rut;
    }
  }

  return { landlordRut, tenantRut };
}

function extractName(
  text: string,
  role: "arrendador" | "arrendatario",
  rut: string | null
): string | null {
  // Estrategia: buscar la palabra "arrendador" o "arrendatario" y tomar el
  // texto entre esa palabra y el RUT siguiente.
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(role);
  if (idx === -1) return null;

  // Slice desde despues de "arrendador" hasta proximo RUT (max 200 chars)
  const slice = text.slice(idx + role.length, idx + role.length + 250);

  // Heuristica: el nombre suele venir despues de "don", "doña", ":" o ","
  // y antes del RUT
  let candidate: string | null = null;

  const patterns = [
    /(?:don|doña|sr\.?|sra\.?|d\.?)\s+([A-ZÁÉÍÓÚÑ][^\d\n,;]{2,80})/i,
    /:\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/,
    /,\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/,
  ];

  for (const pattern of patterns) {
    const m = slice.match(pattern);
    if (m && m[1]) {
      candidate = m[1].trim();
      // Cortar antes de RUT, comas, "RUT", "rol", etc.
      candidate = candidate
        .replace(/\s+(rut|run|cedula|ci|domiciliad|chileno).*$/i, "")
        .trim();
      // Filtrar candidatos demasiado cortos
      if (candidate.split(/\s+/).length >= 2) {
        return titleCase(candidate);
      }
    }
  }

  // Fallback: si tenemos el RUT, buscar 5-6 palabras antes del RUT
  if (rut) {
    const rutCleaned = cleanRut(rut);
    const rutPos = text.toUpperCase().indexOf(rutCleaned);
    if (rutPos > 0) {
      const before = text.slice(Math.max(0, rutPos - 200), rutPos);
      const m = before.match(
        /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})\s*[,;:]?\s*$/
      );
      if (m && m[1]) {
        return titleCase(m[1].trim());
      }
    }
  }

  return null;
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) =>
      w.length <= 2
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

function extractAddress(text: string): string | null {
  const lower = text.toLowerCase();

  // Buscar palabras clave: "domicilio", "ubicada en", "ubicado en", "direccion",
  // "calle", "avenida", "av."
  const keywords = [
    "ubicad[oa]\\s+en",
    "domiciliad[oa]?\\s+en",
    "domicilio",
    "direcci[oó]n",
    "inmueble\\s+(?:ubicado|que\\s+por\\s+el\\s+presente)",
  ];

  for (const kw of keywords) {
    const re = new RegExp(`${kw}[\\s,:]+([^,;.]{8,120})`, "i");
    const m = lower.match(re);
    if (m && m[1]) {
      // Recuperar el texto original (con mayusculas) en esa posicion
      const start = m.index! + m[0].indexOf(m[1]);
      const original = text.slice(start, start + m[1].length).trim();
      // Limpiar prefijos comunes
      const cleaned = original
        .replace(/^en\s+/i, "")
        .replace(/^(?:la|el)\s+/i, "")
        .trim();
      if (cleaned.length > 5) {
        return titleCase(cleaned);
      }
    }
  }

  // Fallback: buscar patrones de calle + numero
  const streetPatterns = [
    /(?:av(?:enida|\.)?\s+|calle\s+|pasaje\s+)([A-Z][^\d,;]{2,60}\s+\d+(?:\s+(?:depto|departamento|of|oficina)\.?\s*\d+)?)/i,
  ];
  for (const pattern of streetPatterns) {
    const m = text.match(pattern);
    if (m && m[1]) {
      return titleCase(m[1].trim());
    }
  }

  return null;
}

function extractUnit(text: string): string | null {
  const m = text.match(
    /(?:depto|departamento|dpto|dep)\.?\s*(?:n[°º]?\s*)?(\d{1,5}[A-Z]?)/i
  );
  if (m && m[1]) return `Depto ${m[1].toUpperCase()}`;
  const ofMatch = text.match(/(?:oficina|ofic|of)\.?\s*(?:n[°º]?\s*)?(\d{1,5}[A-Z]?)/i);
  if (ofMatch && ofMatch[1]) return `Oficina ${ofMatch[1].toUpperCase()}`;
  return null;
}

function extractCommune(text: string): string | null {
  const m = text.match(/comuna\s+(?:de\s+)?([A-ZÁÉÍÓÚÑ][^\d,;.\n]{2,40})/i);
  if (m && m[1]) {
    return titleCase(
      m[1]
        .replace(/\b(de|la|el|los|las)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    );
  }
  return null;
}

function extractCity(text: string): string | null {
  const m = text.match(/ciudad\s+(?:de\s+)?([A-ZÁÉÍÓÚÑ][^\d,;.\n]{2,30})/i);
  if (m && m[1]) {
    return titleCase(m[1].trim());
  }
  return null;
}

function extractMonthlyAmount(text: string): number | null {
  // Buscar patrones como "$ 450.000", "$450.000", "450.000 pesos", "renta mensual de $..."
  const patterns = [
    /(?:renta|canon|arriendo|valor\s+mensual)[^\d]*\$?\s*([\d\.\,]+)/gi,
    /\$\s*([\d\.\,]+)\s*(?:pesos|mensual)/gi,
    /([\d\.\,]{4,})\s*pesos\s+mensuales/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const m of matches) {
      const digits = m[1].replace(/\D/g, "");
      const num = parseInt(digits, 10);
      if (!isNaN(num) && num >= 100_000 && num < 100_000_000) {
        return num;
      }
    }
  }
  return null;
}

function extractDate(text: string, keywords: string[]): string | null {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw);
    if (idx === -1) continue;
    const slice = text.slice(idx, idx + 200);
    const date = parseChileanDate(slice);
    if (date) return date;
  }
  // Fallback: primer fecha en el texto (con menor confianza)
  return parseChileanDate(text.slice(0, 500));
}

function extractDeposit(text: string): number | null {
  // "garantia equivalente a un mes", "deposito de $X", "tres meses de garantia"
  const monthsWord: Record<string, number> = {
    un: 1,
    una: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
  };
  const wordPattern = new RegExp(
    `(${Object.keys(monthsWord).join("|")})\\s+mes(?:es)?\\s+de\\s+(?:garant[ií]a|dep[oó]sito)`,
    "i"
  );
  const wm = text.match(wordPattern);
  if (wm && wm[1]) {
    return monthsWord[wm[1].toLowerCase()] ?? null;
  }

  const numericPattern = /(?:garant[ií]a|dep[oó]sito)[^\d]*\$?\s*([\d\.\,]+)/i;
  const nm = text.match(numericPattern);
  if (nm && nm[1]) {
    const digits = nm[1].replace(/\D/g, "");
    const num = parseInt(digits, 10);
    if (!isNaN(num)) return num;
  }
  return null;
}
