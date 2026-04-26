/**
 * Generadores de datos de ejemplo para probar el flujo sin completar formularios.
 *
 * Las fotos son SVG data URLs livianos (no son imagenes reales pero ocupan
 * el lugar de evidencia para probar todo el flujo: IA stub, observaciones,
 * firmas y PDF).
 */

import type {
  Acta,
  Property,
  Party,
  Room,
  PhotoEvidence,
  PartyRole,
  PropertyType,
  FurnishedStatus,
  RepresentsTarget,
  ConditionLevel,
  ActaType,
  ActaModality,
  AIPhotoAnalysis,
} from "./acta-types";
import { ROOM_TEMPLATES } from "./acta-constants";
import {
  generateId,
  saveActa,
  saveProperty,
  getCurrentUser,
} from "./storage";
import { appendAuditLog } from "./acta-helpers";
import { analyzePhotoWithAI, summarizeRoom } from "./ai-stub";

// ============================================
// Datos de ejemplo
// ============================================

const SAMPLE_PROPERTIES = [
  {
    address: "Av. Providencia 1234",
    unit: "Depto 501",
    commune: "Providencia",
    city: "Santiago",
    propertyType: "apartment" as PropertyType,
    furnished: "yes" as FurnishedStatus,
    parking: true,
    storageUnit: true,
    internalCode: "REF-2026-001",
    rolSii: "1234-56",
  },
  {
    address: "Calle Los Aromos 567",
    unit: null as string | null,
    commune: "Las Condes",
    city: "Santiago",
    propertyType: "house" as PropertyType,
    furnished: "no" as FurnishedStatus,
    parking: true,
    storageUnit: false,
    internalCode: "REF-2026-002",
    rolSii: "5678-12",
  },
  {
    address: "Av. Apoquindo 4500",
    unit: "Of 1801",
    commune: "Las Condes",
    city: "Santiago",
    propertyType: "office" as PropertyType,
    furnished: "partial" as FurnishedStatus,
    parking: true,
    storageUnit: false,
    internalCode: "REF-2026-003",
    rolSii: null,
  },
];

const SAMPLE_NAMES = [
  "Maria Gonzalez Perez",
  "Juan Hernandez Silva",
  "Carolina Munoz Rojas",
  "Pedro Vargas Castillo",
  "Ana Torres Morales",
  "Diego Soto Bravo",
  "Camila Espinoza Rios",
  "Felipe Reyes Carvajal",
];

const SAMPLE_EMAILS = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".") + "@example.com";

const SAMPLE_PHONES = [
  "+56 9 8765 4321",
  "+56 9 7654 3210",
  "+56 9 6543 2109",
  "+56 9 5432 1098",
];

const SAMPLE_RUTS = [
  "12.345.678-9",
  "13.456.789-0",
  "14.567.890-1",
  "15.678.901-2",
];

// ============================================
// SVG photo placeholders
// ============================================

const ROOM_COLORS: Record<string, [string, string]> = {
  living: ["#1c2740", "#2b3d5e"],
  comedor: ["#2b3d5e", "#3a4f7a"],
  cocina: ["#3a4f30", "#5a7048"],
  dormitorio_principal: ["#3d2b5e", "#5e3d8a"],
  dormitorio_secundario: ["#5e3d8a", "#7a5fa8"],
  bano_principal: ["#2b4f5e", "#3d6a7d"],
  bano_secundario: ["#3d6a7d", "#5a8a9d"],
  terraza: ["#5e4f2b", "#7a6a3d"],
  logia: ["#2b3d3e", "#3d5358"],
  estacionamiento: ["#252525", "#3a3a3a"],
  bodega: ["#3a3a3a", "#525252"],
  pasillo: ["#2b2b3d", "#3d3d52"],
  default: ["#1c2740", "#2b3d5e"],
};

