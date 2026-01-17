import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function executeAssignments() {
  console.log("=== Executing North America Country Assignments ===\n");

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

  // Get all North America clubs missing country
  const clubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
      countryId: null,
    },
    select: { id: true, name: true, location: true },
  });

  console.log(`Clubs to process: ${clubs.length}\n`);

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

  let usCount = 0;
  let canadaCount = 0;
  let mexicoCount = 0;
  let caymanCount = 0;
  let unassigned = 0;

  for (const club of clubs) {
    const loc = club.location || "";
    const name = club.name;

    let countryId: string | null = null;
    let countryName = "";

    // Check for Cayman first (specific)
    if (name.includes("Cayman") || loc.includes("Cayman")) {
      countryId = cayman.id;
      countryName = "Cayman Island";
      caymanCount++;
    }
    // Check for Mexico
    else if (name.includes("Mexico") || loc.includes("Mexico")) {
      countryId = mexico.id;
      countryName = "Mexico";
      mexicoCount++;
    }
    // Check for Canada
    else if (canadaIndicators.some((ind) => loc.includes(ind))) {
      countryId = canada.id;
      countryName = "Canada";
      canadaCount++;
    }
    // Check for USA
    else if (usIndicators.some((ind) => loc.includes(ind))) {
      countryId = usa.id;
      countryName = "United States";
      usCount++;
    }

    if (countryId) {
      await prisma.club.update({
        where: { id: club.id },
        data: { countryId },
      });
      console.log(`  ✓ ${club.name} -> ${countryName}`);
    } else {
      console.log(`  ✗ UNASSIGNED: ${club.name} | ${loc}`);
      unassigned++;
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`United States: ${usCount}`);
  console.log(`Canada: ${canadaCount}`);
  console.log(`Mexico: ${mexicoCount}`);
  console.log(`Cayman Island: ${caymanCount}`);
  console.log(`Unassigned: ${unassigned}`);
  console.log(
    `Total updated: ${usCount + canadaCount + mexicoCount + caymanCount}`
  );
}

executeAssignments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
