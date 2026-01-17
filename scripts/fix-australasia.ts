import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAustralasia() {
  console.log("=== Fixing Australasia Clubs ===\n");

  const aus = await prisma.internationalUnit.findFirst({
    where: { name: "Australasia" },
  });
  if (!aus) {
    console.log("Australasia unit not found");
    return;
  }

  // Get countries
  const australia = await prisma.country.findFirst({
    where: { name: "Australia", internationalUnitId: aus.id },
  });
  const newZealand = await prisma.country.findFirst({
    where: { name: "New Zealand", internationalUnitId: aus.id },
  });

  if (!australia || !newZealand) {
    console.log("Missing countries:", {
      australia: !!australia,
      newZealand: !!newZealand,
    });
    return;
  }

  console.log("--- Assigning Countries to Missing Clubs ---\n");

  // Clubs missing country based on location
  const assignments: { name: string; countryId: string; location?: string }[] =
    [
      // Australia clubs
      {
        name: "Cairns Chieftains",
        countryId: australia.id,
        location: "Cairns, Queensland, Australia",
      },
      {
        name: "Harps Brisbane",
        countryId: australia.id,
        location: "Brisbane, Queensland, Australia",
      },
      {
        name: "Hobart Celts GFC/LGFC",
        countryId: australia.id,
        location: "Hobart, Tasmania, Australia",
      },
      {
        name: "Na Fianna",
        countryId: australia.id,
        location: "Adelaide, South Australia, Australia",
      },
      {
        name: "Na Fianna (Queensland)",
        countryId: australia.id,
        location: "Brisbane, Queensland, Australia",
      },
      {
        name: "Na Fianna Adelaide",
        countryId: australia.id,
        location: "Adelaide, South Australia, Australia",
      },
      {
        name: "Na Fianna GFC (Tasmania)",
        countryId: australia.id,
        location: "Hobart, Tasmania, Australia",
      },
      {
        name: "Onkaparinga Gaelic Football Club ",
        countryId: australia.id,
        location: "Adelaide, South Australia, Australia",
      },
      // New Zealand clubs
      {
        name: "Rakaia GAA",
        countryId: newZealand.id,
        location: "Rakaia, Canterbury, New Zealand",
      },
      {
        name: "St Pats Emerald City (Auckland)",
        countryId: newZealand.id,
        location: "Auckland, New Zealand",
      },
    ];

  let updated = 0;
  for (const a of assignments) {
    const club = await prisma.club.findFirst({
      where: { name: a.name, internationalUnitId: aus.id },
    });

    if (club) {
      const updateData: { countryId: string; location?: string } = {
        countryId: a.countryId,
      };
      if (a.location) {
        updateData.location = a.location;
      }

      await prisma.club.update({
        where: { id: club.id },
        data: updateData,
      });

      const countryName =
        a.countryId === australia.id ? "Australia" : "New Zealand";
      console.log(`✓ ${a.name} -> ${countryName}`);
      updated++;
    } else {
      console.log(`? NOT FOUND: ${a.name}`);
    }
  }

  console.log("\n--- Fixing Duplicate Locations ---\n");

  // Fix clubs with duplicate location text
  const clubsWithDupeLocations = await prisma.club.findMany({
    where: {
      internationalUnitId: aus.id,
      OR: [
        { location: { contains: ", New Zealand, " } },
        { location: { contains: ", Australia, " } },
      ],
    },
  });

  let locationFixed = 0;
  for (const club of clubsWithDupeLocations) {
    if (!club.location) continue;

    // Clean up duplicate locations like "Christchurch¬â€, New Zealand, Christchurch¬â€, New Zealand"
    const cleanedLocation = club.location
      .replace(/Â¬â€/g, "") // Remove encoding artifacts
      .replace(/, New Zealand, .*/g, ", New Zealand") // Remove duplicate NZ
      .replace(/, Australia, .*/g, ", Australia") // Remove duplicate AU
      .trim();

    if (cleanedLocation !== club.location) {
      await prisma.club.update({
        where: { id: club.id },
        data: { location: cleanedLocation },
      });
      console.log(`✓ Fixed location: ${club.name} -> "${cleanedLocation}"`);
      locationFixed++;
    }
  }

  // Also fix any remaining encoding issues
  const clubsWithEncodingIssues = await prisma.club.findMany({
    where: {
      internationalUnitId: aus.id,
      location: { contains: "Â" },
    },
  });

  for (const club of clubsWithEncodingIssues) {
    if (!club.location) continue;

    const cleanedLocation = club.location
      .replace(/Â¬â€/g, "")
      .replace(/Â/g, "")
      .trim();

    if (cleanedLocation !== club.location) {
      await prisma.club.update({
        where: { id: club.id },
        data: { location: cleanedLocation },
      });
      console.log(`✓ Fixed encoding: ${club.name} -> "${cleanedLocation}"`);
      locationFixed++;
    }
  }

  console.log("\n--- Checking for Duplicates ---\n");

  // Check for potential duplicates
  const clubs = await prisma.club.findMany({
    where: { internationalUnitId: aus.id },
    orderBy: { name: "asc" },
  });

  // Look for Na Fianna duplicates
  const naFiannaClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes("na fianna")
  );
  if (naFiannaClubs.length > 1) {
    console.log("Potential Na Fianna duplicates:");
    naFiannaClubs.forEach((c) => console.log(`  - ${c.name} | ${c.location}`));
  }

  console.log("\n=== Summary ===");
  console.log(`Countries assigned: ${updated}`);
  console.log(`Locations fixed: ${locationFixed}`);

  // Final count by country
  const byCountry = await prisma.club.groupBy({
    by: ["countryId"],
    where: { internationalUnitId: aus.id },
    _count: true,
  });

  console.log("\nBy Country:");
  for (const bc of byCountry) {
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
    where: { internationalUnitId: aus.id },
  });
  console.log(`\nTotal Australasia clubs: ${total}`);
}

fixAustralasia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
