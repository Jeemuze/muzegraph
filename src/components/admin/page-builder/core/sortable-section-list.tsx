"use client";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { PageSectionItem } from "./types";
import SectionEditor from "./section-editor";

interface Props {
  sections: PageSectionItem[];
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    content: Record<string, any>
  ) => void;
  onReorder: (items: PageSectionItem[]) => void;
}

function SortableItem({
  section,
  onRemove,
  onUpdate,
}: {
  section: PageSectionItem;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    content: Record<string, any>
  ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border bg-white p-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move text-sm text-gray-500"
        >
          ⠿ Drag
        </button>

        <button
          onClick={() => onRemove(section.id)}
          className="text-sm text-red-500"
        >
          Remove
        </button>
      </div>

      <SectionEditor
        section={section}
        onChange={(content) =>
          onUpdate(section.id, content)
        }
      />
    </div>
  );
}

export default function SortableSectionList({
  sections,
  onRemove,
  onUpdate,
  onReorder,
}: Props) {
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = sections.findIndex(
          (s) => s.id === active.id
        );

        const newIndex = sections.findIndex(
          (s) => s.id === over.id
        );

        const reordered = arrayMove(
          sections,
          oldIndex,
          newIndex
        ).map((item, index) => ({
          ...item,
          order: index + 1,
        }));

        onReorder(reordered);
      }}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
