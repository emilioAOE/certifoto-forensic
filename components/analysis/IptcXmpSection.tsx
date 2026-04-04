"use client";

import type { IptcData, XmpData } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataRow } from "@/components/ui/DataRow";
import { Tag, History } from "lucide-react";
import { formatDate } from "@/lib/format";

interface IptcXmpSectionProps {
  iptc: IptcData;
  xmp: XmpData;
}

export function IptcXmpSection({ iptc, xmp }: IptcXmpSectionProps) {
  const hasIptc =
    iptc.byline || iptc.copyright || iptc.caption || iptc.keywords.length > 0;
  const hasXmp =
    xmp.creatorTool || xmp.history.length > 0 || xmp.metadataDate;

  if (!hasIptc && !hasXmp) {
    return (
      <div>
        <SectionHeader icon={<Tag className="h-4 w-4" />} title="IPTC / XMP" />
        <p className="text-sm text-muted">Sin datos IPTC ni XMP</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasIptc && (
        <div>
          <SectionHeader icon={<Tag className="h-4 w-4" />} title="IPTC" />
          <DataRow label="Titulo" value={iptc.objectName} />
          <DataRow label="Descripcion" value={iptc.caption} />
          <DataRow label="Autor" value={iptc.byline} />
          <DataRow label="Copyright" value={iptc.copyright} />
          <DataRow label="Fuente" value={iptc.source} />
          <DataRow label="Ciudad" value={iptc.city} />
          <DataRow label="Pais" value={iptc.country} />
          {iptc.keywords.length > 0 && (
            <div className="flex justify-between gap-4 py-1.5 border-b border-surface-200">
              <span className="text-muted text-sm shrink-0">Keywords</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {iptc.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs bg-surface-200 text-gray-300 px-2 py-0.5 rounded"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasXmp && (
        <div>
          <SectionHeader icon={<History className="h-4 w-4" />} title="XMP" />
          <DataRow label="CreatorTool" value={xmp.creatorTool} />
          <DataRow label="MetadataDate" value={formatDate(xmp.metadataDate)} />
          <DataRow label="CreateDate" value={formatDate(xmp.createDate)} />
          <DataRow label="ModifyDate" value={formatDate(xmp.modifyDate)} />

          {xmp.history.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted uppercase tracking-wider mb-2">
                Historial de ediciones
              </p>
              <div className="space-y-1">
                {xmp.history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-xs bg-surface-50 border border-surface-200 rounded-md px-3 py-2"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-gray-200 font-medium">
                        {entry.action}
                      </span>
                      {entry.softwareAgent && (
                        <span className="text-muted">{entry.softwareAgent}</span>
                      )}
                      {entry.when && (
                        <span className="text-muted">{formatDate(entry.when)}</span>
                      )}
                      {entry.parameters && (
                        <span className="text-muted truncate">
                          {entry.parameters}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
