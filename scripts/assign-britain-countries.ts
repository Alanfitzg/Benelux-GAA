import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignCountries() {
  console.log("=== Assigning Countries to Britain Clubs ===\n");

  // Get or create countries
  let england = await prisma.country.findFirst({ where: { name: "England" } });
  let scotland = await prisma.country.findFirst({
    where: { name: "Scotland" },
  });
  let wales = await prisma.country.findFirst({ where: { name: "Wales" } });
  const isleOfMan = await prisma.country.findFirst({
    where: { name: "Isle of Man" },
  });

  const britain = await prisma.internationalUnit.findFirst({
    where: { name: "Britain" },
  });

  if (!britain) {
    console.error("Britain unit not found");
    return;
  }

  // Create missing countries under Britain
  if (!england) {
    england = await prisma.country.create({
      data: { name: "England", internationalUnitId: britain.id },
    });
    console.log("Created country: England");
  }
  if (!scotland) {
    scotland = await prisma.country.create({
      data: { name: "Scotland", internationalUnitId: britain.id },
    });
    console.log("Created country: Scotland");
  }
  if (!wales) {
    wales = await prisma.country.create({
      data: { name: "Wales", internationalUnitId: britain.id },
    });
    console.log("Created country: Wales");
  }

  // Get all Britain clubs
  const clubs = await prisma.club.findMany({
    where: { internationalUnitId: britain.id },
    select: { id: true, name: true, location: true, region: true },
  });

  let englandCount = 0;
  let scotlandCount = 0;
  let walesCount = 0;
  let isleOfManCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unknownCount = 0;

  // Scotland indicators
  const scotlandIndicators = [
    "Scotland",
    "Glasgow",
    "Edinburgh",
    "Aberdeen",
    "Dundee",
    "Lanarkshire",
  ];

  // Wales indicators
  const walesIndicators = ["Wales", "Cardiff", "Swansea", "Welsh", "Bangor"];

  // Isle of Man indicators
  const isleOfManIndicators = ["Isle of Man", "Douglas"];

  for (const club of clubs) {
    const loc = club.location || "";
    const region = club.region || "";
    const combined = loc + " " + region;

    let countryId: string | null = null;
    let countryName = "";

    // Check Scotland
    if (scotlandIndicators.some((ind) => combined.includes(ind))) {
      countryId = scotland!.id;
      countryName = "Scotland";
      scotlandCount++;
    }
    // Check Wales
    else if (walesIndicators.some((ind) => combined.includes(ind))) {
      countryId = wales!.id;
      countryName = "Wales";
      walesCount++;
    }
    // Check Isle of Man
    else if (isleOfManIndicators.some((ind) => combined.includes(ind))) {
      countryId = isleOfMan?.id || null;
      countryName = "Isle of Man";
      isleOfManCount++;
    }
    // Default to England (most Britain clubs are in England)
    else {
      countryId = england!.id;
      void countryName; // Used for logging
      countryName = "England";
      englandCount++;
    }

    if (countryId) {
      await prisma.club.update({
        where: { id: club.id },
        data: { countryId },
      });
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`England: ${englandCount}`);
  console.log(`Scotland: ${scotlandCount}`);
  console.log(`Wales: ${walesCount}`);
  console.log(`Isle of Man: ${isleOfManCount}`);
  console.log(
    `Total: ${englandCount + scotlandCount + walesCount + isleOfManCount}`
  );

  // Also fix Eire Og Oxford location
  const eireOgOxford = await prisma.club.findFirst({
    where: { name: "Eire Og Oxford" },
  });
  if (eireOgOxford) {
    await prisma.club.update({
      where: { id: eireOgOxford.id },
      data: { location: "Oxford, Oxfordshire, England" },
    });
    console.log(
      '\nFixed location: Eire Og Oxford -> "Oxford, Oxfordshire, England"'
    );
  }
}

assignCountries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
