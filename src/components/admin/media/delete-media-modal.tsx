"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  mediaIds: string[];
  mediaNames?: string[];
  onDeleted?: () => void;
};

export function DeleteMediaModal({
  mediaIds,
  mediaNames = [],
  onDeleted,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isBulkDelete = mediaIds.length > 1;

  async function handleDelete() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: mediaIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus media");
      }

      toast.success(data.message || "Media berhasil dihapus");

      setOpen(false);
      onDeleted?.();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="group h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm border border-white shadow-md hover:bg-white text-gray-700"
        >
          <Trash2 className="h-4 w-4 transition-colors group-hover:text-red-600" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-xl rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-background">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 border border-red-200">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>

            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-xl font-semibold leading-tight">
                {isBulkDelete
                  ? "Hapus beberapa media?"
                  : "Hapus media ini?"}
              </DialogTitle>

              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Data akan dihapus permanen dan tidak dapat dipulihkan kembali.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">
                {isBulkDelete
                  ? `${mediaIds.length} media dipilih`
                  : "File terpilih"}
              </p>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {mediaNames.slice(0, 6).map((name, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-2xl border bg-background px-3 py-3"
                  title={name}
                >
                  <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />

                  <span className="text-sm text-muted-foreground break-all leading-relaxed">
                    {name}
                  </span>
                </div>
              ))}

              {mediaNames.length > 6 && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                  +{mediaNames.length - 6} file lainnya
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t bg-muted/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded-2xl"
          >
            Batal
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-2xl min-w-[130px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </span>
            ) : (
              "Ya, Hapus"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
