"use client";

import { useMemo, useState } from "react";
import {
  Search,
  KeyRound,
  CheckCircle2,
  Shield,
  Crown,
} from "lucide-react";

import { CreatePermissionModal } from "@/components/admin/permissions/create-permission-modal";
import { DeletePermissionModal } from "@/components/admin/permissions/delete-permission-modal";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PermissionTableProps = {
  permissions: {
    id: string;
    name: string;
    roles: {
      role: {
        id: string;
        name: string;
      };
    }[];
  }[];
};

export function PermissionTable({ permissions }: PermissionTableProps) {
  const [search, setSearch] = useState("");

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return permissions;

    return permissions.filter((permission) =>
      `${permission.name} ${permission.roles
        .map((r) => r.role.name)
        .join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [permissions, search]);

  const getPermissionIcon = (permissionName: string) => {
    const name = permissionName.toLowerCase();

    if (name.includes("super")) return Crown;
    if (name.includes("manage")) return Shield;
    return KeyRound;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola hak akses sistem dari sini.
          </p>
        </div>

        <CreatePermissionModal />
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              <TableHead>Digunakan Oleh</TableHead>
              <TableHead className="text-center">Jumlah Role</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No permissions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => {
                const Icon = getPermissionIcon(permission.name);

                return (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                        <Icon className="h-3.5 w-3.5" />
                        {permission.name}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-[500px]">
                      <div className="flex flex-wrap gap-2">
                        {permission.roles.length > 0 ? (
                          permission.roles.map((r) => (
                            <span
                              key={r.role.id}
                              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {r.role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Tidak digunakan
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                        {permission.roles.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <DeletePermissionModal
                          id={permission.id}
                          name={permission.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
