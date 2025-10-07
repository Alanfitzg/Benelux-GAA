import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function backupClubCrests(): Promise<string> {
  console.log("🔄 Creating backup of club crest URLs...\n");

  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
    where: {
      imageUrl: {
        not: null,
      },
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(
    backupDir,
    `club-crests-backup-${timestamp}.json`
  );

  const backupData = {
    timestamp: new Date().toISOString(),
    totalClubs: clubs.length,
    clubs: clubs.map((club) => ({
      id: club.id,
      name: club.name,
      imageUrl: club.imageUrl,
    })),
  };

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

  console.log(`✅ Backup created successfully!`);
  console.log(`📁 Location: ${backupFile}`);
  console.log(`📊 Backed up ${clubs.length} clubs with crests\n`);

  return backupFile;
}

async function restoreClubCrests(backupFile: string): Promise<void> {
  console.log(`🔄 Restoring club crests from backup...\n`);
  console.log(`📁 Backup file: ${backupFile}\n`);

  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file not found: ${backupFile}`);
  }

  const backupData = JSON.parse(fs.readFileSync(backupFile, "utf-8"));

  console.log(`📅 Backup created: ${backupData.timestamp}`);
  console.log(`📊 Restoring ${backupData.totalClubs} clubs...\n`);

  let restored = 0;
  for (const club of backupData.clubs) {
    await prisma.club.update({
      where: { id: club.id },
      data: { imageUrl: club.imageUrl },
    });
    restored++;
    console.log(`✓ Restored: ${club.name}`);
  }

  console.log(`\n✅ Successfully restored ${restored} clubs!`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === "restore") {
      const backupFile = args[1];
      if (!backupFile) {
        console.error("❌ Error: Please provide backup file path");
        console.log(
          "\nUsage: npx tsx scripts/backup-club-crests.ts restore <backup-file>"
        );
        process.exit(1);
      }
      await restoreClubCrests(backupFile);
    } else {
      await backupClubCrests();
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
