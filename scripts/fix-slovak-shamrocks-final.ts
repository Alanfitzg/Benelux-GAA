import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixSlovakShamrocks() {
  const club = await prisma.club.findFirst({
    where: {
      name: "Slovak Shamrocks GAA",
    },
  });

  if (club) {
    console.log("Before:", club.location);

    await prisma.club.update({
      where: { id: club.id },
      data: { location: "Bratislava, Slovakia" },
    });

    console.log("After: Bratislava, Slovakia");
    console.log("✅ Fixed Slovak Shamrocks location");
  } else {
    console.log("❌ Club not found");
  }

  await prisma.$disconnect();
}

fixSlovakShamrocks().catch(console.error);
