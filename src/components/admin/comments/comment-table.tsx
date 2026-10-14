"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X, Trash2, Reply, Shield } from "lucide-react";
import { toast } from "sonner";

type Comment = {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  isAdmin: boolean;
  postTitle: string;
  parentAuthor: string | null;
  createdAt: string;
};

type Props = { comments: Comment[] };

export default function CommentTable({ comments: initial }: Props) {
  const [comments, setComments] = useState(initial);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? comments : comments.filter((c) => c.status === filter);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      toast.success(`Comment ${status.toLowerCase()}`);
    }
  };

  const deleteComment = async (id: string) => {
    const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comment deleted");
    }
  };

  const submitReply = async (comment: Comment) => {
    if (!replyContent.trim()) return;
    const res = await fetch("/api/admin/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: "", parentId: comment.id, content: replyContent }),
    });
    if (res.ok) {
      toast.success("Reply sent");
      setReplyId(null);
      setReplyContent("");
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const counts = {
    ALL: comments.length,
    PENDING: comments.filter((c) => c.status === "PENDING").length,
    APPROVED: comments.filter((c) => c.status === "APPROVED").length,
    REJECTED: comments.filter((c) => c.status === "REJECTED").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1 w-fit">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {filtered.map((comment) => (
          <div key={comment.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
                  {comment.isAdmin && <Badge variant="default" className="text-[10px] px-1.5 py-0"><Shield className="size-2.5 mr-0.5" />Admin</Badge>}
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", statusColor[comment.status])}>
                    {comment.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{comment.authorEmail} · {comment.postTitle}</p>
                {comment.parentAuthor && (
                  <p className="text-xs text-muted-foreground mb-1">↳ Reply to {comment.parentAuthor}</p>
                )}
                <p className="text-sm text-foreground">{comment.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(comment.createdAt).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {comment.status !== "APPROVED" && (
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => updateStatus(comment.id, "APPROVED")} title="Approve">
                    <Check className="size-3.5 text-green-600" />
                  </Button>
                )}
                {comment.status !== "REJECTED" && (
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => updateStatus(comment.id, "REJECTED")} title="Reject">
                    <X className="size-3.5 text-red-600" />
                  </Button>
                )}
                {!comment.isAdmin && (
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => setReplyId(replyId === comment.id ? null : comment.id)} title="Reply">
                    <Reply className="size-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="size-7" onClick={() => deleteComment(comment.id)} title="Delete">
                  <Trash2 className="size-3.5 text-red-600" />
                </Button>
              </div>
            </div>

            {/* Reply form */}
            {replyId === comment.id && (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply as Admin..."
                  className="flex-1 h-8 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="sm" className="h-8" onClick={() => submitReply(comment)}>Reply</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
