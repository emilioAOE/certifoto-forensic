import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata = {
  title: "Blog - CertiFoto",
  description:
    "Articulos sobre actas digitales, arriendos, evidencia fotografica e inteligencia artificial aplicada a la documentacion de propiedades.",
};

export default function BlogIndex() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
              Blog
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Aprende sobre arriendos, evidencia y documentacion digital
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              Guias practicas y articulos tecnicos para arrendadores,
              arrendatarios, corredores y administradoras que quieren
              profesionalizar la forma en que documentan propiedades.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 py-12 border-b border-gray-100">
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-accent hover:shadow-md transition-all"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-accent-softer to-accent-light/40 p-8 sm:p-12 flex items-center justify-center">
                <div className="aspect-[4/3] w-full max-w-md rounded-xl bg-white border border-gray-200 shadow-sm p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-2">
                      {featured.category}
                    </p>
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {featured.title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="text-xs text-accent-dark font-semibold uppercase tracking-wider mb-3">
                  Destacado · {featured.category}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight group-hover:text-accent-dark transition-colors mb-3">
                  {featured.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {featured.readMinutes} min
                  </span>
                  <span>{formatDate(featured.date)}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark">
                  Leer articulo completo
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Mas articulos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block rounded-xl border border-gray-200 bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
            >
              <div className="text-xs text-accent-dark font-semibold uppercase tracking-wider mb-3">
                {p.category}
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-accent-dark transition-colors mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {p.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(p.date)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {p.readMinutes} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Listo para documentar mejor?
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Empieza a usar CertiFoto en menos de un minuto. Sin registro previo.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            Ingresar a la plataforma
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
