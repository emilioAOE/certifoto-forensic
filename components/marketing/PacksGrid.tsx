"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { PACKS, formatCLP, LAUNCH_PRICING_LABEL, type Pack } from "@/lib/packs";
import { cn } from "@/lib/cn";
import { useSupabaseUser } from "@/lib/supabase/use-user";

interface PacksGridProps {
  /** marketing = vitrina con detalle; compact = version para Mis creditos. */
  variant?: "marketing" | "compact";
}

export function PacksGrid({ variant = "marketing" }: PacksGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        variant === "marketing"
          ? "md:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {PACKS.map((pack) => (
        <PackCard key={pack.id} pack={pack} compact={variant === "compact"} />
      ))}
    </div>
  );
}

function PackCard({ pack, compact }: { pack: Pack; compact: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-6 flex flex-col relative",
        pack.highlighted
          ? "border-accent shadow-lg shadow-accent/10"
          : "border-gray-200"
      )}
    >
      {pack.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          {pack.badge}
        </div>
      )}

      <div className="text-xs font-mono text-muted uppercase tracking-wider mb-1">
        Pack {pack.size}
      </div>
      <h3 className="text-base font-bold text-gray-900">{pack.label}</h3>
      {!compact && (
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed min-h-[2.5rem]">
          {pack.audience}
        </p>
      )}

      {pack.launchDiscountPercent > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-400 line-through">
            {formatCLP(pack.listPriceCLP)}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {LAUNCH_PRICING_LABEL} −{pack.launchDiscountPercent}%
          </span>
        </div>
      )}
      <div className={pack.launchDiscountPercent > 0 ? "mt-1 mb-1" : "mt-5 mb-1"}>
        <span className="text-3xl font-bold text-gray-900 tracking-tight">
          {formatCLP(pack.priceCLP)}
        </span>
        <span className="text-xs text-gray-500 ml-1.5">CLP, pago único</span>
      </div>
      <div className="text-[11px] text-muted mb-4">
        {formatCLP(pack.unitPriceCLP)} por certificación
        {pack.savingsPercent > 0 && (
          <span className="text-accent-dark font-medium ml-1">
            · ahorras {pack.savingsPercent}%
          </span>
        )}
      </div>

      <ComprarPackButton pack={pack} />

      {!compact && (
        <ul className="mt-5 space-y-1.5 pt-4 border-t border-gray-100 text-[11px] text-gray-600">
          <li className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-accent-dark shrink-0 mt-0.5" />
            <span>Acceso ilimitado a la app, gratis</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-accent-dark shrink-0 mt-0.5" />
            <span>Los créditos no caducan</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-accent-dark shrink-0 mt-0.5" />
            <span>Pago único, sin suscripción</span>
          </li>
        </ul>
      )}
    </div>
  );
}

/**
 * Compra con Flow. Sin sesion, primero al login (los creditos van a la
 * cuenta) y, al volver del magic link, la compra se retoma sola: el `next`
 * del login trae `?comprar=<pack>` y el boton lo detecta al montar. Con
 * sesion, pide la orden a /api/pagos/flow/crear y redirige a Flow.
 */
function ComprarPackButton({ pack }: { pack: Pack }) {
  const { user, loading } = useSupabaseUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retomada = useRef(false);

  /** Vuelve a esta misma pagina (precios o mis-creditos) con el pack elegido. */
  const irAlLogin = () => {
    const volver = `${window.location.pathname}?comprar=${pack.id}`;
    window.location.href = `/login?next=${encodeURIComponent(volver)}`;
  };

  const comprar = async () => {
    setError(null);
    if (!user) {
      irAlLogin();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/pagos/flow/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (res.status === 401) {
        irAlLogin();
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "No pudimos iniciar el pago. Intenta de nuevo.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Sin conexión. Revisa tu internet e intenta de nuevo.");
      setBusy(false);
    }
  };

  // Retomar la compra tras el login: /precios?comprar=p3 → directo a Flow.
  useEffect(() => {
    if (loading || !user || retomada.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("comprar") !== pack.id) return;
    retomada.current = true;
    params.delete("comprar");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    void comprar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, pack.id]);

  return (
    <div>
      <button
        onClick={() => void comprar()}
        disabled={busy || loading}
        className={cn(
          "w-full inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
          pack.highlighted
            ? "bg-accent text-white hover:bg-accent-dim"
            : "bg-gray-100 text-gray-900 border border-gray-200 hover:border-accent hover:text-accent-dark"
        )}
      >
        {busy ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Conectando con Flow…
          </>
        ) : (
          <>
            Comprar pack
            <ArrowRight className="h-3 w-3" />
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-[11px] text-red-700 leading-snug">
          {error}
        </p>
      )}
      <p className="mt-2 text-[10px] text-gray-400 text-center leading-snug">
        Pago seguro con Flow (tarjeta o transferencia).{" "}
        <Link href={`/contacto?pack=${pack.size}`} className="underline underline-offset-2">
          ¿Prefieres coordinarlo por correo?
        </Link>
      </p>
    </div>
  );
}
