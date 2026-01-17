import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMeath() {
  console.log("=== Fixing Meath GAA Clubs ===\n");

  let deleted = 0;

  // 1. Delete duplicate - Ballinacree GAA (St Brigid's Ballinacree GAA is the correct entry)
  console.log("--- Removing Duplicates ---\n");

  const ballinacree = await prisma.club.findFirst({
    where: { name: "Ballinacree GAA", subRegion: "Meath" },
  });

  const stBrigidsBallinacree = await prisma.club.findFirst({
    where: { name: "St Brigid's Ballinacree GAA", subRegion: "Meath" },
  });

  if (ballinacree && stBrigidsBallinacree) {
    try {
      await prisma.club.delete({ where: { id: ballinacree.id } });
      console.log(
        '✓ Deleted: "Ballinacree GAA" (St Brigid\'s Ballinacree GAA is the correct name)'
      );
      deleted++;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Ballinacree GAA" (has references)');
      }
    }
  } else if (ballinacree && !stBrigidsBallinacree) {
    // Rename to the full name
    await prisma.club.update({
      where: { id: ballinacree.id },
      data: { name: "St Brigid's Ballinacree GAA" },
    });
    console.log(
      '✓ Renamed: "Ballinacree GAA" -> "St Brigid\'s Ballinacree GAA"'
    );
  } else {
    console.log("? Ballinacree duplicate not found or already resolved");
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Duplicates deleted: ${deleted}`);

  // Final count
  const meathClubs = await prisma.club.findMany({
    where: { subRegion: "Meath" },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== Final Meath Club List (${meathClubs.length}) ===\n`);
  meathClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixMeath()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
