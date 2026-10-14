"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Briefcase,
  Crown,
  User,
} from "lucide-react";

import { UserModal } from "@/components/admin/users/user-modal";
import DeleteUserModal from "@/components/admin/users/delete-user-modal";
import type { Role, UserTableType } from "@/components/admin/users/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Props = {
  users: UserTableType[];
  roles: Role[];
};

export function UserTable({ users, roles }: Props) {
  const [search, setSearch] = useState("");

  const formatDate = (date: string | Date) =>
    new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    return users.filter((user) =>
      `${user.name ?? ""} ${user.email} ${user.role?.name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Currently showing {users.length} registered users in the system.
          </p>
        </div>

        <UserModal mode="create" roles={roles} />
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">No</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name || "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>

                  {/* ROLE */}
                  <TableCell>
                    {(() => {
                      const roleName = user.role?.name?.toLowerCase() || "";

                      const roleConfig = {
                        admin: {
                          icon: ShieldCheck,
                          label: "Admin",
                        },
                        superadmin: {
                          icon: Crown,
                          label: "Super Admin",
                        },
                        user: {
                          icon: User,
                          label: "User",
                        },
                        staff: {
                          icon: Briefcase,
                          label: "Staff",
                        },
                      };

                      const currentRole =
                        roleConfig[roleName as keyof typeof roleConfig];

                      const Icon = currentRole?.icon || Shield;
                      const label = currentRole?.label || user.role?.name || "-";

                      return (
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </span>
                      );
                    })()}
                  </TableCell>

                  <TableCell>{formatDate(user.createdAt)}</TableCell>

                  <TableCell>{formatDate(user.updatedAt)}</TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Active
                    </span>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
<div className="flex justify-end gap-2">
  <UserModal
    mode="edit"
    roles={roles}
    user={{
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
    }}
  />

  <DeleteUserModal
    userId={user.id}
    trigger={
      <Button size="icon" variant="ghost">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    }
  />
</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
