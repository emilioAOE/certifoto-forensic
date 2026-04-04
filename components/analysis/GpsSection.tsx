"use client";

import dynamic from "next/dynamic";
import type { GpsData } from "@/lib/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataRow } from "@/components/ui/DataRow";
import { MapPin, ExternalLink } from "lucide-react";
import { formatCoordinate } from "@/lib/format";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-lg bg-surface-200 animate-pulse flex items-center justify-center">
      <span className="text-muted text-sm">Cargando mapa...</span>
    </div>
  ),
});

interface GpsSectionProps {
  data: GpsData;
}

export function GpsSection({ data }: GpsSectionProps) {
  if (data.latitude === null || data.longitude === null) {
    return (
      <div>
        <SectionHeader icon={<MapPin className="h-4 w-4" />} title="GPS" />
        <p className="text-sm text-muted">Sin datos de geolocalizacion</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader icon={<MapPin className="h-4 w-4" />} title="GPS" />

      <div className="mb-3 rounded-lg overflow-hidden border border-surface-300">
        <LeafletMap lat={data.latitude} lng={data.longitude} />
      </div>

      <div>
        <DataRow
          label="Latitud"
          value={`${data.latitude.toFixed(6)} (${formatCoordinate(data.latitude, true)})`}
        />
        <DataRow
          label="Longitud"
          value={`${data.longitude.toFixed(6)} (${formatCoordinate(data.longitude, false)})`}
        />
        <DataRow
          label="Altitud"
          value={
            data.altitude !== null
              ? `${data.altitude.toFixed(1)} m ${data.altitudeRef === "1" ? "(bajo nivel del mar)" : ""}`
              : null
          }
        />
        <DataRow
          label="Direccion"
          value={
            data.direction !== null
              ? `${data.direction.toFixed(1)}\u00B0 ${data.directionRef ?? ""}`
              : null
          }
        />
        <DataRow
          label="Velocidad"
          value={
            data.speed !== null
              ? `${data.speed.toFixed(1)} ${data.speedRef === "K" ? "km/h" : data.speedRef ?? ""}`
              : null
          }
        />
      </div>

      {data.googleMapsUrl && (
        <a
          href={data.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-accent hover:text-accent-dim transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver en Google Maps
        </a>
      )}
    </div>
  );
}
