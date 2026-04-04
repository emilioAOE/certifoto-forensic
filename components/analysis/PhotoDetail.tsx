"use client";

import type { PhotoAnalysis } from "@/lib/types";
import { FileDataSection } from "./FileDataSection";
import { ExifSection } from "./ExifSection";
import { GpsSection } from "./GpsSection";
import { IptcXmpSection } from "./IptcXmpSection";
import { IccSection } from "./IccSection";
import { ThumbnailSection } from "./ThumbnailSection";
import { C2paSection } from "./C2paSection";
import { ConsistencyPanel } from "./ConsistencyPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ShieldCheck } from "lucide-react";

interface PhotoDetailProps {
  analysis: PhotoAnalysis;
}

export function PhotoDetail({ analysis }: PhotoDetailProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
      {/* Left column */}
      <div className="space-y-6">
        <FileDataSection data={analysis.file} />
        <ExifSection
          temporal={analysis.exifTemporal}
          device={analysis.exifDevice}
          capture={analysis.exifCapture}
          image={analysis.exifImage}
        />
        <GpsSection data={analysis.gps} />
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div>
          <SectionHeader
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Senales de integridad"
          />
          <ConsistencyPanel checks={analysis.consistency} />
        </div>
        <IptcXmpSection iptc={analysis.iptc} xmp={analysis.xmp} />
        <IccSection data={analysis.icc} />
        <ThumbnailSection
          thumbnail={analysis.thumbnail}
          previewUrl={analysis.previewUrl}
        />
        <C2paSection data={analysis.c2pa} />
      </div>
    </div>
  );
}
