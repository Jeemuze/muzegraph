"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const TiptapRenderer = dynamic(
  () => import("@/components/editor/tiptap-renderer").then((mod) => mod.TiptapRenderer),
  { ssr: false }
);

type Props = { html: string };

export default function BlogContent({ html }: Props) {
  const content = useMemo(() => {
    try {
      const parsed = JSON.parse(html);
      if (parsed && typeof parsed === "object") return parsed;
      return null;
    } catch {
      return null;
    }
  }, [html]);

  if (content) {
    return <TiptapRenderer content={content} />;
  }

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
