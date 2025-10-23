import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();

const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";
const DEST_DIR = path.join(process.cwd(), "public", "club-crests");

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function extractClubNameFromFile(filename: string): string {
  return filename
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+gaa.*$/i, "")
    .replace(/\s+gfc.*$/i, "")
    .replace(/\s+gac.*$/i, "")
    .replace(/\s+logo.*$/i, "")
    .replace(/\s+crest.*$/i, "")
    .replace(/\s+gaels.*$/i, "")
    .trim();
}

async function addNewClubsWithCrests() {
  console.log("🔍 Scanning folder for new clubs and crests...\n");

  const files = execSync(
    `find "${SOURCE_DIR}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \\)`,
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n");

  console.log(`📁 Found ${files.length} crest files\n`);

  const existingClubs = await prisma.club.findMany({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
    },
  });

  const newClubsAdded = 0;
  let crestsAssigned = 0;
  let skipped = 0;

  for (const sourceFile of files) {
    const fileName = path.basename(sourceFile).toLowerCase();
    const clubNameFromFile = extractClubNameFromFile(fileName);
    const normalizedFileName = normalizeString(clubNameFromFile);

    if (normalizedFileName.length < 3) {
      console.log(`⏭️  Skipped: ${fileName} (filename too generic)`);
      skipped++;
      continue;
    }

    // Copy file to destination
    const destFile = path.join(DEST_DIR, fileName);
    if (!fs.existsSync(destFile)) {
      fs.copyFileSync(sourceFile, destFile);
    }

    // Check if club exists
    let matchedClub = null;
    let bestScore = 0;

    for (const club of existingClubs) {
      const normalizedClubName = normalizeString(club.name);
      const normalizedLocation = normalizeString(club.location || "");

      // Calculate match score
      let score = 0;
      if (normalizedClubName.includes(normalizedFileName)) score += 3;
      if (normalizedFileName.includes(normalizedClubName)) score += 3;
      if (normalizedLocation.includes(normalizedFileName)) score += 2;
      if (normalizedFileName.includes(normalizedLocation)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        matchedClub = club;
      }
    }

    if (matchedClub && bestScore >= 2) {
      // Existing club - assign crest if it doesn't have one
      if (!matchedClub.imageUrl) {
        await prisma.club.update({
          where: { id: matchedClub.id },
          data: { imageUrl: `/club-crests/${fileName}` },
        });
        console.log(`✅ Crest assigned: ${fileName} → ${matchedClub.name}`);
        crestsAssigned++;
      } else {
        console.log(`⏭️  Already has crest: ${matchedClub.name}`);
        skipped++;
      }
    } else {
      // Potentially new club - try to determine location from filename
      console.log(`❓ Unmatched: ${fileName} → "${clubNameFromFile}"`);
      console.log(
        `   This might be a new club. Please specify location manually.\n`
      );
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   New clubs added: ${newClubsAdded}`);
  console.log(`   Crests assigned: ${crestsAssigned}`);
  console.log(`   Skipped: ${skipped}`);

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

  await prisma.$disconnect();
}

addNewClubsWithCrests().catch(console.error);
