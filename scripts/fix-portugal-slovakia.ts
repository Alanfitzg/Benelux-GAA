import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPortugalAndSlovakia() {
  console.log("🔧 Fixing Portugal and Slovakia clubs...\n");

  // 1. Remove Portugal GAA
  const portugalGAA = await prisma.club.findFirst({
    where: {
      name: { contains: "Portugal GAA", mode: "insensitive" },
    },
  });

  if (portugalGAA) {
    await prisma.club.delete({
      where: { id: portugalGAA.id },
    });
    console.log(`❌ Deleted: ${portugalGAA.name} (not a real club)`);
  } else {
    console.log("⏭️  Portugal GAA not found");
  }

  // 2. Check Portugal clubs
  console.log("\n📍 Portugal clubs:");
  const portugalClubs = await prisma.club.findMany({
    where: {
      location: { contains: "Portugal", mode: "insensitive" },
      status: "APPROVED",
    },
  });

  for (const club of portugalClubs) {
    console.log(`   ✅ ${club.name} (${club.location})`);
  }

  // 3. Fix Slovak Shamrocks location
  const slovakShamrocks = await prisma.club.findFirst({
    where: {
      name: { contains: "Slovak Shamrocks", mode: "insensitive" },
    },
  });

  if (slovakShamrocks) {
    console.log(`\n🔧 Slovak Shamrocks:`);
    console.log(`   Before: ${slovakShamrocks.location}`);

    await prisma.club.update({
      where: { id: slovakShamrocks.id },
      data: { location: "Bratislava, Slovakia" },
    });

    console.log(`   After: Bratislava, Slovakia`);
  } else {
    console.log("\n⏭️  Slovak Shamrocks not found");
  }

  console.log("\n✅ All fixes applied!");

  await prisma.$disconnect();
}

fixPortugalAndSlovakia().catch(console.error);
