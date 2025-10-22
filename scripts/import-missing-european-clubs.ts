import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const MISSING_CLUBS = [
  {
    name: "Amsterdam GAC",
    city: "Amsterdam",
    country: "Netherlands",
    latitude: 52.3793727,
    longitude: 4.7869126,
    website: "https://twitter.com/amsterdamgac",
    crestFile: "amsterdam.png",
  },
  {
    name: "An Craobh Rua",
    city: "Brussels",
    country: "Belgium",
    latitude: 50.823465,
    longitude: 4.3944281,
    website: "https://twitter.com/belgiumgaa",
    crestFile: "bgaa-logo.png",
  },
  {
    name: "Bucharest Gaels",
    city: "Bucharest",
    country: "Romania",
    latitude: 44.4318548,
    longitude: 26.0874508,
    crestFile: "bucharest.webp",
  },
  {
    name: "Frankfurt Sarsfields GAA Club",
    city: "Frankfurt",
    country: "Germany",
    latitude: 50.1109221,
    longitude: 8.6821267,
    crestFile: "frankfurt.webp",
  },
  {
    name: "Padova Gaelic Football",
    city: "Padua",
    country: "Italy",
    latitude: 45.4064349,
    longitude: 11.8767611,
    crestFile: "padova.png",
  },
  {
    name: "Augsburg GAA",
    city: "Augsburg",
    country: "Germany",
    latitude: 48.3705449,
    longitude: 10.8978586,
    crestFile: "augsburg.webp",
  },
  {
    name: "Rovigo Gaelic Football",
    city: "Rovigo",
    country: "Italy",
    latitude: 45.0701858,
    longitude: 11.7899714,
    crestFile: "rovigo-gaels.png",
  },
  {
    name: "SS Lazio Calcio Gaelico",
    city: "Rome",
    country: "Italy",
    latitude: 41.9027835,
    longitude: 12.4963655,
    crestFile: "rome-lazio.png",
  },
  {
    name: "Monselice Gaelic Football",
    city: "Monselice",
    country: "Italy",
    latitude: 45.2372149,
    longitude: 11.7518313,
    crestFile: "monselice.png",
  },
  {
    name: "Milan Shamrocks",
    city: "Milan",
    country: "Italy",
    latitude: 45.4642035,
    longitude: 9.189982,
    crestFile: "milano.png",
  },
  {
    name: "Rome Hibernia GAA",
    city: "Rome",
    country: "Italy",
    latitude: 41.9027835,
    longitude: 12.4963655,
    crestFile: "rome-hibernia.png",
  },
  {
    name: "Dresden Hurling",
    city: "Dresden",
    country: "Germany",
    latitude: 51.0504088,
    longitude: 13.7372621,
    crestFile: "dresden-hurling.png",
  },
];

async function importMissingClubs() {
  console.log("📥 Importing Missing European Clubs...\n");

  let imported = 0;
  let skipped = 0;

  for (const clubData of MISSING_CLUBS) {
    const existing = await prisma.club.findFirst({
      where: {
        name: { contains: clubData.name.split(" ")[0], mode: "insensitive" },
        location: { contains: clubData.country, mode: "insensitive" },
      },
    });

    if (existing) {
      console.log(`  ⏭️  Skipped: ${clubData.name} (already exists)`);
      skipped++;
      continue;
    }

    const crestPath = clubData.crestFile
      ? `/club-crests/${clubData.crestFile}`
      : null;

    // Verify crest file exists
    if (clubData.crestFile) {
      const crestFilePath = path.join(
        process.cwd(),
        "public",
        "club-crests",
        clubData.crestFile
      );
      if (!fs.existsSync(crestFilePath)) {
        console.log(
          `  ⚠️  Crest not found for ${clubData.name}: ${clubData.crestFile}`
        );
      }
    }

    await prisma.club.create({
      data: {
        name: clubData.name,
        location: `${clubData.city}, ${clubData.country}`,
        latitude: clubData.latitude,
        longitude: clubData.longitude,
        website: clubData.website || null,
        imageUrl: crestPath,
        status: "APPROVED",
        teamTypes: [],
        dataSource: "MANUAL_IMPORT_2025",
        isMainlandEurope: true,
        verificationStatus: "UNVERIFIED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`  ✅ Imported: ${clubData.name} (${clubData.country})`);
    imported++;
  }

  console.log(`\n📊 Import Complete:`);
  console.log(`   Imported: ${imported} new clubs`);
  console.log(`   Skipped: ${skipped} (already exist)`);
}

importMissingClubs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
