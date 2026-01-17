import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// USGAA clubs missing from database with their division/location info
const missingClubs = [
  // Central Division (Chicago area)
  {
    name: "CuChulainns Hurling Club",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "Harry Bolands",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "John McBrides GFC",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "Na Aisling Gaels",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "St. Brigid's LGFC",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "Erin's Rovers",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "James Joyce GFC",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "Michael Cusack Hurling Club",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "Padraig Pearses",
    region: "Central Division",
    location: "Chicago, IL",
  },
  { name: "Patriots GFC", region: "Central Division", location: "Chicago, IL" },
  {
    name: "St. Brendan's GFC",
    region: "Central Division",
    location: "Chicago, IL",
  },
  {
    name: "St. Mary's Camogie",
    region: "Central Division",
    location: "Chicago, IL",
  },

  // Heartland Division
  {
    name: "Miltown Gaels",
    region: "Heartland Division",
    location: "Heartland, USA",
  },
  {
    name: "Milwaukee Hurling Club",
    region: "Heartland Division",
    location: "Milwaukee, WI",
  },
  {
    name: "St. Louis GAC",
    region: "Heartland Division",
    location: "St. Louis, MO",
  },

  // Midwest Division
  {
    name: "Cleveland St Pats/St Jarlaths",
    region: "Midwest Division",
    location: "Cleveland, OH",
  },
  {
    name: "Columbus GFC",
    region: "Midwest Division",
    location: "Columbus, OH",
  },
  {
    name: "Detroit Wolfetones",
    region: "Midwest Division",
    location: "Detroit, MI",
  },
  {
    name: "Pittsburgh Pucas Hurling",
    region: "Midwest Division",
    location: "Pittsburgh, PA",
  },
  {
    name: "Roc City Gaelic",
    region: "Midwest Division",
    location: "Rochester, NY",
  },

  // Northeast Division (Boston area)
  {
    name: "Shannon Blues GFC",
    region: "Northeast Division",
    location: "Boston, MA",
  },
  {
    name: "New Hampshire Wolves",
    region: "Northeast Division",
    location: "New Hampshire",
  },
  {
    name: "Wolfetones GFC",
    region: "Northeast Division",
    location: "Boston, MA",
  },

  // Northwest Division
  {
    name: "Grit City Hounds",
    region: "Northwest Division",
    location: "Tacoma, WA",
  },
  {
    name: "Thomas Meagher Hurling Club",
    region: "Northwest Division",
    location: "Montana",
  },

  // Philadelphia Division
  {
    name: "Na Toraidhe Hurling",
    region: "Philadelphia Division",
    location: "Philadelphia, PA",
  },
  {
    name: "South Jersey Hurling",
    region: "Philadelphia Division",
    location: "New Jersey",
  },
  {
    name: "Kevin Barry GFC",
    region: "Philadelphia Division",
    location: "Philadelphia, PA",
  },
  {
    name: "Notre Dame Ladies GFC",
    region: "Philadelphia Division",
    location: "Philadelphia, PA",
  },
  {
    name: "St. Patricks/Donegal",
    region: "Philadelphia Division",
    location: "Philadelphia, PA",
  },

  // Southeast Division
  {
    name: "Atlanta Clan na nGael",
    region: "Southeast Division",
    location: "Atlanta, GA",
  },
  {
    name: "Cayman Islands GFC",
    region: "Southeast Division",
    location: "Cayman Islands",
  },

  // Southwest Division
  {
    name: "Flagstaff Mountainhounds",
    region: "Southwest Division",
    location: "Flagstaff, AZ",
  },
  {
    name: "Mulhollands Ladies Gaelic Football",
    region: "Southwest Division",
    location: "Los Angeles, CA",
  },
  {
    name: "St. Peters Hurling",
    region: "Southwest Division",
    location: "Southwest, USA",
  },
  {
    name: "Wild Geese GFC",
    region: "Southwest Division",
    location: "Southwest, USA",
  },

  // Western Division (San Francisco area)
  {
    name: "Clan na Gael",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Cu Chulainn Camogie",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Irish Football Youth League",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Na Fianna",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Naomh Padraig",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Pearse Og's",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Sean Treacys",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Sons of Boru/Celts",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  {
    name: "Tipperary Hurling Club",
    region: "Western Division",
    location: "San Francisco, CA",
  },
  { name: "Ulster", region: "Western Division", location: "San Francisco, CA" },
  {
    name: "Young Irelanders/St Brendans",
    region: "Western Division",
    location: "San Francisco, CA",
  },
];

async function addMissingClubs() {
  console.log("=== Adding Missing USGAA Clubs ===\n");

  // Get North America international unit
  const northAmerica = await prisma.internationalUnit.findFirst({
    where: { name: "North America" },
  });

  if (!northAmerica) {
    console.error("North America international unit not found!");
    return;
  }

  // Get United States country
  const usa = await prisma.country.findFirst({
    where: { name: "United States" },
  });

  // Get Cayman Island country
  const cayman = await prisma.country.findFirst({
    where: { name: "Cayman Island" },
  });

  if (!usa) {
    console.error("United States not found!");
    return;
  }

  let added = 0;
  let skipped = 0;

  for (const club of missingClubs) {
    // Check if club already exists
    const existing = await prisma.club.findFirst({
      where: {
        name: club.name,
        internationalUnitId: northAmerica.id,
      },
    });

    if (existing) {
      console.log(`  - SKIPPED (exists): ${club.name}`);
      skipped++;
      continue;
    }

    // Determine country
    const countryId = club.location.includes("Cayman") ? cayman?.id : usa.id;

    await prisma.club.create({
      data: {
        name: club.name,
        location: club.location,
        region: club.region,
        internationalUnitId: northAmerica.id,
        countryId: countryId,
        clubType: "CLUB",
      },
    });

    console.log(`  ✓ Added: ${club.name} (${club.region})`);
    added++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (already exist): ${skipped}`);

  // Verify total count
  const totalNA = await prisma.club.count({
    where: { internationalUnit: { name: "North America" } },
  });
  const totalUS = await prisma.club.count({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "United States" },
    },
  });

  console.log(`\nTotal North America clubs: ${totalNA}`);
  console.log(`Total US clubs: ${totalUS}`);
}

addMissingClubs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
