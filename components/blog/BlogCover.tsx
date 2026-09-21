/**
 * Portada generada de un artículo (ver lib/blog-cover.ts), servida como
 * imagen SVG desde /blog/<slug>/cover.
 *
 * Es decorativa: el título siempre va al lado, así que lleva alt vacío.
 * El contenedor decide la proporción (aspect-*) y la imagen rellena
 * recortando (object-cover), igual que una fotografía.
 */

import { COVER_HEIGHT, COVER_WIDTH } from "@/lib/blog-cover";

interface BlogCoverProps {
  post: { slug: string };
  className?: string;
  /** Portada principal del artículo: se carga sin lazy para no retrasar el LCP. */
  priority?: boolean;
}

export function BlogCover({ post, className = "", priority = false }: BlogCoverProps) {
  return (
    <div aria-hidden="true" className={`overflow-hidden bg-gray-50 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG generado; next/image no aporta nada aquí */}
      <img
        src={`/blog/${post.slug}/cover`}
        alt=""
        width={COVER_WIDTH}
        height={COVER_HEIGHT}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block h-full w-full object-cover"
      />
    </div>
  );
}
