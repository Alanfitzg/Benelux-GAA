import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SPANISH_CLUBS = [
  "Estrela Vermehla",
  "Herdeiros de Dhais",
  "Irmamdinhos da Estrada",
  "Lume de Beltane",
];

async function fixPortugalToSpain() {
  console.log("🔧 Fixing clubs incorrectly labeled as Portugal...\n");

  for (const clubName of SPANISH_CLUBS) {
    const club = await prisma.club.findFirst({
      where: {
        name: { contains: clubName.split(" ")[0], mode: "insensitive" },
      },
    });

    if (club) {
      await prisma.club.update({
        where: { id: club.id },
        data: { location: "Spain" },
      });
      console.log(`  ✅ Fixed: ${club.name} → Spain (was ${club.location})`);
    }
  }

  console.log("\n✅ All corrections applied!");
  console.log("\nPortugal now has only: LX Celtiberos GAA Club");
}

fixPortugalToSpain()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
