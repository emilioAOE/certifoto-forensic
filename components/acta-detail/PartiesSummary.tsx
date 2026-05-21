"use client";

import { User } from "lucide-react";
import type { Party } from "@/lib/acta-types";
import { PARTY_ROLE_LABEL } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

interface PartiesSummaryProps {
  parties: Party[];
}

export function PartiesSummary({ parties }: PartiesSummaryProps) {
  return (
    <div className="space-y-2">
      {parties.map((party) => (
        <div
          key={party.id}
          className="flex items-center gap-3 rounded-md bg-gray-50 border border-gray-200 px-3 py-2"
        >
          <div className="shrink-0 h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-muted" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 truncate">
              {party.name || (
                <span className="italic text-muted">(sin nombre)</span>
              )}
            </div>
            <div className="text-xs text-muted truncate">
              {PARTY_ROLE_LABEL[party.role]}
              {party.documentId && ` · ${party.documentId}`}
              {party.email && ` · ${party.email}`}
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap gap-1 justify-end">
            {party.canUploadEvidence && (
              <Badge label="fotos" variant="success" />
            )}
            {party.canComment && <Badge label="comenta" variant="muted" />}
          </div>
        </div>
      ))}
    </div>
  );
}

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "muted";
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-mono px-1.5 py-0.5 rounded border",
        variant === "success" &&
          "bg-emerald-50 text-emerald-600 border-emerald-200",
        variant === "muted" && "bg-gray-100 text-muted border-gray-200"
      )}
    >
      {label}
    </span>
  );
}
