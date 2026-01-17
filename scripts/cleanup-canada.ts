import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupCanada() {
  console.log("=== Canada Club Cleanup ===\n");

  const na = await prisma.internationalUnit.findFirst({
    where: { name: "North America" },
  });
  const canada = await prisma.country.findFirst({ where: { name: "Canada" } });

  if (!na || !canada) {
    console.error("North America or Canada not found");
    return;
  }

  let merged = 0;
  let fixed = 0;

  // Helper to safely delete a club
  async function safeDelete(name: string) {
    const club = await prisma.club.findFirst({
      where: { name, internationalUnitId: na.id, countryId: canada.id },
    });
    if (club) {
      try {
        await prisma.club.delete({ where: { id: club.id } });
        return true;
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "P2003") {
          console.log(`    ✗ SKIP (has references): ${name}`);
        }
        return false;
      }
    }
    return false;
  }

  // Helper to merge duplicates (delete one, keep the other with better name)
  async function merge(deleteName: string, keepName: string) {
    const toDelete = await prisma.club.findFirst({
      where: { name: deleteName, internationalUnitId: na.id },
    });
    const toKeep = await prisma.club.findFirst({
      where: { name: keepName, internationalUnitId: na.id },
    });

    if (toDelete && toKeep) {
      if (await safeDelete(deleteName)) {
        console.log(`  ✓ MERGED: "${deleteName}" -> keeping "${keepName}"`);
        merged++;
      }
    } else if (toDelete && !toKeep) {
      // Rename instead
      await prisma.club.update({
        where: { id: toDelete.id },
        data: { name: keepName },
      });
      console.log(`  ✓ RENAMED: "${deleteName}" -> "${keepName}"`);
      merged++;
    } else {
      console.log(`  ? NOT FOUND: ${deleteName}`);
    }
  }

  console.log("--- Merging Duplicates ---\n");

  // Fraser Valley
  await merge("Fraser Valley Gaels GAA", "Fraser Valley Gaels GAA Club");

  // JP Ryans
  await merge("JP Ryan's Hurling and Camogie Club", "JP Ryans GAA Club");

  // Na Piarsaigh
  await merge("Na Piarsaigh CLG", "Na Piarsaigh Toronto");

  // Roger Casements
  await merge("Roger Casements GFC", "Roger Casements GFC Toronto");

  // St. Michael's - keep "St. Michael's Toronto GAA"
  await merge(
    "St. Michael's Hurling and Football Club",
    "St. Michael's Toronto GAA"
  );
  await merge("St. Mike's GFC Toronto", "St. Michael's Toronto GAA");

  // St. Pat's - keep "St. Pat's GFC Toronto"
  await merge("St. Pat's Canadians", "St. Pat's GFC Toronto");

  // St. Vincent's - keep "St. Vincent's GFC Toronto"
  await merge("St. Vincent's Toronto GAA", "St. Vincent's GFC Toronto");
  await merge("St. Vincents GAA Club", "St. Vincent's GFC Toronto");

  // PEI - keep "Prince Edward Island Celts"
  await merge(
    "PEI Celts Gaelic Athletic Association",
    "Prince Edward Island Celts"
  );
  await merge("Prince Edward Island Gaels GAA", "Prince Edward Island Celts");

  // Quebec - keep "Quebec City Les Patriotes" and delete corrupted one
  await merge("Les Patriotes de Québec", "Quebec City Les Patriotes");

  console.log("\n--- Fixing Typos and Encoding ---\n");

  // Fix Ottawa typo
  const ottawa = await prisma.club.findFirst({
    where: {
      name: "Ottawa Gaels Gaelic Football Club",
      internationalUnitId: na.id,
    },
  });
  if (ottawa && ottawa.location?.includes("Ottowa")) {
    await prisma.club.update({
      where: { id: ottawa.id },
      data: { location: "Ottawa, Ontario, Canada" },
    });
    console.log('  ✓ FIXED typo: "Ottowa" -> "Ottawa"');
    fixed++;
  }

  // Fix duplicate location data
  const clubsWithDupeLocations = await prisma.club.findMany({
    where: {
      internationalUnitId: na.id,
      countryId: canada.id,
      location: { contains: ", Canada," },
    },
  });

  for (const club of clubsWithDupeLocations) {
    // Clean up locations like "Toronto, Canada, Ontario, Canada" -> "Toronto, Ontario, Canada"
    const cleanedLocation = club.location
      ?.replace(/, Canada,/g, ",")
      .replace(/British Colombia/g, "British Columbia");

    if (cleanedLocation && cleanedLocation !== club.location) {
      await prisma.club.update({
        where: { id: club.id },
        data: { location: cleanedLocation },
      });
      console.log(`  ✓ FIXED location: "${club.name}" -> "${cleanedLocation}"`);
      fixed++;
    }
  }

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log(`Merged: ${merged}`);
  console.log(`Fixed: ${fixed}`);

  // Final count
  const totalCanada = await prisma.club.count({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "Canada" },
    },
  });
  console.log(`\nTotal Canada clubs: ${totalCanada}`);
}

cleanupCanada()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
