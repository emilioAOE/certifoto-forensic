"use client";

import type { C2paData } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";

interface C2paSectionProps {
  data: C2paData;
}

export function C2paSection({ data }: C2paSectionProps) {
  return (
    <div>
      <SectionHeader
        icon={<Shield className="h-4 w-4" />}
        title="C2PA / Content Credentials"
      />

      {data.detected ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Content Credentials detectados
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Se encontraron {data.markers.length} marcadores JUMBF/C2PA en el archivo.
            Esto indica que la imagen contiene firma de procedencia digital.
          </p>
          <div className="space-y-1 mt-2">
            {data.markers.map((m, i) => (
              <div
                key={i}
                className="text-xs font-mono text-gray-600 bg-white rounded px-2 py-1"
              >
                [{m.label}] offset: 0x{m.offset.toString(16).toUpperCase()}, {m.length} bytes
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-muted" />
            <span className="text-sm text-gray-600">
              Sin firma de procedencia C2PA
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Esta imagen no contiene Content Credentials. Esto es normal para la mayoria de fotos actuales.
            C2PA es un estandar emergente adoptado por Adobe, Google, Microsoft y fabricantes de camaras.
          </p>
        </div>
      )}
    </div>
  );
}
