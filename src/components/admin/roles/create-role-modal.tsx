"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateRoleModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Nama role tidak boleh kosong");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim().toLowerCase(),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(
        data.error || "Gagal membuat role"
      );
      return;
    }

    toast.success(
      `Role "${data.name}" berhasil dibuat`
    );

    setName("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Tambah Role</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            Tambah Role Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Nama Role</Label>
            <Input
              placeholder="editor, viewer, manager"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleCreate()
              }
            />
            <p className="text-xs text-muted-foreground">
              Nama role akan otomatis
              dijadikan lowercase
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreate}
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
