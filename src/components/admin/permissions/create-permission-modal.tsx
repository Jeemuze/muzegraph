"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  KeyRound,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreatePermissionModal() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error(
        "Nama permission tidak boleh kosong"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/admin/permissions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error ||
            "Terjadi kesalahan"
        );
        return;
      }

      toast.success(
        "Permission berhasil dibuat"
      );

      setName("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(
        "Gagal membuat permission"
      );
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
        <Button className="rounded-2xl">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Permission
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>

          <DialogTitle className="text-center text-xl font-semibold">
            Tambah Permission
          </DialogTitle>

          <DialogDescription className="text-center text-sm">
            Tambahkan permission baru
            untuk mengatur akses
            sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="space-y-2">
            <Label>
              Nama Permission
            </Label>

            <Input
              placeholder="manage_users"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleSubmit()
              }
              className="rounded-2xl"
            />

            <p className="text-xs text-muted-foreground">
              Gunakan format snake_case
              untuk konsistensi.
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
              className="flex-1 rounded-2xl"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
