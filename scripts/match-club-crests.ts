import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface CrestMatch {
  clubId: string;
  clubName: string;
  crestFile: string;
  confidence: number;
  currentImageUrl: string | null;
}

// Normalize strings for matching
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

// Calculate similarity between two strings (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  // Exact match
  if (s1 === s2) return 100;

  // Check if crest filename contains club name
  if (s2.includes(s1) || s1.includes(s2)) return 90;

  // Levenshtein distance
  const matrix: number[][] = [];
  const len1 = s1.length;
  const len2 = s2.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.round(similarity);
}

// Get all crest files
function getCrestFiles(): string[] {
  const crestsDir = path.join(process.cwd(), "public", "club-crests");
  const files: string[] = [];

  function readDir(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readDir(fullPath);
      } else if (item.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        // Get relative path from public/club-crests/
        const relativePath = fullPath.replace(crestsDir + "/", "");
        files.push(relativePath);
      }
    }
  }

  readDir(crestsDir);
  return files;
}

// Match clubs with crests
async function matchCrestsToClubs(
  dryRun: boolean = true,
  confidenceThreshold: number = 75
): Promise<void> {
  console.log("\n🔍 Starting Club Crest Matching Process...\n");
  console.log(
    `Mode: ${dryRun ? "🔍 DRY RUN (Preview Only)" : "✍️  LIVE UPDATE"}`
  );
  console.log(`Confidence Threshold: ${confidenceThreshold}%\n`);

  // Get all clubs
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  console.log(`📊 Found ${clubs.length} clubs in database`);

  // Get all crest files
  const crestFiles = getCrestFiles();
  console.log(`🖼️  Found ${crestFiles.length} crest files\n`);

  // Match clubs to crests
  const matches: CrestMatch[] = [];
  const unmatchedClubs: string[] = [];

  for (const club of clubs) {
    let bestMatch: { file: string; confidence: number } | null = null;

    for (const crestFile of crestFiles) {
      const crestNameWithoutExt = crestFile.replace(/\.[^.]+$/, "");
      const confidence = calculateSimilarity(club.name, crestNameWithoutExt);

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { file: crestFile, confidence };
      }
    }

    if (bestMatch && bestMatch.confidence >= confidenceThreshold) {
      matches.push({
        clubId: club.id,
        clubName: club.name,
        crestFile: bestMatch.file,
        confidence: bestMatch.confidence,
        currentImageUrl: club.imageUrl,
      });
    } else {
      unmatchedClubs.push(club.name);
    }
  }

  // Sort matches by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);

  // Display results
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log(`✅ HIGH CONFIDENCE MATCHES (${matches.length} clubs):\n`);

  matches.forEach((match, index) => {
    const status = match.currentImageUrl ? "🔄 UPDATE" : "🆕 NEW";
    console.log(
      `${index + 1}. ${status} [${match.confidence}%] ${match.clubName}`
    );
    console.log(`   → /club-crests/${match.crestFile}`);
    if (match.currentImageUrl) {
      console.log(`   📎 Current: ${match.currentImageUrl}`);
    }
    console.log("");
  });

  if (unmatchedClubs.length > 0) {
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );
    console.log(`⚠️  UNMATCHED CLUBS (${unmatchedClubs.length}):\n`);
    unmatchedClubs.slice(0, 20).forEach((name) => {
      console.log(`   • ${name}`);
    });
    if (unmatchedClubs.length > 20) {
      console.log(`   ... and ${unmatchedClubs.length - 20} more`);
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════════\n");

  // Update database if not dry run
  if (!dryRun) {
    console.log("💾 Updating database...\n");

    let updated = 0;
    for (const match of matches) {
      const imageUrl = `/club-crests/${match.crestFile}`;
      await prisma.club.update({
        where: { id: match.clubId },
        data: { imageUrl },
      });
      updated++;
      console.log(`✓ Updated: ${match.clubName}`);
    }

    console.log(`\n✅ Successfully updated ${updated} clubs with crests!`);

    // Save log file
    const logFile = path.join(
      process.cwd(),
      "scripts",
      `crest-update-log-${Date.now()}.json`
    );
    fs.writeFileSync(
      logFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalMatches: matches.length,
          unmatchedClubs: unmatchedClubs.length,
          matches,
        },
        null,
        2
      )
    );
    console.log(`📝 Log saved to: ${logFile}`);
  } else {
    console.log("ℹ️  DRY RUN MODE - No changes made to database");
    console.log("\n💡 To apply these changes, run with --live flag:");
    console.log("   npx tsx scripts/match-club-crests.ts --live\n");
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isLiveRun = args.includes("--live");
  const confidenceArg = args.find((arg) => arg.startsWith("--confidence="));
  const confidence = confidenceArg ? parseInt(confidenceArg.split("=")[1]) : 75;

  try {
    await matchCrestsToClubs(!isLiveRun, confidence);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
