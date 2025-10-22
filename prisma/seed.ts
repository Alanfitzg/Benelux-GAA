import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function seedEuropeanClubs() {
  const seedPath = path.join(__dirname, "seeds", "european-clubs.json");

  if (!fs.existsSync(seedPath)) {
    console.log("⚠️  No European clubs seed file found");
    console.log("   Run: npx tsx scripts/export-european-clubs-seed.ts");
    return;
  }

  console.log("🌍 Seeding Continental European clubs...\n");

  const clubsData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  console.log(`   Found ${clubsData.length} clubs in seed file`);

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const clubData of clubsData) {
    try {
      const existing = await prisma.club.findUnique({
        where: { id: clubData.id },
      });

      if (existing) {
        await prisma.club.update({
          where: { id: clubData.id },
          data: {
            ...clubData,
            updatedAt: new Date(),
          },
        });
        updated++;
      } else {
        await prisma.club.create({
          data: {
            ...clubData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        imported++;
      }
    } catch (error) {
      console.error(`   ❌ Error seeding ${clubData.name}:`, error);
      skipped++;
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Imported: ${imported} new clubs`);
  console.log(`   Updated: ${updated} existing clubs`);
  if (skipped > 0) {
    console.log(`   Skipped: ${skipped} clubs (errors)`);
  }
}

async function main() {
  console.log("🌱 Running database seeds...\n");

  await seedEuropeanClubs();

  console.log("\n✨ All seeds completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
