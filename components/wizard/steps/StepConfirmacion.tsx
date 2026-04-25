"use client";

import type { WizardData } from "../ActaWizard";
import {
  ACTA_TYPE_LABEL,
  PARTY_ROLE_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/acta-constants";
import { Check, MapPin, Users, Home, Calendar } from "lucide-react";

interface StepConfirmacionProps {
  data: WizardData;
}

export function StepConfirmacion({ data }: StepConfirmacionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-100 mb-1">
        Revisa antes de crear
      </h2>
      <p className="text-sm text-muted mb-5">
        Confirma los datos. Despues de crear el acta podras subir fotos por
        ambiente y solicitar firmas.
      </p>

      <div className="space-y-3">
        <Section icon={<Check className="h-4 w-4" />} title="Tipo">
          <p className="text-sm text-gray-200">
            {data.type ? ACTA_TYPE_LABEL[data.type] : "—"}
          </p>
        </Section>

        <Section icon={<MapPin className="h-4 w-4" />} title="Propiedad">
          <p className="text-sm text-gray-200">
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
          title="Fecha de inspeccion"
        >
          <p className="text-sm text-gray-200">
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
                <span className="text-gray-200">{p.name || "(sin nombre)"}</span>
                <span className="text-muted text-xs ml-2">
                  · {PARTY_ROLE_LABEL[p.role]}
                  {p.canSign && " · firma"}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          icon={<Home className="h-4 w-4" />}
          title={`Ambientes (${data.rooms.length})`}
        >
          <div className="flex flex-wrap gap-1.5">
            {data.rooms.map((r) => (
              <span
                key={r.tempId}
                className="text-xs bg-surface-200 text-gray-300 px-2 py-0.5 rounded"
              >
                {r.name}
                {r.required && (
                  <span className="text-accent ml-1">*</span>
                )}
              </span>
            ))}
          </div>
          {data.rooms.some((r) => r.required) && (
            <p className="text-[10px] text-muted mt-1.5">* Obligatorio</p>
          )}
        </Section>
      </div>

      <div className="mt-5 rounded-lg border border-info/30 bg-info/5 p-3">
        <p className="text-xs text-gray-300 leading-relaxed">
          Despues de crear el acta podras subir fotos por ambiente, agregar
          observaciones y solicitar firmas. El acta se guardara en estado{" "}
          <span className="text-accent font-medium">recopilando evidencia</span>.
        </p>
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
    <div className="rounded-lg bg-surface-50 border border-surface-200 p-3">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted uppercase tracking-wider">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
