import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import * as path from "path";

const prisma = new PrismaClient();
const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";

function extractClubName(filename: string): string {
  return filename
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+gaa.*$/i, "")
    .replace(/\s+gfc.*$/i, "")
    .replace(/\s+gac.*$/i, "")
    .replace(/\s+logo.*$/i, "")
    .replace(/\s+crest.*$/i, "")
    .replace(/\s+gaels.*$/i, "")
    .trim();
}

async function findUnmatchedCrests() {
  const files = execSync(
    `find "${SOURCE_DIR}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \\)`,
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n");

  const clubs = await prisma.club.findMany({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
    },
    select: {
      name: true,
      imageUrl: true,
    },
  });

  const clubsWithCrests = new Set(
    clubs
      .filter((c) => c.imageUrl)
      .map((c) => c.imageUrl?.split("/").pop()?.toLowerCase())
  );

  console.log("🔍 Unmatched crest files:\n");

  let count = 0;
  for (const file of files) {
    const filename = path.basename(file).toLowerCase();

    if (!clubsWithCrests.has(filename)) {
      const clubName = extractClubName(filename);
      console.log(`${++count}. ${filename}`);
      console.log(`   Likely club: "${clubName}"\n`);
    }
  }

  console.log(`\nTotal unmatched: ${count} crest files`);

  await prisma.$disconnect();
}

findUnmatchedCrests().catch(console.error);
