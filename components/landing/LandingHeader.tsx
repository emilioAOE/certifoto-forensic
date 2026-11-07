"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Fingerprint, ArrowRight, Menu, X } from "lucide-react";

const PUBLIC_LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/precios", label: "Precios" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "Preguntas" },
  { href: "/sobre", label: "Sobre nosotros" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  // En /certificar el botón del encabezado apuntaría a la misma página.
  const enCertificar = (usePathname() ?? "").startsWith("/certificar");

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-30 backdrop-blur-sm bg-white/90">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="rounded-lg bg-accent text-white p-1.5">
            <Fingerprint className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            CertiFoto
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-accent-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:inline text-sm text-gray-600 hover:text-accent-dark transition-colors"
          >
            Ingresar
          </Link>
          {!enCertificar && (
          <Link
            href="/certificar"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-3 sm:px-4 py-1.5 text-sm font-semibold hover:bg-accent-dim transition-colors whitespace-nowrap"
          >
            <span className="lg:hidden">Certificar · $2.000</span>
            <span className="hidden lg:inline">Certificar sin cuenta · $2.000</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-1.5 text-gray-700"
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-gray-700 hover:text-accent-dark"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/certificar"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-accent text-white px-4 py-2.5 text-sm font-semibold"
            >
              Certificar mi entrega sin cuenta · $2.000
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block py-2 text-center text-sm text-gray-600 hover:text-accent-dark"
            >
              Ingresar (corredores con cuenta)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
