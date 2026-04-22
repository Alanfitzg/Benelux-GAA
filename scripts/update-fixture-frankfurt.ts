import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type Fixture = {
  id: string;
  date: string;
  competition: string;
  venue: string;
  tbc?: boolean;
  [key: string]: unknown;
};

async function main() {
  const record = await prisma.siteData.findUnique({
    where: { key: "fixtures" },
  });
  if (!record) {
    throw new Error("No fixtures record found in SiteData");
  }

  const fixtures = record.data as unknown as Fixture[];
  if (!Array.isArray(fixtures)) {
    throw new Error("Fixtures data is not an array");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(process.cwd(), "backups", "fixtures");
  mkdirSync(dir, { recursive: true });
  const backupPath = join(dir, `fixtures-${timestamp}.json`);
  writeFileSync(backupPath, JSON.stringify(fixtures, null, 2));
  console.log(`Backed up ${fixtures.length} fixtures to ${backupPath}`);

  const target = fixtures.find((f) => f.id === "7");
  if (!target) {
    throw new Error("Fixture id 7 not found");
  }
  console.log("Before:", JSON.stringify(target, null, 2));

  target.venue = "Frankfurt";
  delete target.tbc;

  console.log("After: ", JSON.stringify(target, null, 2));

  await prisma.siteData.update({
    where: { key: "fixtures" },
    data: { data: fixtures as unknown as object },
  });

  console.log("Fixture 7 updated in SiteData.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
