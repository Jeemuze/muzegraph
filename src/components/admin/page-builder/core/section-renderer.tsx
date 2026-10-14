"use client";

import { PageSectionItem } from "./types";

interface Props {
  section: PageSectionItem;
}

export default function SectionRenderer({
  section,
}: Props) {
  switch (section.type) {
    case "hero":
      return (
        <section className="rounded-2xl bg-gray-100 p-8 text-center">
          <h1 className="text-3xl font-bold">
            {section.content.title || "Hero Title"}
          </h1>
          <p className="mt-2 text-gray-600">
            {section.content.subtitle ||
              "Hero subtitle goes here"}
          </p>
        </section>
      );

    case "rich-content":
      return (
        <section className="rounded-2xl border p-6">
          <p className="whitespace-pre-line text-gray-700">
            {section.content.body ||
              "Your rich content will appear here"}
          </p>
        </section>
      );

    case "contact-info":
      return (
        <section className="rounded-2xl border p-6">
          <h3 className="mb-3 text-xl font-semibold">
            Contact Info
          </h3>
          <p>
            📞 {section.content.phone || "-"}
          </p>
          <p>
            ✉️ {section.content.email || "-"}
          </p>
        </section>
      );

    default:
      return null;
  }
}
