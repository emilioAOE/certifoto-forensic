import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Importante: requerimos Node runtime (no edge) porque sharp y sharp-phash
// dependen de binarios nativos. Vercel los soporta en el runtime nodejs por
// defecto.
export const runtime = "nodejs";

// Tiempo maximo de procesamiento (sharp + pHash + thumbnail)
export const maxDuration = 30;

// Vercel Functions tienen un limite de payload de ~4.5MB en el body por defecto.
// Para fotos mas grandes el cliente las debe comprimir antes de enviar.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
  "image/heif",
  "image/heic",
  "image/avif",
  "image/jpg",
]);

interface AnalyzeResponse {
  ok: boolean;
  sha256?: string;
  phash?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  thumbnailBase64?: string | null;
  warnings?: string[];
  error?: string;
  code?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { ok: false, error: "Cuerpo de la peticion invalido", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { ok: false, error: "No se recibio archivo", code: "NO_FILE" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `Archivo demasiado grande (max ${MAX_FILE_BYTES / 1024 / 1024}MB para procesamiento server-side; el cliente lo procesara localmente)`,
          code: "FILE_TOO_LARGE",
        },
        { status: 413 }
      );
    }

    if (file.type && !ACCEPTED_MIME.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          ok: false,
          error: `Tipo de archivo no soportado: ${file.type}`,
          code: "UNSUPPORTED_TYPE",
        },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // SHA-256 (siempre disponible, no depende de binarios nativos)
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    const warnings: string[] = [];

    // Sharp metadata + pHash (puede fallar en algunos entornos serverless si los
    // binarios nativos no estan disponibles)
    let width: number | null = null;
    let height: number | null = null;
    let format: string | null = null;
    let phash: string | null = null;

    try {
      const sharpMod = await import("sharp");
      const sharp = sharpMod.default;
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      format = metadata.format ?? null;
    } catch (err) {
      warnings.push("sharp_metadata_unavailable");
      console.warn("[analyze] sharp metadata failed:", (err as Error).message);
    }

    try {
      const sharpPhashMod = await import("sharp-phash");
      const sharpPhash = sharpPhashMod.default;
      phash = await sharpPhash(buffer);
    } catch (err) {
      warnings.push("phash_unavailable");
      console.warn("[analyze] sharp-phash failed:", (err as Error).message);
    }

    // Thumbnail extraction via exifr (no requiere binarios nativos)
    let thumbnailBase64: string | null = null;
    try {
      const exifr = await import("exifr");
      const thumbBuf = await exifr.thumbnail(buffer);
      if (thumbBuf) {
        const b64 = Buffer.from(thumbBuf).toString("base64");
        thumbnailBase64 = `data:image/jpeg;base64,${b64}`;
      }
    } catch (err) {
      warnings.push("thumbnail_extraction_failed");
      console.warn("[analyze] thumbnail extraction failed:", (err as Error).message);
    }

    return NextResponse.json({
      ok: true,
      sha256,
      phash,
      width,
      height,
      format,
      thumbnailBase64,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[analyze] unexpected error:", message);
    return NextResponse.json(
      {
        ok: false,
        error: "El servidor no pudo procesar la imagen. El cliente seguira con sus propios calculos forenses.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
