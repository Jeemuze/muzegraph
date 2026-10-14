-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STATIC',
    "imageId" TEXT,
    "videoUrl" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondaryUrl" TEXT,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 40,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroTranslation" (
    "id" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "ctaPrimaryText" TEXT,
    "ctaSecondaryText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hero_isActive_order_idx" ON "Hero"("isActive", "order");

-- CreateIndex
CREATE INDEX "HeroTranslation_heroId_idx" ON "HeroTranslation"("heroId");

-- CreateIndex
CREATE INDEX "HeroTranslation_languageId_idx" ON "HeroTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroTranslation_heroId_languageId_key" ON "HeroTranslation"("heroId", "languageId");

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroTranslation" ADD CONSTRAINT "HeroTranslation_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroTranslation" ADD CONSTRAINT "HeroTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
