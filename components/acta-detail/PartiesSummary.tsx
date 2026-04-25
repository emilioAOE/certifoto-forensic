"use client";

import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import type { Party, Signature } from "@/lib/acta-types";
import { PARTY_ROLE_LABEL } from "@/lib/acta-constants";
import { cn } from "@/lib/cn";

interface PartiesSummaryProps {
  parties: Party[];
  signatures: Signature[];
}

export function PartiesSummary({ parties, signatures }: PartiesSummaryProps) {
  return (
    <div className="space-y-2">
      {parties.map((party) => {
        const sig = signatures.find((s) => s.partyId === party.id);
        return (
          <div
            key={party.id}
            className="flex items-center gap-3 rounded-md bg-gray-50 border border-gray-200 px-3 py-2"
          >
            <div className="shrink-0">
              {!party.canSign ? (
                <span className="text-muted text-[10px]">—</span>
              ) : sig?.status === "signed_conformity" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : sig?.status === "signed_with_observations" ? (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              ) : sig?.status === "rejected" ? (
                <XCircle className="h-4 w-4 text-danger" />
              ) : (
                <Clock className="h-4 w-4 text-muted" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 truncate">
                {party.name || (
                  <span className="italic text-muted">(sin nombre)</span>
                )}
              </div>
              <div className="text-xs text-muted truncate">
                {PARTY_ROLE_LABEL[party.role]}
                {party.email && ` · ${party.email}`}
              </div>
            </div>

            <div className="shrink-0 flex flex-wrap gap-1 justify-end">
              {party.canSign && (
                <Badge label="firma" variant="info" />
              )}
              {party.canUploadEvidence && (
                <Badge label="fotos" variant="success" />
              )}
              {party.canComment && (
                <Badge label="comenta" variant="muted" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "info" | "success" | "muted";
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-mono px-1.5 py-0.5 rounded border",
        variant === "info" && "bg-blue-50 text-blue-600 border-blue-200",
        variant === "success" &&
          "bg-emerald-50 text-emerald-600 border-emerald-200",
        variant === "muted" && "bg-gray-100 text-muted border-gray-200"
      )}
    >
      {label}
    </span>
  );
}
