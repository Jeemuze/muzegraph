-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqTranslation" (
    "id" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqCategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Faq_isActive_idx" ON "Faq"("isActive");

-- CreateIndex
CREATE INDEX "Faq_isFeatured_idx" ON "Faq"("isFeatured");

-- CreateIndex
CREATE INDEX "Faq_order_idx" ON "Faq"("order");

-- CreateIndex
CREATE INDEX "FaqTranslation_faqId_idx" ON "FaqTranslation"("faqId");

-- CreateIndex
CREATE INDEX "FaqTranslation_languageId_idx" ON "FaqTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "FaqTranslation_faqId_languageId_key" ON "FaqTranslation"("faqId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "FaqCategory_slug_key" ON "FaqCategory"("slug");

-- CreateIndex
CREATE INDEX "FaqCategory_isActive_idx" ON "FaqCategory"("isActive");

-- CreateIndex
CREATE INDEX "FaqCategory_order_idx" ON "FaqCategory"("order");

-- CreateIndex
CREATE INDEX "FaqCategoryTranslation_categoryId_idx" ON "FaqCategoryTranslation"("categoryId");

-- CreateIndex
CREATE INDEX "FaqCategoryTranslation_languageId_idx" ON "FaqCategoryTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "FaqCategoryTranslation_categoryId_languageId_key" ON "FaqCategoryTranslation"("categoryId", "languageId");

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FaqCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqTranslation" ADD CONSTRAINT "FaqTranslation_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqTranslation" ADD CONSTRAINT "FaqTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqCategoryTranslation" ADD CONSTRAINT "FaqCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FaqCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqCategoryTranslation" ADD CONSTRAINT "FaqCategoryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
