import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";
const DEST_DIR = path.join(process.cwd(), "public", "club-crests");

const CLUBS_TO_ADD = [
  {
    name: "Gwenn Rann GAA",
    location: "Brittany, France",
    fileName: "gwenn rann.webp",
  },
  {
    name: "Nantes GAA",
    location: "Nantes, France",
    fileName: "nantes gaa.png",
  },
  {
    name: "Kerne GAA",
    location: "France",
    fileName: "kerne.webp",
  },
  {
    name: "Rosteren GAA",
    location: "France",
    fileName: "rosteren.png",
  },
  {
    name: "Guernsey Gaels",
    location: "Guernsey",
    fileName: "guernsey.webp",
  },
];

async function addFinalClubs() {
  console.log("➕ Adding final batch of clubs...\n");

  for (const clubData of CLUBS_TO_ADD) {
    await prisma.club.create({
      data: {
        name: clubData.name,
        location: clubData.location,
        status: "APPROVED",
        teamTypes: [],
        isMainlandEurope: true,
        verificationStatus: "UNVERIFIED",
        imageUrl: `/club-crests/${clubData.fileName}`,
      },
    });

    const sourceFile = path.join(SOURCE_DIR, clubData.fileName);
    const destFile = path.join(DEST_DIR, clubData.fileName);

    if (fs.existsSync(sourceFile) && !fs.existsSync(destFile)) {
      fs.copyFileSync(sourceFile, destFile);
    }

    console.log(`✅ Added: ${clubData.name} (${clubData.location})`);
  }

  console.log(`\n✅ Added ${CLUBS_TO_ADD.length} clubs`);

  await prisma.$disconnect();
}

addFinalClubs().catch(console.error);
