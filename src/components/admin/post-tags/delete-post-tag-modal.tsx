"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  tagName?: string;
};

export default function DeletePostTagModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  tagName = "this tag",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-600 dark:border-red-900/40 dark:bg-red-950/30">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Delete Tag
              </h2>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-foreground">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{tagName}</span>?
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              All related references may be affected after deletion.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border/50 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
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
  );
}
