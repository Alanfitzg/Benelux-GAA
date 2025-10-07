import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixGermanDuplicates() {
  console.log("🔧 Fixing German club duplicates...\n");

  const duplicatesToDelete = [
    // Augsburg - delete "Rómhánaigh Augsburg Óg" (keeping "Augsburg GAA")
    { name: "Rómhánaigh Augsburg Óg", reason: "Duplicate of Augsburg GAA" },

    // Berlin Setanta - delete "Setanta Berlin GAA" (keeping "Setanta Berlin Gaelic Club")
    {
      name: "Setanta Berlin GAA",
      reason: "Duplicate of Setanta Berlin Gaelic Club",
    },

    // Munich - delete "Munich GAA" (keeping "Munich Colmcilles")
    { name: "Munich GAA", reason: "Duplicate of Munich Colmcilles" },
  ];

  let deleted = 0;

  for (const dup of duplicatesToDelete) {
    const club = await prisma.club.findFirst({
      where: { name: dup.name },
    });

    if (club) {
      await prisma.club.delete({ where: { id: club.id } });
      console.log(`🗑️  Deleted: ${dup.name}`);
      console.log(`   Reason: ${dup.reason}\n`);
      deleted++;
    } else {
      console.log(`⚠️  Not found: ${dup.name}\n`);
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`✅ Successfully deleted ${deleted} duplicate German clubs`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixGermanDuplicates();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
