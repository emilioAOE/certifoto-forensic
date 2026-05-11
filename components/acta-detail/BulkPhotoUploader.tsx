"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Loader2,
  Sparkles,
  X,
  ImagePlus,
  CheckCircle2,
  Trash2,
  Brain,
} from "lucide-react";
import type {
  Acta,
  Room,
  PhotoEvidence,
  RoomType,
  ConditionLevel,
} from "@/lib/acta-types";
import { generateId, getCurrentUser } from "@/lib/storage";
import {
  appendAuditLog,
  calculateEvidenceStrength,
  calculatePhotoWarnings,
} from "@/lib/acta-helpers";
import { parseClientSide } from "@/lib/parse-client";
import { analyzePhotoWithAI, summarizeRoom } from "@/lib/ai-stub";
import { compressImage, shouldCompress } from "@/lib/image-compression";
import { classifyRoomWithAI } from "@/lib/room-classifier";
import { ROOM_TEMPLATES } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

/** Prefijo de ids sinteticos para templates que la AI puede sugerir crear. */
const TEMPLATE_PREFIX = "__tpl__";

interface BulkPhotoUploaderProps {
  acta: Acta;
  onUpdate: (updater: (a: Acta) => Acta) => void;
  onClose: () => void;
  /**
   * "modal" (default): modal con overlay fijo + boton X. Usado en la
   *   pagina de detalle del acta.
   * "inline": sin overlay, embebido inline. Usado en el paso "Fotos" del
   *   wizard sobre un acta-borrador.
   */
  variant?: "modal" | "inline";
}

interface ProcessedPhoto {
  tempId: string;
  file: File;
  dataUrl: string;
  thumbnailDataUrl: string | null;
  width: number | null;
  height: number | null;
  bytes: number;
  mime: string;
  forensic: PhotoEvidence["forensic"];
  suggestedRoomId: string | null;
  suggestionConfidence: "alta" | "media" | "baja";
  /** Origen de la sugerencia: heuristica de nombre o IA vision */
  suggestionSource: "filename" | "ai" | "none";
  matchedKeyword: string | null;
  /** Estado del job de AI: idle | running | done | failed | unavailable */
  aiStatus: "idle" | "running" | "done" | "failed" | "unavailable";
}

/**
 * Modal/panel para subir muchas fotos a la vez y dejar que la IA + heuristica
 * de nombre de archivo las asigne a los ambientes correspondientes.
 *
 * Algoritmo de asignacion (mientras el AI stub solo echo del input):
 *  - Normaliza el nombre del archivo (minusculas, sin diacriticos)
 *  - Para cada Room, construye una lista de keywords (tipo + nombre + sinonimos)
 *  - El que mas keywords matchea gana. Empate => primer Room.
 *  - Sin match => sin asignar (el usuario debe escoger antes de confirmar).
 */
