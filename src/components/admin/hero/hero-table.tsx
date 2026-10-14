"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

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

type HeroItem = {
  id: string;
  type: string;
  isActive: boolean;
  order: number;
  image: { id: string; url: string; name: string } | null;
  images?: { media: { id: string; url: string; name: string } }[];
  translations: { title: string; subtitle?: string | null }[];
};

export default function HeroTable({ heroes }: { heroes: HeroItem[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/hero/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json())?.error || "Gagal menghapus");
      toast.success("Hero berhasil dihapus");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hero</h1>
          <p className="text-sm text-muted-foreground">Kelola hero section website</p>
        </div>
        <Link href="/admin/hero/create">
          <Button>+ Tambah Hero</Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-background">
        {heroes.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Belum ada hero.</p>
        ) : (
          <div className="divide-y">
            {heroes.map((hero) => (
              <div key={hero.id} className="flex items-center gap-4 p-4">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />

                {/* Thumbnail */}
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {(hero.image?.url || hero.images?.[0]?.media?.url) ? (
                    <Image
                      src={hero.image?.url || hero.images![0].media.url}
                      alt={hero.translations?.[0]?.title || ""}
                      width={96}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">
                    {hero.translations?.[0]?.title || "Untitled"}
                  </h3>
                  {hero.translations?.[0]?.subtitle && (
                    <p className="truncate text-sm text-muted-foreground">
                      {hero.translations[0].subtitle}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{hero.type}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      hero.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {hero.isActive ? "Active" : "Inactive"}
                  </span>

                  <Link href={`/admin/hero/${hero.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() =>
                      setDeleteTarget({ id: hero.id, title: hero.translations?.[0]?.title || "Untitled" })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus hero &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak bisa dibatalkan. Hero akan dihapus permanen.
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
