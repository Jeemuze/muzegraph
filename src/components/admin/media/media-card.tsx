"use client";
import Image from "next/image";
import { DeleteMediaModal } from "@/components/admin/media/delete-media-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { DialogDescription } from "@/components/ui/dialog";

type Media = {
  id: string;
  name: string;
  url: string;
  type: "IMAGE" | "FILE" | "VIDEO";
  size?: number | null;
  createdAt?: string | Date;
};

type Props = {
  item: Media;
  selected: string[];
  toggleSelect: (id: string) => void;
  getYoutubeThumbnail: (url: string) => string | null;
  getFileIcon: (name: string, type: Media["type"]) => React.ReactNode;
  getExtension: (name: string) => string;
  formatSize: (bytes?: number) => string;
  formatDate: (date?: string) => string;
};

export function MediaCard({
  item,
  selected,
  toggleSelect,
  getYoutubeThumbnail,
  getFileIcon,
  getExtension,
  formatSize,
  formatDate,
  }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const youtubeThumb =
    item.type === "VIDEO" ? getYoutubeThumbnail(item.url) : null;

  return (
    <>
      <div
        className={`group border rounded-2xl overflow-hidden bg-background transition-all hover:shadow-lg cursor-pointer ${
          selected.includes(item.id) ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => setPreviewOpen(true)}
      >
        <div className="h-36 bg-muted relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelect(item.id);
            }}
            className="absolute top-2 left-2 z-20 bg-background rounded-full p-1 shadow"
          >
            <div
              className={`w-4 h-4 rounded-full border ${
                selected.includes(item.id) ? "bg-primary" : "bg-background"
              }`}
            />
          </button>

          <div
            className="absolute top-2 right-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <DeleteMediaModal
              mediaIds={[item.id]}
              mediaNames={[item.name]}
            />
          </div>


          {item.type === "IMAGE" ? (
<Image
  src={item.url}
  alt={item.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover transition-transform duration-300 group-hover:scale-105"
/>
          ) : youtubeThumb ? (
<img
  key={youtubeThumb}
  src={youtubeThumb}
  alt={item.name}
  className={`w-full h-full object-cover transition-all duration-500 ${
    loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
  }`}
  onLoad={() => setLoaded(true)}
  onError={(e) => {
    const target = e.currentTarget;

    if (target.src.includes("maxresdefault")) {
      target.src = target.src.replace("maxresdefault", "sddefault");
    } else {
      setLoaded(true);
    }
  }}
/>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              {getFileIcon(item.name, item.type)}
              <span className="text-[10px] mt-2 font-semibold">
                {getExtension(item.name)}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs font-medium truncate" title={item.name}>
            {item.name}
          </p>

          <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{getExtension(item.name)}</span>
              <span>{formatSize(item.size ?? undefined)}</span>
            </div>

            <div className="text-[11px]">
              {formatDate(item.createdAt?.toString())}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-5xl rounded-3xl p-0 overflow-hidden">
<DialogHeader className="p-6 border-b">
  <DialogTitle className="truncate text-left">
    {item.name}
  </DialogTitle>

  <DialogDescription className="sr-only">
    Preview media dalam ukuran besar.
  </DialogDescription>
</DialogHeader>

          <div className="bg-black/95 flex items-center justify-center max-h-[80vh]">
            {item.type === "IMAGE" ? (
              <img
                src={item.url}
                alt={item.name}
                className="max-h-[75vh] w-auto object-contain"
              />
            ) : youtubeThumb ? (
              <iframe
                src={
                  item.url.includes("watch?v=")
                    ? item.url.replace("watch?v=", "embed/")
                    : item.url
                }
                className="w-full aspect-video"
                allowFullScreen
              />
            ) : (
              <div className="p-10 text-center bg-background w-full">
                <div className="flex justify-center mb-4">
                  {getFileIcon(item.name, item.type)}
                </div>

                <p className="font-medium">{item.name}</p>

                <Button asChild className="mt-5 rounded-xl">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buka File
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
