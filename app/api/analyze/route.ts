import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // SHA-256
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // Sharp metadata + pHash
    let width: number | null = null;
    let height: number | null = null;
    let format: string | null = null;
    let phash: string | null = null;

    try {
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      format = metadata.format ?? null;

      try {
        const sharpPhash = (await import("sharp-phash")).default;
        phash = await sharpPhash(buffer);
      } catch {
        // sharp-phash may not support all formats
      }
    } catch {
      // sharp may fail on unsupported formats
    }

    // Thumbnail extraction via exifr (server-side fallback)
    let thumbnailBase64: string | null = null;

    try {
      const exifr = await import("exifr");
      const thumbBuf = await exifr.thumbnail(buffer);
      if (thumbBuf) {
        const b64 = Buffer.from(thumbBuf).toString("base64");
        thumbnailBase64 = `data:image/jpeg;base64,${b64}`;
      }
    } catch {
      // Thumbnail extraction failed
    }

    return NextResponse.json({
      sha256,
      phash,
      width,
      height,
      format,
      thumbnailBase64,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
