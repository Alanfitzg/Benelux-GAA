import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixSwissClubs() {
  console.log("🔧 Fixing Swiss club issues...\n");

  // Step 1: Delete Zurich Inneoin (duplicate of Zurich GAA)
  console.log("Step 1: Removing Zurich duplicate");
  console.log("─────────────────────────────────────────────────");

  const zurichDup = await prisma.club.findFirst({
    where: { name: "Zurich Inneoin" },
  });

  if (zurichDup) {
    await prisma.club.delete({ where: { id: zurichDup.id } });
    console.log("🗑️  Deleted: Zurich Inneoin (Duplicate of Zurich GAA)\n");
  }

  // Step 2: Fix Geneva Gaels crest (currently has wrong O'Neills URL)
  console.log("Step 2: Fixing Geneva Gaels crest");
  console.log("─────────────────────────────────────────────────");

  const geneva = await prisma.club.findFirst({
    where: { name: "Geneva Gaels" },
  });

  if (geneva) {
    await prisma.club.update({
      where: { id: geneva.id },
      data: { imageUrl: null },
    });
    console.log("🗑️  Removed wrong crest from: Geneva Gaels");
    console.log("   (No Geneva Gaels crest file available)\n");
  }

  // Step 3: Create Bern GAA
  console.log("Step 3: Creating Bern GAA");
  console.log("─────────────────────────────────────────────────");

  const bernExists = await prisma.club.findFirst({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: "bern", mode: "insensitive" } },
            { location: { contains: "bern", mode: "insensitive" } },
          ],
        },
        { location: { contains: "switzerland", mode: "insensitive" } },
      ],
    },
  });

  if (!bernExists) {
    await prisma.club.create({
      data: {
        name: "Bern GAA",
        location: "Bern, Switzerland",
        region: "Central-East",
        imageUrl: "/club-crests/bern-gaa.png",
        isMainlandEurope: true,
      },
    });
    console.log("✅ Created: Bern GAA");
    console.log("   → /club-crests/bern-gaa.png\n");
  } else {
    console.log("ℹ️  Bern GAA already exists\n");
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Swiss clubs cleanup complete!");
  console.log("   - Removed Zurich duplicate");
  console.log("   - Fixed Geneva crest");
  console.log("   - Created Bern GAA");
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixSwissClubs();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
