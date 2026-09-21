"use client";

/**
 * Diálogo "Enviar acta por correo": destinatarios (sugeridos desde las partes
 * del acta), mensaje opcional y envío del PDF adjunto (lib/acta-email.ts).
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, X } from "lucide-react";
import type { Acta, Property } from "@/lib/acta-types";
import { enviarActaPorCorreo } from "@/lib/acta-email";
import { isActaCertified } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DESTINATARIOS = 5;

interface SendActaDialogProps {
  open: boolean;
  onClose: () => void;
  acta: Acta;
  property: Property;
  /** Se llama con los correos que salieron bien. */
  onSent?: (destinatarios: string[]) => void;
}

function uniq(xs: string[]): string[] {
  return Array.from(new Set(xs));
}

export function SendActaDialog({ open, onClose, acta, property, onSent }: SendActaDialogProps) {
  const router = useRouter();
  const toast = useToast();
  const certified = isActaCertified(acta);

  const sugeridos = useMemo(
    () =>
      uniq(
        acta.parties
          .map((p) => (p.email ?? "").trim().toLowerCase())
          .filter((e) => EMAIL_RE.test(e))
      ),
    [acta.parties]
  );

  const [emails, setEmails] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmails(sugeridos.join(", "));
    setMensaje("");
    setError(null);
  }, [open, sugeridos]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sending, onClose]);

  if (!open) return null;

  const handleSend = async () => {
    const lista = uniq(
      emails
        .split(/[,;\s]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
    if (lista.length === 0) {
      setError("Escribe al menos un correo.");
      return;
    }
    const malo = lista.find((e) => !EMAIL_RE.test(e));
    if (malo) {
      setError(`Correo inválido: ${malo}`);
      return;
    }
    if (lista.length > MAX_DESTINATARIOS) {
      setError(`Máximo ${MAX_DESTINATARIOS} destinatarios por envío.`);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const r = await enviarActaPorCorreo(acta, property, lista, mensaje.trim() || undefined);
      if (!r.ok) {
        if (r.error === "login_required") {
          toast.info("Inicia sesión para enviar el acta por correo");
          router.push(`/login?next=/actas/${acta.id}`);
          return;
        }
        setError(
          r.message ??
            (r.error === "too_large"
              ? "El PDF es demasiado grande para enviarlo por correo."
              : "No se pudo enviar. Intenta de nuevo.")
        );
        return;
      }
      if (r.fallidos.length > 0) {
        toast.error("Algunos correos no salieron", r.fallidos.join(", "));
      }
      if (r.enviados.length > 0) {
        toast.success("Acta enviada", `Se envió el PDF a ${r.enviados.join(", ")}.`);
        onSent?.(r.enviados);
        onClose();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => {
        if (!sending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-acta-title"
        className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="rounded-lg bg-accent-softer border border-accent-light p-2 text-accent-dark shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 id="send-acta-title" className="text-base font-semibold text-gray-900">
                Enviar acta por correo
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {certified
                  ? "Va adjunto el PDF certificado, auto-verificable."
                  : "Va adjunto el PDF en borrador (con marca de agua)."}{" "}
                Las respuestas te llegan a ti.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="send-acta-emails">
            Destinatarios
          </label>
          <textarea
            id="send-acta-emails"
            rows={2}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="correo@ejemplo.cl, otro@ejemplo.cl"
            disabled={sending}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent disabled:opacity-60"
          />
          <p className="text-[11px] text-gray-500 mt-1 mb-3">
            {sugeridos.length > 0
              ? "Sugeridos desde las partes del acta. Separa varios con coma."
              : "Separa varios correos con coma. Máximo 5."}
          </p>

          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="send-acta-msg">
            Mensaje (opcional)
          </label>
          <textarea
            id="send-acta-msg"
            rows={3}
            maxLength={1000}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Hola, adjunto el acta de entrega que firmamos hoy…"
            disabled={sending}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent disabled:opacity-60"
          />

          {error && (
            <p className="text-xs text-danger mt-2" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando y enviando…
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
