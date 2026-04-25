import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BlogContent } from "@/components/marketing/BlogContent";

interface LegalPageProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  content: string;
}

export function LegalPage({
  title,
  subtitle,
  lastUpdated,
  content,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-16">
          <p className="text-xs font-semibold text-accent-dark uppercase tracking-wider mb-3">
            Documento legal
          </p>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 mt-3">{subtitle}</p>
          )}
          <p className="text-xs text-gray-500 mt-4">
            Ultima actualizacion: {lastUpdated}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <BlogContent content={content} />
      </article>

      <LandingFooter />
    </div>
  );
}
