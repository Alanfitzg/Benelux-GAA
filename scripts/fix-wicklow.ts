import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixWicklow() {
  console.log("=== Fixing Wicklow GAA Clubs ===\n");

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
  let renamed = 0;
  let merged = 0;

  // 1. Add missing clubs
  console.log("--- Adding Missing Clubs ---\n");

  const missingClubs = [
    { name: "Éire Óg Greystones GAA", location: "Wicklow, Leinster, Ireland" },
    { name: "Annacurra GAA", location: "Wicklow, Leinster, Ireland" },
    { name: "Ballinacor GAA", location: "Wicklow, Leinster, Ireland" },
    { name: "Western Gaels GAA", location: "Wicklow, Leinster, Ireland" },
  ];

  for (const club of missingClubs) {
    const existing = await prisma.club.findFirst({
      where: {
        name: { contains: club.name.replace(" GAA", ""), mode: "insensitive" },
        subRegion: "Wicklow",
      },
    });

    if (!existing) {
      await prisma.club.create({
        data: {
          name: club.name,
          location: club.location,
          region: "Leinster",
          subRegion: "Wicklow",
          internationalUnitId: ireland.id,
          clubType: "CLUB",
          status: "APPROVED",
        },
      });
      console.log(`✓ Added: ${club.name}`);
      added++;
    } else {
      console.log(`? Already exists: ${club.name} (as ${existing.name})`);
    }
  }

  // 2. Delete duplicate - Roundwood GAA (An Tóchar is the correct name)
  console.log("\n--- Removing Duplicates ---\n");

  const roundwood = await prisma.club.findFirst({
    where: { name: "Roundwood GAA", subRegion: "Wicklow" },
  });

  if (roundwood) {
    try {
      await prisma.club.delete({ where: { id: roundwood.id } });
      console.log(
        '✓ Deleted: "Roundwood GAA" (An Tóchar GAA is the correct name)'
      );
      deleted++;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Roundwood GAA" (has references)');
      }
    }
  } else {
    console.log("? Roundwood GAA not found (already removed)");
  }

  // 3. Merge Shillelagh + Coolboy into Shillelagh-Coolboy
  // (They amalgamated in December 2018)
  console.log("\n--- Merging Shillelagh / Coolboy ---\n");

  const shillelagh = await prisma.club.findFirst({
    where: { name: "Shillelagh GAA", subRegion: "Wicklow" },
  });

  const coolboy = await prisma.club.findFirst({
    where: { name: "Coolboy GAA", subRegion: "Wicklow" },
  });

  if (shillelagh && coolboy) {
    // Rename Shillelagh to the combined name
    await prisma.club.update({
      where: { id: shillelagh.id },
      data: { name: "Shillelagh-Coolboy GAA" },
    });
    console.log('✓ Renamed: "Shillelagh GAA" -> "Shillelagh-Coolboy GAA"');

    // Delete Coolboy (keep the merged one)
    try {
      await prisma.club.delete({ where: { id: coolboy.id } });
      console.log('✓ Deleted: "Coolboy GAA" (merged into Shillelagh-Coolboy)');
      merged++;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Coolboy GAA" (has references)');
      }
    }
  } else if (shillelagh && !coolboy) {
    await prisma.club.update({
      where: { id: shillelagh.id },
      data: { name: "Shillelagh-Coolboy GAA" },
    });
    console.log('✓ Renamed: "Shillelagh GAA" -> "Shillelagh-Coolboy GAA"');
    renamed++;
  } else if (!shillelagh && coolboy) {
    await prisma.club.update({
      where: { id: coolboy.id },
      data: { name: "Shillelagh-Coolboy GAA" },
    });
    console.log('✓ Renamed: "Coolboy GAA" -> "Shillelagh-Coolboy GAA"');
    renamed++;
  } else {
    // Check if already merged
    const alreadyMerged = await prisma.club.findFirst({
      where: {
        name: { contains: "Shillelagh-Coolboy", mode: "insensitive" },
        subRegion: "Wicklow",
      },
    });
    if (alreadyMerged) {
      console.log("? Already merged: " + alreadyMerged.name);
    } else {
      console.log("? Neither Shillelagh nor Coolboy found");
    }
  }

  // 4. Rename Newtownmountkennedy to Newtown (official name)
  console.log("\n--- Fixing Club Names ---\n");

  const newtownmk = await prisma.club.findFirst({
    where: { name: "Newtownmountkennedy GAA", subRegion: "Wicklow" },
  });

  if (newtownmk) {
    await prisma.club.update({
      where: { id: newtownmk.id },
      data: { name: "Newtown GAA" },
    });
    console.log('✓ Renamed: "Newtownmountkennedy GAA" -> "Newtown GAA"');
    renamed++;
  } else {
    const newtown = await prisma.club.findFirst({
      where: { name: "Newtown GAA", subRegion: "Wicklow" },
    });
    if (newtown) {
      console.log("? Newtown GAA already correct");
    } else {
      console.log("? Newtownmountkennedy not found");
    }
  }

  // 5. Handle Lacken-Kilbride - this should actually be split into two clubs
  // but we'll keep it for now and add Kilbride separately
  console.log("\n--- Handling Lacken/Kilbride ---\n");

  const lackenKilbride = await prisma.club.findFirst({
    where: { name: "Lacken-Kilbride GAA", subRegion: "Wicklow" },
  });

  if (lackenKilbride) {
    // Check if Kilbride already exists separately
    const kilbrideOnly = await prisma.club.findFirst({
      where: {
        OR: [
          { name: "Cill Bhríde GAA", subRegion: "Wicklow" },
          { name: "Kilbride GAA", subRegion: "Wicklow" },
        ],
      },
    });

    if (!kilbrideOnly) {
      // Add Kilbride as separate club
      await prisma.club.create({
        data: {
          name: "Cill Bhríde GAA",
          location: "Manor Kilbride, Wicklow, Leinster, Ireland",
          region: "Leinster",
          subRegion: "Wicklow",
          internationalUnitId: ireland.id,
          clubType: "CLUB",
          status: "APPROVED",
        },
      });
      console.log("✓ Added: Cill Bhríde GAA (Kilbride)");
      added++;

      // Rename Lacken-Kilbride to just Lacken
      await prisma.club.update({
        where: { id: lackenKilbride.id },
        data: { name: "Lacken GAA" },
      });
      console.log('✓ Renamed: "Lacken-Kilbride GAA" -> "Lacken GAA"');
      renamed++;
    } else {
      console.log("? Kilbride already exists separately");
    }
  } else {
    console.log("? Lacken-Kilbride not found");
  }

  // 6. Check Naomh Teagáin - this appears to be a youth/second team associated with Kiltegan
  // Keep it for now as it may serve a purpose
  console.log("\n--- Notes on Special Cases ---\n");
  console.log(
    "  - Naomh Teagáin GAA, Kiltegan: Kept (may be separate youth/team)"
  );

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Clubs added: ${added}`);
  console.log(`Clubs deleted: ${deleted}`);
  console.log(`Clubs renamed: ${renamed}`);
  console.log(`Clubs merged: ${merged}`);

  // Final count
  const wicklowClubs = await prisma.club.findMany({
    where: { subRegion: "Wicklow" },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== Final Wicklow Club List (${wicklowClubs.length}) ===\n`);
  wicklowClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixWicklow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
