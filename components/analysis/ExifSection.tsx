"use client";

import { useState } from "react";
import type { ExifTemporal, ExifDevice, ExifCapture, ExifImage } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataRow } from "@/components/ui/DataRow";
import { cn } from "@/lib/cn";
import { Camera } from "lucide-react";
import { formatDate } from "@/lib/format";

interface ExifSectionProps {
  temporal: ExifTemporal;
  device: ExifDevice;
  capture: ExifCapture;
  image: ExifImage;
}

const tabs = [
  { id: "temporal", label: "Temporal" },
  { id: "device", label: "Dispositivo" },
  { id: "capture", label: "Captura" },
  { id: "image", label: "Imagen" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ExifSection({ temporal, device, capture, image }: ExifSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("temporal");

  return (
    <div>
      <SectionHeader icon={<Camera className="h-4 w-4" />} title="EXIF" />

      <div className="flex gap-1 mb-3 bg-surface-50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors",
              activeTab === tab.id
                ? "bg-surface-300 text-gray-100"
                : "text-muted hover:text-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "temporal" && (
        <div>
          <DataRow label="DateTimeOriginal" value={formatDate(temporal.dateTimeOriginal)} />
          <DataRow label="DateTimeDigitized" value={formatDate(temporal.dateTimeDigitized)} />
          <DataRow label="DateTime" value={formatDate(temporal.dateTime)} />
          <DataRow label="GPS Date" value={temporal.gpsDateStamp} />
          <DataRow label="GPS Time" value={temporal.gpsTimeStamp} />
          <DataRow label="Offset Original" value={temporal.offsetTimeOriginal} />
          <DataRow label="Offset Digitized" value={temporal.offsetTimeDigitized} />
          <DataRow label="Offset" value={temporal.offsetTime} />
        </div>
      )}

      {activeTab === "device" && (
        <div>
          <DataRow label="Fabricante" value={device.make} />
          <DataRow label="Modelo" value={device.model} />
          <DataRow label="Lente (fabricante)" value={device.lensMake} />
          <DataRow label="Lente (modelo)" value={device.lensModel} />
          <DataRow label="N/S cuerpo" value={device.serialNumber} />
          <DataRow label="Software" value={device.software} />
          <DataRow label="Host Computer" value={device.hostComputer} />
        </div>
      )}

      {activeTab === "capture" && (
        <div>
          <DataRow label="Apertura" value={capture.fNumber !== null ? `f/${capture.fNumber}` : null} />
          <DataRow label="Exposicion" value={capture.exposureTimeFormatted} />
          <DataRow label="ISO" value={capture.iso} />
          <DataRow label="Focal" value={capture.focalLength !== null ? `${capture.focalLength} mm` : null} />
          <DataRow label="Focal (35mm eq.)" value={capture.focalLength35mm !== null ? `${capture.focalLength35mm} mm` : null} />
          <DataRow label="Flash" value={capture.flash} />
          <DataRow label="Balance blancos" value={capture.whiteBalance} />
          <DataRow label="Medicion" value={capture.meteringMode} />
          <DataRow label="Modo exposicion" value={capture.exposureMode} />
          <DataRow label="Programa" value={capture.exposureProgram} />
          <DataRow label="Escena" value={capture.sceneCaptureType} />
          <DataRow label="Zoom digital" value={capture.digitalZoomRatio} />
          <DataRow label="Contraste" value={capture.contrast} />
          <DataRow label="Saturacion" value={capture.saturation} />
          <DataRow label="Nitidez" value={capture.sharpness} />
        </div>
      )}

      {activeTab === "image" && (
        <div>
          <DataRow label="Ancho" value={image.imageWidth !== null ? `${image.imageWidth} px` : null} />
          <DataRow label="Alto" value={image.imageHeight !== null ? `${image.imageHeight} px` : null} />
          <DataRow label="Orientacion" value={image.orientation} />
          <DataRow label="Espacio de color" value={image.colorSpace} />
          <DataRow label="Bits por muestra" value={image.bitsPerSample} />
          <DataRow label="Compresion" value={image.compression} />
          <DataRow label="Resolucion X" value={image.xResolution} />
          <DataRow label="Resolucion Y" value={image.yResolution} />
        </div>
      )}
    </div>
  );
}
