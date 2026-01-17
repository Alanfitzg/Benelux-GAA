import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixNames() {
  console.log("=== Fixing Middle East Club Names ===\n");

  const me = await prisma.internationalUnit.findFirst({
    where: { name: "Middle East" },
  });
  if (!me) {
    console.log("Middle East unit not found");
    return;
  }

  // Name corrections based on official MEGAA website
  const renames: { from: string; to: string }[] = [
    { from: "Abu Dhabi na Fianna", to: "AD Na Fianna" },
    { from: "Al Ain", to: "Al Ain GAA Club" },
    { from: "Clan na hOman", to: "Clann na hOman" },
    { from: "Kerry Middle East GAA", to: "Kerry Middle East" },
    { from: "Laochra Gaels", to: "Laochra DXB" },
    { from: "Naomh Alee Riyadh", to: "Naomh Alee" },
    { from: "Qatar GAA Oryx na hÉireann", to: "Oryx na hÉireann" },
  ];

  let renamed = 0;
  for (const r of renames) {
    const club = await prisma.club.findFirst({
      where: { name: r.from, internationalUnitId: me.id },
    });

    if (club) {
      await prisma.club.update({
        where: { id: club.id },
        data: { name: r.to },
      });
      console.log(`✓ Renamed: "${r.from}" -> "${r.to}"`);
      renamed++;
    } else {
      console.log(`? Not found: "${r.from}"`);
    }
  }

  console.log("\n=== Extra Clubs (Not in Official List) ===\n");

  // These are in our database but not in official MEGAA list
  const extras = ["Oman GAA", "Sharjah Wanderers Ladies Gaelic Football Club"];
  for (const name of extras) {
    const club = await prisma.club.findFirst({
      where: { name, internationalUnitId: me.id },
    });
    if (club) {
      console.log(`- ${name} (${club.location})`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Renamed: ${renamed}`);

  // Final list
  console.log("\n=== Final Club List ===\n");
  const clubs = await prisma.club.findMany({
    where: { internationalUnitId: me.id },
    include: { country: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  for (const c of clubs) {
    console.log(`${c.name} - ${c.country?.name || "No country"}`);
  }
  console.log(`\nTotal: ${clubs.length}`);
}

fixNames()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
