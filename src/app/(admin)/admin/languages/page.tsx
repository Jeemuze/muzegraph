import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { LanguageTable } from "@/components/admin/languages/language-table";

export default async function LanguagePage() {
  await requirePermissionPage("manage_users");

  const languages = await prisma.language.findMany({
    orderBy: {
      order: "asc",
    },
  });

  return <LanguageTable languages={languages} />;
}
