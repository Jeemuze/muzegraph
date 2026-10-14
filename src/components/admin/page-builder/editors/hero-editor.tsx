"use client";

interface HeroEditorProps {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
}

export default function HeroEditor({
  content,
  onChange,
}: HeroEditorProps) {
  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-xl border px-4 py-2"
        placeholder="Hero Title"
        value={content.title || ""}
        onChange={(e) =>
          onChange({
            ...content,
            title: e.target.value,
          })
        }
      />

      <textarea
        className="w-full rounded-xl border px-4 py-2"
        rows={3}
        placeholder="Hero Subtitle"
        value={content.subtitle || ""}
        onChange={(e) =>
          onChange({
            ...content,
            subtitle: e.target.value,
          })
        }
      />
    </div>
  );
}
