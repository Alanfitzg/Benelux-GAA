import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixCrests() {
  console.log("=== Fixing Meath Club Crests ===\n");

  let fixed = 0;

  // 1. Fix Carnaross - has correct crest file available
  const carnaross = await prisma.club.findFirst({
    where: { name: "Carnaross GAA", subRegion: "Meath" },
  });

  if (carnaross) {
    await prisma.club.update({
      where: { id: carnaross.id },
      data: { imageUrl: "/club-crests/meath/carnaross-gaa.png" },
    });
    console.log("✓ Fixed Carnaross GAA: /club-crests/meath/carnaross-gaa.png");
    fixed++;
  }

  // 2. Fix Kilmessan - clear incorrect Lazio logo (no local crest available)
  const kilmessan = await prisma.club.findFirst({
    where: { name: "Kilmessan GAA", subRegion: "Meath" },
  });

  if (kilmessan && kilmessan.imageUrl?.includes("lazio")) {
    await prisma.club.update({
      where: { id: kilmessan.id },
      data: { imageUrl: null },
    });
    console.log("✓ Cleared incorrect Kilmessan GAA crest (was Lazio logo)");
    fixed++;
  }

  // 3. Fix Eastern Gaels - clear incorrect Slaughtmanus logo
  const easternGaels = await prisma.club.findFirst({
    where: { name: "Eastern Gaels GAA", subRegion: "Meath" },
  });

  if (easternGaels && easternGaels.imageUrl?.includes("Slaughtmanus")) {
    await prisma.club.update({
      where: { id: easternGaels.id },
      data: { imageUrl: null },
    });
    console.log(
      "✓ Cleared incorrect Eastern Gaels GAA crest (was Slaughtmanus logo)"
    );
    fixed++;
  }

  // Note: Drumbaragh's O'Neills URL may be valid - leaving it for manual verification

  console.log("\n=== Summary ===");
  console.log(`Crests fixed: ${fixed}`);
  console.log(
    "\nNote: Drumbaragh GAA has external O'Neills URL - may need manual verification"
  );

  // Final crest status
  const clubs = await prisma.club.findMany({
    where: { subRegion: "Meath" },
    select: { name: true, imageUrl: true },
  });

  const withImage = clubs.filter((c) => c.imageUrl);
  const withLocalImage = clubs.filter(
    (c) => c.imageUrl && c.imageUrl.startsWith("/club-crests/meath/")
  );

  console.log(`\nTotal Meath clubs: ${clubs.length}`);
  console.log(`Clubs with any image: ${withImage.length}`);
  console.log(`Clubs with local Meath crest: ${withLocalImage.length}`);
  console.log(`Clubs without image: ${clubs.length - withImage.length}`);
}

fixCrests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
