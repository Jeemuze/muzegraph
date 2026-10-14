"use client";

import { PageSectionItem } from "./types";

import HeroEditor from "../editors/hero-editor";
import RichContentEditor from "../editors/rich-content-editor";
import ContactInfoEditor from "../editors/contact-info-editor";

interface SectionEditorProps {
  section: PageSectionItem;
  onChange: (content: Record<string, any>) => void;
}

export default function SectionEditor({
  section,
  onChange,
}: SectionEditorProps) {
  switch (section.type) {
    case "hero":
      return (
        <HeroEditor
          content={section.content}
          onChange={onChange}
        />
      );

    case "rich-content":
      return (
        <RichContentEditor
          content={section.content}
          onChange={onChange}
        />
      );

    case "contact-info":
      return (
        <ContactInfoEditor
          content={section.content}
          onChange={onChange}
        />
      );

    default:
      return (
        <div className="rounded-xl border p-4 text-sm text-red-500">
          Unknown section type: {section.type}
        </div>
      );
  }
}
