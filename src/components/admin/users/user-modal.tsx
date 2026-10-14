"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { UserForm } from "./user-form";
import type { Role, UserFormValues, UserType } from "./types";

type UserModalProps = {
  mode: "create" | "edit";
  roles: Role[];
  user?: UserType;
};

export function UserModal({
  mode,
  roles,
  user,
}: UserModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<UserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    roleId: user?.roleId ?? "",
  });

  const handleChange = (
    field: keyof UserFormValues,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const endpoint =
        mode === "create"
          ? "/api/admin/users"
          : `/api/admin/users/${user?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }

      toast.success(
        mode === "create"
          ? "User berhasil dibuat"
          : "User berhasil diperbarui"
      );

      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        ) : (
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create"
              ? "Tambah User"
              : "Edit User"}
          </DialogTitle>
        </DialogHeader>

        <UserForm
          mode={mode}
          values={values}
          roles={roles}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
