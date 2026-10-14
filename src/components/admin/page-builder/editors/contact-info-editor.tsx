"use client";

interface Props {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
}

export default function ContactInfoEditor({
  content,
  onChange,
}: Props) {
  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-xl border px-4 py-2"
        placeholder="Phone"
        value={content.phone || ""}
        onChange={(e) =>
          onChange({
            ...content,
            phone: e.target.value,
          })
        }
      />

      <input
        className="w-full rounded-xl border px-4 py-2"
        placeholder="Email"
        value={content.email || ""}
        onChange={(e) =>
          onChange({
            ...content,
            email: e.target.value,
          })
        }
      />
    </div>
  );
}
