"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchComunas, type Comuna, type Region } from "@/lib/chile-comunas";

interface ComunaComboboxProps {
  value: string; // nombre de comuna actual
  onChange: (comuna: string, region: Region | null) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Combobox que busca comunas chilenas en el dataset estatico.
 * Al seleccionar, devuelve el nombre y la region asociada para autollenar
 * el campo region en el formulario.
 */
export function ComunaCombobox({
  value,
  onChange,
  placeholder = "Comuna",
  className,
}: ComunaComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = query.trim().length > 0 ? searchComunas(query, 8) : [];

  const handleSelect = (item: Comuna & { region: Region }) => {
    setQuery(item.name);
    onChange(item.name, item.region);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && activeIdx < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
            // Si el usuario borra, limpiar el value tambien
            if (!e.target.value.trim()) {
              onChange("", null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Si el query no matchea exactamente con una comuna, mantener
            // el texto como value (permite escribir libremente si la comuna
            // no esta en el dataset)
            onChange(query, null);
          }}
          placeholder={placeholder}
          autoComplete="address-level2"
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((item, i) => (
            <button
              key={`${item.name}-${item.regionCode}`}
              type="button"
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => {
                // mousedown evita que el blur del input se dispare antes del click
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-0 transition-colors ${
                i === activeIdx ? "bg-accent-softer" : "hover:bg-gray-50"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">
                Region: {item.region.name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
