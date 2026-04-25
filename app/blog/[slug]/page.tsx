import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Calendar, User } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BlogContent } from "@/components/marketing/BlogContent";
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifoto.cl";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Articulo no encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: [post.category],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const related = getRelatedPosts(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "CertiFoto",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    articleSection: post.category,
    inLanguage: "es-CL",
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingHeader />

      <article className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-accent-dark mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al blog
        </Link>

        <div className="text-xs text-accent-dark font-semibold uppercase tracking-wider mb-4">
          {post.category}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-gray-600 mt-5 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500 pb-8 border-b border-gray-100">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readMinutes} min lectura
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
        </div>

        <div className="mt-10">
          <BlogContent content={post.content} />
        </div>

        {/* CTA inline */}
        <div className="mt-12 rounded-2xl border border-accent-light bg-accent-softer p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Te resulto util este articulo?
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Empieza a documentar tus arriendos con CertiFoto. Sin registro y
            gratis para uso personal.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            Ingresar a la plataforma
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">
              Articulos relacionados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-5 hover:border-accent hover:shadow-sm transition-all"
                >
                  <div className="text-xs text-accent-dark font-semibold uppercase tracking-wider mb-2">
                    {p.category}
                  </div>
                  <h4 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-accent-dark transition-colors mb-2">
                    {p.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {p.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <LandingFooter />
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
