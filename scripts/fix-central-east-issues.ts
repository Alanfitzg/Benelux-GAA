import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixCentralEastIssues() {
  console.log("🔧 Fixing Central-East club issues...\n");

  // Step 1: Delete duplicates
  console.log("Step 1: Removing duplicate clubs");
  console.log("─────────────────────────────────────────────────");

  const duplicatesToDelete = [
    // Luxembourg - delete "Luxembourg" (keeping "Gaelic Sports Club Luxembourg")
    {
      name: "Luxembourg",
      reason: "Duplicate of Gaelic Sports Club Luxembourg",
    },

    // Warsaw - delete "Cumann Warszawa GAA" with S3 URL (keeping "Cumann Warszawa Gaa" with local crest)
    { name: "Cumann Warszawa GAA", reason: "Duplicate of Cumann Warszawa Gaa" },

    // Malmo - delete "MalmÃ¶ GAA" (encoding issue, keeping "Malmo GAA")
    { name: "MalmÃ¶ GAA", reason: "Duplicate of Malmo GAA (encoding issue)" },
  ];

  for (const dup of duplicatesToDelete) {
    const club = await prisma.club.findFirst({
      where: { name: dup.name },
    });

    if (club) {
      await prisma.club.delete({ where: { id: club.id } });
      console.log(`🗑️  Deleted: ${dup.name}`);
      console.log(`   Reason: ${dup.reason}\n`);
    }
  }

  // Step 2: Create Wroclaw club
  console.log("\nStep 2: Creating Wroclaw club");
  console.log("─────────────────────────────────────────────────");

  const wroclawExists = await prisma.club.findFirst({
    where: {
      OR: [
        { name: { contains: "wroclaw", mode: "insensitive" } },
        { location: { contains: "wroclaw", mode: "insensitive" } },
      ],
    },
  });

  if (!wroclawExists) {
    await prisma.club.create({
      data: {
        name: "Wroclaw Eire Og",
        location: "Wrocław, Poland",
        region: "Central-East",
        imageUrl: "/club-crests/wroclaweireogwhitetransparent.png",
        isMainlandEurope: true,
      },
    });
    console.log("✅ Created: Wroclaw Eire Og");
    console.log("   → /club-crests/wroclaweireogwhitetransparent.png\n");
  } else {
    console.log("ℹ️  Wroclaw club already exists\n");
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Central-East clubs cleanup complete!");
  console.log("   - Removed 3 duplicates");
  console.log("   - Created Wroclaw club");
  console.log("   - Bydgoszcz CLG still needs crest (no file available)");
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixCentralEastIssues();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
