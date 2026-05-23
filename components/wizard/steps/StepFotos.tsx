"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Sparkles } from "lucide-react";
import type {
  Acta,
  PhotoEvidence,
  Room,
  RoomType,
  ConditionLevel,
  PartyRole,
} from "@/lib/acta-types";
import { ROOM_TEMPLATES } from "@/lib/acta-constants";
import { BulkPhotoUploader } from "@/components/acta-detail/BulkPhotoUploader";
import { analyzePhotoVision } from "@/lib/photo-analyzer";
import { getCurrentUser } from "@/lib/storage";
import { cn } from "@/lib/cn";

/** ID temporal del acta-borrador. Se reescribe al crear el acta real. */
const DRAFT_ACTA_ID = "wizard-draft";

type RoomDraft = Omit<Room, "id" | "photoIds" | "aiSummary"> & { tempId: string };

interface StepFotosProps {
  /** Ambientes pre-seleccionados manualmente (RoomDraft con tempId). */
  rooms: RoomDraft[];
  onChangeRooms: (rooms: RoomDraft[]) => void;
  /** Fotos cargadas con IA en este paso (con roomId apuntando a Rooms reales). */
  pendingPhotos: PhotoEvidence[];
  onChangePhotos: (photos: PhotoEvidence[]) => void;
  /** Rooms creados por IA durante el bulk upload (Rooms reales con id). */
  detectedRooms: Room[];
  onChangeDetectedRooms: (rooms: Room[]) => void;
}

export function StepFotos({
  rooms,
  onChangeRooms,
  pendingPhotos,
  onChangePhotos,
  detectedRooms,
  onChangeDetectedRooms,
}: StepFotosProps) {
  const [mode, setMode] = useState<"uploading" | "done">(
    pendingPhotos.length > 0 ? "done" : "uploading"
  );
  const [showManualPreselect, setShowManualPreselect] = useState(rooms.length > 0);

  // ── Analisis IA por foto (descripcion del estado) ───────────────────────
  // En el wizard, el BulkPhotoUploader (modo inline) NO corre el analisis por
  // foto para evitar stale-closures al desmontarse. Lo corremos aca, sobre el
  // estado del wizard, que es la fuente de verdad. Usamos un ref para no
  // pisar actualizaciones concurrentes y otro para no re-analizar.
  const photosRef = useRef<PhotoEvidence[]>(pendingPhotos);
  const analyzingRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    photosRef.current = pendingPhotos;
  }, [pendingPhotos]);

  const onChangePhotosRef = useRef(onChangePhotos);
  useEffect(() => {
    onChangePhotosRef.current = onChangePhotos;
  }, [onChangePhotos]);

  useEffect(() => {
    const roomLookup = new Map<string, { name: string; type: RoomType }>();
    for (const r of detectedRooms) {
      roomLookup.set(r.id, { name: r.name, type: r.type });
    }
    for (const r of rooms) {
      roomLookup.set(`manual:${r.tempId}`, { name: r.name, type: r.type });
    }

    const patchPhoto = (id: string, patch: Partial<PhotoEvidence>) => {
      const next = photosRef.current.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      );
      photosRef.current = next;
      onChangePhotosRef.current(next);
    };

    for (const photo of pendingPhotos) {
      if (photo.aiStatus !== "pending") continue;
      if (analyzingRef.current.has(photo.id)) continue;
      analyzingRef.current.add(photo.id);
      patchPhoto(photo.id, { aiStatus: "processing" });
      const room = roomLookup.get(photo.roomId);
      analyzePhotoVision(
        photo.dataUrl,
        room?.name ?? "Ambiente",
        (room?.type ?? "otro") as RoomType,
        {
          fileName: photo.fileName,
          fileSize: photo.fileSize,
          width: photo.width,
          height: photo.height,
        }
      )
        .then((analysis) => {
          patchPhoto(photo.id, { aiAnalysis: analysis, aiStatus: "complete" });
        })
        .catch(() => {
          patchPhoto(photo.id, { aiStatus: "error" });
        })
        .finally(() => {
          analyzingRef.current.delete(photo.id);
        });
    }
  }, [pendingPhotos, detectedRooms, rooms]);

  // Construir un acta-borrador para alimentar al BulkPhotoUploader. Mezcla
  // los rooms manuales (convertidos a Room real con id sintetico) con los
  // rooms detectados por IA durante esta sesion.
  const draftActa: Acta = useMemo(() => {
    const manualRooms: Room[] = rooms.map((rd) => ({
      id: `manual:${rd.tempId}`,
      type: rd.type,
      name: rd.name,
      order: rd.order,
      required: rd.required,
      minPhotos: rd.minPhotos,
      generalCondition: rd.generalCondition,
      aiSummary: null,
      manualObservations: rd.manualObservations,
      photoIds: [],
    }));
    return {
      id: DRAFT_ACTA_ID,
      type: "entrega",
      status: "evidence_collection",
      propertyId: "wizard-draft-property",
      parties: [],
      brokerRole: null,
      organizationId: null,
      rooms: [...manualRooms, ...detectedRooms],
      photos: pendingPhotos,
      inventoryItems: [],
      comments: [],
      signatures: [],
      auditLog: [],
      createdByPartyId: null,
      createdByName: getCurrentUser().name,
      createdByRole: getCurrentUser().role as PartyRole,
      visibilityMode: "private",
      finalPdfDataUrl: null,
      documentHash: null,
      aiSummary: null,
      manualSummary: null,
      disclaimerAccepted: false,
      certifiedAt: null,
      legacyCertified: false,
      inspectionDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
      relatedEntregaActaId: null,
      tags: [],
    };
  }, [rooms, pendingPhotos, detectedRooms]);

  /**
   * Intercepta los updates del BulkPhotoUploader y los traduce a wizard state.
   * Solo capturamos los rooms NUEVOS (los que no son "manual:..." ni los ya
   * detectados) y las fotos NUEVAS.
   */
  const handleUpdate = (updater: (a: Acta) => Acta) => {
    const updated = updater(draftActa);
    // Rooms nuevos = los que no son manual: y no estaban en detectedRooms
    const detectedIds = new Set(detectedRooms.map((r) => r.id));
    const newDetected = updated.rooms.filter(
      (r) =>
        !r.id.startsWith("manual:") &&
        !detectedIds.has(r.id)
    );
    if (newDetected.length > 0) {
      onChangeDetectedRooms([...detectedRooms, ...newDetected]);
    }
    // Fotos: tomamos todas las del updated (incluyendo nuevas), reseteamos.
    onChangePhotos(updated.photos);
  };

  const handleBulkDone = () => {
    setMode("done");
  };

  if (mode === "uploading") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Fotos del inmueble
        </h2>
        <p className="text-sm text-muted mb-4">
          Sube todas las fotos juntas: la IA detecta los ambientes y describe el
          estado de cada foto. Revisar o editar es opcional. También puedes
          continuar sin fotos y subirlas más tarde.
        </p>
        <BulkPhotoUploader
          variant="inline"
          acta={draftActa}
          onUpdate={handleUpdate}
          onClose={handleBulkDone}
        />

        {/* Pre-seleccion manual de ambientes (opcional) */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowManualPreselect((s) => !s)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showManualPreselect ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {showManualPreselect
              ? "Ocultar pre-selección de ambientes"
              : "¿Prefieres marcar los ambientes a mano? (opcional)"}
          </button>

          {showManualPreselect && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Si ya sabes qué ambientes tiene la propiedad, márcalos aquí. La
                IA igual puede crear los que falten cuando subas fotos.
              </p>
              <ManualRoomChips rooms={rooms} onChangeRooms={onChangeRooms} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "done") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Fotos del inmueble
        </h2>
        <p className="text-sm text-muted mb-5">
          Las fotos quedan listas para adjuntarse al acta cuando termines el
          wizard.
        </p>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-600 text-white p-2 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                {pendingPhotos.length} foto
                {pendingPhotos.length === 1 ? "" : "s"} cargada
                {pendingPhotos.length === 1 ? "" : "s"} en{" "}
                {detectedRooms.length} ambiente
                {detectedRooms.length === 1 ? "" : "s"} detectado
                {detectedRooms.length === 1 ? "" : "s"}
              </h3>
              {detectedRooms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {detectedRooms.map((r) => {
                    const photoCount = pendingPhotos.filter(
                      (p) => p.roomId === r.id
                    ).length;
                    return (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-emerald-300 px-2 py-0.5 text-xs text-emerald-900"
                      >
                        {r.name}
                        <span className="text-emerald-700">({photoCount})</span>
                      </span>
                    );
                  })}
                </div>
              )}
              {(() => {
                const done = pendingPhotos.filter(
                  (p) => p.aiStatus === "complete"
                ).length;
                const pending = pendingPhotos.filter(
                  (p) => p.aiStatus === "pending" || p.aiStatus === "processing"
                ).length;
                return (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    {pending > 0 ? (
                      <span>
                        Describiendo el estado de las fotos con IA… {done}/
                        {pendingPhotos.length}
                      </span>
                    ) : (
                      <span>
                        {done} foto{done === 1 ? "" : "s"} con descripción de
                        estado generada
                      </span>
                    )}
                  </div>
                );
              })()}
              <button
                onClick={() => {
                  onChangePhotos([]);
                  onChangeDetectedRooms([]);
                  setMode("uploading");
                }}
                className="mt-3 block text-xs text-emerald-800 hover:underline"
              >
                Empezar de cero
              </button>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-700 leading-relaxed">
          ¿Quieres subir más fotos?{" "}
          <button
            onClick={() => setMode("uploading")}
            className="text-accent-dark font-semibold hover:underline"
          >
            Agregar más
          </button>{" "}
          o continuar al siguiente paso.
        </p>
      </div>
    );
  }

  return null;
}

