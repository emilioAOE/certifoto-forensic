"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowRight,
  Award,
  PlusCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  getCreditsBalance,
  getCreditsHistory,
  subscribeToCreditsChanges,
  addCredits,
  type CreditEntry,
} from "@/lib/credits";
import { PacksGrid } from "@/components/marketing/PacksGrid";
import { useToast } from "@/components/ui/Toast";

const REASON_LABEL: Record<CreditEntry["reason"], string> = {
  pack_purchased: "Compra de pack",
  redeem_code: "Canje de codigo",
  manual_grant: "Carga manual",
  dev_seed: "Carga de prueba",
  certify_acta: "Certificacion de acta",
  refund: "Reverso",
};

export function MisCreditosPage() {
  const toast = useToast();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<CreditEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBalance(getCreditsBalance());
    setHistory(getCreditsHistory());
    const unsub = subscribeToCreditsChanges(() => {
      setBalance(getCreditsBalance());
      setHistory(getCreditsHistory());
    });
    return unsub;
  }, []);

  const handleDevSeed = (amount: number) => {
    const result = addCredits(
      amount,
      "dev_seed",
      `Carga de prueba (+${amount})`,
      { source: "dev_button" }
    );
    if (result.ok) {
      toast.success(
        "Creditos cargados",
        `+${amount} creditos. Saldo: ${result.balanceAfter}.`
      );
    } else {
      toast.error("No se pudo cargar", result.error ?? "Error");
    }
  };

  if (!mounted) return null;

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
          Mis creditos
        </h1>
        <p className="text-sm text-muted mt-1">
          Cada vez que certificas un acta consumes 1 credito. La app sigue
          siendo gratis y los borradores son ilimitados.
        </p>
      </header>

      {/* Balance card */}
      <section className="rounded-2xl border border-accent-light bg-accent-softer p-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-dark uppercase tracking-wider">
            <Coins className="h-3.5 w-3.5" />
            Saldo disponible
          </div>
          <div className="text-5xl font-bold text-gray-900 mt-1 tracking-tight">
            {balance}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            credito{balance === 1 ? "" : "s"}
            {balance === 0 && " · compra un pack para empezar a certificar"}
          </div>
        </div>
        <Link
          href="/precios"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-dim transition-colors"
        >
          Comprar pack
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Soporte / how to */}
      <section className="rounded-lg border border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-info mt-0.5 shrink-0" />
          <div className="text-xs text-gray-700 leading-relaxed">
            <p className="mb-2">
              Por ahora los packs se activan manualmente. Cuando solicitas un
              pack desde el formulario de contacto, coordinamos el pago via
              transferencia o WhatsApp y luego cargamos los creditos en este
              navegador.
            </p>
            <p>
              Limitacion: si limpias el navegador o cambias de dispositivo, los
              creditos no usados se pierden. Recomendamos certificar las actas
              a medida que se completan. Pronto tendras una cuenta en la nube.
            </p>
          </div>
        </div>
      </section>

      {/* Dev seed (solo en desarrollo) */}
      {isDev && (
        <section className="rounded-lg border border-dashed border-purple-300 bg-purple-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Modo desarrollo
          </div>
          <p className="text-xs text-purple-700 mb-3 leading-relaxed">
            Estos botones solo aparecen en localhost. En produccion los creditos
            solo entran via packs activados manualmente.
          </p>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 10].map((n) => (
              <button
                key={n}
                onClick={() => handleDevSeed(n)}
                className="inline-flex items-center gap-1 rounded-md bg-white border border-purple-200 px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-100"
              >
                <PlusCircle className="h-3 w-3" />
                +{n} cred.
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Packs */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Packs disponibles
        </h2>
        <PacksGrid variant="compact" />
      </section>

      {/* Historial */}
      <section>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Historial de movimientos
        </h2>
        {history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 px-4 text-center text-sm text-muted">
            Aun no tienes movimientos. Compra un pack o certifica un acta para
            ver el historial aqui.
          </div>
        ) : (
          <ul className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {history.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function HistoryEntry({ entry }: { entry: CreditEntry }) {
  const isPositive = entry.delta > 0;
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div
        className={
          isPositive
            ? "rounded-full bg-emerald-50 text-emerald-700 p-1.5"
            : "rounded-full bg-amber-50 text-amber-700 p-1.5"
        }
      >
        {isPositive ? (
          <PlusCircle className="h-3.5 w-3.5" />
        ) : (
          <Award className="h-3.5 w-3.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{entry.description}</p>
        <p className="text-[11px] text-muted">
          {REASON_LABEL[entry.reason]} ·{" "}
          {new Date(entry.createdAt).toLocaleString("es-CL")}
        </p>
      </div>
      <div className="text-right">
        <div
          className={
            isPositive
              ? "text-sm font-mono font-semibold text-emerald-700"
              : "text-sm font-mono font-semibold text-amber-700"
          }
        >
          {isPositive ? "+" : ""}
          {entry.delta}
        </div>
        <div className="text-[10px] text-muted font-mono">
          saldo {entry.balanceAfter}
        </div>
      </div>
    </li>
  );
}
