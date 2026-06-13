/**
 * Renderizador simple de contenido de blog.
 *
 * Bloques (inicio de línea):
 * - "## "  = subtitulo H2
 * - "### " = subtitulo H3
 * - "- "   = item de lista con viñeta
 * - "1. "  = item de lista numerada
 * - "> "   = blockquote
 * - resto  = parrafo (lineas contiguas se unen; linea en blanco separa)
 *
 * Inline (dentro de parrafos, items y citas):
 * - **negrita**
 * - [texto](/ruta-interna) -> next/link  ·  [texto](https://externo) -> <a>
 */

import Link from "next/link";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const blocks = parseContent(content);

  return (
    <div className="prose-content space-y-5">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string };

function parseContent(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let currentList: { ordered: boolean; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ kind: "p", text: currentParagraph.join(" ").trim() });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({
        kind: currentList.ordered ? "ol" : "ul",
        items: currentList.items,
      });
    }
    currentList = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "h2", text: trimmed.slice(3) });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "h3", text: trimmed.slice(4) });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "quote", text: trimmed.slice(2) });
      continue;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(trimmed.slice(2));
      continue;
    }

    flushList();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

/** Parsea **negrita** y [texto](href) a nodos React. */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      );
    } else {
      const label = match[2];
      const href = match[3];
      if (href.startsWith("/")) {
        nodes.push(
          <Link
            key={key++}
            href={href}
            className="text-accent-dark underline underline-offset-2 hover:text-accent"
          >
            {label}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-dark underline underline-offset-2 hover:text-accent"
          >
            {label}
          </a>
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.kind) {
    case "h2":
      return (
        <h2
          key={key}
          className="text-2xl font-bold text-gray-900 tracking-tight mt-10 mb-4"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={key}
          className="text-xl font-bold text-gray-900 tracking-tight mt-8 mb-3"
        >
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={key} className="text-base text-gray-700 leading-relaxed">
          {renderInline(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul key={key} className="space-y-2 my-4">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 text-base text-gray-700 leading-relaxed"
            >
              <span className="text-accent-dark mt-1.5">·</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={key}
          className="space-y-2 my-4 list-decimal pl-5 marker:text-accent-dark marker:font-semibold"
        >
          {block.items.map((item, i) => (
            <li key={i} className="text-base text-gray-700 leading-relaxed pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-accent pl-4 py-1 italic text-gray-600 leading-relaxed bg-accent-softer/40 rounded-r-md my-4"
        >
          {renderInline(block.text)}
        </blockquote>
      );
  }
}
