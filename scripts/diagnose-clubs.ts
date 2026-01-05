import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function diagnoseClubs() {
  console.log("=== Club Database Diagnostics ===\n");

  // 1. Check Spain specifically
  console.log("1. Looking for Spain in Countries table...");
  const spainCountries = await prisma.country.findMany({
    where: {
      OR: [
        { name: { contains: "Spain", mode: "insensitive" } },
        { code: { contains: "ES", mode: "insensitive" } },
        { code: { contains: "SP", mode: "insensitive" } },
      ],
    },
  });
  console.log("Spain country records:", spainCountries);

  // 2. Check clubs that might be Spanish
  console.log("\n2. Looking for clubs with 'Spain' or Spanish locations...");
  const spanishClubs = await prisma.club.findMany({
    where: {
      OR: [
        { location: { contains: "Spain", mode: "insensitive" } },
        { location: { contains: "Barcelona", mode: "insensitive" } },
        { location: { contains: "Madrid", mode: "insensitive" } },
        { name: { contains: "Gran Sol", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      location: true,
      countryId: true,
      regionId: true,
      status: true,
    },
  });
  console.log("Spanish clubs found:", spanishClubs);

  // 3. Check Belgium
  console.log("\n3. Looking for Belgium in Countries table...");
  const belgiumCountries = await prisma.country.findMany({
    where: {
      OR: [
        { name: { contains: "Belgium", mode: "insensitive" } },
        { code: { contains: "BE", mode: "insensitive" } },
      ],
    },
  });
  console.log("Belgium country records:", belgiumCountries);

  // 4. Check Belgian clubs
  console.log("\n4. Looking for Belgian clubs...");
  const belgianClubs = await prisma.club.findMany({
    where: {
      OR: [
        { location: { contains: "Belgium", mode: "insensitive" } },
        { location: { contains: "Brussels", mode: "insensitive" } },
        { location: { contains: "Antwerp", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      location: true,
      countryId: true,
      regionId: true,
      status: true,
    },
  });
  console.log("Belgian clubs found:", belgianClubs);

  // 5. Check Europe international unit
  console.log("\n5. Looking for Europe international unit...");
  const europeUnit = await prisma.internationalUnit.findFirst({
    where: {
      OR: [
        { name: { contains: "Europe", mode: "insensitive" } },
        { code: { contains: "EUROPE", mode: "insensitive" } },
      ],
    },
  });
  console.log("Europe unit:", europeUnit);

  // 6. If Europe unit found, check its countries
  if (europeUnit) {
    console.log("\n6. Countries under Europe unit...");
    const europeCountries = await prisma.country.findMany({
      where: { internationalUnitId: europeUnit.id },
      orderBy: { name: "asc" },
    });
    console.log(
      "Europe countries:",
      europeCountries.map((c) => ({ id: c.id, name: c.name, code: c.code }))
    );

    // 7. For each European country, check how many clubs exist
    console.log("\n7. Club counts per European country...");
    for (const country of europeCountries) {
      const clubCount = await prisma.club.count({
        where: { countryId: country.id },
      });
      if (clubCount > 0) {
        console.log(`  ${country.name}: ${clubCount} clubs`);
      }
    }
  }

  // 8. Check clubs with null countryId
  console.log("\n8. Clubs with null countryId...");
  const nullCountryClubs = await prisma.club.count({
    where: { countryId: null },
  });
  console.log(`Clubs with null countryId: ${nullCountryClubs}`);

  // 9. Sample some clubs with null countryId
  if (nullCountryClubs > 0) {
    const sampleNullClubs = await prisma.club.findMany({
      where: { countryId: null },
      take: 10,
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
      },
    });
    console.log("Sample clubs with null countryId:", sampleNullClubs);
  }

  await prisma.$disconnect();
}

diagnoseClubs().catch((e) => {
  console.error("Error:", e);
  prisma.$disconnect();
  process.exit(1);
});
