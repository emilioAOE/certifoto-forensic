"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  GitCompare,
  Image as ImageIcon,
} from "lucide-react";
import {
  getActa,
  listActas,
  getProperty,
  subscribeToStorageChanges,
} from "@/lib/storage";
import type { Acta, Property } from "@/lib/acta-types";
import { ACTA_TYPE_LABEL } from "@/lib/acta-constants";
import { compareActas, type RoomComparison, type PhotoPair } from "@/lib/comparison";
import {
  CHANGE_LEVEL_LABEL,
  CHANGE_LEVEL_COLOR,
  type ChangeLevel,
} from "@/lib/phash-distance";
import { cn } from "@/lib/cn";

export function CompareView({ actaId }: { actaId: string }) {
  const [acta, setActa] = useState<Acta | null>(null);
  const [otherActa, setOtherActa] = useState<Acta | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [actasInProperty, setActasInProperty] = useState<Acta[]>([]);
  const [otherId, setOtherId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    const a = getActa(actaId);
    if (!a) {
      setActa(null);
      return;
    }
    setActa(a);
    setProperty(getProperty(a.propertyId));

    // Otras actas de la misma propiedad
    const all = listActas().filter(
      (x) => x.propertyId === a.propertyId && x.id !== a.id
    );
    setActasInProperty(all);

    // Resolver el "otherActa": primero relatedEntregaActaId, luego otherId,
    // luego la entrega mas reciente automaticamente
    let target: Acta | null = null;
    if (otherId) {
      target = all.find((x) => x.id === otherId) ?? null;
    } else if (a.relatedEntregaActaId) {
      target = all.find((x) => x.id === a.relatedEntregaActaId) ?? null;
    } else if (a.type === "devolucion") {
      target =
        all
          .filter((x) => x.type === "entrega")
          .sort(
            (x, y) =>
              new Date(y.updatedAt).getTime() -
              new Date(x.updatedAt).getTime()
          )[0] ?? null;
    } else if (a.type === "entrega") {
      target =
        all
          .filter((x) => x.type === "devolucion")
          .sort(
            (x, y) =>
              new Date(y.updatedAt).getTime() -
              new Date(x.updatedAt).getTime()
          )[0] ?? null;
    }
    setOtherActa(target);
  };

  useEffect(() => {
    setMounted(true);
    refresh();
    const unsub = subscribeToStorageChanges(refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actaId, otherId]);

  // Determinar before/after segun el tipo
  const { before, after } = useMemo(() => {
    if (!acta || !otherActa) return { before: null, after: null };
    if (acta.type === "devolucion" && otherActa.type === "entrega") {
      return { before: otherActa, after: acta };
    }
    if (acta.type === "entrega" && otherActa.type === "devolucion") {
      return { before: acta, after: otherActa };
    }
    // Si los tipos no encajan, usar la mas antigua como before
    if (
      new Date(acta.createdAt).getTime() <
      new Date(otherActa.createdAt).getTime()
    ) {
      return { before: acta, after: otherActa };
    }
    return { before: otherActa, after: acta };
  }, [acta, otherActa]);

  const comparison = useMemo(() => {
    if (!before || !after) return null;
    return compareActas(before, after);
  }, [before, after]);

  if (!mounted) return null;

  if (!acta) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg text-gray-800">Acta no encontrada</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <Link
          href={`/actas/${actaId}`}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al acta
        </Link>
      </div>

      <header className="flex items-start gap-4 flex-wrap">
        <div className="rounded-lg bg-accent-softer text-accent-dark p-3 shrink-0">
          <GitCompare className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Comparacion de actas
          </h1>
          {property && (
            <p className="text-sm text-gray-600 mt-1">
              {property.address}
              {property.unit && ` · ${property.unit}`} · {property.commune}
            </p>
          )}
        </div>
      </header>

      {/* Selector de comparacion */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <ActaCard
            acta={before}
            label="Antes"
            isCurrent={acta.id === before?.id}
          />
          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
          </div>
          <ActaCard
            acta={after}
            label="Despues"
            isCurrent={acta.id === after?.id}
          />
        </div>

        {actasInProperty.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
              Comparar contra:
            </label>
            <select
              value={otherActa?.id ?? ""}
              onChange={(e) => setOtherId(e.target.value || null)}
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-accent"
            >
              <option value="">— Seleccionar otra acta —</option>
              {actasInProperty.map((a) => (
                <option key={a.id} value={a.id}>
                  {ACTA_TYPE_LABEL[a.type]} ·{" "}
                  {new Date(a.createdAt).toLocaleDateString("es-CL")}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {!comparison && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
          <AlertCircle className="h-5 w-5 text-amber-600 mx-auto mb-2" />
          <p className="text-sm text-amber-900 font-medium">
            No hay otra acta para comparar
          </p>
          <p className="text-xs text-amber-800 mt-1">
            Crea un acta de devolucion (o entrega) para esta propiedad y vuelve aqui.
          </p>
        </div>
      )}

      {comparison && (
        <>
          <SummaryCard comparison={comparison} />

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Comparacion por ambiente ({comparison.rooms.length})
            </h2>
            <div className="space-y-3">
              {comparison.rooms.map((room, i) => (
                <RoomComparisonCard key={i} room={room} />
              ))}
            </div>
          </section>

          {(comparison.removedRooms.length > 0 || comparison.addedRooms.length > 0) && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">
                Diferencias estructurales
              </h3>
              {comparison.removedRooms.length > 0 && (
                <p className="text-xs text-amber-800 mb-1">
                  · Ambientes solo en el antes:{" "}
                  <span className="font-medium">
                    {comparison.removedRooms.map((r) => r.name).join(", ")}
                  </span>
                </p>
              )}
              {comparison.addedRooms.length > 0 && (
                <p className="text-xs text-amber-800">
                  · Ambientes solo en el despues:{" "}
                  <span className="font-medium">
                    {comparison.addedRooms.map((r) => r.name).join(", ")}
                  </span>
                </p>
              )}
            </section>
          )}

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-[11px] text-gray-600 leading-relaxed">
            <strong>Como leer esta comparacion:</strong> el pareo de fotos usa
            el hash perceptual (pHash) calculado al momento de cargar cada
            imagen. La distancia de Hamming entre dos pHashes cuantifica que
            tan distintas son visualmente. Esta herramienta es referencial: las
            partes deben revisar manualmente cualquier hallazgo antes de
            atribuir responsabilidades.
          </div>
        </>
      )}
    </div>
  );
}

function ActaCard({
  acta,
  label,
  isCurrent,
}: {
  acta: Acta | null;
  label: string;
  isCurrent: boolean;
}) {
  if (!acta) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          {label}
        </div>
        <div className="text-sm text-gray-400">No hay acta</div>
      </div>
    );
  }
  return (
    <Link
      href={`/actas/${acta.id}`}
      className={cn(
        "block rounded-md border bg-white p-3 hover:border-accent transition-colors",
        isCurrent ? "border-accent" : "border-gray-200"
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-900">
        {ACTA_TYPE_LABEL[acta.type]}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {new Date(acta.createdAt).toLocaleDateString("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
      <div className="text-[11px] text-gray-500 mt-1">
        {acta.photos.length} foto(s) · {acta.rooms.length} ambiente(s)
      </div>
    </Link>
  );
}

function SummaryCard({
  comparison,
}: {
  comparison: ReturnType<typeof compareActas>;
}) {
  const s = comparison.summary;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Resumen
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Ambientes comparados" value={s.totalRooms} />
        <Stat
          label="Con cambios relevantes"
          value={s.roomsWithChanges}
          accent={s.roomsWithChanges > 0 ? "warn" : "ok"}
        />
        <Stat label="Fotos comparadas" value={s.photosCompared} />
        <Stat
          label="Solo en devolucion"
          value={s.photosOnlyInAfter}
          accent={s.photosOnlyInAfter > 0 ? "warn" : "ok"}
        />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">Cambio mas relevante: </span>
        <span
          className={cn(
            "text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border ml-1",
            CHANGE_LEVEL_COLOR[s.worstChange]
          )}
        >
          {CHANGE_LEVEL_LABEL[s.worstChange]}
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "ok" | "warn";
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn(
          "text-2xl font-bold mt-0.5",
          accent === "warn" && value > 0 ? "text-amber-600" : "text-gray-900"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function RoomComparisonCard({ room }: { room: RoomComparison }) {
  const noChanges =
    room.worstChange === "identical" &&
    room.unmatchedAfter.length === 0 &&
    room.conditionBefore === room.conditionAfter;

  return (
    <details
      className="rounded-lg border border-gray-200 bg-white overflow-hidden group"
      open={!noChanges}
    >
      <summary className="cursor-pointer p-4 hover:bg-gray-50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              {room.roomName}
            </h3>
            <ChangeBadge level={room.worstChange} />
          </div>
          <div className="text-xs text-gray-500">
            {room.pairs.length} foto(s) comparada(s)
            {room.unmatchedAfter.length > 0 &&
              ` · ${room.unmatchedAfter.length} solo en despues`}
          </div>
        </div>
      </summary>

      <div className="p-4 border-t border-gray-100 space-y-4">
        {/* Cambios estructurales del ambiente */}
        {(room.conditionBefore !== room.conditionAfter ||
          room.observationsBefore !== room.observationsAfter) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-md bg-gray-50 border border-gray-200 p-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                Estado antes
              </div>
              <div className="text-gray-800">{room.conditionBefore}</div>
              {room.observationsBefore && (
                <p className="text-gray-600 mt-1">{room.observationsBefore}</p>
              )}
            </div>
            <div className="rounded-md bg-gray-50 border border-gray-200 p-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                Estado despues
              </div>
              <div className="text-gray-800">{room.conditionAfter ?? "—"}</div>
              {room.observationsAfter && (
                <p className="text-gray-600 mt-1">{room.observationsAfter}</p>
              )}
            </div>
          </div>
        )}

        {/* Pares de fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {room.pairs.map((pair, i) => (
            <PhotoPairCard key={i} pair={pair} />
          ))}
        </div>

        {room.unmatchedAfter.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2">
              Solo en devolucion (sin par en entrega)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {room.unmatchedAfter.map((p) => (
                <div
                  key={p.id}
                  className="aspect-square rounded-md overflow-hidden border border-amber-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.dataUrl}
                    alt={p.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {noChanges && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-emerald-800">
              No se detectan cambios visibles relevantes en este ambiente
            </span>
          </div>
        )}
      </div>
    </details>
  );
}

function PhotoPairCard({ pair }: { pair: PhotoPair }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        <div className="aspect-square bg-white relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pair.before.dataUrl}
            alt="Antes"
            className="w-full h-full object-cover"
          />
          <span className="absolute top-1 left-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-900/70 text-white">
            Antes
          </span>
        </div>
        {pair.after ? (
          <div className="aspect-square bg-white relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pair.after.dataUrl}
              alt="Despues"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-1 left-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-900/70 text-white">
              Despues
            </span>
          </div>
        ) : (
          <div className="aspect-square bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 px-2 text-center">
            Sin par en devolucion
          </div>
        )}
      </div>
      <div className="p-2 flex items-center justify-between gap-2">
        <ChangeBadge level={pair.changeLevel} />
        {isFinite(pair.distance) && (
          <span className="text-[10px] font-mono text-gray-500">
            d={pair.distance}
          </span>
        )}
      </div>
    </div>
  );
}

function ChangeBadge({ level }: { level: ChangeLevel }) {
  return (
    <span
      className={cn(
        "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border",
        CHANGE_LEVEL_COLOR[level]
      )}
    >
      {CHANGE_LEVEL_LABEL[level]}
    </span>
  );
}
