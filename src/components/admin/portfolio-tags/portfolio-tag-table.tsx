"use client";

import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSearch,
  Tag,
  Layers3,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type PortfolioTag = {
  id: string;
  slug: string;
  isActive: boolean;
  createdAt: string | Date;
  translations?: {
    name: string;
    language?: {
      code: string;
      name: string;
    };
  }[];
  _count?: {
    portfolios: number;
  };
};

type Props = {
  tags: PortfolioTag[];
};

export default function PortfolioTagTable({
  tags = [],
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const filteredTags = useMemo(() => {
    if (!search.trim()) return tags;

    return tags.filter((item) =>
      `${item.slug} ${
        item.translations
          ?.map((t) => t.name)
          .join(" ") || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tags, search]);

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus tag ini?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const res = await fetch(
        `/api/admin/portfolio-tags/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Gagal menghapus tag"
        );
        return;
      }

      toast.success("Tag berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Portfolio Tags
          </h1>
          <p className="text-sm text-muted-foreground">
            Currently showing {tags.length} tags.
          </p>
        </div>

        <Link href="/admin/portfolio-tags/create">
          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Create Tag
          </Button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search tag..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="rounded-xl pl-9"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead className="min-w-[280px]">
                  Tag
                </TableHead>
                <TableHead>Translations</TableHead>
                <TableHead>Portfolios</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FileSearch className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          No tags found
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted/40">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="space-y-1">
                          <p className="font-semibold">
                            {item.translations?.[0]
                              ?.name || "-"}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {item.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {item.translations?.map(
                          (translation, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="mr-1 rounded-full"
                            >
                              {translation.language?.code} —{" "}
                              {translation.name}
                            </Badge>
                          )
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-full"
                      >
                        <Layers3 className="mr-1 h-3.5 w-3.5" />
                        {item._count?.portfolios || 0}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          item.isActive
                            ? "default"
                            : "destructive"
                        }
                        className="rounded-full"
                      >
                        {item.isActive ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/portfolio-tags/${item.id}/edit`}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-xl text-destructive"
                          disabled={
                            deletingId === item.id
                          }
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
