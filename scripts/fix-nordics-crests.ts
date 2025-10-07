import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manual mappings for Nordics clubs with broken S3 URLs
const nordicsMappings: { clubName: string; crestFile: string | null }[] = [
  // Clubs with local crests available
  { clubName: "Gävle GAA", crestFile: "gavle.jpg" },
  { clubName: "Luleå Gaels", crestFile: "lulea.jpg" },

  // Clubs without local crests - set to null to remove broken S3 URLs
  { clubName: "Dún na Eesti", crestFile: null },
  { clubName: "Hilllerood Wolfe Tones", crestFile: null },
  { clubName: "Oulu Irish Elks GAA", crestFile: null },
  { clubName: "Reykjavík GAA", crestFile: null },
];

async function fixNordicsCrests() {
  console.log("🔧 Fixing Nordics region club crests...\n");

  let updated = 0;
  let notFound = 0;

  for (const mapping of nordicsMappings) {
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
    await fixNordicsCrests();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
