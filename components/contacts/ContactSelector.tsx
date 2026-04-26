"use client";

import { useEffect, useRef, useState } from "react";
import { Search, User, Mail, IdCard } from "lucide-react";
import { searchContacts } from "@/lib/contacts";
import type { Contact, PartyRole } from "@/lib/acta-types";
import { PARTY_ROLE_LABEL } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

interface ContactSelectorProps {
  value: string;
  onTextChange: (text: string) => void;
  onSelectContact: (contact: Contact) => void;
  placeholder?: string;
  /** Filtrar contactos por rol preferente (opcional) */
  preferRole?: PartyRole;
  className?: string;
}

/**
 * Input de nombre con typeahead contra la agenda de contactos.
 * Si el usuario tipea y hay matches, los muestra. Al elegir uno, dispara
 * onSelectContact con el contact completo (para que el padre auto-llene RUT,
 * email, telefono, etc.).
 */
export function ContactSelector({
  value,
  onTextChange,
  onSelectContact,
  placeholder = "Nombre completo",
  preferRole,
  className,
}: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

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

  let suggestions = value.trim().length > 0 ? searchContacts(value, 6) : [];
  if (preferRole) {
    // Re-rank: contactos con preferredRole === preferRole primero
    suggestions = [
      ...suggestions.filter((c) => c.preferredRole === preferRole),
      ...suggestions.filter((c) => c.preferredRole !== preferRole),
    ];
  }

  const handleSelect = (c: Contact) => {
    onSelectContact(c);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      if (suggestions.length > 0) setOpen(true);
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
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onTextChange(e.target.value);
          setOpen(e.target.value.trim().length > 0);
          setActiveIdx(-1);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="input"
      />

      {open && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          role="listbox"
        >
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-1.5 border-b border-gray-100 bg-gray-50">
            En tu agenda
          </div>
          {suggestions.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(c);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={cn(
                "w-full text-left px-3 py-2 border-b border-gray-100 last:border-0 transition-colors flex items-start gap-2",
                i === activeIdx ? "bg-accent-softer" : "hover:bg-gray-50"
              )}
            >
              <User className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 truncate">
                  <span>{PARTY_ROLE_LABEL[c.preferredRole]}</span>
                  {c.documentId && (
                    <span className="inline-flex items-center gap-0.5">
                      <IdCard className="h-2.5 w-2.5" />
                      {c.documentId}
                    </span>
                  )}
                  {c.email && (
                    <span className="inline-flex items-center gap-0.5 truncate">
                      <Mail className="h-2.5 w-2.5" />
                      {c.email}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!open && value.trim().length > 0 && suggestions.length === 0 && (
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Search className="h-2.5 w-2.5" />
          Nuevo contacto · se guardara en tu agenda
        </p>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          background-color: white;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.375rem;
          padding: 0.375rem 0.625rem;
          font-size: 0.8125rem;
          color: rgb(31 41 55);
        }
        .input::placeholder {
          color: rgb(156 163 175);
        }
        .input:focus {
          outline: none;
          border-color: rgb(22 163 74);
        }
      `}</style>
    </div>
  );
}
