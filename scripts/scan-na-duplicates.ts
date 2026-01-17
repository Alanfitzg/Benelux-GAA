import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function scanDuplicates() {
  console.log("=== North America Duplicate Scan ===\n");

  const clubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
    },
    select: {
      id: true,
      name: true,
      location: true,
      region: true,
      subRegion: true,
      country: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  console.log(`Total clubs: ${clubs.length}\n`);

  // 1. Find exact name duplicates
  console.log("=== EXACT NAME DUPLICATES ===");
  const nameCount: Record<string, typeof clubs> = {};
  for (const club of clubs) {
    if (!nameCount[club.name]) nameCount[club.name] = [];
    nameCount[club.name].push(club);
  }

  const exactDupes = Object.entries(nameCount).filter(
    ([, clubs]) => clubs.length > 1
  );
  if (exactDupes.length === 0) {
    console.log("  None found");
  } else {
    for (const [name, dupeClubs] of exactDupes) {
      console.log(`\n  "${name}" (${dupeClubs.length} entries):`);
      dupeClubs.forEach((c) => {
        console.log(`    - Location: ${c.location}`);
        console.log(`      Region: ${c.region} | SubRegion: ${c.subRegion}`);
      });
    }
  }

  // 2. Find similar names (potential duplicates)
  console.log("\n\n=== POTENTIAL DUPLICATES (Similar Names) ===");

  // Normalize name for comparison
  const normalize = (name: string) => {
    return name
      .toLowerCase()
      .replace(/gaa$/i, "")
      .replace(/gfc$/i, "")
      .replace(/clg$/i, "")
      .replace(/gaelic.*club/i, "")
      .replace(/hurling.*club/i, "")
      .replace(/camogie.*club/i, "")
      .replace(/football.*club/i, "")
      .replace(/[''`]/g, "'")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizedGroups: Record<string, typeof clubs> = {};
  for (const club of clubs) {
    const norm = normalize(club.name);
    if (!normalizedGroups[norm]) normalizedGroups[norm] = [];
    normalizedGroups[norm].push(club);
  }

  const similarDupes = Object.entries(normalizedGroups)
    .filter(([, clubs]) => clubs.length > 1)
    .filter(([, clubs]) => {
      // Exclude if all names are exactly the same (already caught above)
      const names = new Set(clubs.map((c) => c.name));
      return names.size > 1;
    });

  if (similarDupes.length === 0) {
    console.log("  None found");
  } else {
    for (const [norm, dupeClubs] of similarDupes) {
      console.log(`\n  Normalized: "${norm}"`);
      dupeClubs.forEach((c) => {
        console.log(`    - ${c.name}`);
        console.log(`      Location: ${c.location}`);
      });
    }
  }

  // 3. Find clubs with same location but different names
  console.log("\n\n=== SAME LOCATION, DIFFERENT NAMES ===");
  const locationGroups: Record<string, typeof clubs> = {};
  for (const club of clubs) {
    const loc = club.location || "unknown";
    if (!locationGroups[loc]) locationGroups[loc] = [];
    locationGroups[loc].push(club);
  }

  const locationDupes = Object.entries(locationGroups)
    .filter(([, clubs]) => clubs.length > 1)
    .filter(([loc]) => loc !== "unknown");

  if (locationDupes.length === 0) {
    console.log("  None found");
  } else {
    for (const [loc, locClubs] of locationDupes.slice(0, 20)) {
      // Limit output
      console.log(`\n  Location: "${loc}"`);
      locClubs.forEach((c) => {
        console.log(`    - ${c.name}`);
      });
    }
    if (locationDupes.length > 20) {
      console.log(
        `\n  ... and ${locationDupes.length - 20} more location groups`
      );
    }
  }

  // 4. Summary
  console.log("\n\n=== SUMMARY ===");
  console.log(`Exact name duplicates: ${exactDupes.length} groups`);
  console.log(`Similar name duplicates: ${similarDupes.length} groups`);
  console.log(`Same location groups: ${locationDupes.length} groups`);
}

scanDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
