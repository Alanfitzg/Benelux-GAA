import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignCountry() {
  const nyUnit = await prisma.internationalUnit.findFirst({
    where: { name: "New York" },
  });
  const usa = await prisma.country.findFirst({
    where: { name: "United States" },
  });

  if (!nyUnit || !usa) {
    console.log("Not found:", { nyUnit: !!nyUnit, usa: !!usa });
    return;
  }

  // Get all NY clubs missing country
  const clubs = await prisma.club.findMany({
    where: {
      internationalUnitId: nyUnit.id,
      countryId: null,
    },
    select: { id: true, name: true },
  });

  console.log("NY clubs missing country:", clubs.length);

  // Update all to USA
  const result = await prisma.club.updateMany({
    where: {
      internationalUnitId: nyUnit.id,
      countryId: null,
    },
    data: { countryId: usa.id },
  });

  console.log("Updated:", result.count, "clubs");

  // Verify they're still in NY unit
  const verify = await prisma.club.count({
    where: { internationalUnitId: nyUnit.id },
  });
  console.log("Total in New York unit:", verify);
}

assignCountry()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