const CATEGORIES = [
  { id: "principal", label: "Principales" },
  { id: "servicios", label: "Servicios" },
  { id: "exterior", label: "Exteriores" },
  { id: "extras", label: "Extras" },
] as const;

function ManualRoomChips({
  rooms,
  onChangeRooms,
}: {
  rooms: RoomDraft[];
  onChangeRooms: (rooms: RoomDraft[]) => void;
}) {
  const isAdded = (type: string) => rooms.some((r) => r.type === type);

  const add = (type: string) => {
    const template = ROOM_TEMPLATES.find((t) => t.type === type);
    if (!template) return;
    const tempId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    onChangeRooms([
      ...rooms,
      {
        tempId,
        type: template.type,
        name: template.name,
        order: rooms.length,
        required: template.required,
        minPhotos: template.minPhotos,
        generalCondition: "no_evaluado" as ConditionLevel,
        manualObservations: null,
      },
    ]);
  };

  const remove = (tempId: string) => {
    onChangeRooms(rooms.filter((r) => r.tempId !== tempId));
  };

  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const items = ROOM_TEMPLATES.filter((t) => t.category === cat.id);
        return (
          <div key={cat.id}>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((tpl) => {
                const added = isAdded(tpl.type);
                const room = rooms.find((r) => r.type === tpl.type);
                return (
                  <button
                    key={tpl.type}
                    onClick={() =>
                      added && room ? remove(room.tempId) : add(tpl.type)
                    }
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors",
                      added
                        ? "border-accent bg-accent text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-accent/50"
                    )}
                  >
                    {added && "✓"} {tpl.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
