"use client";

import { useState } from "react";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  postId: string;
  postTitle: string;
  onDeleted?: (postId: string) => void;
};

export function DeleteBlogPostModal({
  postId,
  postTitle,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/blog/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error || "Gagal menghapus post"
        );
        return;
      }

      toast.success("Post berhasil dihapus");
      onDeleted?.(postId);
      setOpen(false);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/50 px-6 py-5">
              <div className="flex min-w-0 items-center gap-4">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-600 dark:border-red-900/40 dark:bg-red-950/30">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">
                    Delete Blog Post
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-5">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  Are you sure you want to permanently
                  delete this post?
                </p>
                <div className="mt-3 rounded-xl bg-background py-2">
                  <p className="whitespace-normal break-words break-all text-sm font-semibold leading-relaxed text-foreground">
                    {postTitle}
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  All related references may be
                  affected after deletion.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-border/50 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
