"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Plus,
  Search,
  FileSignature,
  Calendar,
} from "lucide-react";
import {
  listProperties,
  listActas,
  subscribeToStorageChanges,
} from "@/lib/storage";
import type { Property, Acta } from "@/lib/acta-types";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
  PROPERTY_TYPE_LABEL,
} from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

export function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [actas, setActas] = useState<Acta[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    setProperties(listProperties());
    setActas(listActas());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
  }, []);

  const propertiesWithStats = useMemo(() => {
    return properties.map((p) => {
      const propActas = actas.filter((a) => a.propertyId === p.id);
      const sorted = propActas
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      const lastActa = sorted[0] ?? null;
      const status = inferOccupationStatus(propActas);
      return {
        ...p,
        actasCount: propActas.length,
        lastActa,
        occupation: status,
      };
    });
  }, [properties, actas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return propertiesWithStats;
    return propertiesWithStats.filter(
      (p) =>
        p.address.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.unit?.toLowerCase().includes(q) ||
        p.internalCode?.toLowerCase().includes(q)
    );
  }, [propertiesWithStats, search]);

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Mis Propiedades
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {properties.length} propiedad{properties.length !== 1 ? "es" : ""} documentada
            {properties.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/actas/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva acta
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por direccion, comuna, codigo..."
          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasProperties={properties.length > 0} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({
  property,
}: {
  property: Property & {
    actasCount: number;
    lastActa: Acta | null;
    occupation: OccupationStatus;
  };
}) {
  return (
    <Link
      href={`/propiedades/${property.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-4 hover:border-accent hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-md bg-accent-softer text-accent-dark p-2 shrink-0">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-accent-dark transition-colors">
            {property.address}
            {property.unit && ` · ${property.unit}`}
          </h3>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.commune}
            {property.city && `, ${property.city}`}
          </p>
        </div>
        <OccupationBadge status={property.occupation} />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="inline-flex items-center gap-1">
          <FileSignature className="h-3 w-3" />
          {property.actasCount} acta{property.actasCount !== 1 ? "s" : ""}
        </span>
        {property.lastActa && (
          <span className="inline-flex items-center gap-1 truncate">
            <Calendar className="h-3 w-3" />
            Ultima:{" "}
            {ACTA_TYPE_LABEL[property.lastActa.type].replace("Acta de ", "")}
          </span>
        )}
        <span className="ml-auto inline-flex items-center text-[10px] font-mono text-gray-400 uppercase tracking-wider">
          {PROPERTY_TYPE_LABEL[property.propertyType]}
        </span>
      </div>

      {property.lastActa && (
        <div className="mt-2">
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
              ACTA_STATUS_COLOR[property.lastActa.status]
            )}
          >
            {ACTA_STATUS_LABEL[property.lastActa.status]}
          </span>
        </div>
      )}
    </Link>
  );
}

function EmptyState({ hasProperties }: { hasProperties: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 px-4 text-center">
      <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-700">
        {hasProperties
          ? "No hay propiedades que coincidan con el filtro"
          : "Aun no tienes propiedades documentadas"}
      </p>
      {!hasProperties && (
        <>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Las propiedades se crean automaticamente cuando creas tu primera acta
          </p>
          <Link
            href="/actas/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear primera acta
          </Link>
        </>
      )}
    </div>
  );
}

// ============================================
// Helpers de estado de ocupacion
// ============================================

type OccupationStatus = "vacante" | "ocupada" | "en_proceso" | "desconocida";

function inferOccupationStatus(actas: Acta[]): OccupationStatus {
  if (actas.length === 0) return "desconocida";
  const sorted = actas
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const last = sorted[0];

  if (last.type === "devolucion" && last.status === "closed") return "vacante";
  if (last.type === "entrega" && last.status === "closed") return "ocupada";
  if (
    last.status === "draft" ||
    last.status === "evidence_collection" ||
    last.status === "review" ||
    last.status === "pending_signatures"
  ) {
    return "en_proceso";
  }
  return "desconocida";
}

function OccupationBadge({ status }: { status: OccupationStatus }) {
  const config: Record<OccupationStatus, { label: string; className: string }> = {
    vacante: {
      label: "Vacante",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    ocupada: {
      label: "Ocupada",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    en_proceso: {
      label: "En proceso",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    desconocida: {
      label: "—",
      className: "bg-gray-100 text-gray-500 border-gray-200",
    },
  };
  const c = config[status];
  return (
    <span
      className={cn(
        "shrink-0 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
        c.className
      )}
    >
      {c.label}
    </span>
  );
}
