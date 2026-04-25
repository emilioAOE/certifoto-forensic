"use client";

import Link from "next/link";
import { useState } from "react";
import { Fingerprint, ArrowRight, Menu, X } from "lucide-react";

const PUBLIC_LINKS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/precios", label: "Precios" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "Preguntas" },
  { href: "/sobre", label: "Sobre nosotros" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

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

        <nav className="hidden md:flex items-center gap-6 text-sm">
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

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-1.5 text-sm font-medium hover:bg-accent-dim transition-colors"
          >
            Ingresar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 text-gray-700"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
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
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent text-white px-4 py-2 text-sm font-medium"
            >
              Ingresar a la plataforma
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
