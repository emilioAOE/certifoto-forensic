"use client";

import { useState } from "react";
import type { Room, ConditionLevel } from "@/lib/acta-types";
import { ROOM_TEMPLATES } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";
import { Plus, Trash2, GripVertical, Camera } from "lucide-react";

type RoomDraft = Omit<Room, "id" | "photoIds" | "aiSummary"> & { tempId: string };

interface StepAmbientesProps {
  rooms: RoomDraft[];
  onChange: (rooms: RoomDraft[]) => void;
}

const CATEGORIES = [
  { id: "principal", label: "Principales" },
  { id: "servicios", label: "Servicios" },
  { id: "exterior", label: "Exteriores" },
  { id: "extras", label: "Extras" },
] as const;

export function StepAmbientes({ rooms, onChange }: StepAmbientesProps) {
  const [customName, setCustomName] = useState("");

  const isAdded = (templateType: string) =>
    rooms.some((r) => r.type === templateType);

  const addFromTemplate = (templateType: string) => {
    const template = ROOM_TEMPLATES.find((t) => t.type === templateType);
    if (!template) return;
    const tempId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newRoom: RoomDraft = {
      tempId,
      type: template.type,
      name: template.name,
      order: rooms.length,
      required: template.required,
      minPhotos: template.minPhotos,
      generalCondition: "no_evaluado" as ConditionLevel,
      manualObservations: null,
    };
    onChange([...rooms, newRoom]);
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const tempId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newRoom: RoomDraft = {
      tempId,
      type: "otro",
      name: customName.trim(),
      order: rooms.length,
      required: false,
      minPhotos: 1,
      generalCondition: "no_evaluado",
      manualObservations: null,
    };
    onChange([...rooms, newRoom]);
    setCustomName("");
  };

  const removeRoom = (tempId: string) => {
    onChange(rooms.filter((r) => r.tempId !== tempId));
  };

  const toggleRequired = (tempId: string) => {
    onChange(
      rooms.map((r) =>
        r.tempId === tempId ? { ...r, required: !r.required } : r
      )
    );
  };

  const updateMinPhotos = (tempId: string, n: number) => {
    onChange(
      rooms.map((r) =>
        r.tempId === tempId ? { ...r, minPhotos: Math.max(1, n) } : r
      )
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Selecciona los ambientes a documentar
      </h2>
      <p className="text-sm text-muted mb-5">
        Agrega los espacios de la propiedad. Los marcados como obligatorios
        deben tener al menos 1 foto.
      </p>

      {/* Selected rooms */}
      {rooms.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">
            Seleccionados ({rooms.length})
          </p>
          <div className="space-y-1.5">
            {rooms.map((room) => (
              <div
                key={room.tempId}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <GripVertical className="h-3 w-3 text-muted shrink-0" />
                <span className="text-sm text-gray-800 flex-1 truncate">
                  {room.name}
                </span>
                <label className="inline-flex items-center gap-1 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={room.required}
                    onChange={() => toggleRequired(room.tempId)}
                    className="h-3 w-3 accent-accent"
                  />
                  Obligatorio
                </label>
                <div className="inline-flex items-center gap-1 text-xs text-muted">
                  <Camera className="h-3 w-3" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={room.minPhotos}
                    onChange={(e) =>
                      updateMinPhotos(room.tempId, parseInt(e.target.value) || 1)
                    }
                    className="w-10 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-xs"
                  />
                </div>
                <button
                  onClick={() => removeRoom(room.tempId)}
                  className="text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available templates */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const items = ROOM_TEMPLATES.filter((t) => t.category === cat.id);
          return (
            <div key={cat.id}>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">
                {cat.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((tpl) => {
                  const added = isAdded(tpl.type);
                  return (
                    <button
                      key={tpl.type}
                      onClick={() => !added && addFromTemplate(tpl.type)}
                      disabled={added}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors",
                        added
                          ? "border-accent/30 bg-accent/10 text-accent cursor-default"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-accent/50"
                      )}
                    >
                      {!added && <Plus className="h-3 w-3" />}
                      {added && "✓"} {tpl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom room */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <p className="text-xs text-muted mb-2">Agregar ambiente personalizado:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Ej: Sala de juegos"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={addCustom}
            disabled={!customName.trim()}
            className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
