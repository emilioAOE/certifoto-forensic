"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "warn" | "error" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastContextValue {
  show: (t: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  warn: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op para evitar crash si se usa fuera del provider
    return {
      show: () => {},
      success: (t, d) => console.log("[toast:success]", t, d),
      warn: (t, d) => console.warn("[toast:warn]", t, d),
      error: (t, d) => console.error("[toast:error]", t, d),
      info: (t, d) => console.log("[toast:info]", t, d),
      dismiss: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const toast: Toast = {
        id,
        durationMs: t.durationMs ?? 4500,
        ...t,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.durationMs && toast.durationMs > 0) {
        setTimeout(() => dismiss(id), toast.durationMs);
      }
    },
    [dismiss]
  );

  const ctx: ToastContextValue = {
    show,
    success: (title, description) => show({ variant: "success", title, description }),
    warn: (title, description) => show({ variant: "warn", title, description }),
    error: (title, description) =>
      show({ variant: "error", title, description, durationMs: 7000 }),
    info: (title, description) => show({ variant: "info", title, description }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    Icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    borderClass: string;
    bgClass: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    iconClass: "text-emerald-600",
    borderClass: "border-emerald-200",
    bgClass: "bg-emerald-50",
  },
  warn: {
    Icon: AlertTriangle,
    iconClass: "text-amber-600",
    borderClass: "border-amber-200",
    bgClass: "bg-amber-50",
  },
  error: {
    Icon: XCircle,
    iconClass: "text-red-600",
    borderClass: "border-red-200",
    bgClass: "bg-red-50",
  },
  info: {
    Icon: Info,
    iconClass: "text-blue-600",
    borderClass: "border-blue-200",
    bgClass: "bg-blue-50",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const cfg = VARIANT_CONFIG[toast.variant];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animar entrada
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto rounded-lg border shadow-lg p-3 flex items-start gap-3 transition-all bg-white",
        cfg.borderClass,
        cfg.bgClass,
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0"
      )}
    >
      <cfg.Icon className={cn("h-5 w-5 shrink-0 mt-0.5", cfg.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Cerrar notificacion"
        className="text-gray-400 hover:text-gray-600 shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
