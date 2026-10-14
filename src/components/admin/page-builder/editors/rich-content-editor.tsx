"use client";

interface Props {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
}

export default function RichContentEditor({
  content,
  onChange,
}: Props) {
  return (
    <textarea
      className="w-full rounded-xl border px-4 py-2"
      rows={8}
      placeholder="Write your content..."
      value={content.body || ""}
      onChange={(e) =>
        onChange({
          ...content,
          body: e.target.value,
        })
      }
    />
  );
}
