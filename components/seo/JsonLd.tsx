/**
 * Helper para emitir structured data (JSON-LD) en server components.
 * Uso: <JsonLd data={...} /> dentro de cualquier page.tsx.
 *
 * El JSON se serializa con replace de "<" para evitar XSS si algun campo
 * trajera contenido del usuario (defensivo — hoy todo es estatico).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
