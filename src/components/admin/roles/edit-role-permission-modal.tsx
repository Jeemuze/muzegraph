"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Pen,
  Loader2,
  ShieldCheck,
  CheckSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Permission = {
  id: string;
  name: string;
};

type RolePermission = {
  permissionId: string;
};

type Role = {
  id: string;
  name: string;
  permissions?: RolePermission[];
};

type Props = {
  role: Role;
};

export function EditRolePermissionModal({ role }: Props) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchPermissions() {
      try {
        const res = await fetch("/api/admin/roles");
        const data = await res.json();

        setPermissions(data.permissions || []);

        const current =
          role.permissions?.map((rp) => rp.permissionId) ?? [];

        setSelected(current);
      } catch {
        setPermissions([]);
      }
    }

    fetchPermissions();
  }, [open, role]);

  function togglePermission(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  }

  async function handleSave() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionIds: selected,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal update");
        return;
      }

      toast.success("Permission berhasil diperbarui");
      setOpen(false);

      await updateSession();
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <Pen className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden shadow-xl">
          <DialogHeader className="border-b px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <DialogTitle className="capitalize">
                  {role.name}
                </DialogTitle>
                <DialogDescription>
                  Atur permission untuk role ini.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada permission tersedia.
                </p>
              ) : (
                permissions.map((p) => {
                  const active = selected.includes(p.id);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`rounded-xl p-2 ${
                          active
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        <CheckSquare className="h-4 w-4" />
                      </div>

                      <span className="text-sm font-medium">
                        {p.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-5">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>

              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
    </>
  );
}
