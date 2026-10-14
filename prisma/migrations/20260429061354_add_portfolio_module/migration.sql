-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "clientName" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "completedAt" TIMESTAMP(3),
    "coverImageId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioTranslation" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "description" TEXT NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioGallery" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PortfolioGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioTagTranslation" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioTagTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioTagMap" (
    "portfolioId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PortfolioTagMap_pkey" PRIMARY KEY ("portfolioId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");

-- CreateIndex
CREATE INDEX "Portfolio_isActive_idx" ON "Portfolio"("isActive");

-- CreateIndex
CREATE INDEX "Portfolio_isFeatured_idx" ON "Portfolio"("isFeatured");

-- CreateIndex
CREATE INDEX "Portfolio_order_idx" ON "Portfolio"("order");

-- CreateIndex
CREATE INDEX "PortfolioTranslation_portfolioId_idx" ON "PortfolioTranslation"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioTranslation_languageId_idx" ON "PortfolioTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioTranslation_portfolioId_languageId_key" ON "PortfolioTranslation"("portfolioId", "languageId");

-- CreateIndex
CREATE INDEX "PortfolioGallery_portfolioId_idx" ON "PortfolioGallery"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioGallery_mediaId_idx" ON "PortfolioGallery"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioTag_slug_key" ON "PortfolioTag"("slug");

-- CreateIndex
CREATE INDEX "PortfolioTag_isActive_idx" ON "PortfolioTag"("isActive");

-- CreateIndex
CREATE INDEX "PortfolioTagTranslation_tagId_idx" ON "PortfolioTagTranslation"("tagId");

-- CreateIndex
CREATE INDEX "PortfolioTagTranslation_languageId_idx" ON "PortfolioTagTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioTagTranslation_tagId_languageId_key" ON "PortfolioTagTranslation"("tagId", "languageId");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTranslation" ADD CONSTRAINT "PortfolioTranslation_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTranslation" ADD CONSTRAINT "PortfolioTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioGallery" ADD CONSTRAINT "PortfolioGallery_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioGallery" ADD CONSTRAINT "PortfolioGallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTagTranslation" ADD CONSTRAINT "PortfolioTagTranslation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PortfolioTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTagTranslation" ADD CONSTRAINT "PortfolioTagTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTagMap" ADD CONSTRAINT "PortfolioTagMap_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTagMap" ADD CONSTRAINT "PortfolioTagMap_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PortfolioTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
