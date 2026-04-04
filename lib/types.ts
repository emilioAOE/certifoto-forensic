// === File-level data ===
export interface FileData {
  name: string;
  size: number;
  sizeHuman: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sha256: string;
  phash: string | null;
}

// === EXIF temporal fields ===
export interface ExifTemporal {
  dateTimeOriginal: string | null;
  dateTimeDigitized: string | null;
  dateTime: string | null;
  gpsDateStamp: string | null;
  gpsTimeStamp: string | null;
  offsetTimeOriginal: string | null;
  offsetTimeDigitized: string | null;
  offsetTime: string | null;
}

// === EXIF device fields ===
export interface ExifDevice {
  make: string | null;
  model: string | null;
  lensMake: string | null;
  lensModel: string | null;
  serialNumber: string | null;
  software: string | null;
  hostComputer: string | null;
}

// === EXIF capture settings ===
export interface ExifCapture {
  fNumber: number | null;
  exposureTime: number | null;
  exposureTimeFormatted: string | null;
  iso: number | null;
  focalLength: number | null;
  focalLength35mm: number | null;
  flash: string | null;
  whiteBalance: string | null;
  meteringMode: string | null;
  exposureMode: string | null;
  exposureProgram: string | null;
  sceneCaptureType: string | null;
  digitalZoomRatio: number | null;
  contrast: string | null;
  saturation: string | null;
  sharpness: string | null;
}

// === EXIF image properties ===
export interface ExifImage {
  imageWidth: number | null;
  imageHeight: number | null;
  orientation: number | null;
  colorSpace: string | null;
  bitsPerSample: number | null;
  compression: string | null;
  xResolution: number | null;
  yResolution: number | null;
}

// === GPS ===
export interface GpsData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  altitudeRef: string | null;
  direction: number | null;
  directionRef: string | null;
  speed: number | null;
  speedRef: string | null;
  googleMapsUrl: string | null;
}

// === IPTC ===
export interface IptcData {
  objectName: string | null;
  caption: string | null;
  byline: string | null;
  copyright: string | null;
  keywords: string[];
  city: string | null;
  country: string | null;
  source: string | null;
}

// === XMP ===
export interface XmpData {
  creatorTool: string | null;
  metadataDate: string | null;
  createDate: string | null;
  modifyDate: string | null;
  history: XmpHistoryEntry[];
  rawXmp: Record<string, unknown>;
}

export interface XmpHistoryEntry {
  action: string;
  when: string | null;
  softwareAgent: string | null;
  parameters: string | null;
}

// === ICC Profile ===
export interface IccData {
  profileName: string | null;
  colorSpace: string | null;
  connectionSpace: string | null;
  creator: string | null;
  description: string | null;
}

// === C2PA ===
export interface C2paData {
  detected: boolean;
  markers: C2paMarker[];
}

export interface C2paMarker {
  offset: number;
  length: number;
  label: string;
}

// === Thumbnail ===
export interface ThumbnailData {
  dataUrl: string | null;
  width: number | null;
  height: number | null;
}

// === Consistency check ===
export type CheckStatus = "pass" | "warn" | "fail" | "info" | "unknown";

export interface ConsistencyCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

// === Aggregated analysis per photo ===
export interface PhotoAnalysis {
  id: string;
  file: FileData;
  exifTemporal: ExifTemporal;
  exifDevice: ExifDevice;
  exifCapture: ExifCapture;
  exifImage: ExifImage;
  gps: GpsData;
  iptc: IptcData;
  xmp: XmpData;
  icc: IccData;
  c2pa: C2paData;
  thumbnail: ThumbnailData;
  consistency: ConsistencyCheck[];
  makerNotesPresent: boolean;
  rawExif: Record<string, unknown>;
  previewUrl: string;
  analyzedAt: string;
}

// === App state ===
export type AnalysisStatus =
  | "idle"
  | "parsing"
  | "server-analysis"
  | "complete"
  | "error";

export interface FileEntry {
  id: string;
  file: File;
  status: AnalysisStatus;
  error: string | null;
  analysis: PhotoAnalysis | null;
  expanded: boolean;
}
