"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";

// Resizable Image Node View Component
function ResizableImageView({ node, updateAttributes, selected }: any) {
  const [resizing, setResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = imgRef.current?.offsetWidth || 300;

    const handleMouseMove = (ev: MouseEvent) => {
      const diff = ev.clientX - startX.current;
      const newWidth = Math.max(100, startWidth.current + diff);
      updateAttributes({ width: newWidth });
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [updateAttributes]);

  return (
    <NodeViewWrapper className="relative inline-block my-2">
      <div className={`relative inline-block ${selected ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}`}>
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          width={node.attrs.width || undefined}
          className="rounded-lg border max-w-full h-auto block"
          style={{ width: node.attrs.width ? `${node.attrs.width}px` : undefined }}
          draggable={false}
        />
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/30 rounded-r-lg transition-colors ${resizing ? "bg-primary/40" : ""}`}
        />
        {node.attrs.width && (
          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {Math.round(node.attrs.width)}px
          </span>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Custom Image Extension with resize support
export const ResizableImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs: Record<string, any> = { ...HTMLAttributes };
    if (attrs.width) {
      attrs.style = `width: ${attrs.width}px`;
    }
    return ["img", mergeAttributes(attrs)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addCommands() {
    return {
      setImage: (options: { src: string; alt?: string; title?: string }) => ({ commands }: any) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    } as any;
  },
});
