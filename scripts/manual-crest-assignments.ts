import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const SOURCE_DIR = "/Users/alan/Desktop/GGE new websie files";
const DEST_DIR = path.join(process.cwd(), "public", "club-crests");

const MANUAL_MATCHES = [
  { clubName: "LX Celtiberos", fileName: "lisbon.webp" },
  { clubName: "Bordigaela", fileName: "bordeaux.gif" },
  { clubName: "Tampere Hammer", fileName: "tampere hammers.jpeg" },
  { clubName: "Seamus Heaneys", fileName: "seamus heaney's moscow crest.png" },
  { clubName: "Rennes GAA", fileName: "logo_rennes_gaa.png" },
  { clubName: "Poitiers", fileName: "poiters.jpg" },
  { clubName: "Ludugnum", fileName: "lyon.webp" },
  { clubName: "Estrela Vermehla", fileName: "estrela vermelha.png" },
  { clubName: "Irmamdinhos", fileName: "irmandinhos.png" },
  { clubName: "Píobairí Strakonice", fileName: "piobairai strakonic.png" },
  { clubName: "Costa Gaels", fileName: "costa-gaels-logo-1200.png" },
  { clubName: "Gran Sol", fileName: "gran dol sol gaa.png" },
  { clubName: "Viking Gaels", fileName: "viking-gaels.jpg" },
  { clubName: "Lille", fileName: "lille crest.webp" },
  { clubName: "Nantes", fileName: "nantes gaa.png" },
  { clubName: "Pas-en-Artois", fileName: "logo lh fg.png" },
];

async function manualCrestAssignments() {
  console.log("🎯 Manual crest assignments...\n");

  let assigned = 0;
  let notFound = 0;

  for (const match of MANUAL_MATCHES) {
    const club = await prisma.club.findFirst({
      where: {
        name: { contains: match.clubName, mode: "insensitive" },
        status: "APPROVED",
        isMainlandEurope: true,
      },
    });

    if (club) {
      // Copy file
      const sourceFile = path.join(SOURCE_DIR, match.fileName);
      const destFileName = match.fileName.toLowerCase();
      const destFile = path.join(DEST_DIR, destFileName);

      if (fs.existsSync(sourceFile) && !fs.existsSync(destFile)) {
        fs.copyFileSync(sourceFile, destFile);
      }

      // Update club
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: `/club-crests/${destFileName}` },
      });

      console.log(`✅ ${match.fileName} → ${club.name}`);
      assigned++;
    } else {
      console.log(`❌ Club not found: ${match.clubName}`);
      notFound++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Assigned: ${assigned}`);
  console.log(`   Not found: ${notFound}`);

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

manualCrestAssignments().catch(console.error);
