import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ClubFromSeed {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
}

async function restoreClubCrests() {
  console.log("Starting club crest restoration...\n");

  const seedFilePath = path.join(process.cwd(), "prisma/seeds/05-clubs.json");

  if (!fs.existsSync(seedFilePath)) {
    console.error("Error: clubs.json seed file not found at:", seedFilePath);
    process.exit(1);
  }

  const seedData: ClubFromSeed[] = JSON.parse(
    fs.readFileSync(seedFilePath, "utf-8")
  );

  console.log(`Found ${seedData.length} clubs in seed file\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const seedClub of seedData) {
    try {
      if (!seedClub.imageUrl) {
        skippedCount++;
        continue;
      }

      const dbClub = await prisma.club.findFirst({
        where: {
          OR: [
            { name: seedClub.name },
            {
              AND: [
                { name: { contains: seedClub.name.split(" ")[0] } },
                { location: seedClub.location },
              ],
            },
          ],
        },
      });

      if (!dbClub) {
        console.log(
          `❌ Not found in DB: ${seedClub.name} (${seedClub.location})`
        );
        notFoundCount++;
        continue;
      }

      if (dbClub.imageUrl === seedClub.imageUrl) {
        skippedCount++;
        continue;
      }

      await prisma.club.update({
        where: { id: dbClub.id },
        data: { imageUrl: seedClub.imageUrl },
      });

      console.log(`✅ Updated: ${seedClub.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error updating ${seedClub.name}:`, error);
      errorCount++;
    }
  }

  console.log("\n=== Restoration Complete ===");
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`⏭️  Skipped (no change or no imageUrl): ${skippedCount}`);
  console.log(`❌ Not found in database: ${notFoundCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);

  await prisma.$disconnect();
}

restoreClubCrests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
