"use client";

type TiptapNode = {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, any> }[];
  attrs?: Record<string, any>;
};

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarks(text: string, marks?: TiptapNode["marks"]): string {
  let html = esc(text).replace(/\n/g, "<br />");
  if (!marks) return html;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold": html = `<strong>${html}</strong>`; break;
      case "italic": html = `<em>${html}</em>`; break;
      case "underline": html = `<u>${html}</u>`; break;
      case "strike": html = `<s>${html}</s>`; break;
      case "code": html = `<code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">${html}</code>`; break;
      case "link": {
        const href = mark.attrs?.href || "#";
        const target = mark.attrs?.target || "_blank";
        html = `<a href="${esc(href)}" target="${target}" rel="noopener noreferrer" class="text-primary underline underline-offset-4 hover:text-primary/80">${html}</a>`;
        break;
      }
      case "highlight": {
        const color = mark.attrs?.color || "#fef08a";
        html = `<mark style="background-color:${color};border-radius:2px;padding:0.1em 0.2em">${html}</mark>`;
        break;
      }
      case "subscript": html = `<sub>${html}</sub>`; break;
      case "superscript": html = `<sup>${html}</sup>`; break;
    }
  }
  return html;
}

function renderNode(node: TiptapNode): string {
  if (node.type === "text") {
    return renderMarks(node.text || "", node.marks);
  }

  const children = node.content?.map(renderNode).join("") || "";
  const align = node.attrs?.textAlign && node.attrs.textAlign !== "left"
    ? ` style="text-align:${node.attrs.textAlign}"`
    : "";

  switch (node.type) {
    case "doc":
      return children;

    case "paragraph":
      if (!children) return `<p class="leading-7 [&:not(:first-child)]:mt-4">&nbsp;</p>`;
      return `<p class="leading-7 text-foreground [&:not(:first-child)]:mt-4"${align}>${children}</p>`;

    case "heading": {
      const level = node.attrs?.level || 1;
      const styles: Record<number, string> = {
        1: "text-3xl font-bold mt-8 mb-4",
        2: "text-2xl font-semibold mt-6 mb-3",
        3: "text-xl font-semibold mt-5 mb-2",
      };
      return `<h${level} class="${styles[level] || styles[1]} tracking-tight text-foreground"${align}>${children}</h${level}>`;
    }

    case "bulletList":
      return `<ul class="my-4 ml-6 list-disc space-y-1.5 text-foreground">${children}</ul>`;

    case "orderedList": {
      const start = node.attrs?.start && node.attrs.start !== 1 ? ` start="${node.attrs.start}"` : "";
      return `<ol class="my-4 ml-6 list-decimal space-y-1.5 text-foreground"${start}>${children}</ol>`;
    }

    case "listItem":
      return `<li class="leading-7">${children}</li>`;

    case "taskList":
      return `<ul class="my-4 space-y-2 list-none pl-0">${children}</ul>`;

    case "taskItem": {
      const checked = node.attrs?.checked;
      const checkbox = `<input type="checkbox" ${checked ? "checked" : ""} disabled class="mr-2 mt-1 rounded" />`;
      const textClass = checked ? "line-through text-muted-foreground" : "text-foreground";
      return `<li class="flex items-start gap-1">${checkbox}<span class="${textClass}">${children}</span></li>`;
    }

    case "blockquote":
      return `<blockquote class="my-6 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">${children}</blockquote>`;

    case "codeBlock": {
      const lang = node.attrs?.language || "";
      return `<pre class="my-4 overflow-x-auto rounded-lg border bg-muted/50 p-4"><code class="text-sm font-mono"${lang ? ` data-language="${esc(lang)}"` : ""}>${children}</code></pre>`;
    }

    case "horizontalRule":
      return `<hr class="my-8 border-border" />`;

    case "image": {
      const src = node.attrs?.src || "";
      const alt = node.attrs?.alt || "";
      const title = node.attrs?.title || "";
      const width = node.attrs?.width;
      const widthStyle = width ? ` style="width:${width}px;max-width:100%"` : "";
      const titleAttr = title ? ` title="${esc(title)}"` : "";
      return `<figure class="my-6"><img src="${esc(src)}" alt="${esc(alt)}"${titleAttr}${widthStyle} class="rounded-lg border" />${title ? `<figcaption class="mt-2 text-center text-sm text-muted-foreground">${esc(title)}</figcaption>` : ""}</figure>`;
    }

    case "table":
      return `<div class="my-6 overflow-x-auto"><table class="w-full border-collapse border border-border text-sm">${children}</table></div>`;

    case "tableRow":
      return `<tr>${children}</tr>`;

    case "tableHeader":
      return `<th class="border border-border bg-muted px-3 py-2 text-left font-semibold">${children}</th>`;

    case "tableCell":
      return `<td class="border border-border px-3 py-2">${children}</td>`;

    case "youtube": {
      const src = node.attrs?.src || "";
      const width = node.attrs?.width || 640;
      const height = node.attrs?.height || 360;
      return `<div class="my-6"><iframe src="${esc(src)}" width="${width}" height="${height}" frameborder="0" allowfullscreen class="w-full rounded-lg border aspect-video"></iframe></div>`;
    }

    case "hardBreak":
      return "<br />";

    default:
      return children;
  }
}

type Props = {
  content: unknown;
};

export function TiptapRenderer({ content }: Props) {
  let doc: TiptapNode | null = null;

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.type === "doc") {
        doc = parsed;
      } else if (Array.isArray(parsed)) {
        doc = { type: "doc", content: parsed };
      }
    } catch { return null; }
  } else if (content && typeof content === "object") {
    doc = content as TiptapNode;
  }

  if (!doc || !doc.content?.length) return null;

  const html = renderNode(doc);

  return (
    <div
      className="max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
