"use client";

import type { ConsistencyCheck } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface ConsistencyPanelProps {
  checks: ConsistencyCheck[];
  compact?: boolean;
}

export function ConsistencyPanel({ checks, compact }: ConsistencyPanelProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {checks.map((c) => (
          <Badge key={c.id} status={c.status} label={c.label} detail={c.detail} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {checks.map((c) => (
        <div
          key={c.id}
          className="flex items-start gap-3 rounded-lg bg-surface-50 border border-surface-200 px-3 py-2"
        >
          <Badge status={c.status} label={c.label} />
          <span className="text-sm text-gray-300 leading-relaxed">
            {c.detail}
          </span>
        </div>
      ))}
    </div>
  );
}
