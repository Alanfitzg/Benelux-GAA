import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addMissing() {
  console.log("=== Adding Missing Asia Clubs ===\n");

  const asia = await prisma.internationalUnit.findFirst({
    where: { name: "Asia" },
  });
  if (!asia) {
    console.log("Asia unit not found");
    return;
  }

  // Get countries
  const china = await prisma.country.findFirst({
    where: { name: "China", internationalUnitId: asia.id },
  });
  const india = await prisma.country.findFirst({
    where: { name: "India", internationalUnitId: asia.id },
  });
  const philippines = await prisma.country.findFirst({
    where: { name: "Philippines", internationalUnitId: asia.id },
  });

  if (!china || !india || !philippines) {
    console.log("Missing countries:", {
      china: !!china,
      india: !!india,
      philippines: !!philippines,
    });
    return;
  }

  // Missing clubs to add
  const missingClubs = [
    {
      name: "Dalian Wolfhounds",
      countryId: china.id,
      location: "Dalian, China",
    },
    { name: "Shunde Gaels", countryId: china.id, location: "Shunde, China" },
    {
      name: "India Wolfhounds",
      countryId: india.id,
      location: "Mumbai, India",
    },
    {
      name: "Manilla GAA",
      countryId: philippines.id,
      location: "Manila, Philippines",
    },
  ];

  // Note: South Africa Gaels is in Africa, not Asia - skip it

  for (const club of missingClubs) {
    const existing = await prisma.club.findFirst({
      where: { name: club.name, internationalUnitId: asia.id },
    });

    if (!existing) {
      await prisma.club.create({
        data: {
          name: club.name,
          location: club.location,
          internationalUnitId: asia.id,
          countryId: club.countryId,
          clubType: "CLUB",
        },
      });
      console.log(`✓ Added: ${club.name} (${club.location})`);
    } else {
      console.log(`? Already exists: ${club.name}`);
    }
  }

  console.log(
    '\nNote: "South Africa Gaels" is in Africa, not Asia - not added here.'
  );

  // Final count
  const total = await prisma.club.count({
    where: { internationalUnitId: asia.id },
  });
  console.log(`\nTotal Asia clubs: ${total}`);

  // List all
  console.log("\n=== Final Asia Club List ===\n");
  const clubs = await prisma.club.findMany({
    where: { internationalUnitId: asia.id },
    include: { country: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  for (const c of clubs) {
    console.log(`${c.name} - ${c.country?.name || "No country"}`);
  }
}

addMissing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
