"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileSignature,
  Building2,
  Users,
  CornerDownLeft,
} from "lucide-react";
import {
  listActas,
  listProperties,
  listContacts,
} from "@/lib/storage";
import { ACTA_TYPE_LABEL, PARTY_ROLE_LABEL } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

interface SearchResult {
  type: "acta" | "property" | "contact";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => buildResults(query), [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const r = results[activeIdx];
      if (r) {
        router.push(r.href);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Busqueda global"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar actas, propiedades, contactos..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              {query.trim().length > 0
                ? "Sin resultados"
                : "Escribe para buscar en tus actas, propiedades y contactos"}
            </div>
          ) : (
            <ul role="listbox">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.id}`}>
                  <Link
                    href={r.href}
                    onClick={onClose}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 transition-colors",
                      i === activeIdx ? "bg-accent-softer" : "hover:bg-gray-50"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-md p-1.5 shrink-0",
                        r.type === "acta"
                          ? "bg-blue-50 text-blue-600"
                          : r.type === "property"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-purple-50 text-purple-600"
                      )}
                    >
                      {r.type === "acta" && <FileSignature className="h-3.5 w-3.5" />}
                      {r.type === "property" && <Building2 className="h-3.5 w-3.5" />}
                      {r.type === "contact" && <Users className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {r.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {r.subtitle}
                      </div>
                    </div>
                    {i === activeIdx && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono">↑↓</kbd>
            navegar
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono">↵</kbd>
            abrir
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono">esc</kbd>
            cerrar
          </span>
        </div>
      </div>
    </div>
  );
}

function buildResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const out: SearchResult[] = [];

  if (q.length === 0) return [];

  // Properties
  const props = listProperties();
  for (const p of props) {
    if (
      p.address.toLowerCase().includes(q) ||
      p.commune.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.unit?.toLowerCase().includes(q) ||
      p.internalCode?.toLowerCase().includes(q)
    ) {
      out.push({
        type: "property",
        id: p.id,
        title: `${p.address}${p.unit ? ` · ${p.unit}` : ""}`,
        subtitle: `${p.commune}, ${p.city}`,
        href: `/propiedades/${p.id}`,
      });
    }
  }

  // Contacts
  const contacts = listContacts();
  for (const c of contacts) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.documentId?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    ) {
      out.push({
        type: "contact",
        id: c.id,
        title: c.name,
        subtitle: `${PARTY_ROLE_LABEL[c.preferredRole]}${
          c.email ? ` · ${c.email}` : ""
        }`,
        href: `/contactos/${c.id}`,
      });
    }
  }

  // Actas
  const actas = listActas();
  for (const a of actas) {
    const property = props.find((p) => p.id === a.propertyId);
    const haystack = `${ACTA_TYPE_LABEL[a.type]} ${property?.address ?? ""} ${
      property?.commune ?? ""
    } ${a.parties.map((p) => p.name).join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      out.push({
        type: "acta",
        id: a.id,
        title: ACTA_TYPE_LABEL[a.type],
        subtitle: property
          ? `${property.address}${property.unit ? ` · ${property.unit}` : ""}`
          : "(sin propiedad)",
        href: `/actas/${a.id}`,
      });
    }
  }

  return out.slice(0, 12);
}
