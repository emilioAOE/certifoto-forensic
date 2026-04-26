"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Fingerprint,
  FileSignature,
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Search,
  Menu,
  X,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { GlobalSearch } from "./GlobalSearch";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/actas", label: "Actas", icon: FileSignature },
  { href: "/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/contactos", label: "Contactos", icon: Users },
  { href: "/forensic", label: "Verificar evidencia", icon: Shield },
  { href: "/verificar", label: "Recibir acta", icon: Share2 },
  { href: "/configuracion", label: "Configuracion", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Si la pagina es la landing publica, no mostrar el shell de la app
  const isLanding =
    pathname === "/" ||
    pathname.startsWith("/blog") ||
    pathname === "/faq" ||
    pathname === "/precios" ||
    pathname === "/sobre" ||
    pathname === "/contacto" ||
    pathname === "/terminos" ||
    pathname === "/privacidad";

  // Cmd+K / Ctrl+K abre la busqueda global
  useEffect(() => {
    if (isLanding) return;
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLanding]);

  // Cerrar mobile menu al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-gray-200 bg-white sticky top-0 h-screen">
        <SidebarContent
          pathname={pathname}
          onSearchClick={() => setSearchOpen(true)}
        />
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          pathname={pathname}
          onSearchClick={() => {
            setSearchOpen(true);
            setMobileMenuOpen(false);
          }}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="rounded-md bg-accent text-white p-1">
              <Fingerprint className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-gray-900">CertiFoto</span>
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
            className="text-gray-600 hover:text-gray-900"
          >
            <Search className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-white lg:bg-gray-50">{children}</main>

        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 text-[11px] text-gray-500 text-center">
            CertiFoto · Las descripciones generadas con IA son referenciales y
            deben ser revisadas por las partes.
          </div>
        </footer>
      </div>

      {/* Global search modal */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

function SidebarContent({
  pathname,
  onSearchClick,
  onCloseMobile,
}: {
  pathname: string;
  onSearchClick: () => void;
  onCloseMobile?: () => void;
}) {
  return (
    <>
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-md bg-accent text-white p-1.5">
            <Fingerprint className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            CertiFoto
          </span>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search trigger */}
      <div className="p-3">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-2 rounded-md bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-accent-softer text-accent-dark font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link
          href="/actas/nueva"
          className="block w-full text-center rounded-md bg-accent text-white px-3 py-2 text-sm font-medium hover:bg-accent-dim transition-colors"
        >
          + Nueva acta
        </Link>
      </div>

      <div className="px-3 py-3 border-t border-gray-100 text-[10px] text-gray-400 text-center">
        v0.4 · Beta
      </div>
    </>
  );
}
