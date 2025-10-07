import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixFrenchClubs() {
  console.log("🔧 Fixing French clubs - wrong crests and duplicates...\n");

  // Step 1: Delete duplicate clubs (keeping the better one)
  console.log("Step 1: Removing duplicate clubs");
  console.log("─────────────────────────────────────────────────");

  const duplicatesToDelete = [
    // Lille - delete the one with S3 URL
    { name: "Lille FG", reason: "Duplicate of Lille GAA" },
    // Kerne - delete the one with accent issues
    {
      name: "Kerne Football GaÃ©lique",
      reason: "Duplicate of Kerne (Quimper)",
    },
    // Strasbourg - delete the one with French name
    {
      name: "Football gaélique Strasbourg",
      reason: "Duplicate of Strasbourg Gaels",
    },
    // Tolosa - delete the one with wrong O\'Neills crest
    {
      name: "Tolosa Gaelic Football Club",
      reason: "Duplicate of Tolosa Gaels",
    },
    // Vannes - delete the one with S3 URL
    { name: "Vannes (Gwened Vannes)", reason: "Duplicate of Gwened Vannes" },
    // Bordeaux - delete "Bordeaux Gaelic Football Club" (shorter name)
    {
      name: "Bordeaux Gaelic Football Club",
      reason: "Duplicate of Bordeaux Gaelic Football",
    },
  ];

  for (const dup of duplicatesToDelete) {
    const club = await prisma.club.findFirst({
      where: { name: dup.name },
    });

    if (club) {
      await prisma.club.delete({ where: { id: club.id } });
      console.log(`🗑️  Deleted: ${dup.name} (${dup.reason})`);
    }
  }

  console.log("\\nStep 2: Updating crests for remaining clubs");
  console.log("─────────────────────────────────────────────────");

  // Step 2: Fix wrong crests and update with local files
  const crestUpdates = [
    // Fix Le Mans (currently has Clermont crest)
    {
      name: "Le Mans",
      crestFile: null,
      note: "Remove Clermont crest - no Le Mans crest available",
    },

    // Fix Montpellier (currently has Clermont crest)
    {
      name: "Montpellier GAA",
      crestFile: null,
      note: "Remove Clermont crest - no Montpellier crest available",
    },

    // Fix Paris Gaels (currently has Le Havre crest)
    {
      name: "Paris Gaels",
      crestFile: null,
      note: "Remove Le Havre crest - no Paris Gaels crest available",
    },

    // Update Lille GAA with local crest
    {
      name: "Lille GAA",
      crestFile: "logo-lillegaa.png",
      note: "Update with local crest",
    },

    // Update Vannes with local crest
    {
      name: "Gwened Vannes",
      crestFile: "vannes-logo.png",
      note: "Update with local crest",
    },
  ];

  for (const update of crestUpdates) {
    const club = await prisma.club.findFirst({
      where: { name: { equals: update.name, mode: "insensitive" } },
    });

    if (club) {
      const imageUrl = update.crestFile
        ? `/club-crests/${update.crestFile}`
        : null;
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl },
      });

      if (update.crestFile) {
        console.log(`✅ Updated: ${club.name}`);
        console.log(`   → ${imageUrl}`);
      } else {
        console.log(`🗑️  Removed wrong crest: ${club.name}`);
      }
      console.log(`   Note: ${update.note}\\n`);
    } else {
      console.log(`⚠️  Not found: ${update.name}\\n`);
    }
  }

  console.log("\\n═══════════════════════════════════════════════════════════");
  console.log("✅ French clubs cleanup complete!");
  console.log("═══════════════════════════════════════════════════════════\\n");
}

async function main() {
  try {
    await fixFrenchClubs();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
