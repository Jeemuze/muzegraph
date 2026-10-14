"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  serviceId: string;
  serviceName: string;
};

export function DeleteServiceModal({
  serviceId,
  serviceName,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus service");
      }

      toast.success("Service berhasil dihapus");
      setOpen(false);
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
          variant="destructive"
          className="rounded-xl shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-left text-lg">
                Hapus Service
              </DialogTitle>
              <DialogDescription className="text-left text-sm">
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Anda akan menghapus service berikut:
          </p>

          <div className="rounded-2xl border bg-muted/40 px-4 py-3">
            <p className="text-sm font-semibold truncate">
              {serviceName}
            </p>
          </div>

          <p className="text-xs text-red-500">
            Semua data terkait service ini akan hilang secara permanen.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded-xl"
          >
            Batal
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl min-w-[110px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Hapus...
              </span>
            ) : (
              "Hapus"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
