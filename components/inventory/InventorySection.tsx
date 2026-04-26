"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit2,
} from "lucide-react";
import type {
  Acta,
  InventoryItem,
  InventoryCategory,
  ConditionLevel,
  Room,
} from "@/lib/acta-types";
import { CONDITION_LABEL, CONDITION_COLOR } from "@/lib/acta-constants";
import { generateId } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  furniture: "Muebles",
  appliance: "Electrodomestico",
  accessory: "Accesorio",
  key: "Llave",
  control: "Control",
  meter: "Medidor",
  other: "Otro",
};

interface InventorySectionProps {
  acta: Acta;
  readOnly: boolean;
  onUpdate: (updater: (a: Acta) => Acta) => void;
}

/**
 * Seccion de inventario para propiedades amobladas. Se muestra en el detalle
 * del acta cuando furnished !== "no" o cuando el tipo de acta es "inventario".
 */
export function InventorySection({
  acta,
  readOnly,
  onUpdate,
}: InventorySectionProps) {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [adding, setAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState<InventoryCategory | "all">(
    "all"
  );
  const [filterRoom, setFilterRoom] = useState<string | "all">("all");

  const items = acta.inventoryItems;

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filterCategory !== "all" && it.category !== filterCategory)
        return false;
      if (filterRoom !== "all" && it.roomId !== filterRoom) return false;
      return true;
    });
  }, [items, filterCategory, filterRoom]);

  const handleAdd = (item: Omit<InventoryItem, "id" | "actaId">) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId("inv"),
      actaId: acta.id,
    };
    onUpdate((a) => ({
      ...a,
      inventoryItems: [...a.inventoryItems, newItem],
    }));
    toast.success("Item agregado al inventario");
    setAdding(false);
  };

  const handleUpdate = (id: string, patch: Partial<InventoryItem>) => {
    onUpdate((a) => ({
      ...a,
      inventoryItems: a.inventoryItems.map((it) =>
        it.id === id ? { ...it, ...patch } : it
      ),
    }));
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar item del inventario",
      message: "Esta accion no se puede deshacer.",
      variant: "warn",
      confirmLabel: "Eliminar",
    });
    if (!ok) return;
    onUpdate((a) => ({
      ...a,
      inventoryItems: a.inventoryItems.filter((it) => it.id !== id),
    }));
    toast.info("Item eliminado");
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" />
          Inventario ({items.length})
        </h2>
        {!readOnly && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-md bg-accent text-white px-3 py-1.5 text-xs font-medium hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar item
          </button>
        )}
      </div>

      {/* Filtros */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as InventoryCategory | "all")
            }
            className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-accent"
          >
            <option value="all">Todas las categorias</option>
            {(Object.keys(CATEGORY_LABEL) as InventoryCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          {acta.rooms.length > 0 && (
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-accent"
            >
              <option value="all">Todos los ambientes</option>
              {acta.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {adding && (
        <InventoryItemForm
          rooms={acta.rooms}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-500">
          {items.length === 0
            ? "Sin items registrados. Agrega muebles, electrodomesticos, llaves o cualquier elemento del inmueble."
            : "Ningun item coincide con el filtro"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              rooms={acta.rooms}
              readOnly={readOnly}
              onUpdate={(patch) => handleUpdate(item.id, patch)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================
// Item card / form
// ============================================

function InventoryItemCard({
  item,
  rooms,
  readOnly,
  onUpdate,
  onDelete,
}: {
  item: InventoryItem;
  rooms: Room[];
  readOnly: boolean;
  onUpdate: (patch: Partial<InventoryItem>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const room = rooms.find((r) => r.id === item.roomId);

  if (editing && !readOnly) {
    return (
      <InventoryItemForm
        initial={item}
        rooms={rooms}
        onSave={(updated) => {
          onUpdate(updated);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-start gap-3"
      >
        <div className="rounded-md bg-gray-100 text-gray-600 p-2 shrink-0">
          <Package className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
            {item.quantity > 1 && (
              <span className="text-xs font-mono text-gray-500">
                ×{item.quantity}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border bg-gray-50 text-gray-600 border-gray-200">
              {CATEGORY_LABEL[item.category]}
            </span>
            <span
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider",
                CONDITION_COLOR[item.condition]
              )}
            >
              {CONDITION_LABEL[item.condition]}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
            {room && <span>Ambiente: {room.name}</span>}
            {item.brand && <span>· {item.brand}</span>}
            {item.model && <span>· {item.model}</span>}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-2 text-xs">
          {item.serialNumber && (
            <div>
              <span className="text-gray-500">N/Serie:</span>{" "}
              <span className="font-mono text-gray-800">{item.serialNumber}</span>
            </div>
          )}
          {item.manualObservations && (
            <div>
              <span className="text-gray-500 block mb-0.5">Observaciones:</span>
              <p className="text-gray-700 leading-relaxed">
                {item.manualObservations}
              </p>
            </div>
          )}
          {!readOnly && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-[11px] text-gray-700 hover:bg-gray-200"
              >
                <Edit2 className="h-3 w-3" />
                Editar
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InventoryItemForm({
  initial,
  rooms,
  onSave,
  onCancel,
}: {
  initial?: InventoryItem;
  rooms: Room[];
  onSave: (
    item: Omit<InventoryItem, "id" | "actaId">
  ) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<InventoryCategory>(
    initial?.category ?? "furniture"
  );
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [serialNumber, setSerialNumber] = useState(initial?.serialNumber ?? "");
  const [condition, setCondition] = useState<ConditionLevel>(
    initial?.condition ?? "bueno"
  );
  const [roomId, setRoomId] = useState<string>(
    initial?.roomId ?? rooms[0]?.id ?? ""
  );
  const [observations, setObservations] = useState(
    initial?.manualObservations ?? ""
  );

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      roomId,
      name: name.trim(),
      category,
      quantity: Math.max(1, quantity),
      brand: brand.trim() || null,
      model: model.trim() || null,
      serialNumber: serialNumber.trim() || null,
      condition,
      aiDescription: initial?.aiDescription ?? null,
      manualObservations: observations.trim() || null,
      photoIds: initial?.photoIds ?? [],
    });
  };

  return (
    <div className="rounded-md border border-accent-light bg-accent-softer/30 p-3 mb-2 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <input
          type="text"
          placeholder="Nombre del item (ej. Sofa de cuero)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="input"
        />
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="input w-20"
          placeholder="Cant"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as InventoryCategory)}
          className="input"
        >
          {(Object.keys(CATEGORY_LABEL) as InventoryCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as ConditionLevel)}
          className="input"
        >
          <option value="excelente">Excelente</option>
          <option value="bueno">Bueno</option>
          <option value="regular">Regular</option>
          <option value="malo">Malo</option>
          <option value="no_evaluado">Sin evaluar</option>
        </select>
      </div>
      {rooms.length > 0 && (
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="input"
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              Ambiente: {r.name}
            </option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Marca (opc)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Modelo (opc)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="N/Serie (opc)"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="input"
        />
      </div>
      <textarea
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        placeholder="Observaciones (opcional)"
        rows={2}
        className="input resize-none"
      />

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="rounded-md bg-accent text-white px-3 py-1.5 text-xs font-medium hover:bg-accent-dim disabled:opacity-30"
        >
          {initial ? "Guardar cambios" : "Agregar"}
        </button>
      </div>

      <style jsx>{`
        .input {
          background-color: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.375rem;
          padding: 0.375rem 0.625rem;
          font-size: 0.8125rem;
          color: rgb(31 41 55);
          width: 100%;
        }
        .input:focus {
          outline: none;
          border-color: rgb(22 163 74);
        }
      `}</style>
    </div>
  );
}

