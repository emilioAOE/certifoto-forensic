"use client";

import type { CheckStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const statusConfig: Record<CheckStatus, { icon: string; className: string }> = {
  pass: { icon: "\u2705", className: "badge-pass" },
  warn: { icon: "\u26A0\uFE0F", className: "badge-warn" },
  fail: { icon: "\uD83D\uDD34", className: "badge-fail" },
  info: { icon: "\u2139\uFE0F", className: "badge-info" },
  unknown: { icon: "\u2753", className: "badge-unknown" },
};

interface BadgeProps {
  status: CheckStatus;
  label: string;
  detail?: string;
  compact?: boolean;
}

export function Badge({ status, label, detail, compact }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono",
        config.className
      )}
      title={detail || label}
    >
      <span>{config.icon}</span>
      {!compact && <span>{label}</span>}
    </span>
  );
}
