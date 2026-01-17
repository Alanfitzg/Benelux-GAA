import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMonaghan() {
  console.log("=== Fixing Monaghan GAA Clubs ===\n");

  let fixed = 0;

  // 1. Fix Kileevan spelling (should be Killeevan with double 'l')
  console.log("--- Fixing Spelling Issues ---\n");

  const kileevan = await prisma.club.findFirst({
    where: { name: "Kileevan Sarsfields GAA", subRegion: "Monaghan" },
  });

  if (kileevan) {
    await prisma.club.update({
      where: { id: kileevan.id },
      data: { name: "Killeevan Sarsfields GAA" },
    });
    console.log(
      '✓ Fixed: "Kileevan Sarsfields GAA" -> "Killeevan Sarsfields GAA"'
    );
    fixed++;
  } else {
    console.log("Kileevan already fixed or not found");
  }

  // Note: Seán Mac Diarmada is the correct Irish name for Sean McDermotts
  // No change needed - keeping the Irish version
  console.log("\n--- Verification ---\n");
  console.log(
    'Note: "Seán Mac Diarmada GAA" = "Sean McDermotts" (Irish language name - keeping as is)'
  );
  console.log(
    'Note: "Monaghan Institute GAA" is a third-level college club (keeping as is)'
  );

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Spelling fixes: ${fixed}`);

  // Final count
  const monaghanClubs = await prisma.club.findMany({
    where: { subRegion: "Monaghan" },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== Final Monaghan Club List (${monaghanClubs.length}) ===\n`);
  monaghanClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
}

fixMonaghan()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
