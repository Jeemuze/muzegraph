/*
  Warnings:

  - You are about to drop the column `description` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Service` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Service_slug_key";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "description",
DROP COLUMN "slug",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "ServiceTranslation" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTranslation_serviceId_languageId_key" ON "ServiceTranslation"("serviceId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTranslation_slug_languageId_key" ON "ServiceTranslation"("slug", "languageId");

-- AddForeignKey
ALTER TABLE "ServiceTranslation" ADD CONSTRAINT "ServiceTranslation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTranslation" ADD CONSTRAINT "ServiceTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
