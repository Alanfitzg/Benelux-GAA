import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manual mappings for Benelux clubs with broken S3 URLs
const beneluxMappings: { clubName: string; crestFile: string | null }[] = [
  // Clubs with local crests available
  { clubName: "Cologne Celtics", crestFile: "logo-cologne_celtics.png" },
  { clubName: "C.L.G. Den Haag", crestFile: "hq-denhaaggaa-2400.png" },
  { clubName: "Den Haag GAA", crestFile: "hq-denhaaggaa-2400.png" },
  {
    clubName: "EC Brussels",
    crestFile: "logo-ecgaelicclubbrussels(youth).png",
  },

  // Clubs without local crests - set to null to remove broken S3 URLs
  { clubName: "Dusseldorf GFC", crestFile: null },
  { clubName: "Frankfurt Sarsfields", crestFile: null },
  { clubName: "NIjmegen GFC", crestFile: null },
];

async function fixBeneluxCrests() {
  console.log("🔧 Fixing Benelux region club crests...\n");

  let updated = 0;
  let notFound = 0;

  for (const mapping of beneluxMappings) {
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
    await fixBeneluxCrests();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
