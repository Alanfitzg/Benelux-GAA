import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixTyrone() {
  console.log("=== Fixing Tyrone GAA Clubs ===\n");

  // Get Ireland unit
  const ireland = await prisma.internationalUnit.findFirst({
    where: { name: "Ireland" },
  });

  if (!ireland) {
    console.log("Ireland unit not found");
    return;
  }

  let deleted = 0;
  let added = 0;

  // 1. Delete "Carrickmore GAA" duplicate (keep "Carrickmore St Colmcille's GAA")
  console.log("--- Fixing Carrickmore Duplicate ---\n");

  const carrickmoreGAA = await prisma.club.findFirst({
    where: { name: "Carrickmore GAA", subRegion: "Tyrone" },
  });

  const carrickmoreStColmcilles = await prisma.club.findFirst({
    where: { name: "Carrickmore St Colmcille's GAA", subRegion: "Tyrone" },
  });

  if (carrickmoreGAA && carrickmoreStColmcilles) {
    try {
      await prisma.club.delete({ where: { id: carrickmoreGAA.id } });
      console.log(
        '✓ Deleted "Carrickmore GAA" (keeping "Carrickmore St Colmcille\'s GAA")'
      );
      deleted++;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log('✗ Cannot delete "Carrickmore GAA" (has references)');
      }
    }
  } else if (carrickmoreGAA && !carrickmoreStColmcilles) {
    // Rename to the full name
    await prisma.club.update({
      where: { id: carrickmoreGAA.id },
      data: { name: "Carrickmore St Colmcille's GAA" },
    });
    console.log(
      '✓ Renamed "Carrickmore GAA" -> "Carrickmore St Colmcille\'s GAA"'
    );
  } else {
    console.log("Carrickmore duplicate already resolved or not found");
  }

  // 2. Add missing clubs
  console.log("\n--- Adding Missing Tyrone Clubs ---\n");

  const missingClubs = [
    { name: "Castlederg St Eugene's GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Cúchulainn an Ghleanna GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Dromore St Dympna's GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Drumragh Sarsfields GAA", location: "Tyrone, Ulster, Ireland" },
    {
      name: "Dúiche Néill An Bhinn Bhorb GAA",
      location: "Tyrone, Ulster, Ireland",
    },
    { name: "Dungannon Eoghan Ruadh GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Killyman St Mary's GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Naomh Columcille GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Naomh Eoghan GAA", location: "Tyrone, Ulster, Ireland" },
    {
      name: "Owen Roe O'Neill's Leckpatrick GAA",
      location: "Tyrone, Ulster, Ireland",
    },
    { name: "Strabane Shamrocks GAA", location: "Tyrone, Ulster, Ireland" },
    { name: "Tulach Óg GAA", location: "Tyrone, Ulster, Ireland" },
  ];

  for (const club of missingClubs) {
    // Check for exact match
    const existing = await prisma.club.findFirst({
      where: { name: club.name, subRegion: "Tyrone" },
    });

    if (!existing) {
      await prisma.club.create({
        data: {
          name: club.name,
          location: club.location,
          region: "Ulster",
          subRegion: "Tyrone",
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

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Duplicates deleted: ${deleted}`);
  console.log(`Missing clubs added: ${added}`);

  // Final count
  const tyroneClubs = await prisma.club.findMany({
    where: { subRegion: "Tyrone" },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== Final Tyrone Club List (${tyroneClubs.length}) ===\n`);
  tyroneClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixTyrone()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
