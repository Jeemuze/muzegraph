import { PrismaClient } from "@prisma/client";

const doc = (text: string) => JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] });

export async function seedFaqs(prisma: PrismaClient) {
  const count = await prisma.faq.count();
  if (count > 0) {
    console.log("⚠️ FAQs already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const generalCat = await prisma.faqCategory.upsert({
    where: { slug: "general" },
    update: {},
    create: { slug: "general", order: 1, translations: { create: [{ languageId: langId.id, name: "Umum", description: "Pertanyaan umum seputar layanan kami" }, { languageId: langEn.id, name: "General", description: "General questions about our services" }] } },
  });

  const pricingCat = await prisma.faqCategory.upsert({
    where: { slug: "pricing" },
    update: {},
    create: { slug: "pricing", order: 2, translations: { create: [{ languageId: langId.id, name: "Harga", description: "Informasi terkait biaya layanan" }, { languageId: langEn.id, name: "Pricing", description: "Information about service pricing" }] } },
  });

  const techCat = await prisma.faqCategory.upsert({
    where: { slug: "technical" },
    update: {},
    create: { slug: "technical", order: 3, translations: { create: [{ languageId: langId.id, name: "Teknis", description: "Pertanyaan teknis seputar pengembangan" }, { languageId: langEn.id, name: "Technical", description: "Technical questions about development" }] } },
  });

  const faqs = [
    { categoryId: generalCat.id, isFeatured: true, order: 1, id: { question: "Apakah website bisa custom sesuai kebutuhan?", answer: doc("Ya, semua website dapat disesuaikan dengan kebutuhan bisnis Anda. Kami akan berdiskusi terlebih dahulu untuk memahami kebutuhan Anda.") }, en: { question: "Can the website be customized to our needs?", answer: doc("Yes, every website can be fully customized based on your business needs. We will discuss first to understand your requirements.") } },
    { categoryId: pricingCat.id, isFeatured: true, order: 2, id: { question: "Berapa lama proses pengerjaan website?", answer: doc("Rata-rata pengerjaan memakan waktu 2–6 minggu tergantung kompleksitas proyek dan fitur yang dibutuhkan.") }, en: { question: "How long does website development take?", answer: doc("On average, development takes 2–6 weeks depending on project complexity and required features.") } },
    { categoryId: pricingCat.id, isFeatured: false, order: 3, id: { question: "Apakah ada biaya maintenance bulanan?", answer: doc("Maintenance bersifat opsional. Kami menyediakan paket maintenance mulai dari Rp 500.000/bulan untuk update konten dan monitoring.") }, en: { question: "Is there a monthly maintenance fee?", answer: doc("Maintenance is optional. We provide maintenance packages starting from IDR 500,000/month for content updates and monitoring.") } },
    { categoryId: techCat.id, isFeatured: true, order: 4, id: { question: "Teknologi apa yang digunakan untuk membangun website?", answer: doc("Kami menggunakan Next.js, React, dan Tailwind CSS untuk frontend, serta PostgreSQL untuk database. Stack modern yang cepat dan scalable.") }, en: { question: "What technology is used to build the website?", answer: doc("We use Next.js, React, and Tailwind CSS for frontend, and PostgreSQL for database. A modern stack that is fast and scalable.") } },
    { categoryId: generalCat.id, isFeatured: false, order: 5, id: { question: "Apakah website sudah termasuk domain dan hosting?", answer: doc("Domain dan hosting bisa kami bantu sediakan atau Anda bisa menggunakan yang sudah ada. Kami akan membantu proses setup dan deployment.") }, en: { question: "Does the website include domain and hosting?", answer: doc("We can help provide domain and hosting, or you can use your existing ones. We will assist with setup and deployment process.") } },
  ];

  for (const f of faqs) {
    await prisma.faq.create({
      data: {
        categoryId: f.categoryId,
        isFeatured: f.isFeatured,
        order: f.order,
        translations: {
          create: [
            { languageId: langId.id, ...f.id },
            { languageId: langEn.id, ...f.en },
          ],
        },
      },
    });
  }

  console.log("✅ FAQs seeded (5)");
}
