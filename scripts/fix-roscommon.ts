import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixRoscommon() {
  console.log("=== Fixing Roscommon GAA Clubs ===\n");

  // Get Ireland unit
  const ireland = await prisma.internationalUnit.findFirst({
    where: { name: "Ireland" },
  });

  if (!ireland) {
    console.log("Ireland unit not found");
    return;
  }

  let added = 0;
  let renamed = 0;

  // 1. Add Clann na nGael (one of the most successful Roscommon clubs - 21 county titles)
  console.log("--- Adding Missing Clubs ---\n");

  const clann = await prisma.club.findFirst({
    where: {
      OR: [
        { name: { contains: "Clann na nGael", mode: "insensitive" } },
        { name: { contains: "Clann na Gael", mode: "insensitive" } },
      ],
      subRegion: "Roscommon",
    },
  });

  if (!clann) {
    await prisma.club.create({
      data: {
        name: "Clann na nGael GAA",
        location: "Roscommon, Connacht, Ireland",
        region: "Connacht",
        subRegion: "Roscommon",
        internationalUnitId: ireland.id,
        clubType: "CLUB",
        status: "APPROVED",
      },
    });
    console.log("✓ Added: Clann na nGael GAA");
    added++;
  } else {
    console.log("? Clann na nGael already exists: " + clann.name);
  }

  // 2. Rename Glaveys to Michael Glaveys
  console.log("\n--- Fixing Club Names ---\n");

  const glaveys = await prisma.club.findFirst({
    where: { name: "Glaveys GAA", subRegion: "Roscommon" },
  });

  if (glaveys) {
    await prisma.club.update({
      where: { id: glaveys.id },
      data: { name: "Michael Glaveys GAA" },
    });
    console.log('✓ Renamed: "Glaveys GAA" -> "Michael Glaveys GAA"');
    renamed++;
  } else {
    // Check if already renamed
    const michaelGlaveys = await prisma.club.findFirst({
      where: {
        name: { contains: "Michael Glaveys", mode: "insensitive" },
        subRegion: "Roscommon",
      },
    });
    if (michaelGlaveys) {
      console.log("? Michael Glaveys already correct: " + michaelGlaveys.name);
    } else {
      console.log("? Glaveys not found");
    }
  }

  // Note: Keeping Ballinagare, Clogher, Crosna, Ballinlough
  // These may be smaller/junior clubs or amalgamated clubs that still exist
  console.log("\n--- Clubs kept (may be junior/amalgamated) ---");
  console.log("  - Ballinagare GAA");
  console.log("  - Clogher GAA");
  console.log("  - Crosna GAA");
  console.log("  - Ballinlough GAA");

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Clubs added: ${added}`);
  console.log(`Clubs renamed: ${renamed}`);

  // Final count
  const roscommonClubs = await prisma.club.findMany({
    where: { subRegion: "Roscommon" },
    orderBy: { name: "asc" },
  });

  console.log(
    `\n=== Final Roscommon Club List (${roscommonClubs.length}) ===\n`
  );
  roscommonClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixRoscommon()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
