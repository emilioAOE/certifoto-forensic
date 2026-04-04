"use client";

import type { IccData } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataRow } from "@/components/ui/DataRow";
import { Palette } from "lucide-react";

interface IccSectionProps {
  data: IccData;
}

export function IccSection({ data }: IccSectionProps) {
  const hasData = data.profileName || data.colorSpace || data.creator;

  if (!hasData) {
    return (
      <div>
        <SectionHeader icon={<Palette className="h-4 w-4" />} title="Perfil ICC" />
        <p className="text-sm text-muted">Sin perfil de color embebido</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader icon={<Palette className="h-4 w-4" />} title="Perfil ICC" />
      <DataRow label="Nombre" value={data.profileName} />
      <DataRow label="Espacio de color" value={data.colorSpace} />
      <DataRow label="Espacio conexion" value={data.connectionSpace} />
      <DataRow label="Creador" value={data.creator} />
      <DataRow label="Descripcion" value={data.description} />
    </div>
  );
}
