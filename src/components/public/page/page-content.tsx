"use client";

import dynamic from "next/dynamic";

const TiptapRenderer = dynamic(
  () => import("@/components/editor/tiptap-renderer").then((mod) => mod.TiptapRenderer),
  { ssr: false }
);

type Props = { content: string };

export default function PageContent({ content }: Props) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return <TiptapRenderer content={parsed} />;
  } catch {}

  return <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</div>;
}
