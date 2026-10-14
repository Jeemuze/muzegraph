"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

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
  id: string;
  name: string;
};

export function DeletePermissionModal({
  id,
  name,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/permissions/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error ||
            "Gagal hapus permission"
        );
        return;
      }

      toast.success(
        "Permission berhasil dihapus"
      );

      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-xl hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <DialogTitle className="text-center text-xl font-semibold">
            Hapus Permission
          </DialogTitle>

          <DialogDescription className="text-center text-sm leading-relaxed">
            Permission ini akan
            dihapus secara permanen
            dan tidak dapat
            dikembalikan.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border bg-muted/40 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Permission yang akan
              dihapus:
            </p>

            <p className="mt-1 break-all text-base font-semibold">
              {name}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl"
              onClick={() =>
                setOpen(false)
              }
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              className="flex-1 rounded-2xl"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
