"use client";

import { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles,
  Loader2,
  ImagePlus,
} from "lucide-react";
import type {
  Acta,
  Room,
  PhotoEvidence,
  ConditionLevel,
} from "@/lib/acta-types";
import { CONDITION_LABEL, CONDITION_COLOR } from "@/lib/acta-constants";
import { generateId, getCurrentUser } from "@/lib/storage";
import {
  appendAuditLog,
  calculateEvidenceStrength,
  calculatePhotoWarnings,
} from "@/lib/acta-helpers";
import { parseClientSide } from "@/lib/parse-client";
import { analyzePhotoWithAI, summarizeRoom } from "@/lib/ai-stub";
import { compressImage, shouldCompress } from "@/lib/image-compression";
import { cn } from "@/lib/cn";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { PhotoEvidenceCard } from "./PhotoEvidenceCard";

// Helpers locales
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

function imageDimensionsFromDataUrl(
  dataUrl: string
): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = dataUrl;
  });
}

interface RoomEvidenceSectionProps {
  acta: Acta;
  room: Room;
  readOnly: boolean;
  onUpdate: (updater: (a: Acta) => Acta) => void;
}

export function RoomEvidenceSection({
  acta,
  room,
  readOnly,
  onUpdate,
}: RoomEvidenceSectionProps) {
  const { confirm } = useConfirm();
  const [expanded, setExpanded] = useState(true);
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const photos = acta.photos.filter((p) => p.roomId === room.id);
  const isMissingRequired = room.required && photos.length === 0;

  const handleFiles = async (
    files: FileList | null,
    capturedInApp: boolean = false
  ) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const user = getCurrentUser();

    try {
      for (const file of Array.from(files)) {
        const photoId = generateId("photo");

        // 1. Analisis forense del archivo ORIGINAL (mantiene SHA-256 puro)
        let forensic = null;
        try {
          forensic = await parseClientSide(file, photoId);
        } catch (err) {
          console.warn("Forensic parse failed:", err);
        }

        // 2. Comprimir si conviene (ahorra ~70% de espacio sin perdida visual)
        let dataUrl: string;
        let displayBytes = file.size;
        let displayWidth: number | null = null;
        let displayHeight: number | null = null;
        let displayMime = file.type;

        if (shouldCompress(file)) {
          try {
            const compressed = await compressImage(file, {
              maxWidth: 2000,
              maxHeight: 2000,
              quality: 0.85,
            });
            dataUrl = compressed.dataUrl;
            displayBytes = compressed.bytes;
            displayWidth = compressed.width;
            displayHeight = compressed.height;
            displayMime = compressed.format;
          } catch (err) {
            console.warn("Image compression failed, using original:", err);
            // Fallback al archivo original sin comprimir
            dataUrl = await fileToDataUrl(file);
          }
        } else {
          dataUrl = await fileToDataUrl(file);
        }

        // 3. Obtener dimensiones del archivo si la compresion fallo
        if (displayWidth === null || displayHeight === null) {
          const dims = await imageDimensionsFromDataUrl(dataUrl);
          displayWidth = dims.w || null;
          displayHeight = dims.h || null;
        }

        const photo: PhotoEvidence = {
          id: photoId,
          actaId: acta.id,
          roomId: room.id,
          uploadedByPartyId: null,
          uploadedByName: user.name,
          uploadedByRole: user.role,
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: displayBytes, // tamano del comprimido (lo que ocupa en storage)
          mimeType: displayMime,
          width: displayWidth,
          height: displayHeight,
          dataUrl,
          thumbnailDataUrl: forensic?.thumbnail.dataUrl ?? null,
          forensic,
          aiAnalysis: null,
          aiStatus: "pending",
          userCaption: null,
          isRelevant: false,
          isFlagged: false,
          evidenceStrength: "media",
          warnings: [],
          capturedInApp,
        };

        photo.warnings = calculatePhotoWarnings(photo);
        photo.evidenceStrength = calculateEvidenceStrength(photo);

        // Add photo to acta
        onUpdate((a) =>
          appendAuditLog(
            { ...a, photos: [...a.photos, photo] },
            user.name,
            user.role,
            null,
            "photo_uploaded",
            { roomId: room.id, photoId }
          )
        );

        // 4. AI analysis (async, updates the photo when done)
        runAIAnalysis(photoId, file, room);
      }
    } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const runAIAnalysis = async (
    photoId: string,
    file: File,
    room: Room
  ) => {
    onUpdate((a) => ({
      ...a,
      photos: a.photos.map((p) =>
        p.id === photoId ? { ...p, aiStatus: "processing" } : p
      ),
    }));

    try {
      // Get dimensions
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = URL.createObjectURL(file);
      });

      const analysis = await analyzePhotoWithAI(
        file.name,
        file.size,
        dims.w || null,
        dims.h || null,
        room.type
      );

      onUpdate((a) => {
        const updatedPhotos = a.photos.map((p) => {
          if (p.id !== photoId) return p;
          const updated: PhotoEvidence = {
            ...p,
            aiAnalysis: analysis,
            aiStatus: "complete",
          };
          updated.warnings = calculatePhotoWarnings(updated);
          updated.evidenceStrength = calculateEvidenceStrength(updated);
          return updated;
        });

        // Update room AI summary
        const roomPhotos = updatedPhotos.filter((p) => p.roomId === room.id);
        const aiAnalyses = roomPhotos
          .map((p) => p.aiAnalysis)
          .filter((x): x is NonNullable<typeof x> => x !== null);
        const summary = summarizeRoom(room.name, aiAnalyses);

        const updatedRooms = a.rooms.map((r) =>
          r.id === room.id ? { ...r, aiSummary: summary } : r
        );

        return appendAuditLog(
          { ...a, photos: updatedPhotos, rooms: updatedRooms },
          a.createdByName,
          a.createdByRole,
          null,
          "photo_analyzed",
          { photoId, hasFindings: analysis.damageFindings.length > 0 }
        );
      });
    } catch (err) {
      console.error("AI analysis failed:", err);
      onUpdate((a) => ({
        ...a,
        photos: a.photos.map((p) =>
          p.id === photoId ? { ...p, aiStatus: "error" } : p
        ),
      }));
    }
  };

  const removePhoto = async (photoId: string) => {
    const ok = await confirm({
      title: "Eliminar foto",
      message:
        "Se eliminara esta foto y su analisis IA. Esta accion no se puede deshacer.",
      variant: "warn",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    onUpdate((a) => ({
      ...a,
      photos: a.photos.filter((p) => p.id !== photoId),
    }));
  };

  const updateRoomCondition = (condition: ConditionLevel) => {
    onUpdate((a) => ({
      ...a,
      rooms: a.rooms.map((r) =>
        r.id === room.id ? { ...r, generalCondition: condition } : r
      ),
    }));
  };

  const updateRoomObservations = (text: string) => {
    onUpdate((a) => ({
      ...a,
      rooms: a.rooms.map((r) =>
        r.id === room.id ? { ...r, manualObservations: text || null } : r
      ),
    }));
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-white",
        isMissingRequired
          ? "border-amber-200"
          : "border-gray-200"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900">{room.name}</h4>
            {room.required && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border bg-accent/10 text-accent border-accent/20">
                Obligatorio
              </span>
            )}
            {isMissingRequired && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-200">
                Sin fotos
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {photos.length} foto{photos.length !== 1 ? "s" : ""} · min.{" "}
            {room.minPhotos}
            {room.generalCondition !== "no_evaluado" && (
              <span className={cn("ml-2", CONDITION_COLOR[room.generalCondition])}>
                · {CONDITION_LABEL[room.generalCondition]}
              </span>
            )}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Photos grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {photos.map((photo) => (
              <PhotoEvidenceCard
                key={photo.id}
                photo={photo}
                readOnly={readOnly}
                onRemove={() => removePhoto(photo.id)}
              />
            ))}

            {!readOnly && (
              <>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-accent/50 hover:border-accent bg-accent-softer/30 flex flex-col items-center justify-center gap-1 text-accent-dark hover:text-accent transition-colors disabled:opacity-50"
                  title="Tomar foto con la camara (mobile) o seleccionar archivo"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span className="text-xs font-medium">Tomar foto</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-muted hover:text-gray-700 transition-colors disabled:opacity-50"
                  title="Subir foto desde la galeria"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs">Subir foto</span>
                </button>
              </>
            )}
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, true)}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, false)}
          />

          {/* AI summary */}
          {room.aiSummary && (
            <div className="rounded-md bg-purple-50 border border-purple-200 p-3">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-purple-700">
                <Sparkles className="h-3 w-3" />
                <span className="uppercase tracking-wider font-medium">
                  Resumen IA
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {room.aiSummary}
              </p>
            </div>
          )}

          {/* Room condition */}
          <div>
            <label className="text-xs text-muted block mb-1.5">
              Estado general del ambiente
            </label>
            <select
              disabled={readOnly}
              value={room.generalCondition}
              onChange={(e) =>
                updateRoomCondition(e.target.value as ConditionLevel)
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-800 disabled:opacity-50"
            >
              <option value="no_evaluado">Sin evaluar</option>
              <option value="excelente">Excelente</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="malo">Malo</option>
            </select>
          </div>

          {/* Observations */}
          <div>
            <label className="text-xs text-muted block mb-1.5">
              Observaciones manuales del ambiente
            </label>
            <textarea
              disabled={readOnly}
              value={room.manualObservations ?? ""}
              onChange={(e) => updateRoomObservations(e.target.value)}
              rows={2}
              placeholder="Cualquier observacion, contexto o nota relevante para este ambiente..."
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-800 placeholder-muted resize-none focus:outline-none focus:border-accent/50 disabled:opacity-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

