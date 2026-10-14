import { PrismaClient } from "@prisma/client";

export async function seedLanguages(prisma: PrismaClient) {
  const languages = [
    {
      code: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      isDefault: true,
      order: 1,
    },
    {
      code: "en",
      name: "English",
      nativeName: "English",
      isDefault: false,
      order: 2,
    },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {
        name: lang.name,
        nativeName: lang.nativeName,
        isDefault: lang.isDefault,
        order: lang.order,
      },
      create: lang,
    });
  }

  console.log("✅ Languages seeded");
}