function makeMockPhotoSvg(roomName: string, roomType: string, idx: number): string {
  const colors = ROOM_COLORS[roomType] ?? ROOM_COLORS.default;
  const w = 800;
  const h = 600;
  const seed = `${roomType}-${idx}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
    <pattern id="p${seed}" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="url(#g${seed})"/>
      <circle cx="30" cy="30" r="1" fill="#ffffff" fill-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#p${seed})"/>
  <rect x="40" y="40" width="${w - 80}" height="${h - 80}" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2"/>
  <text x="${w / 2}" y="${h / 2 - 20}" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">
    ${roomName}
  </text>
  <text x="${w / 2}" y="${h / 2 + 30}" font-family="Inter, sans-serif" font-size="20" fill="#ffffff" fill-opacity="0.5" text-anchor="middle">
    Foto ${idx + 1} (datos de ejemplo)
  </text>
  <text x="${w / 2}" y="${h - 60}" font-family="monospace" font-size="14" fill="#ffffff" fill-opacity="0.4" text-anchor="middle">
    [MOCK PHOTO - SOLO PARA PRUEBA]
  </text>
</svg>`;
  // SVG -> base64 data URL
  if (typeof btoa !== "undefined") {
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  }
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

async function sha256OfString(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "0000000000000000000000000000000000000000000000000000000000000000";
}

// ============================================
// Wizard mock data (para autollenar)
// ============================================

export interface WizardMockData {
  type: ActaType;
  modality: ActaModality;
  property: {
    address: string;
    unit: string | null;
    city: string;
    commune: string;
    region: string | null;
    country: string;
    propertyType: PropertyType;
    furnished: FurnishedStatus;
    parking: boolean;
    storageUnit: boolean;
    internalCode: string | null;
    rolSii: string | null;
    observations: string | null;
    ownerId: null;
    organizationId: null;
    contractMonthlyAmount: number | null;
    contractStartDate: string | null;
    contractEndDate: string | null;
    contractDeposit: number | null;
    petsAllowed: boolean | null;
    smokerAllowed: boolean | null;
    latitude: number | null;
    longitude: number | null;
    tags: string[];
  };
  parties: {
    tempId: string;
    name: string;
    email: string | null;
    phone: string | null;
    documentId: string | null;
    role: PartyRole;
    represents: RepresentsTarget;
    canUploadEvidence: boolean;
    canComment: boolean;
    canSign: boolean;
  }[];
  rooms: {
    tempId: string;
    type: Room["type"];
    name: string;
    order: number;
    required: boolean;
    minPhotos: number;
    generalCondition: ConditionLevel;
    manualObservations: null;
  }[];
  inspectionDate: string;
}

export function getWizardMockData(): WizardMockData {
  const propIdx = Math.floor(Math.random() * SAMPLE_PROPERTIES.length);
  const sampleProp = SAMPLE_PROPERTIES[propIdx];

  const landlordName = SAMPLE_NAMES[Math.floor(Math.random() * 4)];
  const tenantName = SAMPLE_NAMES[4 + Math.floor(Math.random() * 4)];
  const brokerName = "Agente Inmobiliario S.A.";

  // Selecciona ambientes principales
  const selectedRoomTypes = [
    "living",
    "cocina",
    "bano_principal",
    "dormitorio_principal",
    "dormitorio_secundario",
  ];

  const rooms = selectedRoomTypes
    .map((type) => ROOM_TEMPLATES.find((t) => t.type === type))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .map((tpl, i) => ({
      tempId: `r_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      type: tpl.type,
      name: tpl.name,
      order: i,
      required: tpl.required,
      minPhotos: tpl.minPhotos,
      generalCondition: "no_evaluado" as ConditionLevel,
      manualObservations: null,
    }));

  return {
    type: "entrega",
    modality: "gestionada",
    property: {
      address: sampleProp.address,
      unit: sampleProp.unit,
      city: sampleProp.city,
      commune: sampleProp.commune,
      region: "RM",
      country: "Chile",
      propertyType: sampleProp.propertyType,
      furnished: sampleProp.furnished,
      parking: sampleProp.parking,
      storageUnit: sampleProp.storageUnit,
      internalCode: sampleProp.internalCode,
      rolSii: sampleProp.rolSii,
      observations:
        "Propiedad recientemente pintada. Se entrega con todos los servicios al dia.",
      ownerId: null,
      organizationId: null,
      contractMonthlyAmount: 450000,
      contractStartDate: new Date().toISOString().slice(0, 10),
      contractEndDate: null,
      contractDeposit: 1,
      petsAllowed: false,
      smokerAllowed: false,
      latitude: -33.4248,
      longitude: -70.6195,
      tags: [],
    },
    parties: [
      {
        tempId: `t_${Date.now()}_b`,
        name: brokerName,
        email: "contacto@agente-inmobiliario.cl",
        phone: SAMPLE_PHONES[0],
        documentId: null,
        role: "broker",
        represents: "self",
        canUploadEvidence: true,
        canComment: true,
        canSign: true,
      },
      {
        tempId: `t_${Date.now()}_l`,
        name: landlordName,
        email: SAMPLE_EMAILS(landlordName),
        phone: SAMPLE_PHONES[1],
        documentId: SAMPLE_RUTS[0],
        role: "landlord",
        represents: "self",
        canUploadEvidence: false,
        canComment: true,
        canSign: true,
      },
      {
        tempId: `t_${Date.now()}_t`,
        name: tenantName,
        email: SAMPLE_EMAILS(tenantName),
        phone: SAMPLE_PHONES[2],
        documentId: SAMPLE_RUTS[1],
        role: "tenant",
        represents: "self",
        canUploadEvidence: false,
        canComment: true,
        canSign: true,
      },
    ],
    rooms,
    inspectionDate: new Date().toISOString().slice(0, 10),
  };
}

// ============================================
// Seed actas completas con fotos + IA
// ============================================

async function buildMockPhoto(
  actaId: string,
  roomId: string,
  roomName: string,
  roomType: string,
  idx: number,
  user: { name: string; role: PartyRole }
): Promise<PhotoEvidence> {
  const fileName = `mock_${roomType}_${idx + 1}.svg`;
  const dataUrl = makeMockPhotoSvg(roomName, roomType, idx);
  const photoId = generateId("photo");

  const now = new Date();
  // Spread photos in time
  now.setMinutes(now.getMinutes() - idx * 3);
  const uploadedAt = now.toISOString();

  // Forensic stub para mock photos
  const sha256 = await sha256OfString(dataUrl);

  // IA real
  const aiAnalysis: AIPhotoAnalysis = await analyzePhotoWithAI(
    fileName,
    dataUrl.length,
    800,
    600,
    roomType as Room["type"]
  );

  return {
    id: photoId,
    actaId,
    roomId,
    uploadedByPartyId: null,
    uploadedByName: user.name,
    uploadedByRole: user.role,
    uploadedAt,
    fileName,
    fileSize: dataUrl.length,
    mimeType: "image/svg+xml",
    width: 800,
    height: 600,
    dataUrl,
    thumbnailDataUrl: null,
    forensic: {
      id: photoId,
      file: {
        name: fileName,
        size: dataUrl.length,
        sizeHuman: `${(dataUrl.length / 1024).toFixed(1)} KB`,
        mimeType: "image/svg+xml",
        width: 800,
        height: 600,
        sha256,
        phash: null,
      },
      exifTemporal: {
        dateTimeOriginal: uploadedAt,
        dateTimeDigitized: uploadedAt,
        dateTime: uploadedAt,
        gpsDateStamp: null,
        gpsTimeStamp: null,
        offsetTimeOriginal: "-03:00",
        offsetTimeDigitized: null,
        offsetTime: null,
      },
      exifDevice: {
        make: "MockData Inc.",
        model: "Sample Generator v1",
        lensMake: null,
        lensModel: null,
        serialNumber: null,
        software: "CertiFoto Mock",
        hostComputer: null,
      },
      exifCapture: {
        fNumber: null,
        exposureTime: null,
        exposureTimeFormatted: null,
        iso: null,
        focalLength: null,
        focalLength35mm: null,
        flash: null,
        whiteBalance: null,
        meteringMode: null,
        exposureMode: null,
        exposureProgram: null,
        sceneCaptureType: null,
        digitalZoomRatio: null,
        contrast: null,
        saturation: null,
        sharpness: null,
      },
      exifImage: {
        imageWidth: 800,
        imageHeight: 600,
        orientation: 1,
        colorSpace: "sRGB",
        bitsPerSample: 8,
        compression: null,
        xResolution: 96,
        yResolution: 96,
      },
      gps: {
        latitude: -33.4248 + (Math.random() - 0.5) * 0.01,
        longitude: -70.6195 + (Math.random() - 0.5) * 0.01,
        altitude: 570,
        altitudeRef: null,
        direction: null,
        directionRef: null,
        speed: null,
        speedRef: null,
        googleMapsUrl: null,
      },
      iptc: {
        objectName: null,
        caption: null,
        byline: null,
        copyright: null,
        keywords: [],
        city: null,
        country: null,
        source: null,
      },
      xmp: {
        creatorTool: null,
        metadataDate: null,
        createDate: null,
        modifyDate: null,
        history: [],
        rawXmp: {},
      },
      icc: {
        profileName: null,
        colorSpace: null,
        connectionSpace: null,
        creator: null,
        description: null,
      },
      c2pa: { detected: false, markers: [] },
      thumbnail: { dataUrl: null, width: null, height: null },
      consistency: [],
      makerNotesPresent: false,
      rawExif: {},
      previewUrl: dataUrl,
      analyzedAt: uploadedAt,
    },
    aiAnalysis,
    aiStatus: "complete",
    userCaption: null,
    isRelevant: false,
    isFlagged: false,
    evidenceStrength: "media",
    warnings: [],
    capturedInApp: false,
  };
}

/**
 * Crea un acta de ejemplo completa con fotos analizadas.
 */
export async function seedSampleActa(
  type: ActaType = "entrega"
): Promise<string> {
  const user = getCurrentUser();
  const data = getWizardMockData();

  // Override type if requested
  data.type = type;

  // 1. Property
  const propertyId = generateId("prop");
  const now = new Date().toISOString();
  const property: Property = {
    ...data.property,
    id: propertyId,
    createdAt: now,
    updatedAt: now,
  };
  saveProperty(property);

  // 2. Parties + Rooms with real IDs
  const parties: Party[] = data.parties.map((p) => ({
    id: generateId("party"),
    name: p.name,
    email: p.email,
    phone: p.phone,
    documentId: p.documentId,
    role: p.role,
    represents: p.represents,
    canUploadEvidence: p.canUploadEvidence,
    canComment: p.canComment,
    canSign: p.canSign,
    invitationToken: generateId("token"),
    invitationStatus: "pending",
  }));

  const rooms: Room[] = data.rooms.map((r, i) => ({
    id: generateId("room"),
    type: r.type,
    name: r.name,
    order: i,
    required: r.required,
    minPhotos: r.minPhotos,
    generalCondition: ["bueno", "bueno", "regular", "bueno", "bueno"][i] as ConditionLevel,
    aiSummary: null,
    manualObservations:
      i === 2 ? "Se observa pequena humedad en techo, no relevante." : null,
    photoIds: [],
  }));

  const actaId = generateId("acta");

  // 3. Photos por ambiente (2 cada uno)
  const allPhotos: PhotoEvidence[] = [];
  for (const room of rooms) {
    const photoCount = room.minPhotos;
    for (let i = 0; i < photoCount; i++) {
      const photo = await buildMockPhoto(
        actaId,
        room.id,
        room.name,
        room.type,
        i,
        { name: user.name, role: user.role as PartyRole }
      );
      allPhotos.push(photo);
    }
  }

  // 4. Update room AI summaries
  for (const room of rooms) {
    const photos = allPhotos.filter((p) => p.roomId === room.id);
    const analyses = photos
      .map((p) => p.aiAnalysis)
      .filter((x): x is NonNullable<typeof x> => !!x);
    room.aiSummary = summarizeRoom(room.name, analyses);
  }

  // 5. Build acta
  const acta: Acta = {
    id: actaId,
    type: data.type,
    modality: data.modality,
    status: "evidence_collection",
    propertyId,
    parties,
    brokerRole: null,
    organizationId: null,
    rooms,
    photos: allPhotos,
    inventoryItems: [],
    comments: [],
    signatures: [],
    auditLog: [],
    createdByPartyId: null,
    createdByName: user.name,
    createdByRole: user.role as PartyRole,
    visibilityMode: "parties",
    finalPdfDataUrl: null,
    documentHash: null,
    aiSummary: null,
    manualSummary:
      "Acta de ejemplo generada automaticamente para probar el flujo. Las fotos son placeholders.",
    disclaimerAccepted: false,
    inspectionDate: data.inspectionDate,
    createdAt: now,
    updatedAt: now,
    closedAt: null,
    relatedEntregaActaId: null,
    tags: [],
  };

  // Audit
  const withAudit = appendAuditLog(
    acta,
    user.name,
    user.role as PartyRole,
    null,
    "acta_created",
    { mock: true, type: data.type }
  );
  const finalActa = appendAuditLog(
    withAudit,
    "system",
    "system",
    null,
    "photo_analyzed",
    { count: allPhotos.length, mock: true }
  );

  saveActa(finalActa);
  return actaId;
}

/**
 * Crea 3 actas variadas de ejemplo.
 */
export async function seedSampleData(): Promise<{ actaIds: string[] }> {
  const ids: string[] = [];
  const types: ActaType[] = ["entrega", "devolucion", "inspeccion"];
  for (const type of types) {
    const id = await seedSampleActa(type);
    ids.push(id);
  }
  return { actaIds: ids };
}
