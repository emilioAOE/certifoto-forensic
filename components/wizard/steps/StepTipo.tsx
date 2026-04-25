"use client";

import type { ActaType } from "@/lib/acta-types";
import { ACTA_TYPE_LABEL, ACTA_TYPE_DESCRIPTION } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";
import { FileText, Home, Search, Package } from "lucide-react";

const ICONS: Record<ActaType, React.ReactNode> = {
  entrega: <Home className="h-5 w-5" />,
  devolucion: <FileText className="h-5 w-5" />,
  inspeccion: <Search className="h-5 w-5" />,
  inventario: <Package className="h-5 w-5" />,
};

interface StepTipoProps {
  value: ActaType | null;
  onChange: (value: ActaType) => void;
}

export function StepTipo({ value, onChange }: StepTipoProps) {
  const types: ActaType[] = ["entrega", "devolucion", "inspeccion", "inventario"];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        ¿Que tipo de acta vas a crear?
      </h2>
      <p className="text-sm text-muted mb-5">
        Selecciona el momento del proceso de arriendo que quieres documentar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              "rounded-lg border p-4 text-left transition-all",
              value === type
                ? "border-accent bg-accent/10"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "mb-2",
                value === type ? "text-accent" : "text-muted"
              )}
            >
              {ICONS[type]}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {ACTA_TYPE_LABEL[type]}
            </div>
            <div className="text-xs text-muted mt-1 leading-relaxed">
              {ACTA_TYPE_DESCRIPTION[type]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
