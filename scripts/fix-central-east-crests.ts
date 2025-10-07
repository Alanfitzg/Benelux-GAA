import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manual mappings for Central-East clubs with broken S3 URLs
const centralEastMappings: { clubName: string; crestFile: string | null }[] = [
  // Clubs with local crests available
  { clubName: "Cumann Warszawa GAA", crestFile: "warsaw.jpg" },
  { clubName: "Midland GAC", crestFile: "midland_gac_2020_logo.png" },
  {
    clubName: "Seamus Heaneys GAC",
    crestFile: "seamus-heaney's-moscow-crest.png",
  },
  { clubName: "Zurich Inneoin", crestFile: "zurich-gaa-logo.png" },

  // Clubs without local crests - set to null to remove broken S3 URLs
  { clubName: "Bydgoszcz CLG", crestFile: null },
  { clubName: "Dresden Hurling", crestFile: null },
  { clubName: "Rome HIbernia GAA", crestFile: null },
  { clubName: "Salzburg GAA", crestFile: null },
  { clubName: "Sant'Ambrogio Milano GAC", crestFile: null },
];

async function fixCentralEastCrests() {
  console.log("🔧 Fixing Central-East region club crests...\n");

  let updated = 0;
  let notFound = 0;

  for (const mapping of centralEastMappings) {
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
    await fixCentralEastCrests();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
