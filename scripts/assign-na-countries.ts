import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignCountries() {
  console.log("=== North America Country Assignment (DRY RUN) ===\n");

  // Get country IDs
  const usa = await prisma.country.findFirst({
    where: { name: "United States" },
  });
  const canada = await prisma.country.findFirst({ where: { name: "Canada" } });
  const mexico = await prisma.country.findFirst({ where: { name: "Mexico" } });
  const cayman = await prisma.country.findFirst({
    where: { name: "Cayman Island" },
  });

  if (!usa || !canada || !mexico || !cayman) {
    console.error("Missing countries:", {
      usa: !!usa,
      canada: !!canada,
      mexico: !!mexico,
      cayman: !!cayman,
    });
    return;
  }

  console.log("Country IDs found:");
  console.log(`  United States: ${usa.id}`);
  console.log(`  Canada: ${canada.id}`);
  console.log(`  Mexico: ${mexico.id}`);
  console.log(`  Cayman Island: ${cayman.id}`);

  // Get all North America clubs missing country
  const clubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
      countryId: null,
    },
    select: { id: true, name: true, location: true },
    orderBy: { name: "asc" },
  });

  console.log(`\nClubs missing country: ${clubs.length}\n`);

  // US indicators
  const usIndicators = [
    "USA",
    "United States",
    "Boston",
    "Chicago",
    "Philadelphia",
    "San Francisco",
    "New York",
    "Florida",
    "Texas",
    "California",
    "Arizona",
    "Colorado",
    "Georgia",
    "Ohio",
    "Michigan",
    "Wisconsin",
    "Minnesota",
    "Missouri",
    "Indiana",
    "Tennessee",
    "North Carolina",
    "South Carolina",
    "Virginia",
    "Maryland",
    "Massachusetts",
    "Connecticut",
    "Rhode Island",
    "New Hampshire",
    "Maine",
    "Oregon",
    "Washington",
    "Montana",
    "Arkansas",
    "Oklahoma",
    "Kansas",
    "Nevada",
    "Midwest",
    "Mid-Atlantic",
    "South Central",
    "Southwest",
    "South,",
    "Twin Cities",
    ", IL",
    ", CA",
    ", TX",
    ", OH",
    ", MI",
    ", WI",
    ", MN",
    ", MO",
    ", IN",
    ", TN",
    ", NC",
    ", SC",
    ", VA",
    ", MD",
    ", MA",
    ", CT",
    ", RI",
    ", NH",
    ", ME",
    ", OR",
    ", WA",
    ", MT",
    ", AR",
    ", OK",
    ", KS",
    ", NV",
    ", GA",
    ", FL",
    ", AZ",
    ", CO",
    ", NJ",
    ", NY",
    ", PA",
  ];

  // Canada indicators
  const canadaIndicators = [
    "Canada",
    "Ontario",
    "British Columbia",
    "Alberta",
    "Quebec",
    "Québec",
    "Manitoba",
    "Saskatchewan",
    "Nova Scotia",
    "New Brunswick",
    "Newfoundland",
    "Prince Edward Island",
    "Toronto",
    "Vancouver",
    "Calgary",
    "Edmonton",
    "Ottawa",
    "Montreal",
    "Winnipeg",
    "Halifax",
    "Eastern Canada",
    "Western Canada",
  ];

  const assignments: {
    club: string;
    country: string;
    countryId: string;
    location: string;
  }[] = [];
  const unassigned: { club: string; location: string }[] = [];

  for (const club of clubs) {
    const loc = club.location || "";
    const name = club.name;

    let assignedCountry: { name: string; id: string } | null = null;

    // Check for Cayman first (specific)
    if (name.includes("Cayman") || loc.includes("Cayman")) {
      assignedCountry = { name: "Cayman Island", id: cayman.id };
    }
    // Check for Mexico
    else if (name.includes("Mexico") || loc.includes("Mexico")) {
      assignedCountry = { name: "Mexico", id: mexico.id };
    }
    // Check for Canada
    else if (canadaIndicators.some((ind) => loc.includes(ind))) {
      assignedCountry = { name: "Canada", id: canada.id };
    }
    // Check for USA
    else if (usIndicators.some((ind) => loc.includes(ind))) {
      assignedCountry = { name: "United States", id: usa.id };
    }

    if (assignedCountry) {
      assignments.push({
        club: club.name,
        country: assignedCountry.name,
        countryId: assignedCountry.id,
        location: loc,
      });
    } else {
      unassigned.push({ club: club.name, location: loc });
    }
  }

  // Print assignments by country
  console.log("=== PROPOSED ASSIGNMENTS ===\n");

  const byCountry = assignments.reduce(
    (acc, a) => {
      if (!acc[a.country]) acc[a.country] = [];
      acc[a.country].push(a);
      return acc;
    },
    {} as Record<string, typeof assignments>
  );

  for (const [country, clubs] of Object.entries(byCountry).sort()) {
    console.log(`\n--- ${country} (${clubs.length} clubs) ---`);
    clubs.forEach((c) => console.log(`  ${c.club}`));
  }

  if (unassigned.length > 0) {
    console.log(`\n\n=== UNASSIGNED (${unassigned.length}) ===`);
    unassigned.forEach((c) => console.log(`  ${c.club} | ${c.location}`));
  }

  console.log("\n\n=== SUMMARY ===");
  console.log(`Total to assign: ${assignments.length}`);
  console.log(`Unassigned: ${unassigned.length}`);
  Object.entries(byCountry)
    .sort()
    .forEach(([country, clubs]) => {
      console.log(`  ${country}: ${clubs.length}`);
    });

  console.log("\n*** DRY RUN - No changes made ***");
  console.log("Review the assignments above before proceeding.");
}

assignCountries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
