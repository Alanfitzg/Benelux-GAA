import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixEurope() {
  console.log("=== Fixing Europe Clubs ===\n");

  const europe = await prisma.internationalUnit.findFirst({
    where: { name: "Europe" },
  });
  if (!europe) {
    console.log("Europe unit not found");
    return;
  }

  // Create missing countries
  console.log("--- Creating Missing Countries ---\n");

  const newCountries: { name: string; code: string }[] = [
    { name: "Hungary", code: "HU" },
    { name: "Estonia", code: "EE" },
    { name: "Ukraine", code: "UA" },
    { name: "Czech Republic", code: "CZ" },
    { name: "Slovakia", code: "SK" },
    { name: "Iceland", code: "IS" },
  ];

  const countries: Record<string, { id: string }> = {};

  // Get existing countries
  const existingCountries = await prisma.country.findMany({
    where: { internationalUnitId: europe.id },
  });
  for (const c of existingCountries) {
    countries[c.name] = c;
  }

  // Create new countries
  for (const c of newCountries) {
    if (!countries[c.name]) {
      const created = await prisma.country.create({
        data: { name: c.name, code: c.code, internationalUnitId: europe.id },
      });
      countries[c.name] = created;
      console.log(`✓ Created country: ${c.name}`);
    }
  }

  console.log("\n--- Assigning Countries to Clubs ---\n");

  // Assignments based on location
  const assignments: { name: string; country: string; location?: string }[] = [
    {
      name: "Budapest Gaels",
      country: "Hungary",
      location: "Budapest, Hungary",
    },
    { name: "Dun an Esti", country: "Estonia", location: "Tallinn, Estonia" },
    { name: "Tallinn GAA", country: "Estonia", location: "Tallinn, Estonia" },
    { name: "Kyiv Gaels", country: "Ukraine", location: "Kyiv, Ukraine" },
    {
      name: "Píobairí Strakonice GAC",
      country: "Czech Republic",
      location: "Strakonice, Czech Republic",
    },
    {
      name: "Prague Hibernians",
      country: "Czech Republic",
      location: "Prague, Czech Republic",
    },
    {
      name: "Reykjavík Keltar GAA",
      country: "Iceland",
      location: "Reykjavik, Iceland",
    },
    {
      name: "Slovak Shamrocks",
      country: "Slovakia",
      location: "Bratislava, Slovakia",
    },
    {
      name: "Slovak Shamrocks GAA",
      country: "Slovakia",
      location: "Bratislava, Slovakia",
    },
    {
      name: "Guernsey Gaels",
      country: "Gibraltar",
      location: "Guernsey, Channel Islands",
    }, // Using Gibraltar as closest available
  ];

  let updated = 0;
  for (const a of assignments) {
    const club = await prisma.club.findFirst({
      where: { name: a.name, internationalUnitId: europe.id },
    });

    if (club && countries[a.country]) {
      const updateData: { countryId: string; location?: string } = {
        countryId: countries[a.country].id,
      };
      if (a.location) {
        updateData.location = a.location;
      }

      await prisma.club.update({
        where: { id: club.id },
        data: updateData,
      });
      console.log(`✓ ${a.name} -> ${a.country}`);
      updated++;
    } else if (!club) {
      console.log(`? NOT FOUND: ${a.name}`);
    } else {
      console.log(`? COUNTRY NOT FOUND: ${a.country}`);
    }
  }

  console.log("\n--- Fixing Duplicate Locations ---\n");

  // Fix duplicate locations
  const clubsWithDupeLocations = await prisma.club.findMany({
    where: {
      internationalUnitId: europe.id,
      OR: [
        { location: { contains: ", France, " } },
        { location: { contains: ", Germany, " } },
        { location: { contains: ", Spain, " } },
        { location: { contains: ", Sweden, " } },
        { location: { contains: ", Switzerland, " } },
        { location: { contains: ", Luxembourg, " } },
      ],
    },
  });

  let locationFixed = 0;
  for (const club of clubsWithDupeLocations) {
    if (!club.location) continue;

    // Clean up duplicate country in location
    const cleanedLocation = club.location
      .replace(/, France, .*France$/g, ", France")
      .replace(/, Germany, .*Germany$/g, ", Germany")
      .replace(/, Spain, .*Spain$/g, ", Spain")
      .replace(/, Sweden, .*Sweden$/g, ", Sweden")
      .replace(/, Switzerland, .*Switzerland$/g, ", Switzerland")
      .replace(/, Luxembourg, .*Luxembourg$/g, ", Luxembourg")
      .trim();

    if (cleanedLocation !== club.location) {
      await prisma.club.update({
        where: { id: club.id },
        data: { location: cleanedLocation },
      });
      console.log(`✓ Fixed: ${club.name} -> "${cleanedLocation}"`);
      locationFixed++;
    }
  }

  console.log("\n--- Fixing Viking Gaels Location ---\n");

  // Fix Viking Gaels - it's in Norway but has Copenhagen location
  const vikingGaels = await prisma.club.findFirst({
    where: { name: "Viking Gaels", internationalUnitId: europe.id },
  });
  if (vikingGaels) {
    await prisma.club.update({
      where: { id: vikingGaels.id },
      data: { location: "Oslo, Norway" },
    });
    console.log("✓ Fixed Viking Gaels location: Copenhagen -> Oslo, Norway");
    locationFixed++;
  }

  console.log("\n--- Merging Slovak Shamrocks Duplicates ---\n");

  // Merge Slovak Shamrocks duplicates
  const slovakShamrocks = await prisma.club.findFirst({
    where: { name: "Slovak Shamrocks", internationalUnitId: europe.id },
  });
  const slovakShamrocksGAA = await prisma.club.findFirst({
    where: { name: "Slovak Shamrocks GAA", internationalUnitId: europe.id },
  });

  if (slovakShamrocks && slovakShamrocksGAA) {
    try {
      await prisma.club.delete({ where: { id: slovakShamrocksGAA.id } });
      console.log(
        '✓ Deleted "Slovak Shamrocks GAA" (keeping "Slovak Shamrocks")'
      );
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Slovak Shamrocks GAA" (has references)');
      }
    }
  }

  // Check for Tallinn duplicates
  console.log("\n--- Checking Tallinn Duplicates ---\n");

  const tallinnClubs = await prisma.club.findMany({
    where: {
      internationalUnitId: europe.id,
      location: { contains: "Tallinn" },
    },
  });

  if (tallinnClubs.length > 1) {
    console.log("Tallinn clubs found:");
    tallinnClubs.forEach((c) => console.log(`  - ${c.name}`));

    // Keep Tallinn GAA, delete Dun an Esti if both exist
    const tallinnGAA = tallinnClubs.find((c) => c.name === "Tallinn GAA");
    const dunAnEsti = tallinnClubs.find((c) => c.name === "Dun an Esti");

    if (tallinnGAA && dunAnEsti) {
      try {
        await prisma.club.delete({ where: { id: dunAnEsti.id } });
        console.log('✓ Deleted "Dun an Esti" (keeping "Tallinn GAA")');
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "P2003") {
          console.log('✗ Cannot delete "Dun an Esti" (has references)');
        }
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Countries assigned: ${updated}`);
  console.log(`Locations fixed: ${locationFixed}`);

  // Final count by country
  const byCountry = await prisma.club.groupBy({
    by: ["countryId"],
    where: { internationalUnitId: europe.id },
    _count: true,
  });

  console.log("\nBy Country:");
  for (const bc of byCountry.sort((a, b) => b._count - a._count)) {
    if (bc.countryId) {
      const country = await prisma.country.findUnique({
        where: { id: bc.countryId },
      });
      console.log(`  ${country?.name}: ${bc._count}`);
    } else {
      console.log(`  No country: ${bc._count}`);
    }
  }

  const total = await prisma.club.count({
    where: { internationalUnitId: europe.id },
  });
  console.log(`\nTotal Europe clubs: ${total}`);
}

fixEurope()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
