import { PrismaClient, PostStatus } from "@prisma/client";

const block = (text: string) => JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] });

export async function seedPage(prisma: PrismaClient) {
  const count = await prisma.page.count();
  if (count > 0) {
    console.log("⚠️ Pages already exist, skip");
    return;
  }

  const langId = await prisma.language.findUnique({ where: { code: "id" } });
  const langEn = await prisma.language.findUnique({ where: { code: "en" } });
  if (!langId || !langEn) throw new Error("Languages not found");

  const pages = [
    {
      slug: "privacy-policy",
      translations: [
        { languageId: langId.id, title: "Kebijakan Privasi", content: block("Kami menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan kami. Informasi yang kami kumpulkan digunakan semata-mata untuk meningkatkan pengalaman pengguna dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda."), metaTitle: "Kebijakan Privasi", metaDescription: "Kebijakan privasi dan perlindungan data pengguna." },
        { languageId: langEn.id, title: "Privacy Policy", content: block("We value your privacy. This policy explains how we collect, use, and protect your personal data when using our services. Information we collect is used solely to improve user experience and will not be shared with third parties without your consent."), metaTitle: "Privacy Policy", metaDescription: "User privacy and data protection policy." },
      ],
    },
    {
      slug: "terms-of-service",
      translations: [
        { languageId: langId.id, title: "Syarat & Ketentuan", content: block("Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut. Kami berhak mengubah ketentuan ini sewaktu-waktu. Pengguna bertanggung jawab untuk memeriksa pembaruan secara berkala. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan terhadap ketentuan yang diperbarui."), metaTitle: "Syarat & Ketentuan", metaDescription: "Syarat dan ketentuan penggunaan layanan kami." },
        { languageId: langEn.id, title: "Terms of Service", content: block("By using our services, you agree to the following terms and conditions. We reserve the right to modify these terms at any time. Users are responsible for checking updates periodically. Use of services after changes constitutes acceptance of the updated terms."), metaTitle: "Terms of Service", metaDescription: "Terms and conditions of our service usage." },
      ],
    },
    {
      slug: "disclaimer",
      translations: [
        { languageId: langId.id, title: "Disclaimer", content: block("Informasi yang disediakan di website ini hanya untuk tujuan informasi umum. Kami tidak memberikan jaminan atas keakuratan, kelengkapan, atau kegunaan informasi yang tersedia. Segala tindakan yang Anda ambil berdasarkan informasi di website ini sepenuhnya menjadi risiko Anda sendiri."), metaTitle: "Disclaimer", metaDescription: "Disclaimer dan batasan tanggung jawab." },
        { languageId: langEn.id, title: "Disclaimer", content: block("The information provided on this website is for general informational purposes only. We make no warranties about the accuracy, completeness, or usefulness of the information available. Any action you take based on information on this website is strictly at your own risk."), metaTitle: "Disclaimer", metaDescription: "Disclaimer and limitation of liability." },
      ],
    },
  ];

  for (const p of pages) {
    await prisma.page.create({
      data: {
        slug: p.slug,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        translations: { create: p.translations },
      },
    });
  }

  console.log("✅ Pages seeded (3)");
}
