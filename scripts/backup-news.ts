import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const record = await prisma.siteData.findUnique({ where: { key: "news" } });

  if (!record) {
    console.log("No news record found in SiteData.");
    return;
  }

  const articles = Array.isArray(record.data) ? record.data : [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(process.cwd(), "backups", "news");
  mkdirSync(dir, { recursive: true });

  const path = join(dir, `news-${timestamp}.json`);
  writeFileSync(path, JSON.stringify(record.data, null, 2));

  console.log(`Backed up ${articles.length} articles to:`);
  console.log(`  ${path}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
