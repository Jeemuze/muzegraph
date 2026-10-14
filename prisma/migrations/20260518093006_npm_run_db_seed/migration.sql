/*
  Warnings:

  - You are about to drop the column `siteLogoDark` on the `Seo` table. All the data in the column will be lost.
  - You are about to drop the column `siteLogoLight` on the `Seo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Seo" DROP COLUMN "siteLogoDark",
DROP COLUMN "siteLogoLight";

-- CreateTable
CREATE TABLE "HeroImage" (
    "id" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroImage_heroId_idx" ON "HeroImage"("heroId");

-- CreateIndex
CREATE INDEX "HeroImage_mediaId_idx" ON "HeroImage"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroImage_heroId_mediaId_key" ON "HeroImage"("heroId", "mediaId");

-- AddForeignKey
ALTER TABLE "HeroImage" ADD CONSTRAINT "HeroImage_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroImage" ADD CONSTRAINT "HeroImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
