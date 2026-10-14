"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { MessageSquare, Reply, Send, Shield } from "lucide-react";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  replies: Comment[];
};

type Props = {
  postId: string;
  comments: Comment[];
  locale: string;
};

export default function CommentSection({ postId, comments, locale }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (parentId?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          parentId: parentId || null,
          authorName: name,
          authorEmail: email,
          content: parentId ? replyContent : content,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setContent("");
        setReplyContent("");
        setReplyTo(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const t = locale === "en"
    ? { title: "Comments", count: `${comments.length} comments`, name: "Name", email: "Email", comment: "Write a comment...", reply: "Reply", submit: "Submit", submitting: "Submitting...", success: "Your comment has been submitted and is awaiting moderation.", replyTo: "Reply to" }
    : { title: "Komentar", count: `${comments.length} komentar`, name: "Nama", email: "Email", comment: "Tulis komentar...", reply: "Balas", submit: "Kirim", submitting: "Mengirim...", success: "Komentar Anda telah dikirim dan menunggu moderasi.", replyTo: "Balas ke" };

  return (
    <div>
      <Separator className="mb-8" />

      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="size-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
        <Badge variant="secondary" className="text-xs">{t.count}</Badge>
      </div>

      {/* Comment form */}
      <div className="rounded-xl border border-border bg-background p-5 mb-8">
        {success ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t.success}</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.name}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.comment}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!name || !email || !content || submitting}
                onClick={() => submit()}
                className="gap-2"
              >
                <Send className="size-3.5" />
                {submitting ? t.submitting : t.submit}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex size-7 items-center justify-center rounded-full text-xs font-medium", comment.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {comment.isAdmin ? <Shield className="size-3.5" /> : comment.authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
              {comment.isAdmin && <Badge variant="default" className="text-[10px] px-1.5 py-0">Admin</Badge>}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(comment.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>

            {/* Reply button */}
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="size-3" />
              {t.reply}
            </button>

            {/* Reply form */}
            {replyTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`${t.replyTo} ${comment.authorName}...`}
                  className="flex-1 h-8 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button
                  size="sm"
                  disabled={!name || !email || !replyContent || submitting}
                  onClick={() => submit(comment.id)}
                  className="h-8"
                >
                  <Send className="size-3" />
                </Button>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4 ml-6 space-y-3 border-l-2 border-border pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("flex size-6 items-center justify-center rounded-full text-[10px] font-medium", reply.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        {reply.isAdmin ? <Shield className="size-3" /> : reply.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{reply.authorName}</span>
                      {reply.isAdmin && <Badge variant="default" className="text-[10px] px-1.5 py-0">Admin</Badge>}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(reply.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
