"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  UploadCloud,
  Link2,
  PlayCircle,
  FileUp,
  Loader2,
  X,
  FileText,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type TabType = "upload" | "youtube" | "link";

type MediaUploaderProps = {
  onUploaded?: () => void;
};

export function MediaUploader({ onUploaded }: MediaUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("upload");

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [youtubeLink, setYoutubeLink] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [externalName, setExternalName] = useState("");

  async function uploadFiles() {
    if (!selectedFiles.length) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("file", file);
    });

    const loadingToast = toast.loading("Mengupload media...");

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Upload gagal");
        return;
      }

      toast.dismiss(loadingToast);
      toast.success(data.message || "Media berhasil diupload");

      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setOpen(false);

      onUploaded?.();
      router.refresh();

    } catch {
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function saveLink(
  url: string,
  type: "VIDEO" | "FILE",
  name?: string
) {
  if (!url.trim()) {
    toast.error("URL wajib diisi");
    return;
  }

  if (type === "FILE" && !name?.trim()) {
    toast.error("Nama link wajib diisi");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("url", url);
  formData.append("type", type);
  formData.append("name", name || "");

  const loadingToast = toast.loading("Menyimpan link...");

  try {
    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      toast.dismiss(loadingToast);
      toast.error(data.error || "Gagal menyimpan link");
      return;
    }

    toast.dismiss(loadingToast);
    toast.success("Link berhasil disimpan");

    setYoutubeLink("");
    setExternalLink("");
    setExternalName("");
    setOpen(false);

    onUploaded?.();
    router.refresh();


  } catch {
    toast.dismiss(loadingToast);
    toast.error("Terjadi kesalahan");
  } finally {
    setLoading(false);
  }
}

  const tabs = [
    { key: "upload", label: "Upload", icon: UploadCloud },
    { key: "youtube", label: "YouTube", icon: PlayCircle },
    { key: "link", label: "External", icon: Link2 },
  ];

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
          }
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="h-10 gap-2 rounded-2xl px-4 text-sm">
            <FileUp className="w-4 h-4" />
            Upload Media
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl rounded-3xl border border-border bg-background p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Upload & Embed Media
            </DialogTitle>

            <DialogDescription>
              Upload file, tambahkan video YouTube, atau simpan external link.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="mt-5 grid grid-cols-3 rounded-2xl border border-border bg-muted/50 p-1">
            {tabs.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key as TabType)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    tab === item.key
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="mt-6 rounded-3xl border border-border bg-card p-5">
            {/* Upload */}
            {tab === "upload" && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);

                    if (e.dataTransfer.files) {
                      setSelectedFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  onClick={() => inputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background/50 hover:bg-muted/40"
                  }`}
                >
                  <UploadCloud className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />

                  <h3 className="font-semibold text-sm">
                    Drag & Drop file di sini
                  </h3>

                  <p className="text-xs text-muted-foreground mt-1">
                    atau klik untuk memilih file
                  </p>
                </div>

                  {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
                      {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[280px]">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles((prev) => prev.filter((_, index) => index !== i));
                          }}
                          className="h-8 w-8 rounded-xl"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                    <Button
                      className="h-12 w-full rounded-2xl"
                      disabled={loading}
                      onClick={uploadFiles}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Simpan File"
                      )}
                    </Button>
                  </div>
                )}

              </div>
            )}

            {/* YouTube */}
            {tab === "youtube" && (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  className="h-12 rounded-2xl"
                />

                  <Button
                    className="h-12 w-full rounded-2xl"
                    disabled={loading}
                    onClick={() => saveLink(youtubeLink, "VIDEO")}
                  >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan YouTube"
                  )}
                </Button>
              </div>
            )}

            {/* External Link */}
            {tab === "link" && (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        Nama Link <span className="text-destructive">*</span>
      </Label>

      <Input
        type="text"
        required
        placeholder="Contoh: Company Profile PDF"
        value={externalName}
        onChange={(e) => setExternalName(e.target.value)}
        className="h-12 rounded-2xl"
      />
    </div>

    <div className="space-y-2">
      <Label>
        URL <span className="text-destructive">*</span>
      </Label>

      <Input
        type="text"
        required
        placeholder="https://example.com/file.pdf"
        value={externalLink}
        onChange={(e) => setExternalLink(e.target.value)}
        className="h-12 rounded-2xl"
      />
    </div>

      <Button
        className="h-12 w-full rounded-2xl"
        disabled={loading}
        onClick={() => saveLink(externalLink, "FILE", externalName)}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Simpan Link"
        )}
      </Button>
  </div>
)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
