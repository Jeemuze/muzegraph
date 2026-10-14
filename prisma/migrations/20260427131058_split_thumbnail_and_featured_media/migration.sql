/*
  Warnings:

  - You are about to drop the column `featuredMediaId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_featuredMediaId_fkey";

-- DropIndex
DROP INDEX "Post_featuredMediaId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "featuredMediaId",
ADD COLUMN     "thumbnailId" TEXT;

-- CreateTable
CREATE TABLE "BlogPostMedia" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPostMedia_postId_idx" ON "BlogPostMedia"("postId");

-- CreateIndex
CREATE INDEX "BlogPostMedia_mediaId_idx" ON "BlogPostMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostMedia_postId_mediaId_key" ON "BlogPostMedia"("postId", "mediaId");

-- CreateIndex
CREATE INDEX "Post_thumbnailId_idx" ON "Post"("thumbnailId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostMedia" ADD CONSTRAINT "BlogPostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostMedia" ADD CONSTRAINT "BlogPostMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
