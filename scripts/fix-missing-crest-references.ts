import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MISSING_FILES = [
  "frankfurt.webp",
  "padova.png",
  "monselice.png",
  "rovigo-gaels.png",
];

async function fixMissingCrestReferences() {
  console.log("🔧 Fixing clubs with missing crest files...\n");

  for (const file of MISSING_FILES) {
    const clubs = await prisma.club.findMany({
      where: {
        imageUrl: `/club-crests/${file}`,
      },
    });

    for (const club of clubs) {
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: null },
      });
      console.log(`  ✅ Removed broken image reference: ${club.name}`);
    }
  }

  console.log("\n✅ Fixed all clubs with missing crest files");
}

fixMissingCrestReferences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
