"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  searchAddresses,
  type AddressSuggestion,
} from "@/lib/address-autocomplete";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input de direccion con autocompletado via Nominatim.
 * Cuando el usuario selecciona una sugerencia, dispara onSelectSuggestion
 * con todos los campos derivados (comuna, ciudad, lat/lon, etc.) para que
 * el padre pueda autollenar otros inputs.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Av. Providencia 1234",
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cerrar al hacer click fuera
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

  const fetchSuggestions = (query: string) => {
    abortRef.current?.abort();

    if (query.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    searchAddresses(query, controller.signal).then((results) => {
      if (controller.signal.aborted) return;
      setSuggestions(results);
      setLoading(false);
      setOpen(results.length > 0);
      setActiveIdx(-1);
    });
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(newValue), 350);
  };

  const handleSelect = (sug: AddressSuggestion) => {
    onChange(sug.address);
    setOpen(false);
    setSuggestions([]);
    onSelectSuggestion?.(sug);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="street-address"
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        {loading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((sug, i) => (
            <button
              key={`${sug.lat}-${sug.lon}-${i}`}
              type="button"
              role="option"
              aria-selected={i === activeIdx}
              onClick={() => handleSelect(sug)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-0 transition-colors ${
                i === activeIdx
                  ? "bg-accent-softer"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="text-sm font-medium text-gray-900 truncate">
                {sug.address}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {[sug.commune, sug.region, sug.country].filter(Boolean).join(" · ")}
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-1">
        Datos de OpenStreetMap. Si no encuentras tu direccion, ingresala a mano.
      </p>
    </div>
  );
}
