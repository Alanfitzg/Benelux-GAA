import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("=== Cleaning up Australasia Duplicates ===\n");

  const aus = await prisma.internationalUnit.findFirst({
    where: { name: "Australasia" },
  });
  if (!aus) {
    console.log("Australasia unit not found");
    return;
  }

  let merged = 0;

  // Helper to safely delete a club
  async function safeDelete(name: string) {
    const club = await prisma.club.findFirst({
      where: { name, internationalUnitId: aus.id },
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

  // Na Fianna Adelaide duplicates - keep "Na Fianna Adelaide", delete "Na Fianna" (generic name)
  console.log("--- Na Fianna Adelaide duplicates ---");
  const naFiannaGeneric = await prisma.club.findFirst({
    where: { name: "Na Fianna", internationalUnitId: aus.id },
  });
  const naFiannaAdelaide = await prisma.club.findFirst({
    where: { name: "Na Fianna Adelaide", internationalUnitId: aus.id },
  });

  if (naFiannaGeneric && naFiannaAdelaide) {
    // Both exist, delete the generic one
    if (await safeDelete("Na Fianna")) {
      console.log('✓ Deleted "Na Fianna" (keeping "Na Fianna Adelaide")');
      merged++;
    }
  } else if (naFiannaGeneric && !naFiannaAdelaide) {
    // Only generic exists, rename it
    await prisma.club.update({
      where: { id: naFiannaGeneric.id },
      data: { name: "Na Fianna Adelaide" },
    });
    console.log('✓ Renamed "Na Fianna" -> "Na Fianna Adelaide"');
    merged++;
  }

  // Na Fianna Queensland - rename to be clearer
  const naFiannaQld = await prisma.club.findFirst({
    where: { name: "Na Fianna (Queensland)", internationalUnitId: aus.id },
  });
  if (naFiannaQld) {
    await prisma.club.update({
      where: { id: naFiannaQld.id },
      data: { name: "Na Fianna Brisbane" },
    });
    console.log('✓ Renamed "Na Fianna (Queensland)" -> "Na Fianna Brisbane"');
    merged++;
  }

  // Na Fianna Tasmania - rename to be clearer
  const naFiannaTas = await prisma.club.findFirst({
    where: { name: "Na Fianna GFC (Tasmania)", internationalUnitId: aus.id },
  });
  if (naFiannaTas) {
    await prisma.club.update({
      where: { id: naFiannaTas.id },
      data: { name: "Na Fianna Tasmania" },
    });
    console.log('✓ Renamed "Na Fianna GFC (Tasmania)" -> "Na Fianna Tasmania"');
    merged++;
  }

  // Hobart Celts - simplify name
  const hobartCelts = await prisma.club.findFirst({
    where: { name: "Hobart Celts GFC/LGFC", internationalUnitId: aus.id },
  });
  if (hobartCelts) {
    await prisma.club.update({
      where: { id: hobartCelts.id },
      data: { name: "Hobart Celts" },
    });
    console.log('✓ Renamed "Hobart Celts GFC/LGFC" -> "Hobart Celts"');
    merged++;
  }

  // Fix Auckland club name
  const stPatsAuckland = await prisma.club.findFirst({
    where: {
      name: "St Pats Emerald City (Auckland)",
      internationalUnitId: aus.id,
    },
  });
  if (stPatsAuckland) {
    await prisma.club.update({
      where: { id: stPatsAuckland.id },
      data: { name: "St Patrick's Emerald City" },
    });
    console.log(
      '✓ Renamed "St Pats Emerald City (Auckland)" -> "St Patrick\'s Emerald City"'
    );
    merged++;
  }

  // Fix Onkaparinga trailing space
  const onkaparinga = await prisma.club.findFirst({
    where: { name: { startsWith: "Onkaparinga" }, internationalUnitId: aus.id },
  });
  if (onkaparinga && onkaparinga.name.trim() !== onkaparinga.name) {
    await prisma.club.update({
      where: { id: onkaparinga.id },
      data: { name: onkaparinga.name.trim() },
    });
    console.log('✓ Fixed trailing space: "Onkaparinga Gaelic Football Club"');
    merged++;
  }

  console.log("\n=== Summary ===");
  console.log(`Changes: ${merged}`);

  // Final list
  console.log("\n=== Final Australasia Club List ===\n");
  const clubs = await prisma.club.findMany({
    where: { internationalUnitId: aus.id },
    include: { country: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  // Group by country
  const byCountry: Record<string, typeof clubs> = {};
  for (const c of clubs) {
    const country = c.country?.name || "Unknown";
    if (!byCountry[country]) byCountry[country] = [];
    byCountry[country].push(c);
  }

  for (const [country, clubList] of Object.entries(byCountry).sort()) {
    console.log(`${country} (${clubList.length}):`);
    for (const c of clubList) {
      console.log(`  - ${c.name}`);
    }
    console.log("");
  }

  const total = await prisma.club.count({
    where: { internationalUnitId: aus.id },
  });
  console.log(`Total: ${total}`);
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
