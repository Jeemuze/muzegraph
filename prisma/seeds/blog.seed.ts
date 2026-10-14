import { PrismaClient, PostStatus } from "@prisma/client";

function doc(...paragraphs: string[]) {
  return JSON.stringify({
    type: "doc",
    content: paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
  });
}

export async function seedBlog(prisma: PrismaClient) {
  const postCount = await prisma.post.count();
  if (postCount > 0) {
    console.log("⚠️ Blog posts already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const admin = await prisma.user.findFirst({ where: { email: "admin@mail.com" } });
  if (!admin) throw new Error("Admin user not found");

  const techCat = await prisma.postCategory.create({
    data: { icon: "cpu", order: 1, translations: { create: [{ languageId: langId.id, name: "Teknologi", slug: "teknologi", description: "Artikel seputar teknologi" }, { languageId: langEn.id, name: "Technology", slug: "technology", description: "Technology articles" }] } },
  });

  const bizCat = await prisma.postCategory.create({
    data: { icon: "briefcase", order: 2, translations: { create: [{ languageId: langId.id, name: "Bisnis", slug: "bisnis", description: "Tips dan strategi bisnis" }, { languageId: langEn.id, name: "Business", slug: "business", description: "Business tips and strategies" }] } },
  });

  const nextjsTag = await prisma.postTag.create({ data: { order: 1, translations: { create: [{ languageId: langId.id, name: "Next.js", slug: "nextjs" }, { languageId: langEn.id, name: "Next.js", slug: "nextjs-en" }] } } });
  const seoTag = await prisma.postTag.create({ data: { order: 2, translations: { create: [{ languageId: langId.id, name: "SEO", slug: "seo" }, { languageId: langEn.id, name: "SEO", slug: "seo-en" }] } } });
  const webdevTag = await prisma.postTag.create({ data: { order: 3, translations: { create: [{ languageId: langId.id, name: "Web Development", slug: "web-development" }, { languageId: langEn.id, name: "Web Development", slug: "web-development-en" }] } } });

  const posts = [
    { status: PostStatus.PUBLISHED, isFeatured: true, viewCount: 125, readingTime: 6, categoryId: techCat.id, tagIds: [nextjsTag.id, webdevTag.id], id: { title: "Membangun Website Modern dengan Next.js", slug: "membangun-website-modern-nextjs", excerpt: "Panduan lengkap membangun website modern menggunakan Next.js untuk bisnis digital.", content: doc("Next.js adalah framework React yang powerful untuk membangun website modern dengan performa tinggi dan SEO optimal.", "Dengan fitur seperti Server Side Rendering, Static Site Generation, dan App Router, Next.js menjadi pilihan utama developer profesional.", "Framework ini juga mendukung optimasi gambar otomatis, code splitting, dan prefetching yang membuat website Anda sangat cepat."), metaTitle: "Membangun Website Modern dengan Next.js", metaDescription: "Panduan membangun website modern untuk bisnis digital." }, en: { title: "Building Modern Websites with Next.js", slug: "building-modern-websites-nextjs", excerpt: "Complete guide to building modern websites using Next.js for digital business.", content: doc("Next.js is a powerful React framework for building modern websites with high performance and optimal SEO.", "With features like Server Side Rendering, Static Site Generation, and App Router, Next.js is the top choice for professional developers.", "The framework also supports automatic image optimization, code splitting, and prefetching that makes your website blazing fast."), metaTitle: "Building Modern Websites with Next.js", metaDescription: "Guide to building modern websites for digital business." } },
    { status: PostStatus.PUBLISHED, isFeatured: true, viewCount: 89, readingTime: 5, categoryId: techCat.id, tagIds: [seoTag.id], id: { title: "Panduan SEO untuk Pemula 2026", slug: "panduan-seo-pemula-2026", excerpt: "Pelajari dasar-dasar SEO untuk meningkatkan visibilitas website Anda di mesin pencari.", content: doc("SEO adalah kunci untuk mendapatkan traffic organik.", "Mulai dari riset keyword, optimasi on-page, hingga membangun backlink berkualitas.", "Pastikan setiap halaman memiliki meta title, meta description, dan heading structure yang tepat."), metaTitle: "Panduan SEO Pemula 2026", metaDescription: "Dasar-dasar SEO untuk meningkatkan visibilitas website." }, en: { title: "SEO Guide for Beginners 2026", slug: "seo-guide-beginners-2026", excerpt: "Learn SEO basics to improve your website visibility in search engines.", content: doc("SEO is the key to getting organic traffic.", "From keyword research, on-page optimization, to building quality backlinks.", "Make sure every page has proper meta title, meta description, and heading structure."), metaTitle: "SEO Guide for Beginners 2026", metaDescription: "SEO basics to improve website visibility." } },
    { status: PostStatus.PUBLISHED, isFeatured: false, viewCount: 67, readingTime: 4, categoryId: bizCat.id, tagIds: [webdevTag.id], id: { title: "5 Alasan Bisnis Anda Butuh Website", slug: "5-alasan-bisnis-butuh-website", excerpt: "Mengapa setiap bisnis di era digital harus memiliki website profesional.", content: doc("Di era digital, website bukan lagi pilihan tapi kebutuhan.", "Website meningkatkan kredibilitas, menjangkau pelanggan 24/7, dan lebih hemat biaya dibanding toko fisik.", "Website juga memudahkan pelanggan menemukan Anda dan menjadi aset digital jangka panjang."), metaTitle: "5 Alasan Bisnis Butuh Website", metaDescription: "Alasan bisnis harus punya website profesional." }, en: { title: "5 Reasons Your Business Needs a Website", slug: "5-reasons-business-needs-website", excerpt: "Why every business in the digital era must have a professional website.", content: doc("In the digital era, a website is no longer optional but a necessity.", "A website increases credibility, reaches customers 24/7, and is more cost-effective than a physical store.", "A website also makes it easy for customers to find you and is a long-term digital asset."), metaTitle: "5 Reasons Business Needs Website", metaDescription: "Reasons why business needs a professional website." } },
    { status: PostStatus.PUBLISHED, isFeatured: false, viewCount: 45, readingTime: 7, categoryId: techCat.id, tagIds: [nextjsTag.id, seoTag.id], id: { title: "Optimasi Performa Website dengan Next.js", slug: "optimasi-performa-website-nextjs", excerpt: "Teknik-teknik optimasi untuk membuat website Next.js Anda lebih cepat.", content: doc("Performa website sangat mempengaruhi pengalaman pengguna dan ranking SEO.", "Gunakan next/image untuk optimasi gambar, implementasi lazy loading, dan manfaatkan caching strategy.", "Minimalisir bundle size dengan dynamic imports dan pastikan Core Web Vitals selalu baik."), metaTitle: "Optimasi Performa Website Next.js", metaDescription: "Teknik optimasi performa website Next.js." }, en: { title: "Website Performance Optimization with Next.js", slug: "website-performance-optimization-nextjs", excerpt: "Optimization techniques to make your Next.js website faster.", content: doc("Website performance greatly affects user experience and SEO ranking.", "Use next/image for image optimization, implement lazy loading, and leverage proper caching strategies.", "Minimize bundle size with dynamic imports and ensure Core Web Vitals are always in good condition."), metaTitle: "Website Performance Optimization Next.js", metaDescription: "Next.js website performance optimization techniques." } },
    { status: PostStatus.PUBLISHED, isFeatured: true, viewCount: 156, readingTime: 8, categoryId: bizCat.id, tagIds: [seoTag.id, webdevTag.id], id: { title: "Strategi Digital Marketing untuk UMKM", slug: "strategi-digital-marketing-umkm", excerpt: "Panduan strategi digital marketing yang efektif untuk usaha kecil dan menengah.", content: doc("Digital marketing tidak harus mahal. UMKM bisa memanfaatkan strategi yang tepat.", "Mulai dari optimasi Google My Business, content marketing, hingga social media marketing yang konsisten.", "Kunci sukses adalah konsistensi dan memahami target audience dengan baik."), metaTitle: "Strategi Digital Marketing UMKM", metaDescription: "Strategi digital marketing efektif untuk UMKM." }, en: { title: "Digital Marketing Strategy for SMEs", slug: "digital-marketing-strategy-smes", excerpt: "Effective digital marketing strategy guide for small and medium enterprises.", content: doc("Digital marketing doesn't have to be expensive. SMEs can leverage the right strategies.", "From Google My Business optimization, content marketing, to consistent social media marketing.", "The key to success is consistency and understanding your target audience well."), metaTitle: "Digital Marketing Strategy SMEs", metaDescription: "Effective digital marketing strategy for SMEs." } },
  ];

  for (const p of posts) {
    const post = await prisma.post.create({
      data: { authorId: admin.id, status: p.status, publishedAt: new Date(), isFeatured: p.isFeatured, viewCount: p.viewCount, readingTime: p.readingTime, allowComments: true, translations: { create: [{ languageId: langId.id, ...p.id }, { languageId: langEn.id, ...p.en }] } },
    });
    await prisma.postToCategory.create({ data: { postId: post.id, categoryId: p.categoryId } });
    for (const tagId of p.tagIds) {
      await prisma.postToTag.create({ data: { postId: post.id, tagId } });
    }
  }

  console.log("✅ Blog seeded (5 posts, 2 categories, 3 tags)");
}
