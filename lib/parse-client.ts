import * as exifr from "exifr";
import type {
  PhotoAnalysis,
  ExifTemporal,
  ExifDevice,
  ExifCapture,
  ExifImage,
  GpsData,
  IptcData,
  XmpData,
  XmpHistoryEntry,
  IccData,
  ThumbnailData,
  FileData,
} from "./types";
import { formatBytes, formatExposure, formatGoogleMapsUrl } from "./format";
import { scanForC2PA } from "./c2pa-detect";
import { runConsistencyChecks } from "./consistency";

function str(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function num(v: unknown): number | null {
  if (v === undefined || v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function extractTemporal(exif: Record<string, unknown>): ExifTemporal {
  return {
    dateTimeOriginal: str(exif.DateTimeOriginal),
    dateTimeDigitized: str(exif.DateTimeDigitized ?? exif.CreateDate),
    dateTime: str(exif.DateTime ?? exif.ModifyDate),
    gpsDateStamp: str(exif.GPSDateStamp),
    gpsTimeStamp: str(exif.GPSTimeStamp),
    offsetTimeOriginal: str(exif.OffsetTimeOriginal),
    offsetTimeDigitized: str(exif.OffsetTimeDigitized),
    offsetTime: str(exif.OffsetTime),
  };
}

function extractDevice(exif: Record<string, unknown>): ExifDevice {
  return {
    make: str(exif.Make),
    model: str(exif.Model),
    lensMake: str(exif.LensMake),
    lensModel: str(exif.LensModel),
    serialNumber: str(exif.SerialNumber ?? exif.BodySerialNumber),
    software: str(exif.Software),
    hostComputer: str(exif.HostComputer),
  };
}

function extractCapture(exif: Record<string, unknown>): ExifCapture {
  const et = num(exif.ExposureTime);
  return {
    fNumber: num(exif.FNumber),
    exposureTime: et,
    exposureTimeFormatted: et !== null ? formatExposure(et) : null,
    iso: num(exif.ISO ?? exif.ISOSpeedRatings),
    focalLength: num(exif.FocalLength),
    focalLength35mm: num(exif.FocalLengthIn35mmFormat),
    flash: str(exif.Flash),
    whiteBalance: str(exif.WhiteBalance),
    meteringMode: str(exif.MeteringMode),
    exposureMode: str(exif.ExposureMode),
    exposureProgram: str(exif.ExposureProgram),
    sceneCaptureType: str(exif.SceneCaptureType ?? exif.SceneType),
    digitalZoomRatio: num(exif.DigitalZoomRatio),
    contrast: str(exif.Contrast),
    saturation: str(exif.Saturation),
    sharpness: str(exif.Sharpness),
  };
}

function extractImage(exif: Record<string, unknown>): ExifImage {
  return {
    imageWidth: num(exif.ImageWidth ?? exif.ExifImageWidth ?? exif.PixelXDimension),
    imageHeight: num(exif.ImageHeight ?? exif.ExifImageHeight ?? exif.PixelYDimension),
    orientation: num(exif.Orientation),
    colorSpace: str(exif.ColorSpace),
    bitsPerSample: num(exif.BitsPerSample),
    compression: str(exif.Compression),
    xResolution: num(exif.XResolution),
    yResolution: num(exif.YResolution),
  };
}

function extractGps(exif: Record<string, unknown>): GpsData {
  const lat = num(exif.latitude ?? exif.GPSLatitude);
  const lng = num(exif.longitude ?? exif.GPSLongitude);
  return {
    latitude: lat,
    longitude: lng,
    altitude: num(exif.GPSAltitude),
    altitudeRef: str(exif.GPSAltitudeRef),
    direction: num(exif.GPSImgDirection),
    directionRef: str(exif.GPSImgDirectionRef),
    speed: num(exif.GPSSpeed),
    speedRef: str(exif.GPSSpeedRef),
    googleMapsUrl: lat !== null && lng !== null ? formatGoogleMapsUrl(lat, lng) : null,
  };
}

function extractIptc(raw: Record<string, unknown>): IptcData {
  const kw = raw.Keywords ?? raw.keywords;
  let keywords: string[] = [];
  if (Array.isArray(kw)) keywords = kw.map(String);
  else if (typeof kw === "string") keywords = [kw];

  return {
    objectName: str(raw.ObjectName ?? raw["Iptc4xmpCore:IntellectualGenre"]),
    caption: str(raw.Caption ?? raw["dc:description"] ?? raw.Description),
    byline: str(raw.Byline ?? raw["dc:creator"] ?? raw.Creator),
    copyright: str(raw.Copyright ?? raw["dc:rights"]),
    keywords,
    city: str(raw.City ?? raw["photoshop:City"]),
    country: str(raw.Country ?? raw["photoshop:Country"]),
    source: str(raw.Source ?? raw["photoshop:Source"]),
  };
}

function extractXmp(raw: Record<string, unknown>): XmpData {
  const historyRaw = raw["xmpMM:History"] ?? raw.History;
  const history: XmpHistoryEntry[] = [];

  if (Array.isArray(historyRaw)) {
    for (const entry of historyRaw) {
      if (entry && typeof entry === "object") {
        const e = entry as Record<string, unknown>;
        history.push({
          action: str(e.action ?? e["stEvt:action"]) ?? "unknown",
          when: str(e.when ?? e["stEvt:when"]),
          softwareAgent: str(e.softwareAgent ?? e["stEvt:softwareAgent"]),
          parameters: str(e.parameters ?? e["stEvt:parameters"]),
        });
      }
    }
  }

  return {
    creatorTool: str(raw.CreatorTool ?? raw["xmp:CreatorTool"]),
    metadataDate: str(raw.MetadataDate ?? raw["xmp:MetadataDate"]),
    createDate: str(raw.CreateDate ?? raw["xmp:CreateDate"]),
    modifyDate: str(raw.ModifyDate ?? raw["xmp:ModifyDate"]),
    history,
    rawXmp: raw,
  };
}

function extractIcc(raw: Record<string, unknown>): IccData {
  return {
    profileName: str(raw.ProfileDescription ?? raw.profileName ?? raw.desc),
    colorSpace: str(raw.ColorSpaceData ?? raw.colorSpace),
    connectionSpace: str(raw.ConnectionSpace ?? raw.connectionSpace),
    creator: str(raw.ProfileCreator ?? raw.creator),
    description: str(raw.ProfileDescription ?? raw.description),
  };
}

async function extractThumbnail(file: File): Promise<ThumbnailData> {
  try {
    const thumbBuffer = await exifr.thumbnail(file);
    if (thumbBuffer) {
      const blob = new Blob([new Uint8Array(thumbBuffer)], { type: "image/jpeg" });
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Get thumbnail dimensions
      const img = new Image();
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = dataUrl;
      });

      return {
        dataUrl,
        width: dims.w || null,
        height: dims.h || null,
      };
    }
  } catch {
    // Thumbnail extraction failed
  }
  return { dataUrl: null, width: null, height: null };
}

async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

export async function parseClientSide(
  file: File,
  id: string
): Promise<PhotoAnalysis> {
  const buffer = await file.arrayBuffer();

  // Run parallel operations
  const [sha256, exifData, thumbnailData, dims] = await Promise.all([
    computeSha256(buffer),
    exifr
      .parse(file, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        xmp: true,
        icc: true,
        jfif: true,
        userComment: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
        mergeOutput: true,
      })
      .catch(() => ({} as Record<string, unknown>)),
    extractThumbnail(file),
    getImageDimensions(file),
  ]);

  const raw = (exifData ?? {}) as Record<string, unknown>;

  const c2pa = scanForC2PA(buffer);

  const fileData: FileData = {
    name: file.name,
    size: file.size,
    sizeHuman: formatBytes(file.size),
    mimeType: file.type || "application/octet-stream",
    width: dims.width || null,
    height: dims.height || null,
    sha256,
    phash: null, // set by server
  };

  const hasMakerNotes =
    raw.MakerNote !== undefined ||
    raw.MakerNoteVersion !== undefined ||
    raw.mapifd !== undefined;

  const partial = {
    id,
    file: fileData,
    exifTemporal: extractTemporal(raw),
    exifDevice: extractDevice(raw),
    exifCapture: extractCapture(raw),
    exifImage: extractImage(raw),
    gps: extractGps(raw),
    iptc: extractIptc(raw),
    xmp: extractXmp(raw),
    icc: extractIcc(raw),
    c2pa,
    thumbnail: thumbnailData,
    makerNotesPresent: hasMakerNotes,
    rawExif: raw,
    previewUrl: URL.createObjectURL(file),
    analyzedAt: new Date().toISOString(),
  };

  const consistency = runConsistencyChecks(partial);

  return { ...partial, consistency };
}
