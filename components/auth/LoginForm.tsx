"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fingerprint, Mail, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Proteccion anti-abuso del magic link. Un formulario de login es un vector
 * para que un bot haga enviar correos a direcciones inventadas; esos rebotes
 * golpean la reputacion de la cuenta SES compartida con otros sitios.
 *  - Turnstile (Cloudflare): se activa solo si hay site key. Supabase valida
 *    el token con la secret key configurada en Auth > Bot and Abuse Protection.
 *  - Cooldown de reenvio: evita disparar N correos al mismo buzon en segundos.
 * En Supabase ademas hay que bajar el rate limit de emails (Auth > Rate Limits).
 */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const RESEND_COOLDOWN_S = 60;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [company, setCompany] = useState(""); // honeypot anti-bots
  const [captcha, setCaptcha] = useState<string | null>(null);
  // Los tokens de Turnstile son de un solo uso: remontamos el widget tras cada intento.
  const [captchaNonce, setCaptchaNonce] = useState(0);
  // Código de 6 dígitos del correo (0 = el servidor solo mandó enlace). Es la
  // vía para quien abrió CertiFoto dentro de Instagram/Facebook: el enlace se
  // abre en otro navegador, donde no está el acta que creó sin cuenta.
  const [largoCodigo, setLargoCodigo] = useState(0);
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

  const captchaRequired = TURNSTILE_SITE_KEY !== "";
  const onCaptchaToken = useCallback((t: string | null) => setCaptcha(t), []);

  // Error que trae /auth/confirm si el link fallo o expiro.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) setError(traducirError(err));
  }, []);

  // Cuenta regresiva del cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Ingresa un email válido.");
      return;
    }
    if (cooldown > 0) {
      setError(`Espera ${cooldown} s antes de pedir otro enlace.`);
      return;
    }
    if (captchaRequired && !captcha) {
      setError("Completa la verificación de seguridad.");
      return;
    }
    setSending(true);
    try {
      // El enlace lo genera nuestro servidor y lo envia Listmonk (no Supabase).
      const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      const res = await fetch("/api/auth/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, next, company, captcha }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        largoCodigo?: number;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? traducirError(""));
        if (res.status === 429) setCooldown(RESEND_COOLDOWN_S);
        return;
      }
      setLargoCodigo(data.largoCodigo ?? 0);
      setCodigo("");
      setErrorCodigo(null);
      setSent(true);
      setCooldown(RESEND_COOLDOWN_S);
    } catch {
      setError("No pudimos enviar el enlace. Intenta de nuevo en un momento.");
    } finally {
      setSending(false);
      setCaptcha(null);
      setCaptchaNonce((n) => n + 1);
    }
  };

  const verificarCodigo = async (valor: string) => {
    if (verificando || valor.length < 6) return;
    setErrorCodigo(null);
    setVerificando(true);
    try {
      const { error: err } = await createClient().auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: valor,
        type: "email",
      });
      if (err) {
        setErrorCodigo(traducirErrorCodigo(err.message));
        setVerificando(false);
        return;
      }
      // La sesión ya quedó en cookies: /auth/confirm manda la bienvenida y
      // redirige a `next` (recarga completa, así toda la app ve la sesión).
      const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      window.location.assign(`/auth/confirm?sesion=1&next=${encodeURIComponent(next)}`);
    } catch {
      setErrorCodigo("No pudimos verificar el código. Revisa tu conexión e inténtalo de nuevo.");
      setVerificando(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="rounded-full bg-accent-softer border border-accent-light inline-flex p-3 mb-4">
          <CheckCircle className="h-8 w-8 text-accent-dark" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
        {largoCodigo > 0 ? (
          <>
            <p className="text-sm text-gray-600 leading-relaxed">
              Te enviamos un código de {largoCodigo} dígitos a{" "}
              <span className="font-medium text-gray-900">{email}</span>. Escríbelo aquí
              para entrar sin salir de esta pantalla.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void verificarCodigo(codigo);
              }}
              className="mt-5 space-y-3"
            >
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                aria-label="Código de acceso"
                maxLength={largoCodigo}
                value={codigo}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, largoCodigo);
                  setCodigo(v);
                  if (v.length === largoCodigo) void verificarCodigo(v);
                }}
                placeholder={"0".repeat(largoCodigo)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              {errorCodigo && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {errorCodigo}
                </p>
              )}
              <button
                type="submit"
                disabled={verificando || codigo.length < largoCodigo}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verificando ? "Entrando…" : "Entrar"}
                {!verificando && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              También puedes tocar el botón del correo desde este mismo navegador. Si no
              llega en un par de minutos, revisa la carpeta de spam.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">
            Te enviamos un enlace a <span className="font-medium text-gray-900">{email}</span>.
            Ábrelo desde este mismo dispositivo para entrar. Si no llega en un par de
            minutos, revisa la carpeta de spam.
          </p>
        )}
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-accent-dark hover:underline"
        >
          {cooldown > 0 ? `Usar otro correo (reenvío en ${cooldown} s)` : "Usar otro correo"}
        </button>
      </div>
    );
  }

  const submitDisabled = sending || cooldown > 0 || (captchaRequired && !captcha);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot: oculto para humanos; los bots lo llenan */}
      <div className="hidden" aria-hidden="true">
        <label>
          No completar
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>
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

      {captchaRequired && <Turnstile key={captchaNonce} onToken={onCaptchaToken} />}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitDisabled}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending
          ? "Enviando enlace…"
          : cooldown > 0
            ? `Espera ${cooldown} s`
            : "Enviarme el enlace de acceso"}
        {!sending && cooldown === 0 && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="text-[11px] text-gray-500 text-center leading-relaxed">
        Sin contraseñas: te llega un enlace de un solo uso. Al continuar aceptas los{" "}
        <Link href="/terminos" className="underline underline-offset-2">términos</Link> y la{" "}
        <Link href="/privacidad" className="underline underline-offset-2">privacidad</Link>.
      </p>
    </form>
  );
}

/** Widget de Cloudflare Turnstile (render explicito, compatible con React). */
function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;

    const render = () => {
      if (!window.turnstile || !ref.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      return () => {
        script?.removeEventListener("load", render);
        if (widgetId.current && window.turnstile) {
          window.turnstile.remove(widgetId.current);
          widgetId.current = null;
        }
      };
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [onToken]);

  return <div ref={ref} className="min-h-[65px]" />;
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("captcha")) {
    return "La verificación de seguridad falló. Inténtalo de nuevo.";
  }
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

function traducirErrorCodigo(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("rate") || m.includes("too many")) {
    return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
  }
  if (m.includes("expired") || m.includes("invalid")) {
    return "El código no es correcto o ya venció. Usa el del último correo o pide uno nuevo.";
  }
  return "No pudimos verificar el código. Inténtalo de nuevo.";
}

/** Bloque lateral: por que crear cuenta. */
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
