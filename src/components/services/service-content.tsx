"use client";

import dynamic from "next/dynamic";

const TiptapRenderer = dynamic(
  () => import("@/components/editor/tiptap-renderer").then((mod) => mod.TiptapRenderer),
  { ssr: false }
);

type Props = { description: string };

export default function ServiceContent({ description }: Props) {
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") return <TiptapRenderer content={parsed} />;
  } catch {}

  return <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{description}</div>;
}
