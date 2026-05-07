"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PACKS, formatCLP, type Pack } from "@/lib/packs";
import { cn } from "@/lib/cn";

interface PacksGridProps {
  /** Si true, los CTA son "Comprar pack" y van a /contacto?pack=N (vitrina). */
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

      <div className="mt-5 mb-1">
        <span className="text-3xl font-bold text-gray-900 tracking-tight">
          {formatCLP(pack.priceCLP)}
        </span>
        <span className="text-xs text-gray-500 ml-1.5">CLP, pago unico</span>
      </div>
      <div className="text-[11px] text-muted mb-4">
        {formatCLP(pack.unitPriceCLP)} por certificacion
        {pack.savingsPercent > 0 && (
          <span className="text-accent-dark font-medium ml-1">
            · ahorras {pack.savingsPercent}%
          </span>
        )}
      </div>

      <Link
        href={`/contacto?pack=${pack.size}`}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-colors",
          pack.highlighted
            ? "bg-accent text-white hover:bg-accent-dim"
            : "bg-gray-100 text-gray-900 border border-gray-200 hover:border-accent hover:text-accent-dark"
        )}
      >
        Comprar pack
        <ArrowRight className="h-3 w-3" />
      </Link>

      {!compact && (
        <ul className="mt-5 space-y-1.5 pt-4 border-t border-gray-100 text-[11px] text-gray-600">
          <li className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-accent-dark shrink-0 mt-0.5" />
            <span>Acceso ilimitado a la app, gratis</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-accent-dark shrink-0 mt-0.5" />
            <span>Los creditos no caducan</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="h-3 w-3 text-accent-dark shrink-0 mt-0.5" />
            <span>Pago unico, sin suscripcion</span>
          </li>
        </ul>
      )}
    </div>
  );
}
