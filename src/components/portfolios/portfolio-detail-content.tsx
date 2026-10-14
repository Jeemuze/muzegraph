"use client";

import dynamic from "next/dynamic";

const TiptapRenderer = dynamic(
  () => import("@/components/editor/tiptap-renderer").then((mod) => mod.TiptapRenderer),
  { ssr: false }
);

type Props = { description: string; result: string | null; locale: string };

function RenderContent({ value }: { value: string }) {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return <TiptapRenderer content={parsed} />;
  } catch {}
  return <div className="whitespace-pre-line leading-relaxed text-muted-foreground">{value}</div>;
}

export default function PortfolioDetailContent({ description, result, locale }: Props) {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          {locale === "en" ? "About This Project" : "Tentang Proyek Ini"}
        </h2>
        <RenderContent value={description} />
      </div>
      {result && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {locale === "en" ? "Results" : "Hasil"}
          </h2>
          <RenderContent value={result} />
        </div>
      )}
    </div>
  );
}
