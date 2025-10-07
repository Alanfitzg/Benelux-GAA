import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manual mappings for Iberia clubs with broken S3 URLs
const iberiaMappings: { clubName: string; crestFile: string | null }[] = [
  // Clubs with local crests available
  { clubName: "Bilbao GAA", crestFile: "bilbao-gaels-crest-(1).jpg" },
  { clubName: "Costa Gaels Marbella", crestFile: "costa-gaels-logo-1200.png" },
  { clubName: "Eire Og Sevilla", crestFile: "eire-og-sevilla-crest.png" },
  { clubName: "Irmamdinhos da Estrada", crestFile: "irmandinhos.png" },
  { clubName: "LX Celtiberos GAA Club", crestFile: "lisbon.webp" },

  // Clubs without local crests - set to null to remove broken S3 URLs
  { clubName: "Celta Málaga", crestFile: null },
  { clubName: "Sitges", crestFile: null },
];

async function fixIberiaCrests() {
  console.log("🔧 Fixing Iberia region club crests...\n");

  let updated = 0;
  let notFound = 0;

  for (const mapping of iberiaMappings) {
    try {
      // Find club by exact name match
      const club = await prisma.club.findFirst({
        where: {
          name: {
            equals: mapping.clubName,
            mode: "insensitive",
          },
        },
      });

      if (!club) {
        console.log(`⚠️  Club not found: ${mapping.clubName}`);
        notFound++;
        continue;
      }

      const imageUrl = mapping.crestFile
        ? `/club-crests/${mapping.crestFile}`
        : null;

      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl },
      });

      if (mapping.crestFile) {
        console.log(`✅ Updated: ${club.name}`);
        console.log(`   → ${imageUrl}\n`);
      } else {
        console.log(`🗑️  Removed broken URL: ${club.name}`);
        console.log(`   (No local crest available)\n`);
      }
      updated++;
    } catch (error) {
      console.error(`❌ Error updating ${mapping.clubName}:`, error);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`✅ Successfully updated: ${updated} clubs`);
  console.log(`⚠️  Not found: ${notFound} clubs`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixIberiaCrests();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
