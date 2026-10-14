"use client";

import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import type { Role, UserFormValues } from "./types";

type UserFormProps = {
  mode: "create" | "edit";
  values: UserFormValues;
  roles: Role[];
  loading?: boolean;
  onChange: (field: keyof UserFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function UserForm({
  mode,
  values,
  roles,
  loading = false,
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {mode === "create" ? "Password" : "Password Baru"}
        </Label>
        <Input
          id="password"
          type="password"
          value={values.password}
          onChange={(e) => onChange("password", e.target.value)}
          placeholder={
            mode === "edit" ? "Kosongkan jika tidak diubah" : ""
          }
          required={mode === "create"}
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={values.roleId}
          onValueChange={(value) => onChange("roleId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>

          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Simpan"
          ) : (
            "Update User"
          )}
        </Button>
      </div>
    </form>
  );
}
