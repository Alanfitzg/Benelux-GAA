import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const europeanCountries = [
    "France",
    "Germany",
    "Spain",
    "Italy",
    "Netherlands",
    "Belgium",
    "Austria",
    "Switzerland",
    "Poland",
    "Czech Republic",
    "Portugal",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Luxembourg",
    "Hungary",
    "Croatia",
    "Greece",
    "Romania",
    "Bulgaria",
    "Slovakia",
    "Slovenia",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Malta",
    "Cyprus",
    "Iceland",
    "Russia",
    "Gibraltar",
  ];

  const clubs = await prisma.club.findMany({
    where: {
      OR: [
        { country: { name: { in: europeanCountries } } },
        { internationalUnit: { name: "Europe" } },
      ],
    },
    select: {
      id: true,
      name: true,
      region: true,
      country: { select: { name: true } },
      internationalUnit: { select: { name: true } },
    },
  });

  console.log(`Found ${clubs.length} European clubs to update\n`);

  let updated = 0;
  for (const club of clubs) {
    if (club.region !== "Europe") {
      const oldRegion = club.region || "(null)";
      console.log(`  ${club.name}`);
      console.log(`    ${oldRegion} → Europe`);

      await prisma.club.update({
        where: { id: club.id },
        data: { region: "Europe" },
      });
      updated++;
    }
  }

  console.log(`\nUpdated ${updated} clubs to region "Europe"`);

  // Verify
  const verifyCount = await prisma.club.count({
    where: {
      region: "Europe",
    },
  });
  console.log(`Total clubs with region "Europe": ${verifyCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
