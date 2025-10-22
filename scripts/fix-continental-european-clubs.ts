import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const CONTINENTAL_EUROPEAN_COUNTRIES = [
  "France",
  "Romania",
  "Denmark",
  "Croatia",
  "Poland",
  "Germany",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Luxembourg",
  "Spain",
  "Gibraltar",
  "Sweden",
  "Finland",
  "Russia",
  "Norway",
  "Portugal",
  "Slovenia",
  "Czech Republic",
  "Estonia",
  "Hungary",
  "Iceland",
  "Slovakia",
];

async function findClubCrest(
  clubName: string,
  clubLocation: string
): Promise<string | null> {
  const crestsDir = path.join(process.cwd(), "public", "club-crests");

  if (!fs.existsSync(crestsDir)) {
    console.warn("⚠️  Club crests directory not found");
    return null;
  }

  const normalizedClubName = clubName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const cityMatch = clubLocation.match(/^([^,]+)/);
  const city = cityMatch
    ? cityMatch[1].toLowerCase().replace(/[^a-z0-9]/g, "-")
    : "";

  const possibleNames = [
    normalizedClubName,
    city,
    clubName.toLowerCase().replace(/\s+/g, "-"),
    clubName.toLowerCase().replace(/[^a-z0-9]+/g, ""),
    `${city}-gaa`,
    `${city}-gaels`,
    clubName.split(" ")[0].toLowerCase(),
  ];

  const extensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
  const allFiles = fs.readdirSync(crestsDir);

  for (const name of possibleNames) {
    for (const ext of extensions) {
      const fileName = `${name}${ext}`;
      if (allFiles.includes(fileName)) {
        console.log(`✓ Found crest for ${clubName}: ${fileName}`);
        return `/club-crests/${fileName}`;
      }
    }
  }

  const partialMatch = allFiles.find((file) => {
    const fileNameLower = file.toLowerCase();
    return possibleNames.some(
      (name) =>
        fileNameLower.includes(name) ||
        name.includes(fileNameLower.replace(/\.[^.]+$/, ""))
    );
  });

  if (partialMatch) {
    console.log(`✓ Found partial match for ${clubName}: ${partialMatch}`);
    return `/club-crests/${partialMatch}`;
  }

  return null;
}

async function fixContinentalEuropeanClubs() {
  console.log("🔧 Starting Continental European Clubs Fix...\n");

  console.log("📊 Step 1: Analyzing current database state...");
  const allClubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
  });

  const europeanClubs = allClubs.filter((club) => {
    const country = club.location?.split(",").pop()?.trim() || "";
    return CONTINENTAL_EUROPEAN_COUNTRIES.includes(country);
  });

  console.log(`   Total approved clubs: ${allClubs.length}`);
  console.log(`   Continental European clubs: ${europeanClubs.length}`);

  const clubsWithoutImages = europeanClubs.filter((c) => !c.imageUrl);
  const clubsWithS3Images = europeanClubs.filter((c) =>
    c.imageUrl?.includes("s3.")
  );

  console.log(`   Clubs without images: ${clubsWithoutImages.length}`);
  console.log(`   Clubs with S3 URLs: ${clubsWithS3Images.length}`);

  console.log("\n🖼️  Step 2: Linking club crests from public/club-crests/...");

  let linkedCount = 0;

  for (const club of europeanClubs) {
    const needsImage =
      !club.imageUrl ||
      club.imageUrl.includes("s3.") ||
      club.imageUrl.includes("oneills.com");

    if (needsImage && club.location) {
      const crestPath = await findClubCrest(club.name, club.location);

      if (crestPath) {
        await prisma.club.update({
          where: { id: club.id },
          data: {
            imageUrl: crestPath,
            updatedAt: new Date(),
          },
        });
        linkedCount++;
        console.log(`   ✓ Linked: ${club.name} → ${crestPath}`);
      } else {
        console.log(
          `   ⚠️  No crest found for: ${club.name} (${club.location})`
        );
      }
    }
  }

  console.log(`\n✅ Linked ${linkedCount} club crests`);

  console.log("\n🌍 Step 3: Importing fresh data from CSV...");

  const csvPath = path.join(process.cwd(), "docs", "Allgaaclubs.csv");

  if (!fs.existsSync(csvPath)) {
    console.warn("⚠️  CSV file not found, skipping import");
  } else {
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").slice(1);

    let importedCount = 0;
    let updatedCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const match = line.match(
        /Europe,"?([^"]+)"?,"?([^"]*)"?,"?([^"]*)"?,([^,]+),([^,]+),"?([^"]*)"?,"?([^"]*)"?,"?([^"]*)"?,"?([^"]*)"?,"?([^"]*)"?,"?([^"]*)"?,[^,]*,[^,]*,[^,]*,(.+)$/
      );

      if (match) {
        const [
          ,
          clubName,
          ,
          code,
          latitude,
          longitude,
          city,
          country,
          ,
          ,
          directions,
          twitter,
          ,
          ,
          ,
          crestUrl,
        ] = match;

        if (!CONTINENTAL_EUROPEAN_COUNTRIES.includes(country)) continue;

        const existingClub = await prisma.club.findFirst({
          where: {
            name: { contains: clubName, mode: "insensitive" },
            location: { contains: country, mode: "insensitive" },
          },
        });

        const crestPath = await findClubCrest(clubName, `${city}, ${country}`);
        const finalImageUrl =
          crestPath || (crestUrl?.trim() ? crestUrl.trim() : null);

        const clubData = {
          name: clubName,
          location: `${city}, ${country}`.trim(),
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          map: directions || null,
          codes: code || null,
          website: twitter || null,
          imageUrl: finalImageUrl,
          status: "APPROVED" as const,
          teamTypes: [],
          dataSource: "CSV_IMPORT_2025",
          isMainlandEurope: true,
          updatedAt: new Date(),
        };

        if (existingClub) {
          await prisma.club.update({
            where: { id: existingClub.id },
            data: clubData,
          });
          updatedCount++;
          console.log(`   ↻ Updated: ${clubName}`);
        } else {
          await prisma.club.create({ data: clubData });
          importedCount++;
          console.log(`   + Imported: ${clubName}`);
        }
      }
    }

    console.log(`\n✅ Imported ${importedCount} new clubs`);
    console.log(`✅ Updated ${updatedCount} existing clubs`);
  }

  console.log("\n📊 Step 4: Final statistics...");

  const finalClubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
  });

  const finalEuropean = finalClubs.filter((club) => {
    const country = club.location?.split(",").pop()?.trim() || "";
    return CONTINENTAL_EUROPEAN_COUNTRIES.includes(country);
  });

  const byCountry = finalEuropean.reduce(
    (acc, club) => {
      const country = club.location?.split(",").pop()?.trim() || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log(`\n   Continental European Clubs by Country:`);
  Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      console.log(`   ${country}: ${count}`);
    });

  const withImages = finalEuropean.filter((c) => c.imageUrl).length;
  console.log(`\n   Total: ${finalEuropean.length} clubs`);
  console.log(
    `   With images: ${withImages} (${Math.round((withImages / finalEuropean.length) * 100)}%)`
  );

  console.log("\n✅ Continental European Clubs Fix Complete!\n");
}

fixContinentalEuropeanClubs()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
