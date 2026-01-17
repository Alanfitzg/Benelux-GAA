import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateMexico() {
  const northAmerica = await prisma.internationalUnit.findFirst({
    where: { name: "North America" },
  });

  const mexico = await prisma.country.findFirst({
    where: { name: "Mexico" },
  });

  if (!northAmerica || !mexico) {
    console.log("Not found:", {
      northAmerica: !!northAmerica,
      mexico: !!mexico,
    });
    return;
  }

  console.log("Moving Mexico from South America to North America...");

  await prisma.country.update({
    where: { id: mexico.id },
    data: { internationalUnitId: northAmerica.id },
  });

  console.log("Mexico updated successfully");

  // Verify
  const verify = await prisma.internationalUnit.findFirst({
    where: { name: "North America" },
    include: {
      countries: { select: { name: true }, orderBy: { name: "asc" } },
    },
  });

  console.log("\nNorth America countries now:");
  verify?.countries?.forEach((c) => console.log(`  - ${c.name}`));
}

updateMexico()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
