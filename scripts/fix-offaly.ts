import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixOffaly() {
  console.log("=== Fixing Offaly GAA Clubs ===\n");

  // Get Ireland unit
  const ireland = await prisma.internationalUnit.findFirst({
    where: { name: "Ireland" },
  });

  if (!ireland) {
    console.log("Ireland unit not found");
    return;
  }

  let added = 0;
  let merged = 0;

  // 1. Add missing clubs
  console.log("--- Adding Missing Clubs ---\n");

  const missingClubs = [
    { name: "Ballinagar GAA", location: "Offaly, Leinster, Ireland" },
    { name: "Ballyfore GAA", location: "Offaly, Leinster, Ireland" },
    { name: "Raheen GAA", location: "Offaly, Leinster, Ireland" },
  ];

  for (const club of missingClubs) {
    const existing = await prisma.club.findFirst({
      where: { name: club.name, subRegion: "Offaly" },
    });

    if (!existing) {
      await prisma.club.create({
        data: {
          name: club.name,
          location: club.location,
          region: "Leinster",
          subRegion: "Offaly",
          internationalUnitId: ireland.id,
          clubType: "CLUB",
          status: "APPROVED",
        },
      });
      console.log(`✓ Added: ${club.name}`);
      added++;
    } else {
      console.log(`? Already exists: ${club.name}`);
    }
  }

  // 2. Merge Ballyskenagh and Killavilla into one amalgamated club
  console.log("\n--- Merging Ballyskenagh / Killavilla ---\n");

  const ballyskenagh = await prisma.club.findFirst({
    where: { name: "Ballyskenagh GAA", subRegion: "Offaly" },
  });

  const killavilla = await prisma.club.findFirst({
    where: { name: "Killavilla GAA", subRegion: "Offaly" },
  });

  if (ballyskenagh && killavilla) {
    // Rename Ballyskenagh to the combined name
    await prisma.club.update({
      where: { id: ballyskenagh.id },
      data: { name: "Ballyskenagh-Killavilla GAA" },
    });
    console.log(
      '✓ Renamed: "Ballyskenagh GAA" -> "Ballyskenagh-Killavilla GAA"'
    );

    // Delete Killavilla (keep the merged one)
    try {
      await prisma.club.delete({ where: { id: killavilla.id } });
      console.log(
        '✓ Deleted: "Killavilla GAA" (merged into Ballyskenagh-Killavilla)'
      );
      merged++;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Killavilla GAA" (has references)');
      }
    }
  } else if (ballyskenagh && !killavilla) {
    await prisma.club.update({
      where: { id: ballyskenagh.id },
      data: { name: "Ballyskenagh-Killavilla GAA" },
    });
    console.log(
      '✓ Renamed: "Ballyskenagh GAA" -> "Ballyskenagh-Killavilla GAA"'
    );
  } else if (!ballyskenagh && killavilla) {
    await prisma.club.update({
      where: { id: killavilla.id },
      data: { name: "Ballyskenagh-Killavilla GAA" },
    });
    console.log('✓ Renamed: "Killavilla GAA" -> "Ballyskenagh-Killavilla GAA"');
  } else {
    // Check if already merged
    const merged = await prisma.club.findFirst({
      where: {
        name: { contains: "Ballyskenagh-Killavilla", mode: "insensitive" },
        subRegion: "Offaly",
      },
    });
    if (merged) {
      console.log("? Already merged: " + merged.name);
    } else {
      console.log("? Neither Ballyskenagh nor Killavilla found");
    }
  }

  // Note about extras - keeping them for now as they may be historical/smaller clubs
  console.log("\n--- Clubs kept (may be historical/smaller) ---");
  console.log("  - Killeigh GAA");
  console.log("  - Killurin GAA");
  console.log("  - Brosna Gaels GAA (separate from Clodiagh Gaels)");

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Clubs added: ${added}`);
  console.log(`Clubs merged: ${merged}`);

  // Final count
  const offalyClubs = await prisma.club.findMany({
    where: { subRegion: "Offaly" },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== Final Offaly Club List (${offalyClubs.length}) ===\n`);
  offalyClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixOffaly()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
