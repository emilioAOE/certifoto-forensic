"use client";

import Link from "next/link";
import { Fingerprint, Mail, MapPin } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-accent text-white p-1.5">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-gray-900">
                CertiFoto
              </span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
              Actas digitales para arriendos en Chile, con respaldo forense de
              evidencia y firma digital de las partes.
            </p>
            <div className="mt-4 space-y-1.5 text-xs text-gray-500">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Santiago, Chile
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> contacto@certifoto.cl
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/dashboard" className="hover:text-accent-dark">
                  Ingresar
                </Link>
              </li>
              <li>
                <Link href="/actas/nueva" className="hover:text-accent-dark">
                  Crear acta
                </Link>
              </li>
              <li>
                <Link href="/forensic" className="hover:text-accent-dark">
                  Verificar evidencia
                </Link>
              </li>
              <li>
                <Link href="/precios" className="hover:text-accent-dark">
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Recursos
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/blog" className="hover:text-accent-dark">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-accent-dark">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-accent-dark">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-accent-dark">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/terminos" className="hover:text-accent-dark">
                  Terminos de uso
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-accent-dark">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} CertiFoto · Hecho en Chile
          </p>
          <p className="text-xs text-gray-500 max-w-2xl text-right">
            CertiFoto es un registro digital con respaldo tecnico. Las
            descripciones generadas con inteligencia artificial son referenciales
            y deben ser revisadas por las partes antes de firmar.
          </p>
        </div>
      </div>
    </footer>
  );
}
