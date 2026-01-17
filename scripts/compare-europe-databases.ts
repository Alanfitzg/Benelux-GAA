import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  console.log("=== Comparing Europe Databases ===\n");

  const europe = await prisma.internationalUnit.findFirst({
    where: { name: "Europe" },
  });
  if (!europe) {
    console.log("Europe unit not found");
    return;
  }

  // Get clubs in Europe international unit
  const europeUnitClubs = await prisma.club.findMany({
    where: { internationalUnitId: europe.id },
    select: { id: true, name: true, location: true, isMainlandEurope: true },
  });

  // Get clubs with isMainlandEurope = true
  const mainlandEuropeClubs = await prisma.club.findMany({
    where: { isMainlandEurope: true },
    include: { internationalUnit: { select: { name: true } } },
  });

  console.log(`Europe International Unit clubs: ${europeUnitClubs.length}`);
  console.log(`isMainlandEurope=true clubs: ${mainlandEuropeClubs.length}`);
  console.log("");

  // Find clubs in Europe unit that DON'T have isMainlandEurope=true
  const europeUnitNotMainland = europeUnitClubs.filter(
    (c) => !c.isMainlandEurope
  );
  console.log(
    `--- Clubs in Europe Unit WITHOUT isMainlandEurope flag (${europeUnitNotMainland.length}) ---\n`
  );
  for (const c of europeUnitNotMainland.slice(0, 20)) {
    console.log(`  - ${c.name} | ${c.location || "N/A"}`);
  }
  if (europeUnitNotMainland.length > 20) {
    console.log(`  ... and ${europeUnitNotMainland.length - 20} more`);
  }

  // Find clubs with isMainlandEurope=true that are NOT in Europe unit
  const europeUnitIds = new Set(europeUnitClubs.map((c) => c.id));
  const mainlandNotInUnit = mainlandEuropeClubs.filter(
    (c) => !europeUnitIds.has(c.id)
  );

  console.log(
    `\n--- Clubs with isMainlandEurope=true NOT in Europe Unit (${mainlandNotInUnit.length}) ---\n`
  );

  // Group by international unit
  const byUnit: Record<string, typeof mainlandNotInUnit> = {};
  for (const c of mainlandNotInUnit) {
    const unitName = c.internationalUnit?.name || "No Unit";
    if (!byUnit[unitName]) byUnit[unitName] = [];
    byUnit[unitName].push(c);
  }

  for (const [unit, clubs] of Object.entries(byUnit).sort()) {
    console.log(`${unit} (${clubs.length}):`);
    for (const c of clubs.slice(0, 10)) {
      console.log(`  - ${c.name} | ${c.location || "N/A"}`);
    }
    if (clubs.length > 10) {
      console.log(`  ... and ${clubs.length - 10} more`);
    }
    console.log("");
  }

  // Find overlap - clubs in BOTH Europe unit AND have isMainlandEurope=true
  const overlap = europeUnitClubs.filter((c) => c.isMainlandEurope);
  console.log(
    `--- Clubs in BOTH Europe Unit AND isMainlandEurope=true (${overlap.length}) ---\n`
  );
  for (const c of overlap.slice(0, 10)) {
    console.log(`  - ${c.name}`);
  }
  if (overlap.length > 10) {
    console.log(`  ... and ${overlap.length - 10} more`);
  }

  console.log("\n=== Summary ===");
  console.log(`Europe Unit total: ${europeUnitClubs.length}`);
  console.log(`  - With isMainlandEurope flag: ${overlap.length}`);
  console.log(
    `  - Without isMainlandEurope flag: ${europeUnitNotMainland.length}`
  );
  console.log(`\nisMainlandEurope=true total: ${mainlandEuropeClubs.length}`);
  console.log(`  - In Europe Unit: ${overlap.length}`);
  console.log(`  - In other units: ${mainlandNotInUnit.length}`);
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
