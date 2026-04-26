"use client";

import { AlertCircle, AlertTriangle, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ValidationItem {
  level: "error" | "warning";
  message: string;
  /** id de un elemento HTML al que hacer scroll cuando se hace click */
  fieldId?: string;
}

interface ValidationModalProps {
  title: string;
  description?: string;
  items: ValidationItem[];
  onClose: () => void;
  onContinue?: () => void; // si solo hay warnings, permitir continuar
  continueLabel?: string;
}

export function ValidationModal({
  title,
  description,
  items,
  onClose,
  onContinue,
  continueLabel = "Continuar de todas formas",
}: ValidationModalProps) {
  const errors = items.filter((i) => i.level === "error");
  const warnings = items.filter((i) => i.level === "warning");
  const hasErrors = errors.length > 0;

  const handleClickItem = (item: ValidationItem) => {
    if (item.fieldId) {
      const el = document.getElementById(item.fieldId);
      if (el) {
        onClose();
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if ("focus" in el && typeof (el as HTMLElement).focus === "function") {
            (el as HTMLElement).focus();
          }
        }, 100);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "rounded-full p-2 shrink-0",
                hasErrors ? "bg-red-50" : "bg-amber-50"
              )}
            >
              {hasErrors ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="pt-0.5">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              {description && (
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-4">
          {errors.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-2">
                Errores ({errors.length})
              </h3>
              <ul className="space-y-1.5">
                {errors.map((item, i) => (
                  <ItemRow key={i} item={item} onClick={() => handleClickItem(item)} />
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2">
                Advertencias ({warnings.length})
              </h3>
              <ul className="space-y-1.5">
                {warnings.map((item, i) => (
                  <ItemRow key={i} item={item} onClick={() => handleClickItem(item)} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap-reverse justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            {hasErrors ? "Volver a corregir" : "Cerrar"}
          </button>
          {!hasErrors && onContinue && (
            <button
              onClick={() => {
                onClose();
                onContinue();
              }}
              className="rounded-md bg-amber-600 hover:bg-amber-700 px-4 py-2 text-sm font-semibold text-white"
            >
              {continueLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  onClick,
}: {
  item: ValidationItem;
  onClick: () => void;
}) {
  const isError = item.level === "error";
  return (
    <li>
      <button
        onClick={onClick}
        disabled={!item.fieldId}
        className={cn(
          "w-full text-left rounded-md border px-3 py-2 text-xs flex items-start gap-2 transition-colors",
          isError
            ? "bg-red-50 border-red-100 text-red-900"
            : "bg-amber-50 border-amber-100 text-amber-900",
          item.fieldId && "hover:border-gray-300 cursor-pointer",
          !item.fieldId && "cursor-default"
        )}
      >
        <span className="leading-relaxed flex-1">{item.message}</span>
        {item.fieldId && (
          <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 opacity-60" />
        )}
      </button>
    </li>
  );
}
