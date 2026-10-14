"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Shield,
  CheckCircle2,
  KeyRound,
  Crown,
} from "lucide-react";

import { CreateRoleModal } from "@/components/admin/roles/create-role-modal";
import { EditRolePermissionModal } from "@/components/admin/roles/edit-role-permission-modal";
import { DeleteRoleModal } from "@/components/admin/roles/delete-role-modal";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Permission = {
  id: string;
  permissionId: string;
  permission: {
    name: string;
  };
};

type Role = {
  id: string;
  name: string;
  permissions: Permission[];
};

type Props = {
  roles: Role[];
};

export function RoleTable({ roles }: Props) {
  const [search, setSearch] = useState("");

  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles;

    return roles.filter((role) =>
      `${role.name} ${role.permissions
        .map((p) => p.permission.name)
        .join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [roles, search]);

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();

    if (name.includes("super")) return Crown;
    if (name.includes("admin")) return Shield;
    return KeyRound;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Role & Permission
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola role dan permission user dari sini.
          </p>
        </div>

        <CreateRoleModal />
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
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
              <TableHead>Role</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => {
                const Icon = getRoleIcon(role.name);

                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                        <Icon className="h-3.5 w-3.5" />
                        {role.name}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-[500px]">
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.length > 0 ? (
                          role.permissions.map((rp) => (
                            <span
                              key={rp.id}
                              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {rp.permission.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Tidak ada permission
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                        {role.permissions.length}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Active
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <EditRolePermissionModal role={role} />
                        <DeleteRoleModal
                          roleId={role.id}
                          roleName={role.name}
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
