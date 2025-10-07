import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixGermanClubCrests() {
  console.log("🔧 Fixing German club crests...\n");

  const germanMappings: { clubName: string; crestFile: string }[] = [
    { clubName: "Darmstadt GAA", crestFile: "darmstadt-gaa.png" },
    { clubName: "Dusseldorf GFC", crestFile: "dusseldorf-gaa.png" },
    { clubName: "Dresden Hurling", crestFile: "dresden-hurling.png" },
  ];

  for (const mapping of germanMappings) {
    const club = await prisma.club.findFirst({
      where: { name: { contains: mapping.clubName, mode: "insensitive" } },
    });

    if (club) {
      const newImageUrl = `/club-crests/${mapping.crestFile}`;
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: newImageUrl },
      });
      console.log(`✅ Updated: ${club.name}`);
      console.log(`   New crest: ${newImageUrl}\n`);
    } else {
      console.log(`⚠️  Not found: ${mapping.clubName}\n`);
    }
  }

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ German club crests updated!");
  console.log("   - Darmstadt GAA: Fixed wrong crest");
  console.log("   - Dresden Hurling: Added crest");
  console.log("   - Dusseldorf GFC: Added crest");
  console.log("═══════════════════════════════════════════════════════════\n");
}

async function main() {
  try {
    await fixGermanClubCrests();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
