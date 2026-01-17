import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixDerry() {
  console.log("=== Fixing Derry GAA Clubs ===\n");

  // Get Ireland unit
  const ireland = await prisma.internationalUnit.findFirst({
    where: { name: "Ireland" },
  });

  if (!ireland) {
    console.log("Ireland unit not found");
    return;
  }

  let deleted = 0;
  let moved = 0;
  let added = 0;

  // 1. Delete "Glen GAA" duplicate (keep "Watty Graham's Glen GAA")
  console.log("--- Fixing Glen Duplicate ---\n");

  const glenGAA = await prisma.club.findFirst({
    where: { name: "Glen GAA", subRegion: "Derry" },
  });

  const wattyGrahamsGlen = await prisma.club.findFirst({
    where: { name: "Watty Graham's Glen GAA", subRegion: "Derry" },
  });

  if (glenGAA && wattyGrahamsGlen) {
    try {
      await prisma.club.delete({ where: { id: glenGAA.id } });
      console.log('✓ Deleted "Glen GAA" (keeping "Watty Graham\'s Glen GAA")');
      deleted++;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Glen GAA" (has references)');
      }
    }
  } else if (glenGAA && !wattyGrahamsGlen) {
    // Rename Glen GAA to the full name
    await prisma.club.update({
      where: { id: glenGAA.id },
      data: { name: "Watty Graham's Glen GAA" },
    });
    console.log('✓ Renamed "Glen GAA" -> "Watty Graham\'s Glen GAA"');
  } else {
    console.log("Glen duplicate already resolved or not found");
  }

  // 2. Check and move Brocagh Emmetts to Tyrone
  console.log("\n--- Checking Brocagh Emmetts ---\n");

  const brocagh = await prisma.club.findFirst({
    where: { name: "Brocagh Emmetts GAA", subRegion: "Derry" },
  });

  if (brocagh) {
    // Brocagh Emmetts is actually in Tyrone, not Derry
    await prisma.club.update({
      where: { id: brocagh.id },
      data: {
        subRegion: "Tyrone",
        location: "Tyrone, Ulster, Ireland",
      },
    });
    console.log('✓ Moved "Brocagh Emmetts GAA" from Derry to Tyrone');
    moved++;
  } else {
    console.log("Brocagh Emmetts not in Derry (already correct or not found)");
  }

  // 3. Add missing clubs
  console.log("\n--- Adding Missing Derry Clubs ---\n");

  const missingClubs = [
    { name: "St Mary's Ardmore GAA", location: "Derry, Ulster, Ireland" },
    { name: "Sarsfields Ballerin GAA", location: "Derry, Ulster, Ireland" },
    {
      name: "St Malachy's Castledawson GAA",
      location: "Derry, Ulster, Ireland",
    },
    { name: "O'Connor's Glack GAA", location: "Derry, Ulster, Ireland" },
    {
      name: "John Mitchell's Glenullin GAA",
      location: "Derry, Ulster, Ireland",
    },
    { name: "St Michaels Lissan GAA", location: "Derry, Ulster, Ireland" },
    { name: "St Aidan's Magilligan GAA", location: "Derry, Ulster, Ireland" },
    {
      name: "Henry Joy McCracken's Moneymore GAA",
      location: "Derry, Ulster, Ireland",
    },
    { name: "Ogra Colmcille GAA", location: "Derry, Ulster, Ireland" },
    { name: "Sean Dolan's GAA", location: "Derry, Ulster, Ireland" },
  ];

  for (const club of missingClubs) {
    const existing = await prisma.club.findFirst({
      where: {
        OR: [
          { name: club.name },
          {
            name: {
              contains: club.name
                .replace(" GAA", "")
                .replace("'s", "")
                .split(" ")[0],
            },
            subRegion: "Derry",
          },
        ],
      },
    });

    if (!existing) {
      await prisma.club.create({
        data: {
          name: club.name,
          location: club.location,
          region: "Ulster",
          subRegion: "Derry",
          internationalUnitId: ireland.id,
          clubType: "CLUB",
          status: "APPROVED",
        },
      });
      console.log(`✓ Added: ${club.name}`);
      added++;
    } else {
      console.log(
        `? Already exists (or similar): ${club.name} -> found "${existing.name}"`
      );
    }
  }

  // 4. Fix location inconsistencies
  console.log("\n--- Fixing Location Inconsistencies ---\n");

  const clubsWithBadLocation = await prisma.club.findMany({
    where: {
      subRegion: "Derry",
      location: { contains: "United Kingdom" },
    },
  });

  let locationFixed = 0;
  for (const club of clubsWithBadLocation) {
    await prisma.club.update({
      where: { id: club.id },
      data: { location: "Derry, Ulster, Ireland" },
    });
    console.log(`✓ Fixed location: ${club.name}`);
    locationFixed++;
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Duplicates deleted: ${deleted}`);
  console.log(`Clubs moved to correct county: ${moved}`);
  console.log(`Missing clubs added: ${added}`);
  console.log(`Locations fixed: ${locationFixed}`);

  // Final count
  const derryClubs = await prisma.club.findMany({
    where: { subRegion: "Derry" },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== Final Derry Club List (${derryClubs.length}) ===\n`);
  derryClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixDerry()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
