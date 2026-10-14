import { PrismaClient } from "@prisma/client";

export async function seedSiteSettings(prisma: PrismaClient) {
  const count = await prisma.siteSetting.count();
  if (count > 0) {
    console.log("⚠️ Site settings already exist, skip");
    return;
  }

  const settings = [
    { key: "contact_email", value: "hello@mulaidigital.com" },
    { key: "contact_phone", value: "+62 812-3456-7890" },
    { key: "contact_whatsapp", value: "6281234567890" },
    { key: "address", value: "Jl. Teknologi No. 10, Jakarta Selatan, DKI Jakarta 12345" },
    { key: "social_instagram", value: "https://instagram.com/mulaidigital" },
    { key: "social_linkedin", value: "https://linkedin.com/company/mulaidigital" },
    { key: "social_github", value: "https://github.com/mulaidigital" },
    { key: "working_hours", value: "Senin - Jumat, 09:00 - 17:00 WIB" },
  ];

  await prisma.siteSetting.createMany({ data: settings });

  console.log("✅ Site settings seeded (8)");
}
