import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { ServiceTable } from "@/components/admin/services/service-table";

export default async function ServicePage() {
  await requirePermissionPage("manage_service");

  const services = await prisma.service.findMany({
    orderBy: { order: "asc" },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      images: {
        include: {
          media: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return <ServiceTable services={services} />;
}