export function BulkPhotoUploader({
  acta,
  onUpdate,
  onClose,
  variant = "modal",
}: BulkPhotoUploaderProps) {
  const inline = variant === "inline";
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"select" | "processing" | "review">(
    "select"
  );
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [photos, setPhotos] = useState<ProcessedPhoto[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    {}
  );
  /**
   * Rooms materializados localmente por la IA — ambientes que la IA detecto
   * en las fotos y que no existian en el acta. Se persisten al hacer Save.
   * Tienen id real (no de template) para que el dropdown pueda mostrarlos.
   */
  const [extraRooms, setExtraRooms] = useState<Room[]>([]);
  const [saving, setSaving] = useState(false);

  /** Combinacion de rooms del acta + los materializados durante esta sesion. */
  const allAvailableRooms: Room[] = [...acta.rooms, ...extraRooms];

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    setStage("processing");
    setProgress({ done: 0, total: files.length });

    const processed: ProcessedPhoto[] = [];
    for (const file of files) {
      const result = await processOne(file, acta.rooms);
      processed.push(result);
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setPhotos(processed);
    const initialAssignments: Record<string, string | null> = {};
    for (const p of processed) {
      initialAssignments[p.tempId] = p.suggestedRoomId;
    }
    setAssignments(initialAssignments);
    setStage("review");

    // Despues del procesamiento local, lanza AI vision en background para
    // mejorar las sugerencias de fotos sin match alta de filename.
    void runAIClassification(processed);
  };

  const runAIClassification = async (initial: ProcessedPhoto[]) => {
    // Solo clasificamos las que NO tienen match alta del filename.
    // Las "alta" del filename ya son confiables — no gastamos tokens ahi.
    const targets = initial.filter(
      (p) => p.suggestionSource !== "filename" || p.suggestionConfidence !== "alta"
    );
    if (targets.length === 0) return;

    // Le mandamos a la AI todos los rooms existentes del acta MAS los templates
    // canonicos para los tipos que aun no estan en el acta. Si la AI elige
    // un template, lo materializamos como Room real al recibir la respuesta.
    const existingTypes = new Set(acta.rooms.map((r) => r.type));
    const roomsForAI = [
      ...acta.rooms.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
      })),
      ...ROOM_TEMPLATES.filter((t) => !existingTypes.has(t.type)).map((t) => ({
        id: `${TEMPLATE_PREFIX}${t.type}`,
        name: t.name,
        type: t.type,
      })),
    ];

    // Marcar todos como "running"
    setPhotos((prev) =>
      prev.map((p) =>
        targets.some((t) => t.tempId === p.tempId)
          ? { ...p, aiStatus: "running" as const }
          : p
      )
    );

    // Procesar en serie para que el prompt cache haga hit a partir de la 2da
    // (Haiku tiene cache de 5min para prefijos > 4096 tokens; con muchos
    // ambientes el system prompt entra al cache despues de la primera).
    for (const target of targets) {
      const result = await classifyRoomWithAI(target.dataUrl, roomsForAI);

      // Si la IA respondio con un id de template (ambiente que no existia
      // en el acta), lo materializamos como Room real ahora.
      let finalRoomId = result.roomId;
      if (
        result.ok &&
        result.roomId &&
        result.roomId.startsWith(TEMPLATE_PREFIX)
      ) {
        const templateType = result.roomId.slice(TEMPLATE_PREFIX.length);
        finalRoomId = ensureRoomFromTemplate(templateType);
      }

      setPhotos((prev) =>
        prev.map((p) => {
          if (p.tempId !== target.tempId) return p;
          if (result.source === "unavailable") {
            return { ...p, aiStatus: "unavailable" as const };
          }
          if (!result.ok || !finalRoomId) {
            // AI no pudo clasificar: dejamos el fallback de filename si lo hay
            return {
              ...p,
              aiStatus: result.source === "ai" ? "done" : "failed",
            };
          }
          return {
            ...p,
            aiStatus: "done" as const,
            suggestedRoomId: finalRoomId,
            suggestionConfidence: result.confidence,
            suggestionSource: "ai" as const,
            matchedKeyword: result.reasoning,
          };
        })
      );

      // Si la asignacion estaba sin asignar O era de baja confianza, aplicamos
      // la sugerencia de AI. Si el usuario ya cambio manualmente el dropdown,
      // respetamos su eleccion (no la pisamos).
      if (result.ok && finalRoomId) {
        setAssignments((prev) => {
          const current = prev[target.tempId];
          // No piso si el user ya cambio la asignacion manualmente
          if (current && current !== target.suggestedRoomId) return prev;
          return { ...prev, [target.tempId]: finalRoomId };
        });
      }
    }
  };

  /**
   * Garantiza que existe un Room con el tipo dado (en acta.rooms o en
   * extraRooms). Si no existe, lo crea en extraRooms con el nombre del
   * template canonico. Retorna el id del Room.
   */
  const ensureRoomFromTemplate = (templateType: string): string | null => {
    // 1. Si ya existe en el acta, usarlo
    const existing = acta.rooms.find((r) => r.type === templateType);
    if (existing) return existing.id;
    // 2. Si ya lo materializamos en esta sesion, reutilizar
    const materialized = extraRooms.find((r) => r.type === templateType);
    if (materialized) return materialized.id;
    // 3. Crear desde template
    const template = ROOM_TEMPLATES.find((t) => t.type === templateType);
    if (!template) return null;
    const newRoom: Room = {
      id: generateId("room"),
      type: template.type,
      name: template.name,
      order: acta.rooms.length + extraRooms.length,
      required: false,
      minPhotos: template.minPhotos,
      generalCondition: "no_evaluado" as ConditionLevel,
      aiSummary: null,
      manualObservations: null,
      photoIds: [],
    };
    setExtraRooms((prev) => [...prev, newRoom]);
    return newRoom.id;
  };

  const handleSave = async () => {
    if (saving) return;
    const user = getCurrentUser();
    setSaving(true);
    try {
      // Si hay fotos sin asignar, creamos (o reutilizamos) un ambiente
      // "Sin clasificar" automaticamente para no perderlas. El usuario
      // puede moverlas manualmente despues.
      const unassigned = photos.filter((p) => !assignments[p.tempId]);
      let fallbackRoom: Room | null = null;
      let newSinClasificar: Room | null = null;
      if (unassigned.length > 0) {
        fallbackRoom =
          acta.rooms.find(
            (r) => r.type === "otro" && /sin clasificar/i.test(r.name)
          ) ??
          extraRooms.find(
            (r) => r.type === "otro" && /sin clasificar/i.test(r.name)
          ) ??
          null;
        if (!fallbackRoom) {
          newSinClasificar = {
            id: generateId("room"),
            name: "Sin clasificar",
            type: "otro" as RoomType,
            order: acta.rooms.length + extraRooms.length,
            required: false,
            minPhotos: 0,
            generalCondition: "no_evaluado" as ConditionLevel,
            aiSummary: null,
            manualObservations:
              "Ambiente creado automaticamente para fotos sin asignar. Puedes mover las fotos al ambiente correcto cuando sea claro.",
            photoIds: [],
          };
          fallbackRoom = newSinClasificar;
        }
      }

      const photosToAdd: PhotoEvidence[] = [];
      const aiJobs: { photoId: string; file: File; roomType: RoomType }[] = [];

      // Universo completo de rooms para esta operacion: acta.rooms + extra
      // (detectados por AI) + sinClasificar (si fue necesario crearlo).
      const allRoomsThisSave = [
        ...acta.rooms,
        ...extraRooms,
        ...(newSinClasificar ? [newSinClasificar] : []),
      ];

      for (const p of photos) {
        let roomId = assignments[p.tempId];
        if (!roomId && fallbackRoom) {
          roomId = fallbackRoom.id;
        }
        if (!roomId) continue;
        const room = allRoomsThisSave.find((r) => r.id === roomId);
        if (!room) continue;
        const photoId = generateId("photo");
        const photo: PhotoEvidence = {
          id: photoId,
          actaId: acta.id,
          roomId,
          uploadedByPartyId: null,
          uploadedByName: user.name,
          uploadedByRole: user.role,
          uploadedAt: new Date().toISOString(),
          fileName: p.file.name,
          fileSize: p.bytes,
          mimeType: p.mime,
          width: p.width,
          height: p.height,
          dataUrl: p.dataUrl,
          thumbnailDataUrl: p.thumbnailDataUrl,
          forensic: p.forensic,
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
        photosToAdd.push(photo);
        aiJobs.push({ photoId, file: p.file, roomType: room.type });
      }

      if (photosToAdd.length === 0) {
        onClose();
        return;
      }

      onUpdate((a) => {
        // Para no duplicar: solo agregamos extraRooms / newSinClasificar
        // si NO existen ya en a.rooms (por tipo y nombre).
        const existingIds = new Set(a.rooms.map((r) => r.id));
        const roomsToAdd = [
          ...extraRooms.filter((r) => !existingIds.has(r.id)),
          ...(newSinClasificar && !existingIds.has(newSinClasificar.id)
            ? [newSinClasificar]
            : []),
        ];
        return appendAuditLog(
          {
            ...a,
            rooms: [...a.rooms, ...roomsToAdd],
            photos: [...a.photos, ...photosToAdd],
          },
          user.name,
          user.role,
          null,
          "photo_uploaded",
          {
            count: photosToAdd.length,
            bulk: true,
            createdAIRooms: extraRooms.length,
            createdSinClasificarRoom: !!newSinClasificar,
          }
        );
      });

      // Lanzar analisis IA en background (no bloqueante para el usuario)
      void runBulkAI(aiJobs);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const runBulkAI = async (
    jobs: { photoId: string; file: File; roomType: RoomType }[]
  ) => {
    for (const job of jobs) {
      try {
        onUpdate((a) => ({
          ...a,
          photos: a.photos.map((p) =>
            p.id === job.photoId ? { ...p, aiStatus: "processing" } : p
          ),
        }));
        const dims = await imageDims(job.file);
        const analysis = await analyzePhotoWithAI(
          job.file.name,
          job.file.size,
          dims.w,
          dims.h,
          job.roomType
        );
        onUpdate((a) => {
          const updatedPhotos = a.photos.map((p) => {
            if (p.id !== job.photoId) return p;
            const updated: PhotoEvidence = {
              ...p,
              aiAnalysis: analysis,
              aiStatus: "complete",
            };
            updated.warnings = calculatePhotoWarnings(updated);
            updated.evidenceStrength = calculateEvidenceStrength(updated);
            return updated;
          });
          // Actualizar resumen del room afectado
          const photo = updatedPhotos.find((p) => p.id === job.photoId);
          if (photo) {
            const room = a.rooms.find((r) => r.id === photo.roomId);
            if (room) {
              const roomPhotos = updatedPhotos.filter(
                (p) => p.roomId === photo.roomId
              );
              const analyses = roomPhotos
                .map((p) => p.aiAnalysis)
                .filter((x): x is NonNullable<typeof x> => x !== null);
              const summary = summarizeRoom(room.name, analyses);
              return {
                ...a,
                photos: updatedPhotos,
                rooms: a.rooms.map((r) =>
                  r.id === room.id ? { ...r, aiSummary: summary } : r
                ),
              };
            }
          }
          return { ...a, photos: updatedPhotos };
        });
      } catch (err) {
        console.warn("Bulk AI analysis failed for photo:", err);
        onUpdate((a) => ({
          ...a,
          photos: a.photos.map((p) =>
            p.id === job.photoId ? { ...p, aiStatus: "error" } : p
          ),
        }));
      }
    }
  };

  const updateAssignment = (tempId: string, roomId: string | null) => {
    setAssignments((prev) => ({ ...prev, [tempId]: roomId }));
  };

  const removePhoto = (tempId: string) => {
    setPhotos((prev) => prev.filter((p) => p.tempId !== tempId));
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });
  };

  const assignedCount = Object.values(assignments).filter(
    (v): v is string => v !== null
  ).length;
  const unassignedCount = photos.length - assignedCount;

  const containerOuterClass = inline
    ? ""
    : "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4";
  const containerInnerClass = inline
    ? "bg-white rounded-xl border border-gray-200 flex flex-col"
    : "bg-white rounded-xl border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col";

  return (
    <div className={containerOuterClass}>
      <div className={containerInnerClass}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-accent-softer p-1.5 text-accent-dark">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Subir todas las fotos juntas
              </h2>
              <p className="text-xs text-muted">
                La IA propone a que ambiente pertenece cada una. Puedes
                ajustarlas antes de guardar.
              </p>
            </div>
          </div>
          {!inline && (
            <button
              onClick={onClose}
              className="text-muted hover:text-gray-800"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {stage === "select" && (
            <SelectStage onSelect={handleFilesSelected} inputRef={inputRef} />
          )}

          {stage === "processing" && (
            <ProcessingStage
              done={progress.done}
              total={progress.total}
            />
          )}

          {stage === "review" && (
            <ReviewStage
              photos={photos}
              rooms={allAvailableRooms}
              extraRoomsCount={extraRooms.length}
              assignments={assignments}
              onChangeAssignment={updateAssignment}
              onRemovePhoto={removePhoto}
            />
          )}
        </div>

        {/* Footer */}
        {stage === "review" && (
          <div className="border-t border-gray-200 p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-gray-700">
              <span className="font-semibold text-emerald-700">
                {assignedCount}
              </span>{" "}
              asignadas
              {unassignedCount > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-amber-700">
                    {unassignedCount}
                  </span>{" "}
                  van a &ldquo;Sin clasificar&rdquo;
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-md bg-gray-100 border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || photos.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Guardar {photos.length} foto{photos.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectStage({
  onSelect,
  inputRef,
}: {
  onSelect: (files: FileList | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 hover:border-accent transition-colors py-12 px-4 text-center">
      <ImagePlus className="h-8 w-8 text-gray-400 mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-800 mb-1">
        Selecciona o arrastra todas las fotos del inmueble
      </p>
      <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto leading-relaxed">
        Carga juntas las fotos de todos los ambientes. Procesamos cada foto y
        la IA propone a que ambiente pertenece. Despues revisas y ajustas.
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim"
      >
        <Upload className="h-3.5 w-3.5" />
        Elegir fotos
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onSelect(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ProcessingStage({ done, total }: { done: number; total: number }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="py-8 px-4 text-center">
      <Loader2 className="h-6 w-6 text-accent animate-spin mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-800 mb-1">
        Procesando fotos...
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Calculando hash forense, comprimiendo y proponiendo asignaciones.
      </p>
      <div className="max-w-xs mx-auto">
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted mt-2 font-mono">
          {done} / {total}
        </p>
      </div>
    </div>
  );
}

function ReviewStage({
  photos,
  rooms,
  extraRoomsCount,
  assignments,
  onChangeAssignment,
  onRemovePhoto,
}: {
  photos: ProcessedPhoto[];
  rooms: Room[];
  extraRoomsCount: number;
  assignments: Record<string, string | null>;
  onChangeAssignment: (tempId: string, roomId: string | null) => void;
  onRemovePhoto: (tempId: string) => void;
}) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-8">
        No hay fotos para revisar.
      </p>
    );
  }

  const runningCount = photos.filter((p) => p.aiStatus === "running").length;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-700 leading-relaxed flex-1 min-w-[200px]">
          Revisa la asignacion sugerida. Las fotos sin asignar se guardaran en
          un ambiente &ldquo;Sin clasificar&rdquo; que podras renombrar despues.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {extraRoomsCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-medium text-emerald-800"
              title="Ambientes creados automaticamente por IA segun el contenido de las fotos"
            >
              <Brain className="h-3 w-3" />
              IA creo {extraRoomsCount} ambiente
              {extraRoomsCount === 1 ? "" : "s"} nuevo
              {extraRoomsCount === 1 ? "" : "s"}
            </span>
          )}
          {runningCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-medium text-purple-800">
              <Loader2 className="h-3 w-3 animate-spin" />
              IA analizando {runningCount} foto{runningCount === 1 ? "" : "s"}...
            </span>
          )}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {photos.map((p) => {
          const assignedId = assignments[p.tempId] ?? null;
          const isAssigned = assignedId !== null;
          return (
            <div
              key={p.tempId}
              className={cn(
                "rounded-lg border bg-white p-2 flex flex-col gap-2",
                isAssigned ? "border-gray-200" : "border-amber-300 bg-amber-50/40"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumbnailDataUrl ?? p.dataUrl}
                alt={p.file.name}
                className="aspect-video w-full object-cover rounded-md bg-gray-100"
              />
              <div className="text-[10px] text-muted truncate font-mono">
                {p.file.name}
              </div>
              <select
                value={assignedId ?? ""}
                onChange={(e) =>
                  onChangeAssignment(p.tempId, e.target.value || null)
                }
                className={cn(
                  "w-full text-xs rounded-md border px-2 py-1.5 bg-white",
                  isAssigned
                    ? "border-gray-200"
                    : "border-amber-300 text-amber-900"
                )}
              >
                <option value="">— Sin clasificar —</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <SuggestionBadge photo={p} />
                <button
                  onClick={() => onRemovePhoto(p.tempId)}
                  className="text-muted hover:text-danger shrink-0"
                  aria-label="Quitar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuggestionBadge({ photo: p }: { photo: ProcessedPhoto }) {
  if (p.aiStatus === "running") {
    return (
      <span className="inline-flex items-center gap-1 text-purple-700">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        IA analizando...
      </span>
    );
  }
  if (p.suggestionSource === "ai") {
    return (
      <span
        className="inline-flex items-center gap-1 text-purple-800 truncate"
        title={p.matchedKeyword ?? ""}
      >
        <Brain className="h-2.5 w-2.5" />
        IA ({p.suggestionConfidence}): {p.matchedKeyword?.slice(0, 40)}
      </span>
    );
  }
  if (p.suggestionSource === "filename") {
    return (
      <span className="inline-flex items-center gap-1 text-accent-dark">
        <Sparkles className="h-2.5 w-2.5" />
        Nombre: &ldquo;{p.matchedKeyword}&rdquo; ({p.suggestionConfidence})
      </span>
    );
  }
  if (p.aiStatus === "unavailable") {
    return (
      <span className="text-amber-700">
        IA no configurada — asigna manualmente
      </span>
    );
  }
  if (p.aiStatus === "failed") {
    return (
      <span className="text-amber-700">IA fallo — asigna manualmente</span>
    );
  }
  return (
    <span className="text-amber-700">Sin match — asigna manualmente</span>
  );
}

// ============================================
// Helpers
// ============================================

async function processOne(file: File, rooms: Room[]): Promise<ProcessedPhoto> {
  const tempId = `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 1. Forensic
  let forensic: PhotoEvidence["forensic"] = null;
  try {
    forensic = await parseClientSide(file, tempId);
  } catch (err) {
    console.warn("Forensic parse failed:", err);
  }

  // 2. Compress
  let dataUrl: string;
  let bytes = file.size;
  let width: number | null = null;
  let height: number | null = null;
  let mime = file.type;

  if (shouldCompress(file)) {
    try {
      const c = await compressImage(file, {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 0.85,
      });
      dataUrl = c.dataUrl;
      bytes = c.bytes;
      width = c.width;
      height = c.height;
      mime = c.format;
    } catch {
      dataUrl = await fileToDataUrl(file);
    }
  } else {
    dataUrl = await fileToDataUrl(file);
  }

  if (width === null || height === null) {
    const dims = await imageDimsFromUrl(dataUrl);
    width = dims.w || null;
    height = dims.h || null;
  }

  // 3. Suggest room (heuristic). La AI corre despues en background.
  const { roomId, confidence, keyword } = suggestRoom(file.name, rooms);

  return {
    tempId,
    file,
    dataUrl,
    thumbnailDataUrl: forensic?.thumbnail.dataUrl ?? null,
    width,
    height,
    bytes,
    mime,
    forensic,
    suggestedRoomId: roomId,
    suggestionConfidence: confidence,
    suggestionSource: roomId ? "filename" : "none",
    matchedKeyword: keyword,
    aiStatus: "idle",
  };
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

function imageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = URL.createObjectURL(file);
  });
}

function imageDimsFromUrl(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = dataUrl;
  });
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_-]/g, " ");
}

const ROOM_KEYWORDS: Record<string, string[]> = {
  living: ["living", "sala", "estar", "salon"],
  comedor: ["comedor", "dining"],
  cocina: ["cocina", "kitchen"],
  dormitorio_principal: ["dormitorio principal", "matrimonial", "master", "principal"],
  dormitorio_secundario: ["dormitorio", "pieza", "habitacion", "bedroom", "secundario"],
  bano_principal: ["bano principal", "baño principal", "bano master", "master bath"],
  bano_secundario: ["bano", "baño", "bath", "wc", "toilet"],
  terraza: ["terraza", "balcon", "terrace"],
  logia: ["logia", "lavanderia", "laundry"],
  pasillo: ["pasillo", "hall", "corridor"],
  estacionamiento: ["estacionamiento", "parking", "garage", "cochera"],
  bodega: ["bodega", "storage"],
  medidores: ["medidor", "meter", "tablero"],
  accesos: ["acceso", "entrada", "puerta", "lobby"],
  llaves_controles: ["llaves", "controles", "keys"],
  muebles: ["muebles", "mueble", "furniture"],
  electrodomesticos: ["electrodomestico", "appliance"],
};

function suggestRoom(
  fileName: string,
  rooms: Room[]
): {
  roomId: string | null;
  confidence: "alta" | "media" | "baja";
  keyword: string | null;
} {
  if (rooms.length === 0) {
    return { roomId: null, confidence: "baja", keyword: null };
  }
  const name = normalize(fileName);

  let bestRoom: Room | null = null;
  let bestKeyword: string | null = null;
  let bestScore = 0;

  for (const room of rooms) {
    // 1. Try matching against this room's name directly
    const roomNameNorm = normalize(room.name);
    if (roomNameNorm.length >= 3 && name.includes(roomNameNorm)) {
      const score = roomNameNorm.length + 5; // bonus for direct name match
      if (score > bestScore) {
        bestScore = score;
        bestRoom = room;
        bestKeyword = room.name;
      }
    }

    // 2. Try matching against canonical keywords for this room type
    const keywords = ROOM_KEYWORDS[room.type] ?? [];
    for (const kw of keywords) {
      if (name.includes(normalize(kw))) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          bestRoom = room;
          bestKeyword = kw;
        }
      }
    }
  }

  if (bestRoom) {
    const confidence: "alta" | "media" | "baja" =
      bestScore >= 8 ? "alta" : bestScore >= 5 ? "media" : "baja";
    return { roomId: bestRoom.id, confidence, keyword: bestKeyword };
  }

  return { roomId: null, confidence: "baja", keyword: null };
}
