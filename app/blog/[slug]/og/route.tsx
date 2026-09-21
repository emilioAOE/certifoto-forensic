/**
 * Imagen Open Graph por artículo: /blog/<slug>/og (1200x630 PNG).
 *
 * Fondo = la misma portada generada del sitio (lib/blog-cover.ts), desplazada
 * a la derecha; encima, Satori dibuja el título, la categoría y la marca.
 * Se pre-renderiza en el build (force-static + generateStaticParams), así que
 * no cuesta nada en runtime y Google/LinkedIn/WhatsApp reciben una imagen
 * distinta por artículo (Google exige `image` para los rich results de
 * Article; antes todos los posts compartían la OG genérica del sitio).
 *
 * Tipografía: intenta bajar Geist 800 de Google Fonts en el build, subconjunto
 * al texto del título (patrón de la doc de Vercel). Si la red falla, cae a la
 * fuente por defecto de next/og (Noto Sans regular): la imagen sale igual, con
 * el título en peso normal.
 */

import { ImageResponse } from "next/og";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-posts";
import { coverDataUri, coverTheme, OG_TRANSFORM } from "@/lib/blog-cover";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

const WIDTH = 1200;
const HEIGHT = 630;

async function fuenteTitulo(texto: string): Promise<ArrayBuffer | null> {
  const familias = ["Geist:wght@800", "Inter:wght@800"];
  for (const familia of familias) {
    try {
      const css = await fetch(
        `https://fonts.googleapis.com/css2?family=${familia}&text=${encodeURIComponent(texto)}`,
        // Sin UA moderno Google sirve TTF, que Satori sí entiende (no WOFF2).
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; next-og)" } }
      ).then((r) => (r.ok ? r.text() : ""));
      const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
      if (!src) continue;
      const res = await fetch(src[1]);
      if (res.ok) return await res.arrayBuffer();
    } catch {
      // Sin red en el build: se usa la fuente por defecto.
    }
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const post = getPostBySlug(params.slug);
  if (!post) return new Response("Not found", { status: 404 });

  const theme = coverTheme(post.category);
  const fondo = coverDataUri(post, { withText: false, transform: OG_TRANSFORM });
  const titleSize = post.title.length > 90 ? 40 : post.title.length > 60 ? 46 : 54;
  // El subconjunto debe cubrir TODO lo que se dibuja con esta familia.
  const fuente = await fuenteTitulo(
    `${post.title} ${post.category.toUpperCase()} CertiFoto · Blog Cf min de lectura 0123456789`
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          position: "relative",
          fontFamily: fuente ? "Titulo, sans-serif" : "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fondo}
          width={WIDTH}
          height={HEIGHT}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <div
          style={{
            position: "absolute",
            left: 56,
            top: 56,
            width: 544,
            height: 518,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 44px",
            background: "rgba(255,255,255,0.93)",
            borderRadius: 28,
            border: `2px solid ${theme.accent}55`,
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                background: theme.accent,
                color: "#ffffff",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "8px 16px",
                borderRadius: 999,
              }}
            >
              {post.category.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: theme.ink,
              lineHeight: 1.12,
              letterSpacing: -1,
            }}
          >
            {post.title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  color: "#ffffff",
                  fontSize: 21,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Cf
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0a0e17" }}>
                CertiFoto
              </div>
              <div style={{ fontSize: 20, color: "#6b7280" }}>· Blog</div>
            </div>
            <div style={{ fontSize: 18, color: "#6b7280" }}>
              {post.readMinutes} min de lectura
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fuente
        ? [{ name: "Titulo", data: fuente, weight: 800, style: "normal" }]
        : undefined,
    }
  );
}
