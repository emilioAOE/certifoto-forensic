"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fingerprint, FileSignature, Shield, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/actas", label: "Actas", icon: FileSignature },
  { href: "/forensic", label: "Verificar evidencia", icon: Shield },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // La landing tiene su propio header, no le agregamos el nav de la app
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-gray-50 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="rounded-lg bg-accent/10 p-1.5">
              <Fingerprint className="h-5 w-5 text-accent" />
            </div>
            <span className="text-base font-bold text-gray-900 font-mono tracking-tight hidden sm:inline">
              CertiFoto
            </span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto ml-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap",
                    active
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-muted hover:text-gray-800 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-muted text-center">
          CertiFoto — Registro digital con respaldo forense. Las descripciones
          generadas con IA son referenciales y deben ser revisadas por las partes.
        </div>
      </footer>
    </div>
  );
}
