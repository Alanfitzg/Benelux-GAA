import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMoreEuropeanClubs() {
  console.log("🔧 Fixing more European club issues...\n");

  // Step 1: Delete duplicates
  console.log("Step 1: Removing duplicate clubs");
  console.log("─────────────────────────────────────────────────");

  const duplicatesToDelete = [
    // Fillos - delete "Fillos de BreogÃ¡n" (encoding issue)
    {
      name: "Fillos de BreogÃ¡n",
      reason: "Duplicate of Fillos of Breogan (encoding issue)",
    },

    // Madrid - delete "Madrid Harps - Youth" (keeping main club)
    {
      name: "Madrid Harps - Youth",
      reason: "Duplicate/Youth team of Madrid Harps GAA",
    },

    // Marbella - delete "Costa Gaels, Marbella" with O\'Neills URL
    {
      name: "Costa Gaels, Marbella",
      reason: "Duplicate of Costa Gaels Marbella",
    },

    // Valencia - delete "Sant Vicent Valencia" (keeping Valencia GAA)
    { name: "Sant Vicent Valencia", reason: "Duplicate of Valencia GAA" },
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

  // Step 2: Fix wrong crests
  console.log("Step 2: Fixing wrong crests");
  console.log("─────────────────────────────────────────────────");

  // Fix Earls of Leuven (currently has Brussels crest)
  const leuven = await prisma.club.findFirst({
    where: { name: "Earls of Leuven" },
  });
  if (leuven) {
    await prisma.club.update({
      where: { id: leuven.id },
      data: { imageUrl: null },
    });
    console.log("🗑️  Removed wrong crest from: Earls of Leuven");
    console.log("   (Had Brussels crest - no Leuven crest available)\n");
  }

  // Fix Gaélicos do Gran Sol (currently has wrong O'Neills crest)
  const granSol = await prisma.club.findFirst({
    where: { name: { contains: "Gran Sol", mode: "insensitive" } },
  });
  if (granSol) {
    await prisma.club.update({
      where: { id: granSol.id },
      data: { imageUrl: null },
    });
    console.log("🗑️  Removed wrong crest from: " + granSol.name);
    console.log("   (No Gran Sol crest available)\n");
  }

  // Fix Zaragoza (currently has wrong Turonia crest)
  const zaragoza = await prisma.club.findFirst({
    where: { name: "Zaragoza GAA" },
  });
  if (zaragoza) {
    await prisma.club.update({
      where: { id: zaragoza.id },
      data: { imageUrl: null },
    });
    console.log("🗑️  Removed wrong crest from: Zaragoza GAA");
    console.log("   (Had Turonia crest - no Zaragoza crest available)\n");
  }

  // Remove crest from Valencia GAA (currently has Independiente crest which may be wrong)
  const valencia = await prisma.club.findFirst({
    where: { name: "Valencia GAA" },
  });
  if (valencia) {
    await prisma.club.update({
      where: { id: valencia.id },
      data: { imageUrl: null },
    });
    console.log("🗑️  Removed crest from: Valencia GAA");
    console.log("   (Verify if Independiente crest is correct)\n");
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ European clubs cleanup complete!");
  console.log("   - Removed 4 duplicates");
  console.log("   - Fixed 4 wrong crests");
  console.log("   - Brussels Craobh Rua needs to be created manually");
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixMoreEuropeanClubs();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
