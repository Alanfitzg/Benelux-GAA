import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log("=== North America Duplicate Cleanup ===\n");

  // Helper to safely delete a club
  async function safeDelete(name: string, location?: string) {
    try {
      const whereClause: {
        name: string;
        internationalUnit: { name: string };
        location?: string;
      } = {
        name,
        internationalUnit: { name: "North America" },
      };
      if (location) {
        whereClause.location = location;
      }

      const club = await prisma.club.findFirst({ where: whereClause });
      if (club) {
        await prisma.club.delete({ where: { id: club.id } });
        console.log(`  ✓ Deleted: ${name}${location ? ` (${location})` : ""}`);
        return true;
      }
      return false;
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "P2003") {
        console.log(`  ✗ SKIPPED (FK constraint): ${name}`);
      } else {
        console.log(
          `  ✗ Error deleting ${name}: ${e instanceof Error ? e.message : String(e)}`
        );
      }
      return false;
    }
  }

  // 1. Tampa Bay GAA - Remove the Florida, USA one (keep Southeast Division one with better structure)
  console.log("\n1. Tampa Bay GAA duplicates:");
  await safeDelete("Tampa Bay GAA", "Florida, USA");

  // 2. Houston Gaels - Remove the one without GAA suffix
  console.log("\n2. Houston Gaels duplicates:");
  await safeDelete(
    "Houston Gaels",
    "Texas, Southwest Division, Southwest Division, United States"
  );

  // 3. Milwaukee Hurling Club - Remove the one without GAA suffix
  console.log("\n3. Milwaukee Hurling Club duplicates:");
  await safeDelete("Milwaukee Hurling Club", "Milwaukee, WI, United States");

  // 4. Portland Eireannach - Remove the one without GAA suffix
  console.log("\n4. Portland Eireannach duplicates:");
  await safeDelete(
    "Portland Eireannach",
    "Oregon, North Western Division, North Western Division, United States"
  );

  // 5. San Diego Setanta - Remove the one without GAA suffix
  console.log("\n5. San Diego Setanta duplicates:");
  await safeDelete(
    "San Diego Setanta",
    "California, Southwest Division, Southwest Division, United States"
  );

  // 6. Seattle Gaels - Remove the one without GAA suffix
  console.log("\n6. Seattle Gaels duplicates:");
  await safeDelete(
    "Seattle Gaels",
    "Washington, North Western Division, North Western Division, United States"
  );

  // 7. St. John's Avalon Harps - Remove the one without GAA suffix
  console.log("\n7. St. John's Avalon Harps duplicates:");
  await safeDelete(
    "St. John's Avalon Harps",
    "St. John's, Newfoundland and Labrador, Canada"
  );

  // 8. Clann na nGael Hurling Club - San Francisco one has wrong subRegion (Canada), delete it
  console.log(
    "\n8. Clann na nGael Hurling Club (San Francisco with wrong data):"
  );
  await safeDelete(
    "Clann na nGael Hurling Club",
    "San Francisco, CA, United States"
  );

  // 9. Galway Boston - Keep both as they serve different purposes (one is hurling specific)
  console.log(
    "\n9. Galway Boston - Keeping both (Galway Boston GAA and Galway Hurling Club Boston GAA are different)"
  );

  // Final count
  console.log("\n\n=== Final Count ===");
  const finalCount = await prisma.club.count({
    where: { internationalUnit: { name: "North America" } },
  });
  console.log(`North America clubs: ${finalCount}`);
}

cleanupDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
