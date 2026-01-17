import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fix() {
  // Find all clubs with "Michael" in name (catches different apostrophe styles)
  const dupes = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "Canada" },
      name: { contains: "Michael" },
    },
    select: { id: true, name: true, location: true },
  });

  console.log("Found St. Michaels:", dupes.length);
  dupes.forEach((d) => console.log("  " + d.id + " | " + d.location));

  if (dupes.length > 1) {
    // Keep the one with better location (Ontario)
    const toKeep =
      dupes.find((c) => c.location?.includes("Ontario")) || dupes[0];
    console.log("Keeping:", toKeep.id);

    for (const d of dupes) {
      if (d.id === toKeep.id) continue;
      await prisma.club.delete({ where: { id: d.id } });
      console.log("Deleted:", d.id);
    }
  }

  const count = await prisma.club.count({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "Canada" },
    },
  });
  console.log("\nCanada total:", count);
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
