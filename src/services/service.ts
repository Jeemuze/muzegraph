import { prisma } from "@/lib/prisma";

export async function getServices(locale: string = "id") {
  return prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      translations: {
        where: {
          language: {
            code: locale,
          },
        },
      },
      images: {
        include: {
          media: true,
        },
      },
    },
  });
}


export async function getFormattedServices(locale: string = "id") {
  const services = await getServices(locale);

  return services.map((service) => ({
    id: service.id,
    icon: service.icon,
    order: service.order,
    image: service.images[0]?.media?.url ?? null,
    title: service.translations[0]?.title ?? "",
    slug: service.translations[0]?.slug ?? "",
    description: service.translations[0]?.description ?? "",
  }));
}
