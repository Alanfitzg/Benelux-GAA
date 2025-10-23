import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";
const DEST_DIR = path.join(process.cwd(), "public", "club-crests");

const CLUBS_TO_ADD = [
  {
    name: "Gibraltar GAA",
    location: "Gibraltar",
    fileName: "gibraltar.webp",
  },
  {
    name: "Dorna GAA",
    location: "Spain",
    fileName: "dorna.png",
  },
  {
    name: "Lugh GAA",
    location: "Spain",
    fileName: "lugh gaa.png",
  },
  {
    name: "A Coruña Fillos de Breogán",
    location: "A Coruña, Spain",
    fileName: "a coruña fillos de breogán.png",
  },
];

async function addBatchClubs() {
  console.log("➕ Adding batch of clubs...\n");

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

addBatchClubs().catch(console.error);
