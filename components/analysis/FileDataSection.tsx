"use client";

import type { FileData } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataRow } from "@/components/ui/DataRow";
import { FileText } from "lucide-react";

interface FileDataSectionProps {
  data: FileData;
}

export function FileDataSection({ data }: FileDataSectionProps) {
  return (
    <div>
      <SectionHeader icon={<FileText className="h-4 w-4" />} title="Archivo" />
      <div className="space-y-0">
        <DataRow label="Nombre" value={data.name} />
        <DataRow label="Tamano" value={`${data.sizeHuman} (${data.size.toLocaleString()} bytes)`} />
        <DataRow label="Tipo MIME" value={data.mimeType} />
        <DataRow
          label="Dimensiones"
          value={data.width && data.height ? `${data.width} x ${data.height} px` : null}
        />
        <DataRow label="SHA-256" value={data.sha256} mono />
        <DataRow label="pHash" value={data.phash} mono />
      </div>
    </div>
  );
}
