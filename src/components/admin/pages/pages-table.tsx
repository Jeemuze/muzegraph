"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, Trash2, Pencil, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PageItem = {
  id: string;
  slug: string;
  template: string | null;
  status: string;
  isHomePage: boolean;
  updatedAt: string | Date;
  translations: { title: string }[];
};

export default function PagesTable({ pages }: { pages: PageItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        (p.translations?.[0]?.title ?? "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error || "Gagal menghapus");
      }
      toast.success("Page berhasil dihapus");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const statusStyle: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground">Manage website pages</p>
        </div>
        <Link href="/admin/pages/create">
          <Button>+ Create Page</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background">
        {filteredPages.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No pages found.</p>
        ) : (
          <div className="divide-y">
            {filteredPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium">
                      {page.translations?.[0]?.title || "Untitled"}
                    </h3>
                    {page.isHomePage && (
                      <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        HOME
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[page.status] || statusStyle.DRAFT}`}>
                    {page.status}
                  </span>

                  <span className="hidden items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs sm:flex">
                    <LayoutTemplate className="h-3 w-3" />
                    {page.template || "default"}
                  </span>

                  <Link href={`/admin/pages/${page.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget({ id: page.id, title: page.translations?.[0]?.title || "Untitled" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus page &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak bisa dibatalkan. Page beserta semua section dan translation akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
