import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeClubs() {
  const clubsToRemove = ["Augsburg GAA", "Frankfurt Sarsfields"];

  for (const clubName of clubsToRemove) {
    const club = await prisma.club.findFirst({
      where: {
        name: { contains: clubName.split(" ")[0], mode: "insensitive" },
      },
    });

    if (club && club.name.includes(clubName.split(" ")[1])) {
      await prisma.club.delete({
        where: { id: club.id },
      });
      console.log(`❌ Deleted: ${club.name}`);
    } else if (club) {
      console.log(`⏭️  Skipped: ${club.name} (didn't match "${clubName}")`);
    } else {
      console.log(`⚠️  Not found: ${clubName}`);
    }
  }

  console.log("\n✅ Done!");

  await prisma.$disconnect();
}

removeClubs().catch(console.error);
