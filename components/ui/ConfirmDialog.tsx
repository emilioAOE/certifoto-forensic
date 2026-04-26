"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "default" | "danger" | "warn";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  /** Si se pasa, requiere doble confirmacion (escribir el texto exacto) */
  requireConfirmText?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return {
      confirm: async (opts) => {
        // Fallback al confirm nativo si no hay provider
        if (typeof window !== "undefined") {
          return window.confirm(`${opts.title}\n\n${opts.message}`);
        }
        return false;
      },
    };
  }
  return ctx;
}

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<{
    options: ConfirmOptions;
    resolve: (b: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ options, resolve });
      }),
    []
  );

  const handleAccept = () => {
    pending?.resolve(true);
    setPending(null);
  };
  const handleReject = () => {
    pending?.resolve(false);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <ConfirmModal
          options={pending.options}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function ConfirmModal({
  options,
  onAccept,
  onReject,
}: {
  options: ConfirmOptions;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const variant: Variant = options.variant ?? "default";
  const needsTextConfirm = !!options.requireConfirmText;
  const canSubmit = !needsTextConfirm || confirmText === options.requireConfirmText;

  // Focus cancel por defecto + Escape para cerrar
  useEffect(() => {
    cancelButtonRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onReject();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onReject]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={options.title}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onReject}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div
              className={cn(
                "rounded-full p-2 shrink-0",
                variant === "danger" && "bg-red-50",
                variant === "warn" && "bg-amber-50",
                variant === "default" && "bg-blue-50"
              )}
            >
              {variant === "danger" || variant === "warn" ? (
                <AlertTriangle
                  className={cn(
                    "h-5 w-5",
                    variant === "danger" ? "text-red-600" : "text-amber-600"
                  )}
                />
              ) : (
                <Info className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-base font-semibold text-gray-900">
                {options.title}
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {options.message}
          </p>

          {needsTextConfirm && (
            <div className="mt-4">
              <label className="text-xs text-gray-500 block mb-1.5">
                Para confirmar, escribe:{" "}
                <span className="font-mono font-semibold text-gray-900">
                  {options.requireConfirmText}
                </span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap-reverse justify-end gap-2">
          <button
            ref={cancelButtonRef}
            onClick={onReject}
            className="rounded-md bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 text-sm font-medium text-gray-700"
          >
            {options.cancelLabel ?? "Cancelar"}
          </button>
          <button
            onClick={onAccept}
            disabled={!canSubmit}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warn"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-accent hover:bg-accent-dim"
            )}
          >
            {options.confirmLabel ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
