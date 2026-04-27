"use client";

import type { ActaModality } from "@/lib/acta-types";
import { cn } from "@/lib/cn";
import { Users, UserCheck, Building2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

const OPTIONS: {
  id: ActaModality;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "directa",
    title: "Directa",
    description: "Entre arrendador y arrendatario, sin intermediarios.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "gestionada",
    title: "Gestionada por corredor",
    description:
      "Un corredor o administrador gestiona el proceso e invita a las partes.",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    id: "organizacion",
    title: "Organizacion",
    description:
      "Cuenta de empresa con multiples ejecutivos y propiedades administradas.",
    icon: <Building2 className="h-5 w-5" />,
  },
];

interface StepModalidadProps {
  value: ActaModality | null;
  onChange: (value: ActaModality) => void;
}

export function StepModalidad({ value, onChange }: StepModalidadProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        ¿Como vas a gestionar el acta?
        <Tooltip
          content={
            <>
              La modalidad afecta los permisos por defecto de cada parte. Por
              ejemplo, en modalidad <strong>gestionada</strong>, el corredor
              tiene permiso de subir fotos por defecto y los demas no.
            </>
          }
        />
      </h2>
      <p className="text-sm text-muted mb-5">
        La modalidad define quien gestiona el proceso y los permisos por defecto
        de cada parte.
      </p>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-all flex items-start gap-3",
              value === opt.id
                ? "border-accent bg-accent/10"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "shrink-0 mt-0.5",
                value === opt.id ? "text-accent" : "text-muted"
              )}
            >
              {opt.icon}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {opt.title}
              </div>
              <div className="text-xs text-muted mt-1 leading-relaxed">
                {opt.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
