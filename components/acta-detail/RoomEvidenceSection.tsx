"use client";

import { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Trash2,
  Sparkles,
  Loader2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import type {
  Acta,
  Room,
  PhotoEvidence,
  ConditionLevel,
} from "@/lib/acta-types";
import {
  CONDITION_LABEL,
  CONDITION_COLOR,
  DAMAGE_TYPE_LABEL,
  DAMAGE_SEVERITY_LABEL,
  DAMAGE_SEVERITY_COLOR,
} from "@/lib/acta-constants";
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
  const [expanded, setExpanded] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = acta.photos.filter((p) => p.roomId === room.id);
  const isMissingRequired = room.required && photos.length === 0;

  const handleFiles = async (files: FileList | null) => {
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
          capturedInApp: false,
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
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const removePhoto = (photoId: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;
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
              <PhotoCard
                key={photo.id}
                photo={photo}
                readOnly={readOnly}
                onRemove={() => removePhoto(photo.id)}
              />
            ))}

            {!readOnly && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-accent/50 bg-gray-50 flex flex-col items-center justify-center gap-1 text-muted hover:text-accent transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span className="text-xs">Agregar fotos</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
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

function PhotoCard({
  photo,
  readOnly,
  onRemove,
}: {
  photo: PhotoEvidence;
  readOnly: boolean;
  onRemove: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.dataUrl}
          alt={photo.fileName}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setShowDetail(true)}
        />

        {/* Badges */}
        <div className="absolute top-1 left-1 flex flex-wrap gap-1">
          {photo.aiStatus === "processing" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-600 text-purple-700 backdrop-blur-sm flex items-center gap-1">
              <Loader2 className="h-2 w-2 animate-spin" />
              IA
            </span>
          )}
          {photo.aiStatus === "complete" && photo.aiAnalysis && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-600 text-purple-700 backdrop-blur-sm">
              <Sparkles className="h-2 w-2 inline" /> IA
            </span>
          )}
          {photo.evidenceStrength === "fuerte" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-600 text-emerald-700 backdrop-blur-sm">
              <Shield className="h-2 w-2 inline" /> Fuerte
            </span>
          )}
          {photo.warnings.length > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-600 text-amber-700 backdrop-blur-sm">
              <AlertTriangle className="h-2 w-2 inline" />
            </span>
          )}
        </div>

        {/* Damage findings indicator */}
        {photo.aiAnalysis && photo.aiAnalysis.damageFindings.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="text-[9px] bg-red-600 text-red-700 px-1.5 py-0.5 rounded backdrop-blur-sm truncate">
              {photo.aiAnalysis.damageFindings.length} hallazgo(s)
            </div>
          </div>
        )}

        {/* Remove button */}
        {!readOnly && (
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Detail modal */}
      {showDetail && (
        <PhotoDetailModal photo={photo} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

function PhotoDetailModal({
  photo,
  onClose,
}: {
  photo: PhotoEvidence;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full bg-white border border-gray-200 rounded-lg overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {photo.fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-gray-800 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-h-[80vh] overflow-y-auto">
          {/* Image */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.dataUrl}
              alt={photo.fileName}
              className="w-full rounded-lg"
            />
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm">
            {/* AI */}
            {photo.aiAnalysis && (
              <div className="rounded-md bg-purple-50 border border-purple-200 p-3">
                <div className="flex items-center gap-1 mb-1.5 text-xs text-purple-700 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Analisis IA
                </div>
                <p className="text-gray-700 leading-relaxed mb-2">
                  {photo.aiAnalysis.caption}
                </p>
                <p className="text-xs text-muted">
                  Estado: {photo.aiAnalysis.conditionSummary}
                </p>
                {photo.aiAnalysis.damageFindings.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-100 space-y-1">
                    <p className="text-xs text-purple-700 uppercase tracking-wider mb-1">
                      Hallazgos
                    </p>
                    {photo.aiAnalysis.damageFindings.map((f) => (
                      <div key={f.id} className="text-xs">
                        <span className={cn("font-medium", DAMAGE_SEVERITY_COLOR[f.severity])}>
                          [{DAMAGE_SEVERITY_LABEL[f.severity]}]
                        </span>{" "}
                        <span className="text-gray-600">
                          {DAMAGE_TYPE_LABEL[f.type]}
                        </span>
                        <p className="text-muted mt-0.5">{f.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Forensic summary */}
            {photo.forensic && (
              <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
                <div className="flex items-center gap-1 mb-2 text-xs text-accent uppercase tracking-wider">
                  <Shield className="h-3 w-3" />
                  Respaldo forense
                </div>
                <div className="space-y-1 text-xs">
                  <KV
                    label="SHA-256"
                    value={photo.forensic.file.sha256.slice(0, 16) + "..."}
                    mono
                  />
                  <KV
                    label="Fecha EXIF"
                    value={photo.forensic.exifTemporal.dateTimeOriginal ?? "—"}
                  />
                  <KV
                    label="GPS"
                    value={
                      photo.forensic.gps.latitude
                        ? `${photo.forensic.gps.latitude.toFixed(4)}, ${photo.forensic.gps.longitude?.toFixed(4)}`
                        : "—"
                    }
                  />
                  <KV
                    label="Camara"
                    value={photo.forensic.exifDevice.model ?? "—"}
                  />
                  <KV label="Fuerza" value={photo.evidenceStrength} />
                </div>
              </div>
            )}

            {/* Warnings */}
            {photo.warnings.length > 0 && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <div className="flex items-center gap-1 mb-1 text-xs text-amber-700 uppercase tracking-wider">
                  <AlertTriangle className="h-3 w-3" />
                  Advertencias
                </div>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {photo.warnings.map((w) => (
                    <li key={w}>· {w.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-muted">
              Subido por {photo.uploadedByName} el{" "}
              {new Date(photo.uploadedAt).toLocaleString("es-CL")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className={cn("text-gray-700 truncate", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
