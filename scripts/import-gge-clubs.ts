import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface GGEClub {
  name: string;
  country: string;
}

async function importGGEClubs() {
  console.log("📥 Importing clubs from GGE scrape data...\n");

  const ggeClubsPath = path.join(process.cwd(), "gge-clubs-manual.json");
  const ggeClubs: GGEClub[] = JSON.parse(
    fs.readFileSync(ggeClubsPath, "utf-8")
  );

  console.log(`Found ${ggeClubs.length} clubs in GGE data\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const ggeClub of ggeClubs) {
    try {
      // Check if club already exists
      const searchName = ggeClub.name.split(" ")[0];
      const existing = await prisma.club.findFirst({
        where: {
          OR: [
            { name: { contains: searchName, mode: "insensitive" } },
            { name: { contains: ggeClub.name, mode: "insensitive" } },
          ],
          location: { contains: ggeClub.country, mode: "insensitive" },
          status: "APPROVED",
        },
      });

      if (existing) {
        console.log(
          `  ⏭️  Skipped: ${ggeClub.name} → already exists as "${existing.name}"`
        );
        skipped++;
        continue;
      }

      // Create new club
      await prisma.club.create({
        data: {
          name: ggeClub.name,
          location: ggeClub.country,
          status: "APPROVED",
          teamTypes: [],
          dataSource: "GGE_SCRAPE_2025",
          isMainlandEurope: true,
          verificationStatus: "UNVERIFIED",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`  ✅ Imported: ${ggeClub.name} (${ggeClub.country})`);
      imported++;
    } catch (error) {
      console.error(`  ❌ Error importing ${ggeClub.name}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   Imported: ${imported} new clubs`);
  console.log(`   Skipped: ${skipped} (already exist)`);
  console.log(`   Errors: ${errors}`);

  // Final status
  const allClubs = await prisma.club.findMany({
    where: { status: "APPROVED", isMainlandEurope: true },
  });

  const withImages = allClubs.filter((c) => c.imageUrl);

  console.log(`\n✅ Final Status:`);
  console.log(`   Total European clubs: ${allClubs.length}`);
  console.log(
    `   With crests: ${withImages.length} (${Math.round((withImages.length / allClubs.length) * 100)}%)`
  );
}

importGGEClubs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
