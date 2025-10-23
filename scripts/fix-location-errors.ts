import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixLocationErrors() {
  console.log("🔧 Fixing location errors...\n");

  // 1. Fix Slovak Shamrocks: Slovenia → Slovakia
  const slovakShamrocks = await prisma.club.findFirst({
    where: {
      name: { contains: "Slovak Shamrocks", mode: "insensitive" },
    },
  });

  if (slovakShamrocks && slovakShamrocks.location?.includes("Slovenia")) {
    await prisma.club.update({
      where: { id: slovakShamrocks.id },
      data: { location: "Bratislava, Slovakia" },
    });
    console.log(`✅ Fixed: Slovak Shamrocks`);
    console.log(`   Before: ${slovakShamrocks.location}`);
    console.log(`   After: Bratislava, Slovakia\n`);
  }

  // 2. Fix Amsterdam GAC: Silicon Valley → Amsterdam
  const amsterdamGAC = await prisma.club.findFirst({
    where: {
      name: { contains: "Amsterdam GAC", mode: "insensitive" },
      location: { contains: "Silicon Valley", mode: "insensitive" },
    },
  });

  if (amsterdamGAC) {
    await prisma.club.update({
      where: { id: amsterdamGAC.id },
      data: { location: "Amsterdam, Netherlands" },
    });
    console.log(`✅ Fixed: Amsterdam GAC`);
    console.log(`   Before: ${amsterdamGAC.location}`);
    console.log(`   After: Amsterdam, Netherlands\n`);
  }

  // 3. Fix duplicate locations (e.g., "Marbella, Spain, Marbella, Spain")
  const allClubs = await prisma.club.findMany({
    where: {
      status: "APPROVED",
      isMainlandEurope: true,
    },
  });

  console.log("🔍 Checking for duplicate locations...\n");

  for (const club of allClubs) {
    if (!club.location) continue;

    // Check if location has duplicates (e.g., "City, Country, City, Country")
    const parts = club.location.split(", ");
    if (parts.length > 2) {
      // Check if it's a duplicate pattern
      const half = Math.floor(parts.length / 2);
      const firstHalf = parts.slice(0, half).join(", ");
      const secondHalf = parts.slice(half).join(", ");

      if (firstHalf === secondHalf) {
        await prisma.club.update({
          where: { id: club.id },
          data: { location: firstHalf },
        });
        console.log(`✅ Fixed duplicate: ${club.name}`);
        console.log(`   Before: ${club.location}`);
        console.log(`   After: ${firstHalf}\n`);
      }
    }
  }

  console.log("✅ All location fixes applied!");

  await prisma.$disconnect();
}

fixLocationErrors().catch(console.error);
