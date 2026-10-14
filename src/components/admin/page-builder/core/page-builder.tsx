"use client";

import { useState } from "react";

import { PageSectionItem, SectionType } from "./types";
import { SECTION_REGISTRY } from "./section-registry";
import SortableSectionList from "./sortable-section-list";
import PreviewPane from "../preview/preview-pane";

interface PageBuilderProps {
  pageId: string;
}

export default function PageBuilder({
  pageId,
}: PageBuilderProps) {
  const [sections, setSections] = useState<PageSectionItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  function addSection(type: SectionType) {
    const newSection: PageSectionItem = {
      id: crypto.randomUUID(),
      type,
      order: sections.length + 1,
      isActive: true,
      content: {},
    };

    setSections((prev) => [...prev, newSection]);
  }

  function updateSection(
    id: string,
    updatedContent: Record<string, any>
  ) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? {
              ...section,
              content: updatedContent,
            }
          : section
      )
    );
  }

  function removeSection(id: string) {
    setSections((prev) =>
      prev
        .filter((section) => section.id !== id)
        .map((section, index) => ({
          ...section,
          order: index + 1,
        }))
    );
  }

  async function saveSections() {
    try {
      setIsSaving(true);

      const response = await fetch(
        `/api/admin/pages/${pageId}/sections`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sections }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      alert("Builder saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save builder");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full">
  <div className="grid min-h-[80vh] grid-cols-1 gap-6 xl:grid-cols-12">
    {/* LEFT PANEL */}
    <div className="flex flex-col rounded-2xl border bg-white xl:col-span-3">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">
          Add Section
        </h2>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {SECTION_REGISTRY.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => addSection(item.type)}
            className="w-full rounded-xl border px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="font-medium">
              {item.label}
            </div>
            <div className="text-sm text-gray-500">
              {item.description}
            </div>
          </button>
        ))}
      </div>

      <div className="border-t p-4">
        <button
          type="button"
          onClick={saveSections}
          disabled={isSaving}
          className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Builder"}
        </button>
      </div>
    </div>

    {/* CENTER PANEL */}
    <div className="rounded-2xl border bg-white xl:col-span-4">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">
          Sections
        </h2>
      </div>

      <div className="p-4">
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
            No sections added yet
          </div>
        ) : (
          <SortableSectionList
            sections={sections}
            onRemove={removeSection}
            onUpdate={updateSection}
            onReorder={setSections}
          />
        )}
      </div>
    </div>

    {/* PREVIEW PANEL */}
    <div className="rounded-2xl border bg-white xl:col-span-5">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">
          Live Preview
        </h2>
      </div>

      <div className="p-4">
        <PreviewPane sections={sections} />
      </div>
    </div>
  </div>
</div>
  );
}
