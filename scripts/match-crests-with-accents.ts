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
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractClubName(filename: string): string {
  return filename
    .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+gaa.*$/i, "")
    .replace(/\s+gfc.*$/i, "")
    .replace(/\s+gac.*$/i, "")
    .replace(/\s+logo.*$/i, "")
    .replace(/\s+crest.*$/i, "")
    .trim();
}

async function matchCrestsWithAccents() {
  console.log("🔍 Matching crests with accent-aware search...\n");

  const files = execSync(
    `find "${SOURCE_DIR}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \\)`,
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n");

  console.log(`Found ${files.length} crest files\n`);

  // Get all European clubs
  const clubs = await prisma.club.findMany({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
    },
  });

  console.log(`Found ${clubs.length} European clubs in database\n`);

  let matched = 0;
  let unmatched = 0;
  const unmatchedFiles: string[] = [];

  for (const sourceFile of files) {
    const fileName = path.basename(sourceFile).toLowerCase();
    const clubNameFromFile = extractClubName(fileName);
    const normalizedFileName = normalizeString(clubNameFromFile);

    let bestMatch = null;
    let bestScore = 0;

    for (const club of clubs) {
      const normalizedClubName = normalizeString(club.name);
      const normalizedLocation = normalizeString(club.location || "");

      // Check if any word from the filename appears in the club name or location
      const fileWords = normalizedFileName.split(" ");
      const clubWords = normalizedClubName.split(" ");

      let matchCount = 0;
      for (const fileWord of fileWords) {
        if (fileWord.length < 3) continue; // Skip short words
        if (
          clubWords.some((w) => w.includes(fileWord) || fileWord.includes(w))
        ) {
          matchCount++;
        }
        if (normalizedLocation.includes(fileWord)) {
          matchCount++;
        }
      }

      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestMatch = club;
      }
    }

    if (bestMatch && bestScore >= 1) {
      // Copy file if not already there
      const destFile = path.join(DEST_DIR, fileName);
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(sourceFile, destFile);
      }

      // Update club with crest
      await prisma.club.update({
        where: { id: bestMatch.id },
        data: { imageUrl: `/club-crests/${fileName}` },
      });

      console.log(
        `✅ Matched: ${path.basename(sourceFile)} → ${bestMatch.name}`
      );
      matched++;
    } else {
      console.log(`❌ No match: ${path.basename(sourceFile)}`);
      unmatchedFiles.push(path.basename(sourceFile));
      unmatched++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Matched: ${matched}`);
  console.log(`   Unmatched: ${unmatched}`);

  if (unmatchedFiles.length > 0 && unmatchedFiles.length < 20) {
    console.log(`\n⚠️  Unmatched files:`);
    unmatchedFiles.forEach((f) => console.log(`   - ${f}`));
  }

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

matchCrestsWithAccents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
