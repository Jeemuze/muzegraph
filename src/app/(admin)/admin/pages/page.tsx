import { prisma } from "@/lib/prisma";
import { requirePermissionPage } from "@/lib/guards/auth";
import PagesTable from "@/components/admin/pages/pages-table";

export default async function PagesPage() {
  await requirePermissionPage("manage_pages");

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      status: true,
      isHomePage: true,
      template: true,
      updatedAt: true,
      translations: { select: { title: true } },
    },
  });

  return <PagesTable pages={pages} />;
}
