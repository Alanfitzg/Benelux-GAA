import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listNorthAmerica() {
  const clubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
    },
    select: {
      name: true,
      location: true,
      region: true,
      subRegion: true,
      clubType: true,
    },
    orderBy: [{ region: "asc" }, { subRegion: "asc" }, { name: "asc" }],
  });

  console.log("=== North America GAA Clubs ===");
  console.log("Total: " + clubs.length + "\n");

  let currentRegion = "";
  let currentSubRegion = "";

  for (const c of clubs) {
    const region = c.region || "No Region";
    const subRegion = c.subRegion || "No SubRegion";

    if (region !== currentRegion) {
      currentRegion = region;
      console.log("\n=== " + currentRegion + " ===");
      currentSubRegion = "";
    }
    if (subRegion !== currentSubRegion) {
      currentSubRegion = subRegion;
      console.log("\n  -- " + currentSubRegion + " --");
    }
    const type =
      c.clubType && c.clubType !== "CLUB" ? " [" + c.clubType + "]" : "";
    console.log("    " + c.name + type);
    console.log("       Location: " + (c.location || "N/A"));
  }

  // Summary by region
  console.log("\n\n=== SUMMARY BY REGION ===");
  const byRegion = clubs.reduce(
    (acc, c) => {
      const r = c.region || "No Region";
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  Object.entries(byRegion)
    .sort()
    .forEach(([r, count]) => {
      console.log(`${r}: ${count}`);
    });
}

listNorthAmerica()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
