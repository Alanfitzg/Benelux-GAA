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

async function strictCrestMatching() {
  console.log("🔄 Resetting all European club crests...\n");

  // Clear all imageUrl for European clubs first
  await prisma.club.updateMany({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
    },
    data: { imageUrl: null },
  });

  console.log("✅ Cleared all European club crests\n");
  console.log("📥 Starting strict crest matching...\n");

  const files = execSync(
    `find "${SOURCE_DIR}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \\)`,
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n");

  const clubs = await prisma.club.findMany({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
    },
  });

  let matched = 0;
  let skipped = 0;

  for (const sourceFile of files) {
    const fileName = path.basename(sourceFile).toLowerCase();
    const destFile = path.join(DEST_DIR, fileName);

    // Copy file
    if (!fs.existsSync(destFile)) {
      fs.copyFileSync(sourceFile, destFile);
    }

    // Extract clean name from filename
    const fileBaseName = fileName
      .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
      .replace(/[-_]/g, "")
      .replace(/\s+gaa.*$/i, "")
      .replace(/\s+gfc.*$/i, "")
      .replace(/\s+gac.*$/i, "")
      .replace(/\s+logo.*$/i, "")
      .replace(/\s+crest.*$/i, "")
      .replace(/\s+gaels.*$/i, "")
      .trim();

    const normalizedFile = normalizeString(fileBaseName);

    // Only match if we have at least 5 characters to match on
    if (normalizedFile.length < 5) {
      console.log(`⏭️  Skipped: ${fileName} (filename too generic)`);
      skipped++;
      continue;
    }

    let foundMatch = false;

    for (const club of clubs) {
      const normalizedClubName = normalizeString(club.name);
      const normalizedLocation = normalizeString(club.location || "");

      // Strict matching: filename must be a substantial part of club name or location
      const matchesName =
        normalizedClubName.includes(normalizedFile) ||
        normalizedFile.includes(normalizedClubName);
      const matchesLocation =
        normalizedLocation.includes(normalizedFile) ||
        normalizedFile.includes(normalizedLocation);

      // Require significant overlap (at least 70% of the shorter string)
      const minLength = Math.min(
        normalizedFile.length,
        normalizedClubName.length
      );
      const overlapThreshold = Math.floor(minLength * 0.7);

      let overlap = 0;
      for (let i = 0; i < normalizedFile.length - overlapThreshold; i++) {
        const substr = normalizedFile.substring(i, i + overlapThreshold);
        if (
          normalizedClubName.includes(substr) ||
          normalizedLocation.includes(substr)
        ) {
          overlap = overlapThreshold;
          break;
        }
      }

      if ((matchesName || matchesLocation) && overlap >= overlapThreshold) {
        // Only update if club doesn't already have an image
        if (!club.imageUrl) {
          await prisma.club.update({
            where: { id: club.id },
            data: { imageUrl: `/club-crests/${fileName}` },
          });

          console.log(`✅ ${fileName} → ${club.name}`);
          matched++;
          foundMatch = true;
          break;
        }
      }
    }

    if (!foundMatch) {
      console.log(`❌ ${fileName} (no strict match found)`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Matched: ${matched}`);
  console.log(`   Skipped: ${skipped}`);

  // Final status
  const allClubs = await prisma.club.findMany({
    where: { status: "APPROVED", isMainlandEurope: true },
  });
  const withImages = allClubs.filter((c) => c.imageUrl);
  const withoutImages = allClubs.filter((c) => !c.imageUrl);

  console.log(`\n✅ Final Status:`);
  console.log(`   Total European clubs: ${allClubs.length}`);
  console.log(
    `   With crests: ${withImages.length} (${Math.round((withImages.length / allClubs.length) * 100)}%)`
  );
  console.log(`   Without crests: ${withoutImages.length}`);

  if (withoutImages.length <= 30) {
    console.log(`\n⚠️  Clubs still missing crests:`);
    withoutImages.forEach((c) => console.log(`   - ${c.name} (${c.location})`));
  }
}

strictCrestMatching()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
