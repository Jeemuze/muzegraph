import { PrismaClient } from "@prisma/client";

const doc = (text: string) => JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] });

export async function seedServices(prisma: PrismaClient) {
  const serviceCount = await prisma.service.count();
  if (serviceCount > 0) {
    console.log("⚠️ Services already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const services = [
    { icon: "globe", order: 1, id: { title: "Website Company Profile", slug: "website-company-profile", description: doc("Website profesional untuk meningkatkan citra dan kredibilitas perusahaan Anda di dunia digital.") }, en: { title: "Company Profile Website", slug: "company-profile-website", description: doc("Professional website to enhance your company's image and credibility in the digital world.") } },
    { icon: "layout", order: 2, id: { title: "Landing Page", slug: "landing-page", description: doc("Halaman khusus yang dirancang untuk meningkatkan konversi dan menghasilkan leads berkualitas.") }, en: { title: "Landing Page", slug: "landing-page-en", description: doc("Specialized pages designed to increase conversions and generate quality leads.") } },
    { icon: "shopping-cart", order: 3, id: { title: "Toko Online", slug: "toko-online", description: doc("Platform e-commerce lengkap dengan sistem pembayaran, manajemen produk, dan tracking pesanan.") }, en: { title: "Online Store", slug: "online-store", description: doc("Complete e-commerce platform with payment system, product management, and order tracking.") } },
    { icon: "search", order: 4, id: { title: "SEO Optimization", slug: "seo-optimization", description: doc("Optimasi mesin pencari untuk meningkatkan visibilitas website Anda di halaman pertama Google.") }, en: { title: "SEO Optimization", slug: "seo-optimization-en", description: doc("Search engine optimization to improve your website visibility on Google's first page.") } },
    { icon: "smartphone", order: 5, id: { title: "Aplikasi Mobile", slug: "aplikasi-mobile", description: doc("Pengembangan aplikasi mobile cross-platform untuk Android dan iOS dengan teknologi terkini.") }, en: { title: "Mobile Application", slug: "mobile-application", description: doc("Cross-platform mobile app development for Android and iOS with the latest technology.") } },
  ];

  for (const s of services) {
    await prisma.service.create({ data: { icon: s.icon, order: s.order, translations: { create: [{ languageId: langId.id, ...s.id }, { languageId: langEn.id, ...s.en }] } } });
  }

  console.log("✅ Services seeded (5)");
}
