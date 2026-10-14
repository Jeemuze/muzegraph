"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  FileArchive,
  FileImage,
  FileVideo,
  FileText,
  File,
  FileSpreadsheet,
} from "lucide-react";

import { DeleteMediaModal } from "@/components/admin/media/delete-media-modal";
import { MediaCard } from "@/components/admin/media/media-card";

type Media = {
  id: string;
  name: string;
  url: string;
  type: "IMAGE" | "FILE" | "VIDEO";
  size?: number | null;
  mimeType?: string | null;
  createdAt?: string | Date;
};

export function MediaGrid({ media }: { media: Media[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setSelected((prev) =>
      prev.filter((id) => media.some((m) => m.id === id))
    );
  }, [media]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const clearSelection = () => {
    setSelected([]);
  };

  const filteredMedia = useMemo(() => {
    return media.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [media, search]);

  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);

  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedia.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedia, currentPage]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };


  const formatDate = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date);

    const tanggal = d.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const jam = d.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${tanggal}, ${jam} WIB`;
  };


  const getYoutubeThumbnail = (url: string) => {
    try {
      const parsed = new URL(url);

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1];
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }

      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }

      if (parsed.hostname === "youtu.be") {
        const id = parsed.pathname.replace("/", "");
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }

      return null;
    } catch {
      return null;
    }
  };

  const getFileIcon = (name: string, type: Media["type"]) => {
    const ext = name.split(".").pop()?.toLowerCase();

    if (type === "IMAGE") {
      return <FileImage className="h-8 w-8" />;
    }

    if (type === "VIDEO") {
      return <FileVideo className="h-8 w-8" />;
    }

    switch (ext) {
      case "zip":
      case "rar":
      case "7z":
        return <FileArchive className="h-8 w-8" />;
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
        return <FileText className="h-8 w-8" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className="h-8 w-8" />;
      default:
        return <File className="h-8 w-8" />;
    }
  };

  const getExtension = (name: string) => {
    return name.split(".").pop()?.toUpperCase() || "FILE";
  };

  return (
    <div className="space-y-6">
      {/* SEARCH + ACTION */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Cari media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {selected.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
              {selected.length} file dipilih
            </div>

            <DeleteMediaModal
              mediaIds={selected}
              mediaNames={media
                .filter((m) => selected.includes(m.id))
                .map((m) => m.name)}
              onDeleted={clearSelection}
            />
          </div>
        )}
      </div>

      {/* RESULT INFO */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">
            {filteredMedia.length}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-foreground">{media.length}</span>{" "}
          media
        </p>

        {search && (
          <button
            onClick={() => setSearch("")}
            className="w-fit rounded-xl border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Reset pencarian
          </button>
        )}
      </div>

      {/* GRID */}
      {filteredMedia.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {paginatedMedia.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                selected={selected}
                toggleSelect={toggleSelect}
                getYoutubeThumbnail={getYoutubeThumbnail}
                getFileIcon={getFileIcon}
                getExtension={getExtension}
                formatSize={formatSize}
                formatDate={formatDate}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border bg-muted/40">
            <FileImage className="h-10 w-10 text-muted-foreground" />
          </div>

          <h3 className="text-xl font-semibold text-foreground">
            {search ? "Media tidak ditemukan" : "Belum ada media"}
          </h3>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {search
              ? "Coba gunakan kata kunci lain untuk menemukan file yang kamu cari."
              : "Upload file pertama kamu untuk mulai mengelola galeri media."}
          </p>
        </div>
      )}
    </div>
  );
}
