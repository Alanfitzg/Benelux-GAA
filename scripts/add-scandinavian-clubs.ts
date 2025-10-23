import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";
const DEST_DIR = path.join(process.cwd(), "public", "club-crests");

const CLUBS_TO_ADD = [
  {
    name: "Oslo GAA",
    location: "Oslo, Norway",
    fileName: "oslo.webp",
  },
  {
    name: "Oulu Irish Elks",
    location: "Oulu, Finland",
    fileName: "oulu irish ellks .jpeg",
  },
];

async function addScandinavianClubs() {
  console.log("➕ Adding Scandinavian clubs...\n");

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

addScandinavianClubs().catch(console.error);
