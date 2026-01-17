import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupNY() {
  console.log("=== New York Club Cleanup ===\n");

  const nyUnit = await prisma.internationalUnit.findFirst({
    where: { name: "New York" },
  });

  if (!nyUnit) {
    console.error("New York unit not found");
    return;
  }

  let merged = 0;
  let fixed = 0;

  // Helper to merge (keep first, delete second)
  async function merge(keepName: string, deleteName: string) {
    const toKeep = await prisma.club.findFirst({
      where: { name: keepName, internationalUnitId: nyUnit.id },
    });
    const toDelete = await prisma.club.findFirst({
      where: { name: deleteName, internationalUnitId: nyUnit.id },
    });

    if (toKeep && toDelete) {
      await prisma.club.delete({ where: { id: toDelete.id } });
      console.log(`  ✓ MERGED: "${deleteName}" -> keeping "${keepName}"`);
      merged++;
    } else if (!toKeep && toDelete) {
      // Rename instead
      await prisma.club.update({
        where: { id: toDelete.id },
        data: { name: keepName },
      });
      console.log(`  ✓ RENAMED: "${deleteName}" -> "${keepName}"`);
      merged++;
    } else if (!toDelete) {
      console.log(`  ? NOT FOUND: ${deleteName}`);
    }
  }

  console.log("--- Merging Duplicates ---\n");

  // Cavan - merge ladies into main club
  await merge("Cavan NY GAA", "Cavan Ladies NY GAA");

  // Fermanagh Ladies - merge if there's a main club (check first)
  const fermanagh = await prisma.club.findMany({
    where: { name: { contains: "Fermanagh" }, internationalUnitId: nyUnit.id },
  });
  if (
    fermanagh.length === 1 &&
    fermanagh[0].name === "Fermanagh Ladies NY GAA"
  ) {
    // Only ladies team exists, rename to main club name
    await prisma.club.update({
      where: { id: fermanagh[0].id },
      data: { name: "Fermanagh NY GAA" },
    });
    console.log('  ✓ RENAMED: "Fermanagh Ladies NY GAA" -> "Fermanagh NY GAA"');
    fixed++;
  }

  // Na Fianna Ladies - merge if there's a main club
  const naFiannaNY = await prisma.club.findMany({
    where: { name: { contains: "Na Fianna" }, internationalUnitId: nyUnit.id },
  });
  if (
    naFiannaNY.length === 1 &&
    naFiannaNY[0].name === "Na Fianna Ladies NY GAA"
  ) {
    await prisma.club.update({
      where: { id: naFiannaNY[0].id },
      data: { name: "Na Fianna NY GAA" },
    });
    console.log('  ✓ RENAMED: "Na Fianna Ladies NY GAA" -> "Na Fianna NY GAA"');
    fixed++;
  }

  console.log("\n--- Fixing Locations ---\n");

  // Fix Shannon Gaels weird location
  const shannon = await prisma.club.findFirst({
    where: { name: "Shannon Gaels", internationalUnitId: nyUnit.id },
  });
  if (shannon) {
    await prisma.club.update({
      where: { id: shannon.id },
      data: { location: "New York, NY, USA" },
    });
    console.log('  ✓ FIXED location: Shannon Gaels -> "New York, NY, USA"');
    fixed++;
  }

  // Fix New Haven location (it's in Connecticut but part of NY GAA)
  const newHaven = await prisma.club.findFirst({
    where: { name: "New Haven Gaelic Club", internationalUnitId: nyUnit.id },
  });
  if (newHaven) {
    await prisma.club.update({
      where: { id: newHaven.id },
      data: { location: "New Haven, CT, USA" },
    });
    console.log(
      '  ✓ FIXED location: New Haven Gaelic Club -> "New Haven, CT, USA"'
    );
    fixed++;
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Merged: ${merged}`);
  console.log(`Fixed: ${fixed}`);

  const total = await prisma.club.count({
    where: { internationalUnitId: nyUnit.id },
  });
  console.log(`\nTotal New York clubs: ${total}`);
}

cleanupNY()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
