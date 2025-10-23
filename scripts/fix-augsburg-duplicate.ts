import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAugsburg() {
  const clubs = await prisma.club.findMany({
    where: {
      name: { contains: "augsburg", mode: "insensitive" },
      status: "APPROVED",
    },
  });

  console.log(`🔍 Found ${clubs.length} Augsburg clubs:\n`);

  for (const club of clubs) {
    console.log(`   ID: ${club.id}`);
    console.log(`   Name: ${club.name}`);
    console.log(`   Location: ${club.location}`);
    console.log(`   Crest: ${club.imageUrl || "(none)"}`);
    console.log("");
  }

  const nonIrishClub = clubs.find((c) => !c.name.includes("Rómhánaigh"));

  if (nonIrishClub) {
    await prisma.club.delete({
      where: { id: nonIrishClub.id },
    });
    console.log(`❌ Deleted: ${nonIrishClub.name}`);
    console.log(`✅ Kept: Rómhánaigh Augsburg Óg (Irish version)`);
  } else {
    console.log("⚠️  Could not identify non-Irish version");
  }

  await prisma.$disconnect();
}

fixAugsburg().catch(console.error);
