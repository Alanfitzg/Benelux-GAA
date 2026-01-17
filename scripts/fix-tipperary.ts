import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixTipperary() {
  console.log("=== Fixing Tipperary GAA Clubs ===\n");

  // Get Ireland unit
  const ireland = await prisma.internationalUnit.findFirst({
    where: { name: "Ireland" },
  });

  if (!ireland) {
    console.log("Ireland unit not found");
    return;
  }

  let added = 0;
  let deleted = 0;

  // 1. Remove duplicate Carrick Swan (keep the one with image)
  console.log("--- Removing Duplicates ---\n");

  const carrickSwans = await prisma.club.findMany({
    where: { name: "Carrick Swan GAA", subRegion: "Tipperary" },
    orderBy: { imageUrl: "desc" }, // One with image first
  });

  if (carrickSwans.length > 1) {
    // Delete the one without image
    const toDelete = carrickSwans.find((c) => !c.imageUrl);
    if (toDelete) {
      try {
        await prisma.club.delete({ where: { id: toDelete.id } });
        console.log(
          '✓ Deleted duplicate "Carrick Swan GAA" (kept one with crest)'
        );
        deleted++;
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "P2003") {
          console.log(
            '✗ Cannot delete duplicate "Carrick Swan GAA" (has references)'
          );
        }
      }
    }
  } else {
    console.log("? Carrick Swan duplicate already resolved");
  }

  // 2. Add missing clubs
  console.log("\n--- Adding Missing Clubs ---\n");

  const missingClubs = [
    { name: "Durlas Óg GAA", location: "Tipperary, Munster, Ireland" },
    { name: "Kiladangan GAA", location: "Tipperary, Munster, Ireland" },
    { name: "Killea GAA", location: "Tipperary, Munster, Ireland" },
    { name: "Marlfield GAA", location: "Tipperary, Munster, Ireland" },
    {
      name: "St Patrick's Tipperary GAA",
      location: "Tipperary, Munster, Ireland",
    },
    {
      name: "Knockavilla-Donaskeigh Kickhams GAA",
      location: "Tipperary, Munster, Ireland",
    },
  ];

  for (const club of missingClubs) {
    // Check for existing with similar name
    const searchName = club.name.replace(" GAA", "").split(" ")[0];
    const existing = await prisma.club.findFirst({
      where: {
        name: { contains: searchName, mode: "insensitive" },
        subRegion: "Tipperary",
      },
    });

    // More specific check for exact duplicates
    const exactMatch = await prisma.club.findFirst({
      where: {
        name: club.name,
        subRegion: "Tipperary",
      },
    });

    if (exactMatch) {
      console.log(`? Already exists: ${club.name}`);
    } else if (
      existing &&
      club.name.includes("Patrick") &&
      existing.name.includes("Patrick")
    ) {
      console.log(`? Similar exists: ${club.name} (found ${existing.name})`);
    } else if (
      existing &&
      club.name.includes("Knockavilla") &&
      existing.name.includes("Knockavilla")
    ) {
      console.log(`? Similar exists: ${club.name} (found ${existing.name})`);
    } else {
      await prisma.club.create({
        data: {
          name: club.name,
          location: club.location,
          region: "Munster",
          subRegion: "Tipperary",
          internationalUnitId: ireland.id,
          clubType: "CLUB",
          status: "APPROVED",
        },
      });
      console.log(`✓ Added: ${club.name}`);
      added++;
    }
  }

  // Note about extras
  console.log("\n--- Notes ---");
  console.log("  - Garda College GAA: Kept (college/third-level club)");
  console.log("  - Mary Immaculate College Thurles GAA: Kept (college club)");
  console.log(
    '  - Éire Óg Annacarty GAA: Same as "Eire Óg Annacarthy Donohill"'
  );

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Clubs added: ${added}`);
  console.log(`Duplicates deleted: ${deleted}`);

  // Final count
  const tipperaryClubs = await prisma.club.findMany({
    where: { subRegion: "Tipperary" },
    orderBy: { name: "asc" },
  });

  console.log(
    `\n=== Final Tipperary Club List (${tipperaryClubs.length}) ===\n`
  );
  tipperaryClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixTipperary()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
