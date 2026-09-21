"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fingerprint, Mail, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Error que trae /auth/confirm si el link falló o expiró.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) setError(traducirError(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Ingresa un email válido.");
      return;
    }
    setSending(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: clean,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
          shouldCreateUser: true,
        },
      });
      if (err) {
        setError(traducirError(err.message));
        return;
      }
      setSent(true);
    } catch {
      setError("No pudimos enviar el enlace. Intenta de nuevo en un momento.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="rounded-full bg-accent-softer border border-accent-light inline-flex p-3 mb-4">
          <CheckCircle className="h-8 w-8 text-accent-dark" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Te enviamos un enlace a <span className="font-medium text-gray-900">{email}</span>.
          Ábrelo desde este mismo dispositivo para entrar. Si no llega en un par de
          minutos, revisa la carpeta de spam.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-accent-dark hover:underline"
        >
          Usar otro correo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.cl"
            className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? "Enviando enlace…" : "Enviarme el enlace de acceso"}
        {!sending && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="text-[11px] text-gray-500 text-center leading-relaxed">
        Sin contraseñas: te llega un enlace de un solo uso. Al continuar aceptas los{" "}
        <Link href="/terminos" className="underline underline-offset-2">términos</Link> y la{" "}
        <Link href="/privacidad" className="underline underline-offset-2">privacidad</Link>.
      </p>
    </form>
  );
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("expired") || m.includes("invalid")) {
    return "El enlace expiró o ya fue usado. Pide uno nuevo.";
  }
  if (m.includes("rate") || m.includes("too many")) {
    return "Demasiados intentos. Espera un minuto y vuelve a probar.";
  }
  if (m.includes("incompleto")) {
    return "El enlace está incompleto. Pide uno nuevo.";
  }
  return "No pudimos completar el acceso. Pide un enlace nuevo.";
}

/** Bloque lateral: por qué crear cuenta. */
export function LoginBenefits() {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-accent-softer border border-accent-light px-3 py-1 text-xs font-medium text-accent-dark">
        <Fingerprint className="h-3.5 w-3.5" />
        <span>Cuenta CertiFoto</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
        Tus créditos y tus actas, a salvo en cualquier dispositivo
      </h1>
      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <span>Los créditos de certificación quedan en tu cuenta, no en el navegador.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <span>Respaldo de tus actas y fotos: sigue en el celular lo que empezaste en el computador.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <span>Crear y editar actas sigue siendo gratis. Solo pagas al certificar.</span>
        </li>
      </ul>
    </div>
  );
}
