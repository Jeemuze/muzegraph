-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "featuredMediaId" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "allowComments" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCategory" (
    "id" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTagTranslation" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostTagTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostToCategory" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PostToCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostToTag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PostToTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_featuredMediaId_idx" ON "Post"("featuredMediaId");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "PostTranslation_slug_idx" ON "PostTranslation"("slug");

-- CreateIndex
CREATE INDEX "PostTranslation_postId_idx" ON "PostTranslation"("postId");

-- CreateIndex
CREATE INDEX "PostTranslation_languageId_idx" ON "PostTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTranslation_postId_languageId_key" ON "PostTranslation"("postId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTranslation_slug_languageId_key" ON "PostTranslation"("slug", "languageId");

-- CreateIndex
CREATE INDEX "PostCategoryTranslation_categoryId_idx" ON "PostCategoryTranslation"("categoryId");

-- CreateIndex
CREATE INDEX "PostCategoryTranslation_languageId_idx" ON "PostCategoryTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategoryTranslation_categoryId_languageId_key" ON "PostCategoryTranslation"("categoryId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategoryTranslation_slug_languageId_key" ON "PostCategoryTranslation"("slug", "languageId");

-- CreateIndex
CREATE INDEX "PostTagTranslation_tagId_idx" ON "PostTagTranslation"("tagId");

-- CreateIndex
CREATE INDEX "PostTagTranslation_languageId_idx" ON "PostTagTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTagTranslation_tagId_languageId_key" ON "PostTagTranslation"("tagId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTagTranslation_slug_languageId_key" ON "PostTagTranslation"("slug", "languageId");

-- CreateIndex
CREATE INDEX "PostToCategory_postId_idx" ON "PostToCategory"("postId");

-- CreateIndex
CREATE INDEX "PostToCategory_categoryId_idx" ON "PostToCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PostToCategory_postId_categoryId_key" ON "PostToCategory"("postId", "categoryId");

-- CreateIndex
CREATE INDEX "PostToTag_postId_idx" ON "PostToTag"("postId");

-- CreateIndex
CREATE INDEX "PostToTag_tagId_idx" ON "PostToTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "PostToTag_postId_tagId_key" ON "PostToTag"("postId", "tagId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "ServiceImage_serviceId_idx" ON "ServiceImage"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceImage_mediaId_idx" ON "ServiceImage"("mediaId");

-- CreateIndex
CREATE INDEX "ServiceTranslation_serviceId_idx" ON "ServiceTranslation"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceTranslation_languageId_idx" ON "ServiceTranslation"("languageId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTranslation" ADD CONSTRAINT "PostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTranslation" ADD CONSTRAINT "PostTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategoryTranslation" ADD CONSTRAINT "PostCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategoryTranslation" ADD CONSTRAINT "PostCategoryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTagTranslation" ADD CONSTRAINT "PostTagTranslation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PostTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTagTranslation" ADD CONSTRAINT "PostTagTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToCategory" ADD CONSTRAINT "PostToCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToCategory" ADD CONSTRAINT "PostToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToTag" ADD CONSTRAINT "PostToTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostToTag" ADD CONSTRAINT "PostToTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PostTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
