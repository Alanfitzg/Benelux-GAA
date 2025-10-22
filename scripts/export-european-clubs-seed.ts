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

async function exportEuropeanClubsSeed() {
  console.log("📦 Exporting Continental European clubs for seed data...\n");

  const allClubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
  });

  const europeanClubs = allClubs.filter((club) => {
    const country = club.location?.split(",").pop()?.trim() || "";
    return CONTINENTAL_EUROPEAN_COUNTRIES.includes(country);
  });

  console.log(`   Found ${europeanClubs.length} continental European clubs`);

  const clubsWithImages = europeanClubs.filter((c) => c.imageUrl);
  console.log(
    `   ${clubsWithImages.length} have images (${Math.round((clubsWithImages.length / europeanClubs.length) * 100)}%)`
  );

  const seedData = europeanClubs.map((club) => ({
    id: club.id,
    name: club.name,
    location: club.location,
    latitude: club.latitude,
    longitude: club.longitude,
    map: club.map,
    website: club.website,
    facebook: club.facebook,
    instagram: club.instagram,
    imageUrl: club.imageUrl,
    codes: club.codes,
    teamTypes: club.teamTypes,
    sportsSupported: club.sportsSupported,
    status: club.status,
    dataSource: club.dataSource || "SEED_DATA",
    isMainlandEurope: true,
    verificationStatus: club.verificationStatus,
  }));

  const outputPath = path.join(
    process.cwd(),
    "prisma",
    "seeds",
    "european-clubs.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));

  console.log(`\n✅ Exported ${seedData.length} European clubs to seed file`);
  console.log(`📁 Location: ${outputPath}`);
  console.log(
    `📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`
  );

  const byCountry = seedData.reduce(
    (acc, club) => {
      const country = club.location?.split(",").pop()?.trim() || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log("\n📊 Breakdown by country:");
  Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      console.log(`   ${country}: ${count}`);
    });

  console.log(
    "\n💡 This seed file can be committed to git for version control"
  );
  console.log("   Run: git add prisma/seeds/european-clubs.json");
}

exportEuropeanClubsSeed()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
