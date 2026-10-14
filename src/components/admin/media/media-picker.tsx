"use client";
import type { DragEndEvent } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  FileArchive,
  Video,
  Link2,
  ImageIcon,
  Check,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { MediaUploader } from "@/components/admin/media/media-uploader";

type Media = {
  id: string;
  url: string;
  type: string;
  name: string;
  size?: number;
};

type Props = {
  value?: string | string[];
  onChange: (ids: string | string[]) => void;
  multiple?: boolean;
};

function getMediaIcon(type: string, name: string) {
  if (type === "IMAGE") return <ImageIcon className="w-5 h-5" />;
  if (type === "YOUTUBE") return <Video className="w-5 h-5" />;
  if (name.endsWith(".pdf")) return <FileText className="w-5 h-5" />;
  if (name.endsWith(".zip")) return <FileArchive className="w-5 h-5" />;
  return <Link2 className="w-5 h-5" />;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "-";

  const sizes = ["B", "KB", "MB", "GB"];
  let i = 0;
  let value = bytes;

  while (value >= 1024 && i < sizes.length - 1) {
    value /= 1024;
    i++;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${sizes[i]}`;
}

function SortableItem({
  id,
  url,
  type,
  onRemove,
}: {
  id: string;
  url: string;
  type: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {type === "IMAGE" ? (
        <Image
          src={url}
          alt=""
          fill
          sizes="200px"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {getMediaIcon(type, url)}
        </div>
      )}

      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-1 top-1 z-30 h-5 w-5 rounded-full"
      >
        ×
      </Button>

    </div>
  );
}

export function MediaPicker({
  value = [],
  onChange,
  multiple = true,
}: Props) {
  const [media, setMedia] = useState<Media[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));
  const normalizedValue = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];


    async function fetchMedia() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/media");
        const data = await res.json();
        setMedia(data);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      fetchMedia();
    }, []);


  const filteredMedia = useMemo(() => {
    return media.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [media, search]);

  function toggleSelect(id: string) {
    if (multiple) {
      if (normalizedValue.includes(id)) {
        onChange(normalizedValue.filter((v) => v !== id));
      } else {
        onChange([...normalizedValue, id]);
      }
    } else {
      onChange(id);
      setOpen(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = normalizedValue.indexOf(String(active.id));
    const newIndex = normalizedValue.indexOf(String(over.id));
    onChange(arrayMove(normalizedValue, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <Label>Media</Label>

      {normalizedValue.length > 0 && (
      multiple ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
      <SortableContext
        items={normalizedValue}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {normalizedValue.map((id) => {
            const item = media.find((m) => m.id === id);
            if (!item) return null;

            return (
              <SortableItem
                key={id}
                id={id}
                url={item.url}
                type={item.type}
                onRemove={() =>
                  onChange(normalizedValue.filter((v) => v !== id))
                }
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {normalizedValue.map((id) => {
        const item = media.find((m) => m.id === id);
        if (!item) return null;

        return (
          <div
            key={id}
            className="group relative aspect-square rounded-2xl overflow-hidden border bg-muted/20"
          >
            <Image
              src={item.url}
              alt=""
              fill
              sizes="200px"
              className="object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => onChange(normalizedValue.filter((v) => v !== id))}
              className="absolute right-1 top-1 z-30 h-5 w-5 rounded-full"
            >
              ×
            </Button>
          </div>
        );
      })}
    </div>
  )
)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-11 rounded-2xl border-border bg-background px-4"
          >
            {normalizedValue.length > 0
              ? `Kelola Media (${normalizedValue.length})`
              : "Pilih Media"}
          </Button>
        </DialogTrigger>

        <DialogContent className="flex h-[90vh] w-[95vw] max-w-7xl flex-col rounded-3xl border border-border bg-background p-0 shadow-xl">
          <div className="space-y-4 border-b border-border p-6">
            <DialogTitle className="text-xl font-semibold">
              Media Library
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
              Pilih satu atau beberapa file dari media library untuk digunakan.
            </DialogDescription>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-2xl pl-10"
                />
              </div>

              <MediaUploader onUploaded={fetchMedia} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            {loading ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-muted animate-pulse"
                  />
                ))}
              </div>
              ) : filteredMedia.length === 0 ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 text-center">
                    <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground" />

                    <h3 className="text-base font-semibold">
                      Media tidak ditemukan
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Coba ubah kata kunci pencarian atau upload file baru.
                    </p>

                    <div className="mt-5">
                      <MediaUploader onUploaded={fetchMedia} />
                    </div>
                  </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                      {filteredMedia.map((item) => {
                    const active = normalizedValue.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`
                        cursor-pointer overflow-hidden rounded-2xl border border-border
                        bg-card transition-all duration-200 hover:shadow-md
                        ${active ? "ring-2 ring-primary" : "hover:shadow-lg"}
                      `}
                    >
                      <div className="relative aspect-square bg-muted/30">
                        {item.type === "IMAGE" ? (
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            sizes="250px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getMediaIcon(item.type, item.name)}
                          </div>
                        )}

                        {active && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 p-3">
                        <p className="line-clamp-2 text-xs font-medium">
                          {item.name}
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className="rounded-xl text-[10px]"
                          >
                            {item.type}
                          </Badge>

                          <span className="text-[10px] text-muted-foreground">
                            {formatFileSize(item.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border p-6">
            <p className="text-xs text-muted-foreground">
              {normalizedValue.length} file dipilih
            </p>

            <Button onClick={() => setOpen(false)} className="rounded-2xl">
              Selesai
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
