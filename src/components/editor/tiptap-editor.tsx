"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useRef } from "react";

import { ResizableImage } from "./extensions/resizable-image";
import EditorToolbar from "./EditorToolbar";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function TiptapEditor({ value, onChange }: Props) {
  const initialized = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      ResizableImage,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis konten di sini..." }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ controls: true }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap min-h-[200px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    if (editor && !initialized.current) {
      try {
        const parsed = value ? JSON.parse(value) : null;
        if (parsed && typeof parsed === "object") {
          editor.commands.setContent(parsed);
        }
      } catch {}
      initialized.current = true;
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
