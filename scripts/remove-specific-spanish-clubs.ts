import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeSpecificSpanishClubs() {
  console.log("🗑️  Removing specific Spanish clubs...\n");

  let removed = 0;

  // 1. A Coruña Fillos de Breogán
  let club = await prisma.club.findFirst({
    where: {
      name: { contains: "Coruña", mode: "insensitive" },
      name: { contains: "Fillos", mode: "insensitive" },
      location: { contains: "Spain", mode: "insensitive" },
    },
  });

  if (club) {
    console.log(`📋 Found: ${club.name} (${club.location})`);
    await prisma.club.delete({ where: { id: club.id } });
    console.log(`❌ Deleted\n`);
    removed++;
  }

  // 2. Éire Óg Sevilla
  club = await prisma.club.findFirst({
    where: {
      name: { contains: "Sevilla", mode: "insensitive" },
      location: { contains: "Spain", mode: "insensitive" },
    },
  });

  if (club) {
    console.log(`📋 Found: ${club.name} (${club.location})`);
    await prisma.club.delete({ where: { id: club.id } });
    console.log(`❌ Deleted\n`);
    removed++;
  }

  // 3. Valencia GAA
  club = await prisma.club.findFirst({
    where: {
      name: { equals: "Valencia GAA", mode: "insensitive" },
    },
  });

  if (club) {
    console.log(`📋 Found: ${club.name} (${club.location})`);
    await prisma.club.delete({ where: { id: club.id } });
    console.log(`❌ Deleted\n`);
    removed++;
  }

  // 4. Gaélicos do Gran Sol (or Gran Sol)
  club = await prisma.club.findFirst({
    where: {
      OR: [
        { name: { contains: "Gran Sol", mode: "insensitive" } },
        { name: { contains: "Gaélicos", mode: "insensitive" } },
      ],
      location: { contains: "Spain", mode: "insensitive" },
    },
  });

  if (club) {
    console.log(`📋 Found: ${club.name} (${club.location})`);
    await prisma.club.delete({ where: { id: club.id } });
    console.log(`❌ Deleted\n`);
    removed++;
  }

  console.log(`\n✅ Removed ${removed} Spanish clubs`);

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

removeSpecificSpanishClubs().catch(console.error);
