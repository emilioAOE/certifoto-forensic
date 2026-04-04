"use client";

import type { FileEntry } from "@/lib/types";
import { Spinner } from "@/components/ui/Spinner";
import { CheckCircle, AlertCircle, FileImage } from "lucide-react";

interface FileQueueProps {
  entries: FileEntry[];
}

export function FileQueue({ entries }: FileQueueProps) {
  const pending = entries.filter((e) => e.status !== "complete" && e.status !== "error");
  if (pending.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pending.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-2 rounded-lg bg-surface-100 border border-surface-300 px-3 py-1.5 text-sm"
        >
          <FileImage className="h-4 w-4 text-muted" />
          <span className="text-gray-300 max-w-[200px] truncate">
            {entry.file.name}
          </span>
          {entry.status === "parsing" && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Spinner className="h-3 w-3" /> Leyendo...
            </span>
          )}
          {entry.status === "server-analysis" && (
            <span className="flex items-center gap-1 text-xs text-info">
              <Spinner className="h-3 w-3" /> Analizando...
            </span>
          )}
          {entry.status === "complete" && (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          )}
          {entry.status === "error" && (
            <AlertCircle className="h-4 w-4 text-danger" />
          )}
        </div>
      ))}
    </div>
  );
}
