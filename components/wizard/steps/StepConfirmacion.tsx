"use client";

import type { WizardData } from "../ActaWizard";
import type { PhotoEvidence } from "@/lib/acta-types";
import {
  ACTA_TYPE_LABEL,
  PARTY_ROLE_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/acta-constants";
import {
  Check,
  MapPin,
  Users,
  Calendar,
  Camera,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface StepConfirmacionProps {
  data: WizardData;
}

export function StepConfirmacion({ data }: StepConfirmacionProps) {
  const roomName = (roomId: string): string => {
    const det = data.detectedRooms.find((r) => r.id === roomId);
    if (det) return det.name;
    const man = data.rooms.find((r) => `manual:${r.tempId}` === roomId);
    if (man) return man.name;
    return "Sin clasificar";
  };

  // Agrupar fotos por ambiente preservando el orden de aparicion.
  const photosByRoom: { roomId: string; photos: PhotoEvidence[] }[] = [];
  for (const photo of data.pendingPhotos) {
    let group = photosByRoom.find((g) => g.roomId === photo.roomId);
    if (!group) {
      group = { roomId: photo.roomId, photos: [] };
      photosByRoom.push(group);
    }
    group.photos.push(photo);
  }

  const analyzing = data.pendingPhotos.filter(
    (p) => p.aiStatus === "pending" || p.aiStatus === "processing"
  ).length;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Revisa antes de generar el certificado
      </h2>
      <p className="text-sm text-muted mb-5">
        Esta es tu última oportunidad de editar. Cuando generes el certificado,
        el acta queda sellada y ya no se puede modificar.
      </p>

      <div className="space-y-3">
        <Section icon={<Check className="h-4 w-4" />} title="Tipo">
          <p className="text-sm text-gray-800">
            {data.type ? ACTA_TYPE_LABEL[data.type] : "—"}
          </p>
        </Section>

        <Section icon={<MapPin className="h-4 w-4" />} title="Propiedad">
          <p className="text-sm text-gray-800">
            {data.property.address}
            {data.property.unit && ` · ${data.property.unit}`}
          </p>
          <p className="text-xs text-muted">
            {data.property.commune}, {data.property.city} ·{" "}
            {PROPERTY_TYPE_LABEL[data.property.propertyType]}
            {data.property.furnished === "yes" && " · Amoblada"}
            {data.property.furnished === "partial" && " · Parc. amoblada"}
          </p>
        </Section>

        <Section
          icon={<Calendar className="h-4 w-4" />}
          title="Fecha de inspección"
        >
          <p className="text-sm text-gray-800">
            {new Date(data.inspectionDate).toLocaleDateString("es-CL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Section>

        <Section
          icon={<Users className="h-4 w-4" />}
          title={`Partes (${data.parties.length})`}
        >
          <div className="space-y-1">
            {data.parties.map((p) => (
              <div key={p.tempId} className="text-sm">
                <span className="text-gray-800">{p.name || "(sin nombre)"}</span>
                <span className="text-muted text-xs ml-2">
                  · {PARTY_ROLE_LABEL[p.role]}
                  {p.documentId && ` · ${p.documentId}`}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Fotos y su estado (crudo, generado por IA) */}
        <Section
          icon={<Camera className="h-4 w-4" />}
          title={`Fotos y estado (${data.pendingPhotos.length})`}
        >
          {data.pendingPhotos.length === 0 ? (
            <p className="text-xs text-muted leading-relaxed">
              No subiste fotos en este paso. Puedes volver atrás y subirlas, o
              agregarlas después en el acta.
            </p>
          ) : (
            <div className="space-y-4">
              {analyzing > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-accent-dark">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Describiendo el estado de {analyzing} foto
                  {analyzing === 1 ? "" : "s"} con IA…
                </div>
              )}
              {photosByRoom.map((group) => (
                <div key={group.roomId}>
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">
                    {roomName(group.roomId)}{" "}
                    <span className="text-muted font-normal">
                      ({group.photos.length})
                    </span>
                  </p>
                  <div className="space-y-2">
                    {group.photos.map((photo) => (
                      <PhotoRow key={photo.id} photo={photo} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="mt-5 rounded-lg border border-accent-light bg-accent-softer/40 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-accent-dark shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 leading-relaxed">
            Al apretar <span className="font-semibold">Generar certificado</span>{" "}
            se sella el documento (queda inmutable, con su huella digital), se
            consume 1 crédito y el acta ya no se podrá editar. Después solo
            podrás descargarlo.
          </p>
        </div>
      </div>
    </div>
  );
}

function PhotoRow({ photo }: { photo: PhotoEvidence }) {
  const a = photo.aiAnalysis;
  const findings = a?.damageFindings ?? [];
  return (
    <div className="flex gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbnailDataUrl ?? photo.dataUrl}
        alt={photo.fileName}
        className="h-12 w-12 rounded object-cover border border-gray-200 shrink-0"
      />
      <div className="min-w-0 flex-1">
        {a ? (
          <>
            <p className="text-xs text-gray-800 leading-snug">
              {a.caption || a.conditionSummary || "Sin descripción"}
            </p>
            {findings.length > 0 && (
              <p className="text-[11px] text-amber-700 mt-0.5">
                {findings.length} hallazgo{findings.length === 1 ? "" : "s"}
                {findings.some((f) => f.needsHumanReview) && " · revisar"}
              </p>
            )}
          </>
        ) : photo.aiStatus === "error" ? (
          <p className="text-[11px] text-muted italic">
            No se pudo generar la descripción (puedes agregarla a mano después).
          </p>
        ) : (
          <p className="text-[11px] text-muted italic">Describiendo con IA…</p>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted uppercase tracking-wider">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
