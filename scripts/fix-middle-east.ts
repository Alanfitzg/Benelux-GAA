import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMiddleEast() {
  console.log("=== Fixing Middle East Clubs ===\n");

  const me = await prisma.internationalUnit.findFirst({
    where: { name: "Middle East" },
  });
  if (!me) {
    console.log("Middle East unit not found");
    return;
  }

  // Get all countries
  const uae = await prisma.country.findFirst({
    where: { name: "UAE", internationalUnitId: me.id },
  });
  const oman = await prisma.country.findFirst({
    where: { name: "Oman", internationalUnitId: me.id },
  });
  const kuwait = await prisma.country.findFirst({
    where: { name: "Kuwait", internationalUnitId: me.id },
  });
  const qatar = await prisma.country.findFirst({
    where: { name: "Qatar", internationalUnitId: me.id },
  });
  const saudiArabia = await prisma.country.findFirst({
    where: { name: "Saudi Arabia", internationalUnitId: me.id },
  });

  if (!uae || !oman || !kuwait || !qatar || !saudiArabia) {
    console.log("Missing countries:", {
      uae: !!uae,
      oman: !!oman,
      kuwait: !!kuwait,
      qatar: !!qatar,
      saudiArabia: !!saudiArabia,
    });
    return;
  }

  // Club assignments based on location
  const assignments: { name: string; countryId: string; location?: string }[] =
    [
      {
        name: "Abu Dhabi na Fianna",
        countryId: uae.id,
        location: "Abu Dhabi, UAE",
      },
      { name: "Al Ain", countryId: uae.id, location: "Abu Dhabi, UAE" },
      {
        name: "Al Reem Shamrocks",
        countryId: uae.id,
        location: "Abu Dhabi, UAE",
      },
      { name: "Arabian Celts", countryId: uae.id, location: "Dubai, UAE" }, // Generic Middle East - assume Dubai
      { name: "Donegal Dubai", countryId: uae.id, location: "Dubai, UAE" },
      { name: "Dubai Celts", countryId: uae.id, location: "Dubai, UAE" },
      { name: "Dubai Eire Og", countryId: uae.id, location: "Dubai, UAE" },
      { name: "Jumeirah Gaels", countryId: uae.id, location: "Dubai, UAE" },
      {
        name: "RAK Ropairí",
        countryId: uae.id,
        location: "Ras Al Khaimah, UAE",
      },
      { name: "Sharjah Gaels", countryId: uae.id, location: "Sharjah, UAE" },
      {
        name: "Sharjah Wanderers Ladies Gaelic Football Club",
        countryId: uae.id,
        location: "Sharjah, UAE",
      },
      {
        name: "Kuwait Harps",
        countryId: kuwait.id,
        location: "Kuwait City, Kuwait",
      },
      {
        name: "Qatar GAA Oryx na hÉireann",
        countryId: qatar.id,
        location: "Doha, Qatar",
      },
      {
        name: "Naomh Alee Riyadh",
        countryId: saudiArabia.id,
        location: "Riyadh, Saudi Arabia",
      },
      { name: "Clan na hOman", countryId: oman.id, location: "Muscat, Oman" },
      { name: "Oman GAA", countryId: oman.id, location: "Muscat, Oman" },
      // Generic Middle East clubs - need to determine
      {
        name: "Kerry Middle East GAA",
        countryId: uae.id,
        location: "Dubai, UAE",
      }, // Assume Dubai
      { name: "Laochra Gaels", countryId: uae.id, location: "Dubai, UAE" }, // Assume Dubai
    ];

  let updated = 0;
  let fixed = 0;

  for (const assignment of assignments) {
    const club = await prisma.club.findFirst({
      where: { name: assignment.name, internationalUnitId: me.id },
    });

    if (club) {
      const updateData: { countryId: string; location?: string } = {
        countryId: assignment.countryId,
      };

      // Also fix location if provided and different
      if (assignment.location && club.location !== assignment.location) {
        updateData.location = assignment.location;
        fixed++;
      }

      await prisma.club.update({
        where: { id: club.id },
        data: updateData,
      });

      const countryName =
        assignment.countryId === uae.id
          ? "UAE"
          : assignment.countryId === oman.id
            ? "Oman"
            : assignment.countryId === kuwait.id
              ? "Kuwait"
              : assignment.countryId === qatar.id
                ? "Qatar"
                : "Saudi Arabia";

      console.log(
        `✓ ${assignment.name} -> ${countryName}${updateData.location ? ` (location fixed)` : ""}`
      );
      updated++;
    } else {
      console.log(`? NOT FOUND: ${assignment.name}`);
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Updated: ${updated}`);
  console.log(`Locations fixed: ${fixed}`);

  // Final count by country
  const final = await prisma.club.groupBy({
    by: ["countryId"],
    where: { internationalUnitId: me.id },
    _count: true,
  });

  console.log("\nBy Country:");
  for (const f of final) {
    if (f.countryId) {
      const country = await prisma.country.findUnique({
        where: { id: f.countryId },
      });
      console.log(`  ${country?.name}: ${f._count}`);
    } else {
      console.log(`  No country: ${f._count}`);
    }
  }

  const total = await prisma.club.count({
    where: { internationalUnitId: me.id },
  });
  console.log(`\nTotal Middle East clubs: ${total}`);
}

fixMiddleEast()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
