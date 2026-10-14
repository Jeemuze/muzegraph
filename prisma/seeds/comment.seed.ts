import { PrismaClient, CommentStatus } from "@prisma/client";

export async function seedComments(prisma: PrismaClient) {
  const count = await prisma.comment.count();
  if (count > 0) {
    console.log("⚠️ Comments already exist, skip");
    return;
  }

  const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" }, take: 5 });
  if (!posts.length) return;

  const comments = [
    { authorName: "Rizky Pratama", authorEmail: "rizky@mail.com", content: "Artikel yang sangat informatif! Terima kasih sudah berbagi pengetahuan ini.", status: CommentStatus.APPROVED },
    { authorName: "Siti Nurhaliza", authorEmail: "siti@mail.com", content: "Saya sudah coba implementasi tips di artikel ini dan hasilnya luar biasa. Sangat membantu!", status: CommentStatus.APPROVED },
    { authorName: "Ahmad Fauzi", authorEmail: "ahmad@mail.com", content: "Apakah ada tutorial lanjutan untuk topik ini? Saya ingin belajar lebih dalam.", status: CommentStatus.APPROVED },
    { authorName: "Dewi Lestari", authorEmail: "dewi@mail.com", content: "Penjelasannya sangat jelas dan mudah dipahami. Keep up the good work!", status: CommentStatus.APPROVED },
    { authorName: "Budi Santoso", authorEmail: "budi@mail.com", content: "Ini persis yang saya cari. Bookmark dulu untuk referensi nanti.", status: CommentStatus.APPROVED },
    { authorName: "Spam User", authorEmail: "spam@mail.com", content: "Check out my website for free stuff!", status: CommentStatus.REJECTED },
    { authorName: "Rina Wati", authorEmail: "rina@mail.com", content: "Baru baca sekilas, nanti saya baca lebih detail lagi.", status: CommentStatus.PENDING },
  ];

  // Admin replies
  const adminReplies = [
    { authorName: "Admin", authorEmail: "admin@mail.com", content: "Terima kasih atas feedback-nya! Senang bisa membantu.", isAdmin: true, status: CommentStatus.APPROVED },
    { authorName: "Admin", authorEmail: "admin@mail.com", content: "Tentu! Kami akan segera membuat tutorial lanjutannya. Stay tuned!", isAdmin: true, status: CommentStatus.APPROVED },
  ];

  for (const post of posts) {
    // Add 2-3 comments per post
    const postComments = comments.slice(0, 3 + Math.floor(Math.random() * 2));

    for (let i = 0; i < postComments.length; i++) {
      const c = postComments[i];
      const comment = await prisma.comment.create({
        data: {
          postId: post.id,
          authorName: c.authorName,
          authorEmail: c.authorEmail,
          content: c.content,
          status: c.status,
          isAdmin: false,
        },
      });

      // Add admin reply to first 2 comments of each post
      if (i < 2 && adminReplies[i]) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            parentId: comment.id,
            authorName: adminReplies[i].authorName,
            authorEmail: adminReplies[i].authorEmail,
            content: adminReplies[i].content,
            status: adminReplies[i].status,
            isAdmin: true,
          },
        });
      }
    }
  }

  console.log("✅ Comments seeded");
}
