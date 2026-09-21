import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BlogContent } from "@/components/marketing/BlogContent";
import { BlogCta } from "@/components/marketing/BlogCta";
import { BlogCover } from "@/components/blog/BlogCover";
import { BlogStickyCta } from "@/components/marketing/BlogStickyCta";
import { blogCtas } from "@/lib/blog-cta";
import { fuentesParaPost } from "@/lib/blog-fuentes";
import { SITE_AUTHOR } from "@/lib/site-author";
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certifoto.cl";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Artículo no encontrado" };
  // Imagen OG propia de cada artículo (app/blog/[slug]/og/route.tsx).
  const ogImage = `${SITE_URL}/blog/${post.slug}/og`;
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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const related = getRelatedPosts(params.slug);
  const { mid, end } = blogCtas(post.category, post.slug);
  const fuentes = fuentesParaPost(post.slug, post.category);

  const faqItems = extractFaqItems(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [`${SITE_URL}/blog/${post.slug}/og`],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      jobTitle: SITE_AUTHOR.jobTitle,
      url: `${SITE_URL}${SITE_AUTHOR.path}`,
      ...(SITE_AUTHOR.sameAs.length > 0 ? { sameAs: SITE_AUTHOR.sameAs } : {}),
      worksFor: { "@type": "Organization", name: "CertiFoto", url: SITE_URL },
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

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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

        <p className="mt-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Por{" "}
            <Link href={SITE_AUTHOR.path} className="font-medium text-gray-700 hover:text-accent-dark">
              {SITE_AUTHOR.name}
            </Link>
            <span className="text-gray-400">· {SITE_AUTHOR.jobTitle}</span>
          </span>
          {" · "}
          Actualizado:{" "}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>

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
        </div>

        <BlogCover
          post={post}
          priority
          className="mt-8 -mx-4 sm:mx-0 sm:rounded-2xl sm:border sm:border-gray-100 aspect-[16/9] sm:aspect-[21/9]"
        />

        <div className="mt-10">
          <BlogContent
            content={post.content}
            midCta={<BlogCta config={mid} slug={post.slug} compact />}
          />
        </div>

        {/* Fuentes y legislación */}
        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Fuentes y legislación
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Normativa chilena en que se basa este artículo (texto vigente en
            Ley Chile, Biblioteca del Congreso Nacional):
          </p>
          <ul className="space-y-2 text-sm">
            {fuentes.map((f) => (
              <li key={f.url}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener"
                  className="text-accent-dark font-medium hover:underline"
                >
                  {f.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Autor */}
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-gray-200 p-5">
          <div className="h-12 w-12 shrink-0 rounded-full bg-accent text-white flex items-center justify-center text-lg font-bold">
            {SITE_AUTHOR.name.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">
              <Link href={SITE_AUTHOR.path} className="hover:text-accent-dark">
                {SITE_AUTHOR.name}
              </Link>{" "}
              <span className="text-gray-400 font-normal">· {SITE_AUTHOR.jobTitle}</span>
            </p>
            <p className="text-gray-600 mt-1 leading-relaxed">{SITE_AUTHOR.bio}</p>
          </div>
        </div>

        {/* CTA de cierre */}
        <div className="mt-12">
          <BlogCta config={end} slug={post.slug} />
        </div>
      </article>

      <BlogStickyCta slug={post.slug} />

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">
              Artículos relacionados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-accent hover:shadow-sm transition-all"
                >
                  <BlogCover
                    post={p}
                    className="aspect-[2/1] border-b border-gray-100"
                  />
                  <div className="p-5">
                    <div className="text-xs text-accent-dark font-semibold uppercase tracking-wider mb-2">
                      {p.category}
                    </div>
                    <h4 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-accent-dark transition-colors mb-2">
                      {p.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {p.excerpt}
                    </p>
                  </div>
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

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Extrae pares pregunta/respuesta de la sección "## Preguntas frecuentes"
 * del contenido Markdown de un post para emitir JSON-LD FAQPage.
 *
 * Reglas:
 * - La sección empieza en "## Preguntas frecuentes" y termina en el siguiente
 *   encabezado H2 ("## ...") o al final del contenido.
 * - Cada pregunta es un encabezado H3 ("### ...").
 * - La respuesta es el texto que sigue a la pregunta hasta el próximo H3/H2;
 *   los párrafos contiguos se unen con un espacio.
 * - Si no hay sección o no hay pares completos, devuelve [].
 */
function extractFaqItems(content: string): FaqItem[] {
  const lines = content.split("\n");

  const startIndex = lines.findIndex(
    (line) => line.trim().toLowerCase() === "## preguntas frecuentes"
  );
  if (startIndex === -1) return [];

  const items: FaqItem[] = [];
  let currentQuestion: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    if (currentQuestion) {
      const answer = answerLines.join(" ").replace(/\s+/g, " ").trim();
      if (answer) {
        items.push({ question: currentQuestion, answer });
      }
    }
    currentQuestion = null;
    answerLines = [];
  };

  for (let i = startIndex + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Fin de la sección FAQ: siguiente H2.
    if (trimmed.startsWith("## ")) {
      flush();
      break;
    }

    if (trimmed.startsWith("### ")) {
      flush();
      currentQuestion = stripInlineMarkdown(trimmed.slice(4));
      continue;
    }

    if (currentQuestion && trimmed !== "") {
      answerLines.push(stripInlineMarkdown(trimmed));
    }
  }

  flush();

  return items;
}

/** Quita marcas inline de Markdown (**negrita**, [texto](href)) dejando texto plano. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .trim();
}
