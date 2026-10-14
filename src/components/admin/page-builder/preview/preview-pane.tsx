"use client";

import { PageSectionItem } from "../core/types";
import SectionRenderer from "../core/section-renderer";

interface Props {
  sections: PageSectionItem[];
}

export default function PreviewPane({
  sections,
}: Props) {
  return (
    <div className="space-y-6 rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">
        Live Preview
      </h2>

      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No preview available
        </div>
      ) : (
        sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
          />
        ))
      )}
    </div>
  );
}
