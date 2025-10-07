import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMoreFrenchClubs() {
  console.log("🔧 Fixing Brest, Lyon, and incorrect crests...\n");

  // Step 1: Delete duplicates
  console.log("Step 1: Removing duplicate clubs");
  console.log("─────────────────────────────────────────────────");

  // Delete "Gaelic Football Bro-Leon" (duplicate of "Brest (Bro Leon)")
  const brestDup = await prisma.club.findFirst({
    where: { name: "Gaelic Football Bro-Leon" },
  });
  if (brestDup) {
    await prisma.club.delete({ where: { id: brestDup.id } });
    console.log(
      "🗑️  Deleted: Gaelic Football Bro-Leon (Duplicate of Brest (Bro Leon))"
    );
  }

  // Delete "Lugdunum CLG" (duplicate of "Lyon (Ludugnum)")
  const lyonDup = await prisma.club.findFirst({
    where: { name: "Lugdunum CLG" },
  });
  if (lyonDup) {
    await prisma.club.delete({ where: { id: lyonDup.id } });
    console.log("🗑️  Deleted: Lugdunum CLG (Duplicate of Lyon (Ludugnum))");
  }

  // Step 2: Fix incorrect Lyon crest on Irish clubs
  console.log("\nStep 2: Fixing incorrect Lyon crest on Irish clubs");
  console.log("─────────────────────────────────────────────────");

  const irishClubsWithWrongCrest = ["Castlelyons", "Killyon"];

  for (const clubName of irishClubsWithWrongCrest) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
    });

    if (club) {
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: null },
      });
      console.log(`🗑️  Removed incorrect Lyon crest from: ${clubName}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("✅ Brest and Lyon clubs cleanup complete!");
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixMoreFrenchClubs();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
