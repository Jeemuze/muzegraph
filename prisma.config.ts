import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // @ts-expect-error -- seed is supported at runtime but not yet in PrismaConfig type
  seed: "tsx prisma/seed.ts",
});
