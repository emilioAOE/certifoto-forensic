"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  side?: "top" | "bottom";
  /** Si solo quieres un icono ? con tooltip, no pasar children */
  iconLabel?: string;
  className?: string;
}

/**
 * Tooltip simple, accesible:
 * - Si pasas children, se envuelve y el tooltip aparece al hover/focus
 * - Si no pasas children, renderiza un icono ? como trigger
 * - Soporta keyboard navigation: focusable, Escape lo cierra
 * - Usa aria-describedby
 *
 * Para tooltips siempre visibles o anclados a un campo, mejor usar
 * texto helper directo en el form (este es para definiciones puntuales).
 */
export function Tooltip({
  content,
  children,
  side = "top",
  iconLabel = "Mas informacion",
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      {children ? (
        <button
          ref={triggerRef}
          type="button"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          aria-describedby={open ? tooltipId : undefined}
          className="inline-flex items-center cursor-help"
        >
          {children}
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-label={iconLabel}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          aria-describedby={open ? tooltipId : undefined}
          className="inline-flex items-center text-gray-400 hover:text-gray-700 cursor-help"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute z-40 left-1/2 -translate-x-1/2 w-64 max-w-[80vw] rounded-md bg-gray-900 text-white text-xs leading-relaxed px-3 py-2 shadow-lg pointer-events-none",
            side === "top"
              ? "bottom-full mb-2"
              : "top-full mt-2"
          )}
        >
          {content}
          <span
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45",
              side === "top" ? "top-full -mt-1" : "bottom-full -mb-1"
            )}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
