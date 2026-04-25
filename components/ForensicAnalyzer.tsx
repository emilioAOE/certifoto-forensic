"use client";

import { useState, useCallback } from "react";
import type { FileEntry, PhotoAnalysis } from "@/lib/types";
import { parseClientSide } from "@/lib/parse-client";
import { runConsistencyChecks } from "@/lib/consistency";
import { DropZone } from "./upload/DropZone";
import { FileQueue } from "./upload/FileQueue";
import { PhotoCard } from "./analysis/PhotoCard";
import { ExportButtons } from "./report/ExportButtons";
import { Shield } from "lucide-react";

let nextId = 0;
function genId() {
  return `photo-${++nextId}-${Date.now()}`;
}

export function ForensicAnalyzer() {
  const [entries, setEntries] = useState<FileEntry[]>([]);

  const updateEntry = useCallback(
    (id: string, patch: Partial<FileEntry>) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      );
    },
    []
  );

  const analyzeFile = useCallback(
    async (file: File, id: string) => {
      try {
        // Phase 1: Client-side parsing
        updateEntry(id, { status: "parsing" });
        const analysis = await parseClientSide(file, id);

        // Phase 2: Server-side analysis
        updateEntry(id, { status: "server-analysis" });

        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const serverData = await res.json();

            // El servidor puede responder ok=true con warnings parciales
            // (por ejemplo si pHash fallo pero metadata si)
            const sd = serverData.ok ? serverData : null;

            // Merge server data — solo si vino algo util
            const merged: PhotoAnalysis = {
              ...analysis,
              file: {
                ...analysis.file,
                phash: sd?.phash ?? analysis.file.phash,
                width: sd?.width ?? analysis.file.width,
                height: sd?.height ?? analysis.file.height,
              },
              thumbnail: {
                ...analysis.thumbnail,
                dataUrl: analysis.thumbnail.dataUrl ?? sd?.thumbnailBase64 ?? null,
              },
            };

            // Re-run consistency checks with updated data
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { consistency: _prev, ...partial } = merged;
            const consistency = runConsistencyChecks(partial);

            updateEntry(id, {
              status: "complete",
              analysis: { ...merged, consistency },
            });
            return;
          }
        } catch {
          // Server analysis failed, use client-only results
        }

        updateEntry(id, { status: "complete", analysis });
      } catch (err) {
        updateEntry(id, {
          status: "error",
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    },
    [updateEntry]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const newEntries: FileEntry[] = files.map((file) => ({
        id: genId(),
        file,
        status: "idle" as const,
        error: null,
        analysis: null,
        expanded: files.length === 1,
      }));

      setEntries((prev) => [...prev, ...newEntries]);

      // Start analysis for each file
      for (const entry of newEntries) {
        analyzeFile(entry.file, entry.id);
      }
    },
    [analyzeFile]
  );

  const toggleExpanded = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e))
    );
  }, []);

  const completedAnalyses = entries
    .filter((e) => e.analysis)
    .map((e) => e.analysis!);

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
            Verificar evidencia
          </h1>
          <p className="text-sm text-muted mt-1">
            Analisis forense de metadata para verificar la autenticidad de imagenes.
            Util para validar fotos antes o despues de cargarlas a un acta.
          </p>
        </div>

        <div className="space-y-6">
        <DropZone
          onFilesSelected={handleFiles}
          disabled={entries.some(
            (e) => e.status === "parsing" || e.status === "server-analysis"
          )}
        />

        <FileQueue entries={entries} />

        {/* Results */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Resultados ({completedAnalyses.length} de {entries.length})
                </h2>
              </div>

              {completedAnalyses.length > 0 && (
                <ExportButtons analyses={completedAnalyses} />
              )}
            </div>

            <div className="space-y-3">
              {entries.map((entry) => (
                <PhotoCard
                  key={entry.id}
                  entry={entry}
                  onToggle={() => toggleExpanded(entry.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted text-sm">
              Sube una o mas fotos para analizar su metadata, verificar su
              autenticidad y generar un informe pericial.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
