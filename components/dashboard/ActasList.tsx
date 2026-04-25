"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, FileSignature } from "lucide-react";
import { listActaSummaries } from "@/lib/storage";
import type { ActaSummary, ActaStatus, ActaType } from "@/lib/acta-types";
import {
  ACTA_TYPE_LABEL,
  ACTA_STATUS_LABEL,
  ACTA_STATUS_COLOR,
} from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

export function ActasList() {
  const [actas, setActas] = useState<ActaSummary[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActaStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ActaType | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActas(
      listActaSummaries().sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
  }, []);

  const filtered = useMemo(() => {
    return actas.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (search && !a.propertyAddress.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [actas, search, statusFilter, typeFilter]);

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 font-mono tracking-tight">
            Mis Actas
          </h1>
          <p className="text-sm text-muted mt-1">
            {actas.length} acta{actas.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/actas/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-surface px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva acta
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por direccion..."
            className="w-full bg-surface-100 border border-surface-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-muted focus:outline-none focus:border-accent/50"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ActaType | "all")}
          className="bg-surface-100 border border-surface-300 rounded-lg px-3 py-2 text-sm text-gray-200"
        >
          <option value="all">Todos los tipos</option>
          {(Object.keys(ACTA_TYPE_LABEL) as ActaType[]).map((t) => (
            <option key={t} value={t}>
              {ACTA_TYPE_LABEL[t]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ActaStatus | "all")}
          className="bg-surface-100 border border-surface-300 rounded-lg px-3 py-2 text-sm text-gray-200"
        >
          <option value="all">Todos los estados</option>
          {(Object.keys(ACTA_STATUS_LABEL) as ActaStatus[]).map((s) => (
            <option key={s} value={s}>
              {ACTA_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 py-12 px-4 text-center">
          <FileSignature className="h-10 w-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-gray-300">
            {actas.length === 0
              ? "Aun no tienes actas creadas"
              : "No hay actas que coincidan con el filtro"}
          </p>
          {actas.length === 0 && (
            <Link
              href="/actas/nueva"
              className="inline-flex items-center gap-2 mt-4 rounded-lg bg-accent text-surface px-4 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear primera acta
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((acta) => (
            <Link
              key={acta.id}
              href={`/actas/${acta.id}`}
              className="block rounded-lg border border-surface-300 bg-surface-100 p-4 hover:border-surface-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-100">
                      {ACTA_TYPE_LABEL[acta.type]}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        ACTA_STATUS_COLOR[acta.status]
                      )}
                    >
                      {ACTA_STATUS_LABEL[acta.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1 truncate">
                    {acta.propertyAddress}
                  </p>
                  <div className="text-xs text-muted mt-2 flex flex-wrap gap-3">
                    <span>{acta.roomsCount} ambientes</span>
                    <span>{acta.photosCount} fotos</span>
                    <span>
                      {acta.signaturesCount}/{acta.signaturesRequired} firmas
                    </span>
                    <span>
                      Actualizada{" "}
                      {new Date(acta.updatedAt).toLocaleDateString("es-CL")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
