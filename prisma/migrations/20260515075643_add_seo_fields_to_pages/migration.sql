-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "structuredData" JSONB;

-- AlterTable
ALTER TABLE "PageTranslation" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "ogImage" TEXT;

-- AlterTable
ALTER TABLE "Seo" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "locale" TEXT DEFAULT 'id_ID',
ADD COLUMN     "ogType" TEXT DEFAULT 'website',
ADD COLUMN     "structuredData" JSONB,
ADD COLUMN     "twitterCard" TEXT DEFAULT 'summary_large_image',
ADD COLUMN     "twitterSite" TEXT;

-- CreateIndex
CREATE INDEX "Page_slug_status_idx" ON "Page"("slug", "status");
