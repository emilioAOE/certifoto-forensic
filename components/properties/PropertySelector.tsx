"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Building2, Plus, Check, MapPin } from "lucide-react";
import { listProperties, subscribeToStorageChanges } from "@/lib/storage";
import type { Property } from "@/lib/acta-types";
import { cn } from "@/lib/cn";

interface PropertySelectorProps {
  selectedId: string | null;
  onSelect: (property: Property | null) => void;
  className?: string;
}

/**
 * Componente que permite elegir una propiedad existente como atajo en el
 * wizard. Si se selecciona, los campos de StepPropiedad se prellenan.
 * Si no, el usuario llena todo a mano (default).
 */
export function PropertySelector({
  selectedId,
  onSelect,
  className,
}: PropertySelectorProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const refresh = () => setProperties(listProperties());

  useEffect(() => {
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const sorted = properties
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    const q = search.trim().toLowerCase();
    if (!q) return sorted.slice(0, 10);
    return sorted
      .filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.commune.toLowerCase().includes(q) ||
          p.unit?.toLowerCase().includes(q) ||
          p.internalCode?.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [properties, search]);

  if (properties.length === 0) {
    return null; // si no hay propiedades, no mostrar nada
  }

  const selected = properties.find((p) => p.id === selectedId);

  if (selected) {
    return (
      <div
        className={cn(
          "rounded-lg border border-accent bg-accent-softer/40 p-3",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-white border border-accent-light p-2 shrink-0">
            <Check className="h-4 w-4 text-accent-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-0.5">
              Propiedad seleccionada
            </div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {selected.address}
              {selected.unit && ` · ${selected.unit}`}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {selected.commune}, {selected.city}
            </div>
          </div>
          <button
            onClick={() => {
              onSelect(null);
              setExpanded(false);
            }}
            className="text-xs text-gray-500 hover:text-gray-800 shrink-0"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-gray-50 p-3", className)}>
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 text-left"
        >
          <div className="rounded-md bg-white border border-gray-200 p-2 shrink-0">
            <Building2 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">
              Usar una propiedad existente
            </div>
            <div className="text-xs text-gray-500">
              Tienes {properties.length} propiedad{properties.length !== 1 ? "es" : ""}{" "}
              guardada{properties.length !== 1 ? "s" : ""}. Selecciona una para
              prellenar los datos.
            </div>
          </div>
          <Plus className="h-4 w-4 text-gray-400" />
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Selecciona una propiedad
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Cerrar
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por direccion, comuna..."
              autoFocus
              className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-xs text-gray-500 py-3 text-center">
              No hay propiedades que coincidan
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1 -mx-1 px-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    setExpanded(false);
                  }}
                  className="w-full text-left rounded-md bg-white border border-gray-200 hover:border-accent px-3 py-2 transition-colors flex items-start gap-2"
                >
                  <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {p.address}
                      {p.unit && ` · ${p.unit}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {p.commune}, {p.city}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-[10px] text-gray-400 mt-2 text-center">
            O cierra y llena los datos a mano para crear una nueva propiedad
          </div>
        </div>
      )}
    </div>
  );
}
