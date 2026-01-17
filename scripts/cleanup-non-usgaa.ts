import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("=== Cleanup Non-USGAA US Clubs ===\n");

  const na = await prisma.internationalUnit.findFirst({
    where: { name: "North America" },
  });
  const ny = await prisma.internationalUnit.findFirst({
    where: { name: "New York" },
  });

  if (!na || !ny) {
    console.error("International units not found");
    return;
  }

  let removed = 0;
  let merged = 0;
  let moved = 0;
  let fixed = 0;

  // Helper to safely delete a club
  async function safeDelete(name: string) {
    const club = await prisma.club.findFirst({
      where: { name, internationalUnitId: na.id },
    });
    if (club) {
      try {
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`  ✓ REMOVED: ${name}`);
        removed++;
        return true;
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "P2003") {
          console.log(`  ✗ SKIP (has references): ${name}`);
        } else {
          console.log(
            `  ✗ ERROR: ${name} - ${e instanceof Error ? e.message : String(e)}`
          );
        }
        return false;
      }
    } else {
      console.log(`  ? NOT FOUND: ${name}`);
      return false;
    }
  }

  // Helper to merge (delete duplicate, keep USGAA version)
  async function merge(duplicateName: string, usgaaName: string) {
    const dupe = await prisma.club.findFirst({
      where: { name: duplicateName, internationalUnitId: na.id },
    });
    const usgaa = await prisma.club.findFirst({
      where: { name: usgaaName, internationalUnitId: na.id },
    });

    if (dupe && usgaa) {
      try {
        await prisma.club.delete({ where: { id: dupe.id } });
        console.log(`  ✓ MERGED: "${duplicateName}" -> keeping "${usgaaName}"`);
        merged++;
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "P2003") {
          console.log(`  ✗ SKIP MERGE (has references): ${duplicateName}`);
        }
      }
    } else if (dupe && !usgaa) {
      // Rename instead of delete
      await prisma.club.update({
        where: { id: dupe.id },
        data: { name: usgaaName },
      });
      console.log(`  ✓ RENAMED: "${duplicateName}" -> "${usgaaName}"`);
      merged++;
    } else {
      console.log(`  ? NOT FOUND for merge: ${duplicateName}`);
    }
  }

  // 1. REMOVE DEFUNCT CLUBS
  console.log("--- Removing Defunct/Obscure Clubs ---");
  await safeDelete("Annacurra GAA");
  await safeDelete("Ardglass GAA");
  await safeDelete("CLG Naomh Anna, Leitir Móir");
  await safeDelete("Currin Sons of St Patrick");
  await safeDelete("Barely House Wolves");
  await safeDelete("Bohola-Moy Davitts, Foxford");

  // 2. MERGE DUPLICATES
  console.log("\n--- Merging Duplicates ---");
  await merge("Cusacks Hurling Club GAA", "Michael Cusack Hurling Club");
  await merge("Erin Rovers GAA", "Erin's Rovers");
  await merge("Flagstaff Mountain Hounds", "Flagstaff Mountainhounds");
  await merge("Na Tóraidhe Hurling Club GAA", "Na Toraidhe Hurling");
  await merge("St. Louis Gaelic Athletic Club", "St. Louis GAC");
  await merge("McBrides GFC GAA", "John McBrides GFC");

  // Check Westput Setanta (typo)
  const westput = await prisma.club.findFirst({
    where: { name: "Westput Setanta GAA", internationalUnitId: na.id },
  });
  if (westput) {
    await prisma.club.delete({ where: { id: westput.id } });
    console.log(
      '  ✓ REMOVED typo: "Westput Setanta GAA" (duplicate of San Diego Setanta)'
    );
    removed++;
  }

  // 3. MOVE NEW YORK CLUBS TO NY UNIT
  console.log("\n--- Moving New York Clubs to NY Unit ---");
  const nyClubs = ["New York Celtics", "New York GAA", "New Haven Gaelic Club"];
  for (const name of nyClubs) {
    const club = await prisma.club.findFirst({
      where: { name, internationalUnitId: na.id },
    });
    if (club) {
      await prisma.club.update({
        where: { id: club.id },
        data: { internationalUnitId: ny.id },
      });
      console.log(`  ✓ MOVED to NY: ${name}`);
      moved++;
    }
  }

  // 4. FIX TYPOS
  console.log("\n--- Fixing Typos ---");
  const indianapolis = await prisma.club.findFirst({
    where: { name: "Indianopolis GAA", internationalUnitId: na.id },
  });
  if (indianapolis) {
    await prisma.club.update({
      where: { id: indianapolis.id },
      data: { name: "Indianapolis GAA" },
    });
    console.log('  ✓ FIXED: "Indianopolis GAA" -> "Indianapolis GAA"');
    fixed++;
  }

  // Fix location typo
  const chicago = await prisma.club.findFirst({
    where: { name: "Chicago GAA", internationalUnitId: na.id },
  });
  if (chicago && chicago.location?.includes("Illonois")) {
    await prisma.club.update({
      where: { id: chicago.id },
      data: { location: "Illinois, Central Division, United States" },
    });
    console.log('  ✓ FIXED location: "Illonois" -> "Illinois"');
    fixed++;
  }

  // 5. SUMMARY
  console.log("\n=== SUMMARY ===");
  console.log(`Removed: ${removed}`);
  console.log(`Merged: ${merged}`);
  console.log(`Moved to NY: ${moved}`);
  console.log(`Typos fixed: ${fixed}`);

  // Final count
  const totalNA = await prisma.club.count({
    where: { internationalUnit: { name: "North America" } },
  });
  const totalUS = await prisma.club.count({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "United States" },
    },
  });

  console.log(`\nTotal North America clubs: ${totalNA}`);
  console.log(`Total US clubs: ${totalUS}`);
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
