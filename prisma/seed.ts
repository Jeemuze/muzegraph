import { PrismaClient } from "@prisma/client";

import { seedAuth } from "./seeds/auth.seed";
import { seedSeo } from "./seeds/seo.seed";
import { seedLanguages } from "./seeds/language.seed";
import { seedHeroes } from "./seeds/hero.seed";
import { seedServices } from "./seeds/service.seed";
import { seedBlog } from "./seeds/blog.seed";
import { seedTestimonials } from "./seeds/testimonial.seed";
import { seedPortfolios } from "./seeds/portfolio.seed";
import { seedFaqs } from "./seeds/faq.seed";
import { seedPage } from "./seeds/page.seed";
import { seedSiteSettings } from "./seeds/site-setting.seed";
import { seedComments } from "./seeds/comment.seed";
import { seedContacts } from "./seeds/contact.seed";

const prisma = new PrismaClient();

async function main() {
  await seedAuth(prisma);
  await seedSeo(prisma);
  await seedLanguages(prisma);
  await seedHeroes(prisma);
  await seedServices(prisma);
  await seedBlog(prisma);
  await seedTestimonials(prisma);
  await seedPortfolios(prisma);
  await seedFaqs(prisma);
  await seedPage(prisma);
  await seedSiteSettings(prisma);
  await seedComments(prisma);
  await seedContacts(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
