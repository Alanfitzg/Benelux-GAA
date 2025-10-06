import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyClubImport() {
  console.log("Verifying club import...\n");

  const totalClubs = await prisma.club.count();
  console.log(`📊 Total clubs in database: ${totalClubs}`);

  const clubsWithCrests = await prisma.club.count({
    where: {
      imageUrl: {
        not: null,
      },
    },
  });
  console.log(`🖼️  Clubs with crests: ${clubsWithCrests}`);

  const clubsWithoutCrests = await prisma.club.count({
    where: {
      imageUrl: null,
    },
  });
  console.log(`❌ Clubs without crests: ${clubsWithoutCrests}`);

  console.log("\n=== European Clubs Sample ===");
  const europeanClubs = await prisma.club.findMany({
    where: {
      OR: [
        { location: { contains: "Switzerland" } },
        { location: { contains: "Germany" } },
        { location: { contains: "France" } },
        { location: { contains: "Spain" } },
        { location: { contains: "Italy" } },
        { location: { contains: "Netherlands" } },
        { location: { contains: "Belgium" } },
        { location: { contains: "Austria" } },
        { location: { contains: "Portugal" } },
        { location: { contains: "Sweden" } },
      ],
    },
    select: {
      name: true,
      location: true,
      imageUrl: true,
    },
    take: 20,
  });

  europeanClubs.forEach((club) => {
    const hasCrest = club.imageUrl ? "✅" : "❌";
    console.log(`${hasCrest} ${club.name} (${club.location})`);
  });

  const europeanTotal = await prisma.club.count({
    where: {
      OR: [
        { location: { contains: "Switzerland" } },
        { location: { contains: "Germany" } },
        { location: { contains: "France" } },
        { location: { contains: "Spain" } },
        { location: { contains: "Italy" } },
        { location: { contains: "Netherlands" } },
        { location: { contains: "Belgium" } },
        { location: { contains: "Austria" } },
        { location: { contains: "Portugal" } },
        { location: { contains: "Sweden" } },
        { location: { contains: "Norway" } },
        { location: { contains: "Denmark" } },
        { location: { contains: "Finland" } },
        { location: { contains: "Poland" } },
        { location: { contains: "Czech Republic" } },
        { location: { contains: "Slovakia" } },
        { location: { contains: "Hungary" } },
        { location: { contains: "Estonia" } },
        { location: { contains: "Iceland" } },
        { location: { contains: "Luxembourg" } },
      ],
    },
  });

  console.log(`\n🌍 Total European clubs: ${europeanTotal}`);

  await prisma.$disconnect();
}

verifyClubImport().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
