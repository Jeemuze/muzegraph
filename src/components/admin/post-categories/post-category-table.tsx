"use client";

import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLucideIcon } from "@/lib/lucide-icon";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Languages,
  FileSearch,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeletePostCategoryModal from "@/components/admin/post-categories/delete-post-category-modal";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type PostCategory = {
  id: string;
  icon: string | null;
  isActive: boolean;
  order: number;
  translations: {
    id: string;
    language: {
      code: string;
      name: string;
    };
    name: string;
    slug: string;
    description?: string | null;
  }[];
};

type Props = {
  categories: PostCategory[];
};

export default function PostCategoryTable({
  categories,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<PostCategory | null>(null);

  // loading simulation biar skeleton tampil konsisten
  const [loading] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;

    return categories.filter((category) => {
      const primaryTranslation =
        category.translations.find(
          (t) => t.language.code === "id"
        ) || category.translations[0];

      if (!primaryTranslation) return false;

      return `${primaryTranslation.name} ${primaryTranslation.slug}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [categories, search]);

  const truncateText = (
    text?: string,
    max = 55
  ) => {
    if (!text) return "-";
    return text.length > max
      ? `${text.slice(0, max)}...`
      : text;
  };

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(
        `/api/admin/post-categories/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus");
        return;
      }

      toast.success("Category berhasil dihapus");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Post Categories
            </h1>
            <p className="text-sm text-muted-foreground">
              Currently showing {categories.length} categories
              in the system.
            </p>
          </div>

          <Link href="/admin/post-categories/create">
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </Link>
        </div>

        {/* SEARCH */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="rounded-xl pl-9"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-[60px]">
                    No
                  </TableHead>
                  <TableHead className="min-w-[420px]">
                    Category
                  </TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map(
                    (_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell className="w-[420px] max-w-[420px]">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 animate-pulse rounded-2xl bg-muted" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-[70%] animate-pulse rounded bg-muted" />
                              <div className="h-3 w-[45%] animate-pulse rounded bg-muted" />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                            <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-40 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileSearch className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            No categories found
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your search or
                            create a new category.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map(
                    (category, index) => {
                      const primaryTranslation =
                        category.translations.find(
                          (t) =>
                            t.language.code === "id"
                        ) || category.translations[0];

                      const SafeIcon = getLucideIcon(
                        category.icon
                      );

                      return (
                        <TableRow
                          key={category.id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          {/* CATEGORY */}
                          <TableCell className="w-[420px] max-w-[420px]">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 shadow-sm">
                                <SafeIcon className="h-5 w-5 text-foreground" />
                              </div>

                              <div className="min-w-0 flex-1 overflow-hidden">
                                <p
                                  title={
                                    primaryTranslation?.name ||
                                    "-"
                                  }
                                  className="text-sm font-semibold leading-snug text-foreground"
                                >
                                  {truncateText(
                                    primaryTranslation?.name,
                                    55
                                  )}
                                </p>

                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {primaryTranslation?.slug ||
                                    "-"}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* META */}
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Languages className="h-4 w-4" />
                                {
                                  category.translations
                                    .length
                                }{" "}
                                languages
                              </div>

                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Order #{category.order}
                              </div>
                            </div>
                          </TableCell>

                          {/* STATUS */}
                            <TableCell>
                              <Badge
                                variant={category.isActive ? "default" : "destructive"}
                                className="gap-1.5 rounded-full px-3 py-1"
                              >
                                {category.isActive ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3.5 w-3.5" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </TableCell>

                          {/* ACTIONS */}
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/post-categories/${category.id}/edit`}
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
                                className="rounded-xl text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <DeletePostCategoryModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteTarget?.id}
        categoryName={
          deleteTarget?.translations.find(
            (t) => t.language.code === "id"
          )?.name || "this category"
        }
      />
    </>
  );
}
