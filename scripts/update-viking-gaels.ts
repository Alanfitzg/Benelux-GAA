import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function updateVikingGaels() {
  const club = await prisma.club.findFirst({
    where: {
      name: { contains: "Viking Gaels", mode: "insensitive" },
    },
  });

  if (!club) {
    console.log("❌ Viking Gaels not found");
    await prisma.$disconnect();
    return;
  }

  console.log(`📋 Current status:`);
  console.log(`   Name: ${club.name}`);
  console.log(`   Location: ${club.location}`);
  console.log(`   Crest: ${club.imageUrl || "(none)"}`);

  if (!club.imageUrl) {
    const sourceFile =
      "/Users/alan/Desktop/GGE new websie files/viking-gaels.jpg";
    const destFile = path.join(
      process.cwd(),
      "public",
      "club-crests",
      "viking-gaels.jpg"
    );

    if (fs.existsSync(sourceFile) && !fs.existsSync(destFile)) {
      fs.copyFileSync(sourceFile, destFile);
      console.log(`\n📁 Copied crest file`);
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { imageUrl: "/club-crests/viking-gaels.jpg" },
    });

    console.log(`✅ Updated Viking Gaels with crest`);
  } else {
    console.log(`\n✅ Viking Gaels already has a crest assigned`);
  }

  await prisma.$disconnect();
}

updateVikingGaels().catch(console.error);
