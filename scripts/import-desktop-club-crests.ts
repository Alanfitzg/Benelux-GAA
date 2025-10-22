import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();

const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";
const DEST_DIR = path.join(process.cwd(), "public", "club-crests");

async function importDesktopCrests() {
  console.log("📥 Importing Club Crests from Desktop...\n");

  // Find all image files
  const files = execSync(
    `find "${SOURCE_DIR}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \\)`,
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n");

  console.log(`Found ${files.length} crest files\n`);

  let copied = 0;
  let matched = 0;
  let skipped = 0;

  for (const sourceFile of files) {
    const fileName = path.basename(sourceFile).toLowerCase();
    const destFile = path.join(DEST_DIR, fileName);

    // Copy file
    try {
      fs.copyFileSync(sourceFile, destFile);
      copied++;
      console.log(`📋 Copied: ${fileName}`);
    } catch {
      console.log(`⚠️  Failed to copy: ${fileName}`);
      skipped++;
      continue;
    }

    // Try to match to club
    const clubName = fileName
      .replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\s+gaa.*$/i, "")
      .replace(/\s+logo.*$/i, "")
      .replace(/\s+crest.*$/i, "")
      .trim();

    const clubs = await prisma.club.findMany({
      where: {
        OR: [
          { name: { contains: clubName, mode: "insensitive" } },
          { location: { contains: clubName, mode: "insensitive" } },
        ],
        status: "APPROVED",
      },
    });

    if (clubs.length > 0) {
      for (const club of clubs) {
        await prisma.club.update({
          where: { id: club.id },
          data: { imageUrl: `/club-crests/${fileName}` },
        });
        console.log(`   ✓ Matched to: ${club.name}`);
        matched++;
      }
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   Files copied: ${copied}`);
  console.log(`   Clubs matched: ${matched}`);
  console.log(`   Skipped: ${skipped}`);

  // Final status
  const europeanCountries = [
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

  const allClubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
  });
  const european = allClubs.filter((c) => {
    const country = c.location?.split(",").pop()?.trim() || "";
    return europeanCountries.includes(country);
  });

  const withImages = european.filter((c) => c.imageUrl);

  console.log(`\n✅ Final Status:`);
  console.log(`   European clubs: ${european.length}`);
  console.log(
    `   With crests: ${withImages.length} (${Math.round((withImages.length / european.length) * 100)}%)`
  );
}

importDesktopCrests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
