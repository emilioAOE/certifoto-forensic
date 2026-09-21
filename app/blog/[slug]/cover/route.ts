/**
 * Portada generada de un artículo como archivo SVG: /blog/<slug>/cover
 *
 * Se sirve como imagen (no inline) para que el HTML del listado no cargue
 * 40 SVG dos veces (HTML + payload RSC): el navegador los pide en paralelo,
 * con lazy loading y caché. Se pre-renderiza en el build.
 */

import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-posts";
import { coverSvg } from "@/lib/blog-cover";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return new Response("Not found", { status: 404 });

  return new Response(coverSvg(post, { withText: true }), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Un día en el navegador: si cambia el diseño, se renueva solo.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
