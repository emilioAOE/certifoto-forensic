import Link from "next/link";
import { Home, FileSearch, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full bg-accent-softer border border-accent-light inline-flex p-4 mb-6">
          <FileSearch className="h-8 w-8 text-accent-dark" />
        </div>

        <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-2">
          Error 404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
          Pagina no encontrada
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          La pagina que buscas no existe o fue movida. Si llegaste aca desde un
          enlace externo, avisanos.
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-accent hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Mis actas
          </Link>
        </div>
      </div>
    </div>
  );
}
