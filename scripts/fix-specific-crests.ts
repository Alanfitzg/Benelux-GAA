import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manual mappings for clubs that didn't auto-match or have incorrect S3 URLs
const manualMappings: { clubName: string; crestFile: string }[] = [
  // Previous fixes
  {
    clubName: "Barcelona Gaels",
    crestFile: "3463-st.-patricks-gaz-101.1-gr.png.png",
  },
  { clubName: "Basel GAA", crestFile: "basel-gaa-logo.png" },
  { clubName: "Copenhagen GAA", crestFile: "copenhagen-crest.jpg" },
  { clubName: "Darmstadt GAA", crestFile: "logo-cologne_celtics.png" },
  { clubName: "Earls of Leuven", crestFile: "bgaa-logo.png" },
  {
    clubName: "Fillos of Breogan",
    crestFile: "a-coruña-fillos-de-breogán.png",
  },
  {
    clubName: "Fillos de BreogÃ¡n",
    crestFile: "a-coruña-fillos-de-breogán.png",
  },
  { clubName: "Hamburg GAA", crestFile: "hamburggaa_crest_png.png" },
  { clubName: "Helsinki Harps GAA", crestFile: "helsinki-harps-300dpi.png" },
  { clubName: "Lorient GAC", crestFile: "goelands.webp" },
  {
    clubName: "Maastricht Gaels",
    crestFile: "maastricht-gaels---red-round---cropped.png",
  },
  { clubName: "Madrid Harps GAA", crestFile: "harps-crest-(large).jpg" },
  { clubName: "Madrid Harps - Youth", crestFile: "harps-crest-(large).jpg" },
  {
    clubName: "Moscow Shamrocks",
    crestFile: "seamus-heaney's-moscow-crest.png",
  },
  { clubName: "Paris Gaels", crestFile: "logo-lh-fg.png" },
  { clubName: "Strasbourg Gaels", crestFile: "logo-strasbourg-gaels.png" },
  {
    clubName: "Football gaélique Strasbourg",
    crestFile: "logo-strasbourg-gaels.png",
  },
  { clubName: "Valencia GAA", crestFile: "independiente.png" },
  { clubName: "Sant Vicent Valencia", crestFile: "independiente.png" },
  { clubName: "Zaragoza GAA", crestFile: "turonia-gfg.png" },

  // New French/Nordic clubs
  { clubName: "Tampere Hammers", crestFile: "crest.jpg" }, // Nordic crest
  {
    clubName: "Anjou Gaels",
    crestFile: "anjou-gaels-liser+®-jaune-+-fond.png",
  },
  { clubName: "Brest (Bro Leon)", crestFile: "gwenn-rann.webp" },
  { clubName: "Gwen Rann (Guerande)", crestFile: "gwenn-rann.webp" },
  { clubName: "Football gaélique Le Havre", crestFile: "logo-lh-fg.png" },
  { clubName: "Le Mans", crestFile: "clermont.webp" }, // Need to verify correct file
  { clubName: "Montpellier GAA", crestFile: "clermont.webp" }, // Need to verify correct file
  {
    clubName: "Football Gaelique Nantes (Naoned)",
    crestFile: "nantes-gaa.png",
  },
  { clubName: "Rennes (Ar Gwazi Gouez)", crestFile: "logo_rennes_gaa.png" },
  { clubName: "St Brieuc (Bro St. Brieg)", crestFile: "gwenn-rann.webp" }, // Using Gwenn Rann as similar Brittany club
  { clubName: "Golélands Gaëlics S. Coulomb", crestFile: "goelands.webp" },

  // Correcting incorrect crests
  { clubName: "Slovak Shamrocks", crestFile: "slovakshamrocks-gaa-logo3.png" },
  {
    clubName: "Slovak Shamrocks GAA",
    crestFile: "slovakshamrocks-gaa-logo3.png",
  },
  { clubName: "Setanta Berlin Gaelic Club", crestFile: "berlin-setanta.webp" },
  { clubName: "Setanta Berlin GAA", crestFile: "berlin-setanta.webp" },
  {
    clubName: "Gaelic Sports Club Luxembourg",
    crestFile: "gaelic_sports_club_luxembourg_crest.jpg",
  },
  {
    clubName: "Gaelic Football Bro Sant Brieg",
    crestFile: "liguesportsgaeliques-(4).jpg",
  },
];

async function fixSpecificCrests() {
  console.log("🔧 Fixing specific club crests...\n");

  let updated = 0;
  let notFound = 0;

  for (const mapping of manualMappings) {
    try {
      // Find club by name (case-insensitive partial match)
      const clubs = await prisma.club.findMany({
        where: {
          name: {
            contains: mapping.clubName,
            mode: "insensitive",
          },
        },
      });

      if (clubs.length === 0) {
        console.log(`⚠️  Club not found: ${mapping.clubName}`);
        notFound++;
        continue;
      }

      if (clubs.length > 1) {
        console.log(`⚠️  Multiple clubs found for "${mapping.clubName}":`);
        clubs.forEach((club) =>
          console.log(`   - ${club.name} (ID: ${club.id})`)
        );
        console.log(`   Skipping - please be more specific\n`);
        notFound++;
        continue;
      }

      const club = clubs[0];
      const imageUrl = `/club-crests/${mapping.crestFile}`;

      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl },
      });

      console.log(`✅ Updated: ${club.name}`);
      console.log(`   → ${imageUrl}\n`);
      updated++;
    } catch (error) {
      console.error(`❌ Error updating ${mapping.clubName}:`, error);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`✅ Successfully updated: ${updated} clubs`);
  console.log(`⚠️  Not found/skipped: ${notFound} clubs`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixSpecificCrests();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
