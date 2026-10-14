"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Link2,
  Unlink,
  Code,
  Code2,
  Highlighter,
  Subscript,
  Superscript,
  RemoveFormatting,
  Table,
  TableProperties,
  Video,
  IndentIncrease,
  IndentDecrease,
  WrapText,
  Trash2,
  Plus,
  Columns3,
  Rows3,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = { editor: Editor };

export default function EditorToolbar({ editor }: Props) {
  const [showTableMenu, setShowTableMenu] = useState(false);

  const exec = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  const uploadToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-editor", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload gagal");
    return data.url;
  };

  const handleImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const url = await uploadToServer(file);
        (editor.chain().focus() as any).setImage({ src: url }).run();
      }
    };
    input.click();
  };

  const handleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const prev = editor.getAttributes("link").href || "";
    const url = prompt("Masukkan URL:", prev);
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const handleYoutube = () => {
    const url = prompt("Masukkan URL YouTube:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const Btn = ({ active, disabled, onClick, title, children }: { active?: boolean; disabled?: boolean; onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={exec(onClick)}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none",
        active && "bg-accent text-foreground"
      )}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="mx-1 h-6 w-px bg-border" />;
  const ic = "h-4 w-4";

  return (
    <div className="space-y-0 border-b bg-muted/40">
      {/* Main toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        {/* Text style */}
        <Btn title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className={ic} />
        </Btn>
        <Btn title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className={ic} />
        </Btn>
        <Btn title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className={ic} />
        </Btn>
        <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className={ic} />
        </Btn>
        <Btn title="Inline Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className={ic} />
        </Btn>
        <Btn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className={ic} />
        </Btn>
        <Btn title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <Subscript className={ic} />
        </Btn>
        <Btn title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <Superscript className={ic} />
        </Btn>

        <Sep />

        {/* Block type */}
        <Btn title="Paragraph" active={editor.isActive("paragraph") && !editor.isActive("bulletList") && !editor.isActive("orderedList")} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow className={ic} />
        </Btn>
        <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className={ic} />
        </Btn>
        <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className={ic} />
        </Btn>
        <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className={ic} />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className={ic} />
        </Btn>
        <Btn title="Numbered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className={ic} />
        </Btn>
        <Btn title="Task List" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks className={ic} />
        </Btn>
        <Btn title="Indent" onClick={() => editor.chain().focus().sinkListItem("listItem").run()} disabled={!editor.can().sinkListItem("listItem")}>
          <IndentIncrease className={ic} />
        </Btn>
        <Btn title="Outdent" onClick={() => editor.chain().focus().liftListItem("listItem").run()} disabled={!editor.can().liftListItem("listItem")}>
          <IndentDecrease className={ic} />
        </Btn>

        <Sep />

        {/* Block elements */}
        <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className={ic} />
        </Btn>
        <Btn title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className={ic} />
        </Btn>
        <Btn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className={ic} />
        </Btn>
        <Btn title="Line Break" onClick={() => editor.chain().focus().setHardBreak().run()}>
          <WrapText className={ic} />
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn title="Align Left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className={ic} />
        </Btn>
        <Btn title="Align Center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className={ic} />
        </Btn>
        <Btn title="Align Right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className={ic} />
        </Btn>
        <Btn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className={ic} />
        </Btn>

        <Sep />

        {/* Media */}
        <Btn title="Insert Image" onClick={handleImage}>
          <ImageIcon className={ic} />
        </Btn>
        <Btn title="YouTube Video" onClick={handleYoutube}>
          <Video className={ic} />
        </Btn>
        <Btn title={editor.isActive("link") ? "Remove Link" : "Insert Link"} active={editor.isActive("link")} onClick={handleLink}>
          {editor.isActive("link") ? <Unlink className={ic} /> : <Link2 className={ic} />}
        </Btn>

        <Sep />

        {/* Table */}
        <Btn title="Insert Table" onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}>
          <Table className={ic} />
        </Btn>
        {editor.isActive("table") && (
          <Btn title="Table Options" active={showTableMenu} onClick={() => setShowTableMenu(!showTableMenu)}>
            <TableProperties className={ic} />
          </Btn>
        )}

        <Sep />

        {/* History */}
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className={ic} />
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className={ic} />
        </Btn>

        <Sep />

        <Btn title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <RemoveFormatting className={ic} />
        </Btn>
      </div>

      {/* Table sub-toolbar */}
      {editor.isActive("table") && showTableMenu && (
        <div className="flex flex-wrap items-center gap-1 border-t bg-background px-2 py-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Table:</span>
          <TableBtn onClick={() => editor.chain().focus().addColumnBefore().run()} icon={<Plus className="h-3 w-3" />} label="Add Col Before" />
          <TableBtn onClick={() => editor.chain().focus().addColumnAfter().run()} icon={<Plus className="h-3 w-3" />} label="Add Col After" />
          <TableBtn onClick={() => editor.chain().focus().deleteColumn().run()} icon={<Columns3 className="h-3 w-3" />} label="Delete Col" danger />
          <div className="mx-1 h-4 w-px bg-border" />
          <TableBtn onClick={() => editor.chain().focus().addRowBefore().run()} icon={<Plus className="h-3 w-3" />} label="Add Row Before" />
          <TableBtn onClick={() => editor.chain().focus().addRowAfter().run()} icon={<Plus className="h-3 w-3" />} label="Add Row After" />
          <TableBtn onClick={() => editor.chain().focus().deleteRow().run()} icon={<Rows3 className="h-3 w-3" />} label="Delete Row" danger />
          <div className="mx-1 h-4 w-px bg-border" />
          <TableBtn onClick={() => editor.chain().focus().mergeCells().run()} label="Merge" />
          <TableBtn onClick={() => editor.chain().focus().splitCell().run()} label="Split" />
          <TableBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()} label="Header Row" />
          <div className="mx-1 h-4 w-px bg-border" />
          <TableBtn onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} icon={<Trash2 className="h-3 w-3" />} label="Delete Table" danger />
        </div>
      )}
    </div>
  );
}

function TableBtn({ onClick, icon, label, danger }: { onClick: () => void; icon?: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-accent",
        danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
