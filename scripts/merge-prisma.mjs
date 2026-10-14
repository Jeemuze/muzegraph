import fs from "fs";
import path from "path";

const base = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

const modulesDir = path.resolve("prisma/modules");
const outputFile = path.resolve("prisma/schema.prisma");

const files = fs.readdirSync(modulesDir)
  .filter((f) => f.endsWith(".prisma"))
  .sort();

let content = base + "\n";

for (const file of files) {
  const filePath = path.join(modulesDir, file);
  content += "\n" + fs.readFileSync(filePath, "utf-8") + "\n";
}

fs.writeFileSync(outputFile, content);

console.log("schema.prisma generated successfully.");
