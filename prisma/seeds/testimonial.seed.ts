import { PrismaClient } from "@prisma/client";

export async function seedTestimonials(prisma: PrismaClient) {
  const count = await prisma.testimonial.count();
  if (count > 0) {
    console.log("⚠️ Testimonials already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const testimonials = [
    { clientName: "Andi Saputra", clientRole: "Founder", companyName: "PT Digital Nusantara", companyUrl: "https://digitalnusantara.id", projectName: "Company Profile Website", rating: 5, isFeatured: true, order: 1, id: "Pelayanan sangat profesional dan hasil website melebihi ekspektasi kami. Tim sangat responsif.", en: "The service was highly professional and the website exceeded our expectations. Very responsive team." },
    { clientName: "Sarah Wijaya", clientRole: "Marketing Manager", companyName: "Creative Labs", projectName: "Landing Page Campaign", rating: 5, isFeatured: true, order: 2, id: "Tim sangat responsif dan memahami kebutuhan bisnis kami dengan baik. Hasilnya luar biasa!", en: "The team was very responsive and understood our business needs well. The results were amazing!" },
    { clientName: "Budi Hartono", clientRole: "CEO", companyName: "PT Maju Sejahtera", companyUrl: "https://majusejahtera.co.id", projectName: "E-Commerce Platform", rating: 5, isFeatured: true, order: 3, id: "Website toko online kami sekarang jauh lebih cepat dan mudah dikelola. Penjualan meningkat 150%.", en: "Our online store website is now much faster and easier to manage. Sales increased by 150%." },
    { clientName: "Diana Putri", clientRole: "Owner", companyName: "Batik Nusantara", projectName: "Brand Website", rating: 4, isFeatured: false, order: 4, id: "Desain website sangat elegan dan sesuai dengan identitas brand kami. Sangat puas dengan hasilnya.", en: "The website design is very elegant and matches our brand identity. Very satisfied with the results." },
    { clientName: "Reza Firmansyah", clientRole: "CTO", companyName: "TechStart Indonesia", companyUrl: "https://techstart.id", projectName: "SaaS Dashboard", rating: 5, isFeatured: false, order: 5, id: "Kualitas kode sangat baik dan dokumentasi lengkap. Mudah untuk dikembangkan lebih lanjut.", en: "Code quality is excellent and documentation is complete. Easy to develop further." },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: {
        clientName: t.clientName,
        clientRole: t.clientRole,
        companyName: t.companyName,
        companyUrl: t.companyUrl || null,
        projectName: t.projectName,
        rating: t.rating,
        isFeatured: t.isFeatured,
        order: t.order,
        translations: {
          create: [
            { languageId: langId.id, content: t.id },
            { languageId: langEn.id, content: t.en },
          ],
        },
      },
    });
  }

  console.log("✅ Testimonials seeded (5)");
}
