import { PrismaClient } from "@prisma/client";

export async function seedHeroes(prisma: PrismaClient) {
  const heroCount = await prisma.hero.count();
  if (heroCount > 0) {
    console.log("⚠️ Heroes already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const heroes = [
    {
      type: "STATIC",
      overlayOpacity: 40,
      isActive: true,
      order: 1,
      ctaPrimaryUrl: "/contact",
      ctaSecondaryUrl: "/services",
      id: { title: "Solusi Digital untuk Bisnis Modern", subtitle: "Kami Membantu Anda Tumbuh", description: "Bangun kehadiran online yang kuat dengan website profesional dan strategi digital yang tepat.", ctaPrimaryText: "Hubungi Kami", ctaSecondaryText: "Lihat Layanan" },
      en: { title: "Digital Solutions for Modern Business", subtitle: "We Help You Grow", description: "Build a strong online presence with professional websites and the right digital strategy.", ctaPrimaryText: "Contact Us", ctaSecondaryText: "View Services" },
    },
    {
      type: "STATIC",
      overlayOpacity: 50,
      isActive: true,
      order: 2,
      ctaPrimaryUrl: "/portfolio",
      ctaSecondaryUrl: "/about",
      id: { title: "Desain Website yang Memukau", subtitle: "Kreativitas Tanpa Batas", description: "Kami menciptakan desain website yang menarik dan fungsional untuk berbagai kebutuhan bisnis.", ctaPrimaryText: "Lihat Portfolio", ctaSecondaryText: "Tentang Kami" },
      en: { title: "Stunning Website Design", subtitle: "Unlimited Creativity", description: "We create attractive and functional website designs for various business needs.", ctaPrimaryText: "View Portfolio", ctaSecondaryText: "About Us" },
    },
    {
      type: "STATIC",
      overlayOpacity: 35,
      isActive: true,
      order: 3,
      ctaPrimaryUrl: "/services",
      ctaSecondaryUrl: "/contact",
      id: { title: "Tingkatkan Konversi Bisnis Anda", subtitle: "Landing Page Profesional", description: "Landing page yang dirancang khusus untuk meningkatkan konversi dan menghasilkan leads berkualitas.", ctaPrimaryText: "Mulai Sekarang", ctaSecondaryText: "Konsultasi Gratis" },
      en: { title: "Boost Your Business Conversion", subtitle: "Professional Landing Pages", description: "Landing pages specifically designed to increase conversions and generate quality leads.", ctaPrimaryText: "Start Now", ctaSecondaryText: "Free Consultation" },
    },
    {
      type: "STATIC",
      overlayOpacity: 45,
      isActive: true,
      order: 4,
      ctaPrimaryUrl: "/contact",
      ctaSecondaryUrl: "/portfolio",
      id: { title: "Partner Teknologi Terpercaya", subtitle: "Berpengalaman & Profesional", description: "Tim developer berpengalaman siap membantu mewujudkan ide digital Anda menjadi kenyataan.", ctaPrimaryText: "Hubungi Kami", ctaSecondaryText: "Lihat Hasil Kerja" },
      en: { title: "Trusted Technology Partner", subtitle: "Experienced & Professional", description: "Our experienced developer team is ready to turn your digital ideas into reality.", ctaPrimaryText: "Contact Us", ctaSecondaryText: "See Our Work" },
    },
    {
      type: "STATIC",
      overlayOpacity: 30,
      isActive: true,
      order: 5,
      ctaPrimaryUrl: "/services",
      ctaSecondaryUrl: "/blog",
      id: { title: "Website Cepat, SEO Optimal", subtitle: "Performa Terbaik", description: "Website dengan performa tinggi dan optimasi SEO untuk memastikan bisnis Anda mudah ditemukan.", ctaPrimaryText: "Lihat Layanan", ctaSecondaryText: "Baca Blog" },
      en: { title: "Fast Website, Optimal SEO", subtitle: "Best Performance", description: "High-performance websites with SEO optimization to ensure your business is easily found.", ctaPrimaryText: "View Services", ctaSecondaryText: "Read Blog" },
    },
  ];

  for (const h of heroes) {
    await prisma.hero.create({
      data: {
        type: h.type,
        overlayOpacity: h.overlayOpacity,
        isActive: h.isActive,
        order: h.order,
        ctaPrimaryUrl: h.ctaPrimaryUrl,
        ctaSecondaryUrl: h.ctaSecondaryUrl,
        translations: {
          create: [
            { languageId: langId.id, ...h.id },
            { languageId: langEn.id, ...h.en },
          ],
        },
      },
    });
  }

  console.log("✅ Heroes seeded (5)");
}
