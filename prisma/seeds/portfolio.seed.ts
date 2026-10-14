import { PrismaClient } from "@prisma/client";

const doc = (text: string) => JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] });

export async function seedPortfolios(prisma: PrismaClient) {
  const count = await prisma.portfolio.count();
  if (count > 0) {
    console.log("⚠️ Portfolios already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const webTag = await prisma.portfolioTag.upsert({ where: { slug: "web-development" }, update: {}, create: { slug: "web-development", translations: { create: [{ languageId: langId.id, name: "Web Development" }, { languageId: langEn.id, name: "Web Development" }] } } });
  const brandingTag = await prisma.portfolioTag.upsert({ where: { slug: "branding" }, update: {}, create: { slug: "branding", translations: { create: [{ languageId: langId.id, name: "Branding" }, { languageId: langEn.id, name: "Branding" }] } } });
  const mobileTag = await prisma.portfolioTag.upsert({ where: { slug: "mobile-app" }, update: {}, create: { slug: "mobile-app", translations: { create: [{ languageId: langId.id, name: "Aplikasi Mobile" }, { languageId: langEn.id, name: "Mobile App" }] } } });

  const portfolios = [
    { slug: "website-company-profile-modern", clientName: "PT Maju Bersama", industry: "Corporate", location: "Jakarta", completedAt: new Date("2026-01-10"), isFeatured: true, order: 1, tags: [webTag.id, brandingTag.id], id: { title: "Website Company Profile Modern", excerpt: "Website modern untuk meningkatkan citra perusahaan.", description: doc("Kami membangun website company profile dengan desain profesional, performa tinggi, dan SEO optimal."), result: doc("Traffic meningkat 200% dalam 3 bulan.") }, en: { title: "Modern Company Profile Website", excerpt: "A modern website to improve corporate image.", description: doc("We developed a company profile website with professional design, high performance, and strong SEO."), result: doc("Traffic increased by 200% within 3 months.") } },
    { slug: "saas-dashboard-platform", clientName: "Startup TechLabs", industry: "Technology", location: "Bandung", completedAt: new Date("2026-03-15"), isFeatured: true, order: 2, tags: [webTag.id], id: { title: "Platform Dashboard SaaS", excerpt: "Dashboard analitik untuk monitoring bisnis.", description: doc("Platform dashboard interaktif untuk visualisasi data bisnis secara real-time."), result: doc("Efisiensi monitoring meningkat signifikan.") }, en: { title: "SaaS Dashboard Platform", excerpt: "Analytics dashboard for business monitoring.", description: doc("An interactive dashboard platform for real-time business data visualization."), result: doc("Monitoring efficiency improved significantly.") } },
    { slug: "ecommerce-batik-nusantara", clientName: "Batik Nusantara", industry: "Fashion", location: "Solo", completedAt: new Date("2026-02-20"), isFeatured: true, order: 3, tags: [webTag.id, brandingTag.id], id: { title: "E-Commerce Batik Nusantara", excerpt: "Toko online batik dengan desain elegan.", description: doc("Platform e-commerce dengan fitur lengkap untuk penjualan batik premium secara online."), result: doc("Penjualan online meningkat 300% dalam 6 bulan.") }, en: { title: "Batik Nusantara E-Commerce", excerpt: "Elegant online batik store.", description: doc("Full-featured e-commerce platform for premium batik online sales."), result: doc("Online sales increased by 300% in 6 months.") } },
    { slug: "mobile-app-kesehatan", clientName: "HealthTech ID", industry: "Healthcare", location: "Surabaya", completedAt: new Date("2026-04-01"), isFeatured: false, order: 4, tags: [mobileTag.id], id: { title: "Aplikasi Mobile Kesehatan", excerpt: "Aplikasi konsultasi kesehatan online.", description: doc("Aplikasi mobile untuk konsultasi dokter online, booking jadwal, dan rekam medis digital."), result: doc("10.000+ download dalam bulan pertama.") }, en: { title: "Healthcare Mobile App", excerpt: "Online health consultation app.", description: doc("Mobile app for online doctor consultation, schedule booking, and digital medical records."), result: doc("10,000+ downloads in the first month.") } },
    { slug: "landing-page-properti", clientName: "Griya Asri Development", industry: "Real Estate", location: "Tangerang", completedAt: new Date("2026-03-28"), isFeatured: false, order: 5, tags: [webTag.id], id: { title: "Landing Page Properti Premium", excerpt: "Landing page untuk pemasaran perumahan.", description: doc("Landing page high-converting untuk pemasaran proyek perumahan dengan fitur virtual tour."), result: doc("Leads meningkat 250% dibanding metode konvensional.") }, en: { title: "Premium Property Landing Page", excerpt: "Landing page for housing marketing.", description: doc("High-converting landing page for housing project marketing with virtual tour feature."), result: doc("Leads increased by 250% compared to conventional methods.") } },
  ];

  for (const p of portfolios) {
    await prisma.portfolio.create({ data: { slug: p.slug, clientName: p.clientName, industry: p.industry, location: p.location, completedAt: p.completedAt, isFeatured: p.isFeatured, order: p.order, translations: { create: [{ languageId: langId.id, ...p.id }, { languageId: langEn.id, ...p.en }] }, tags: { create: p.tags.map((tagId) => ({ tagId })) } } });
  }

  console.log("✅ Portfolios seeded (5)");
}
