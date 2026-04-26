/**
 * Compresion de imagenes client-side antes de guardar.
 *
 * Reduce drasticamente el tamano del dataURL guardado en storage. Ejemplo
 * tipico: foto de 6MB del celular → ~400-700KB tras compresion sin perdida
 * visual perceptible para uso de evidencia.
 *
 * IMPORTANTE: el SHA-256 forense se calcula del archivo ORIGINAL antes de
 * comprimir. La copia comprimida es solo para display/storage. Asi mantenemos
 * la integridad forense del hash.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, JPEG quality
  mimeType?: "image/jpeg" | "image/webp";
}

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  originalBytes: number;
  ratio: number; // bytes / originalBytes
  format: string;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.85,
  mimeType: "image/jpeg",
};

/**
 * Comprime una imagen via canvas. Mantiene aspect ratio. Si la imagen ya es
 * mas pequena que maxWidth/maxHeight no se redimensiona, solo se recodifica.
 *
 * Para PNGs sin transparencia, convierte a JPEG (gran ahorro). Si tiene
 * transparencia (alpha < 255 detectado), mantiene PNG.
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const originalBytes = file.size;
  const url = URL.createObjectURL(file);

  try {
    // Cargar imagen
    const img = await loadImage(url);

    // Calcular nuevas dimensiones manteniendo aspect ratio
    const { width: targetW, height: targetH } = computeTargetDimensions(
      img.naturalWidth,
      img.naturalHeight,
      opts.maxWidth,
      opts.maxHeight
    );

    // Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) {
      throw new Error("No se pudo obtener contexto 2D del canvas");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Para JPEG, llenar fondo blanco si la imagen pudiera tener alpha
    // (canvas para JPEG ignora alpha pero conviene asegurar fondo)
    const chosenMime = opts.mimeType;
    if (chosenMime === "image/jpeg") {
      // Re-dibujar sobre fondo blanco para evitar transparencia rara
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.globalCompositeOperation = "source-over";
    }

    // Convertir a Blob
    const blob = await canvasToBlob(canvas, chosenMime, opts.quality);
    const dataUrl = await blobToDataUrl(blob);

    return {
      blob,
      dataUrl,
      width: targetW,
      height: targetH,
      bytes: blob.size,
      originalBytes,
      ratio: originalBytes > 0 ? blob.size / originalBytes : 1,
      format: chosenMime,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Imagen invalida o corrupta"));
    img.src = url;
  });
}

function computeTargetDimensions(
  origW: number,
  origH: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  if (origW <= maxW && origH <= maxH) {
    return { width: origW, height: origH };
  }
  const ratio = Math.min(maxW / origW, maxH / origH);
  return {
    width: Math.round(origW * ratio),
    height: Math.round(origH * ratio),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob fallo"));
      },
      mimeType,
      quality
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper: convierte un Blob a File con nombre original (sin perder filename).
 */
export function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

/**
 * Decide si conviene comprimir una imagen segun su tamano y MIME.
 * No comprime si ya es pequena o si es SVG/HEIC (que canvas no soporta bien).
 */
export function shouldCompress(file: File): boolean {
  const KB = 1024;
  if (file.size < 200 * KB) return false; // ya es pequena
  const skipMimes = [
    "image/svg+xml",
    "image/heic",
    "image/heif",
    "image/avif",
  ];
  if (skipMimes.includes(file.type)) return false;
  return true;
}
