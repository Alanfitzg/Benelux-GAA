import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLUBS_TO_REMOVE = [
  "A Coruña Fillos de Breogán",
  "Éire Óg Sevilla",
  "Valencia GAA",
  "Gaélicos do Gran Sol",
  "Gran Sol",
];

async function removeSpanishClubs() {
  console.log("🗑️  Removing Spanish clubs...\n");

  let removed = 0;

  for (const clubName of CLUBS_TO_REMOVE) {
    const clubs = await prisma.club.findMany({
      where: {
        OR: [
          { name: { contains: clubName, mode: "insensitive" } },
          { name: { contains: clubName.split(" ")[0], mode: "insensitive" } },
        ],
      },
    });

    for (const club of clubs) {
      console.log(`📋 Found: ${club.name} (${club.location})`);
      console.log(`   Crest: ${club.imageUrl || "(none)"}`);

      await prisma.club.delete({
        where: { id: club.id },
      });

      console.log(`❌ Deleted: ${club.name}\n`);
      removed++;
    }
  }

  if (removed === 0) {
    console.log("⚠️  No clubs found to remove");
  } else {
    console.log(`\n✅ Removed ${removed} Spanish clubs`);
  }

  const remaining = await prisma.club.count({
    where: { status: "APPROVED", isMainlandEurope: true },
  });
  const withCrests = await prisma.club.count({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
      imageUrl: { not: null },
    },
  });

  console.log(`\n📊 Updated Status:`);
  console.log(`   Total European clubs: ${remaining}`);
  console.log(
    `   With crests: ${withCrests} (${Math.round((withCrests / remaining) * 100)}%)`
  );

  await prisma.$disconnect();
}

removeSpanishClubs().catch(console.error);
