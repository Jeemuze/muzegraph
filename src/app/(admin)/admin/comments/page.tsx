import { prisma } from "@/lib/prisma";
import CommentTable from "@/components/admin/comments/comment-table";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { translations: { select: { title: true }, take: 1 } } },
      parent: { select: { authorName: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
        <p className="text-sm text-muted-foreground">Manage and moderate blog comments</p>
      </div>
      <CommentTable comments={comments.map((c) => ({
        id: c.id,
        authorName: c.authorName,
        authorEmail: c.authorEmail,
        content: c.content,
        status: c.status,
        isAdmin: c.isAdmin,
        postTitle: c.post.translations[0]?.title || "Untitled",
        parentAuthor: c.parent?.authorName || null,
        createdAt: c.createdAt.toISOString(),
      }))} />
    </div>
  );
}
