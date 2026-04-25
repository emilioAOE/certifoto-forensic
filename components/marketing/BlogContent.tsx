/**
 * Renderizador simple de contenido de blog.
 * Soporta:
 * - Parrafos (separados por linea en blanco)
 * - "## " al inicio de linea = subtitulo H2
 * - "### " al inicio de linea = subtitulo H3
 * - "- " al inicio de linea = item de lista
 * - "> " al inicio de linea = blockquote
 */

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
  | { kind: "quote"; text: string };

function parseContent(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let currentList: string[] | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ kind: "p", text: currentParagraph.join(" ").trim() });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      blocks.push({ kind: "ul", items: currentList });
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

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      if (!currentList) currentList = [];
      currentList.push(trimmed.slice(2));
      continue;
    }

    flushList();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
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
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={key} className="space-y-2 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-base text-gray-700 leading-relaxed">
              <span className="text-accent-dark mt-1.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-accent pl-4 py-1 italic text-gray-600 leading-relaxed bg-accent-softer/40 rounded-r-md my-4"
        >
          {block.text}
        </blockquote>
      );
  }
}
