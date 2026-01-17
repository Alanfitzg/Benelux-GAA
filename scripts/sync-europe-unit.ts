import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncEuropeUnit() {
  console.log("=== Syncing Europe International Unit ===\n");
  console.log(
    "Option A: Assigning clubs with isMainlandEurope=true to Europe unit\n"
  );

  const europe = await prisma.internationalUnit.findFirst({
    where: { name: "Europe" },
  });
  if (!europe) {
    console.log("Europe unit not found");
    return;
  }

  // Find clubs with isMainlandEurope=true but no international unit
  const clubsToAssign = await prisma.club.findMany({
    where: {
      isMainlandEurope: true,
      internationalUnitId: null,
    },
    select: {
      id: true,
      name: true,
      location: true,
      countryId: true,
      country: { select: { name: true } },
    },
  });

  console.log(`Found ${clubsToAssign.length} clubs to assign to Europe unit\n`);

  // Group by country for display
  const byCountry: Record<string, typeof clubsToAssign> = {};
  for (const c of clubsToAssign) {
    const country = c.country?.name || "Unknown";
    if (!byCountry[country]) byCountry[country] = [];
    byCountry[country].push(c);
  }

  console.log("--- Clubs to be assigned ---\n");
  for (const [country, clubs] of Object.entries(byCountry).sort()) {
    console.log(`${country} (${clubs.length}):`);
    for (const c of clubs) {
      console.log(`  - ${c.name}`);
    }
  }

  // Perform the update
  console.log("\n--- Assigning to Europe unit ---\n");

  const result = await prisma.club.updateMany({
    where: {
      isMainlandEurope: true,
      internationalUnitId: null,
    },
    data: {
      internationalUnitId: europe.id,
    },
  });

  console.log(`✓ Assigned ${result.count} clubs to Europe international unit`);

  // Verify
  const europeClubs = await prisma.club.count({
    where: { internationalUnitId: europe.id },
  });

  const mainlandEuropeClubs = await prisma.club.count({
    where: { isMainlandEurope: true },
  });

  console.log("\n=== Summary ===");
  console.log(`Europe Unit clubs: ${europeClubs}`);
  console.log(`isMainlandEurope=true clubs: ${mainlandEuropeClubs}`);

  // Check remaining discrepancy
  const stillNoUnit = await prisma.club.count({
    where: {
      isMainlandEurope: true,
      internationalUnitId: null,
    },
  });

  const inUnitNoFlag = await prisma.club.count({
    where: {
      internationalUnitId: europe.id,
      isMainlandEurope: false,
    },
  });

  console.log(`\nRemaining without unit: ${stillNoUnit}`);
  console.log(`In Europe unit without isMainlandEurope flag: ${inUnitNoFlag}`);
}

syncEuropeUnit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
