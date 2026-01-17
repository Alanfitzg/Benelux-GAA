import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Official USGAA clubs by division (from usgaa.org)
const usgaaClubs = {
  "Central Division": [
    "CuChulainns Hurling Club",
    "Harry Bolands",
    "John McBrides GFC",
    "Na Aisling Gaels",
    "Parnell's GFC",
    "St. Brigid's LGFC",
    "Wolfe Tones",
    "Erin's Rovers",
    "James Joyce GFC",
    "Limerick Hurling Club",
    "Michael Cusack Hurling Club",
    "Padraig Pearses",
    "Patriots GFC",
    "St. Brendan's GFC",
    "St. Mary's Camogie",
  ],
  "Heartland Division": [
    "Fox River Hurling Club",
    "Indianapolis GAA",
    "Kansas City GAC",
    "Hurling Club of Madison",
    "Miltown Gaels",
    "Milwaukee Hurling Club",
    "Naperville Hurling Club",
    "St. Louis GAC",
    "Twin Cities GFC",
    "Tulsa GAC",
    "Robert Emmets Hurling",
  ],
  "Mid-Atlantic Division": [
    "Baltimore Bohemians",
    "Richmond Battery GAA",
    "Michael Collins GAA",
    "Washington, D.C. Gaels",
    "Coastal Virginia",
  ],
  "Midwest Division": [
    "Akron Celtic Guards",
    "Albany Rebels",
    "Buffalo Fenians",
    "Cincinnati GAA",
    "Cleveland St Pats/St Jarlaths",
    "Columbus GFC",
    "Detroit Wolfetones",
    "Kalamazoo GAA",
    "Pittsburgh GAA",
    "Pittsburgh Pucas Hurling",
    "Roc City Gaelic",
    "Syracuse GAA",
  ],
  "Northeast Division": [
    "Aidan McAnespie's GFC",
    "Boston Shamrocks",
    "Connacht Ladies LGFC",
    "Cork Boston GFC",
    "Fr. Tom Burke's Hurling Club",
    "Galway Boston Hurling Club",
    "Kerry Boston GFC",
    "Portland Hurling Club",
    "Portland Gaelic Football Club",
    "Sean Og's GAA Club",
    "Shannon Blues GFC",
    "Tir Na Nog LGFC",
    "New Hampshire Wolves",
    "Christophers GFC",
    "Connemara Gaels GFC",
    "Donegal Boston GFC",
    "Galway Boston GFC",
    "Hartford GAA",
    "Offaly Boston Hurling Club",
    "Providence Hurling Club",
    "Tipperary Boston Hurling Club",
    "Wexford Boston Hurling Club",
    "Worcester GAA Club",
    "Wolfetones GFC",
  ],
  "Northwest Division": [
    "Seattle Gaels",
    "Tacoma Rangers",
    "Columbia Red Branch",
    "Grit City Hounds",
    "Portland Eireannach",
    "Willamette Valley Nomads Hurling Club",
    "Thomas Meagher Hurling Club",
    "Butte Wolfe Tones",
  ],
  "Philadelphia Division": [
    "Allentown Hibernians Hurling Club",
    "Na Toraidhe Hurling",
    "Shamrocks",
    "Young Irelanders GFC",
    "South Jersey Hurling",
    "Kevin Barry GFC",
    "Notre Dame Ladies GFC",
    "St. Patricks/Donegal",
    "Delco Gaels GAC",
    "Jersey Shore GAA Club",
  ],
  "Southeast Division": [
    "Atlanta Clan na nGael",
    "Augusta Gaelic Sports Club",
    "Cayman Islands GFC",
    "Charleston Hurling Club",
    "Charlotte GAA",
    "Greenville Gaels",
    "Knoxville GAC",
    "Little Rock GAC",
    "Memphis GAA",
    "Nashville GAC",
    "Orlando GAA",
    "Raleigh GAA",
    "Red Wolves Hurling Club",
    "Savannah GAA",
    "Winston-Salem GAA",
    "Tampa Bay GAA",
  ],
  "Southwest Division": [
    "Austin Celtic Cowboys",
    "Dallas Fionn Mac Cumhaills",
    "Denver Gaels",
    "Flagstaff Mountainhounds",
    "Houston Gaels",
    "LA Cougars",
    "Los Angeles Hurling Club",
    "Los San Patricios GAA Club, Mexico City",
    "Mulhollands Ladies Gaelic Football",
    "Phoenix Gaels",
    "Regulators Hurling Club",
    "San Antonio GAC",
    "San Diego Na Fianna",
    "San Diego Setanta",
    "St. Peters Hurling",
    "Wild Geese GFC",
  ],
  "Western Division": [
    "Clan na Gael",
    "Cú Chulainn Camogie",
    "Eire Og",
    "Fog City Harps",
    "Irish Football Youth League",
    "Michael Cusack's",
    "Na Fianna",
    "Naomh Padraig",
    "Pearse Og's",
    "Sean Treacys",
    "Sons of Boru/Celts",
    "St. Joseph's",
    "Tipperary Hurling Club",
    "Ulster",
    "Young Irelanders/St Brendans",
  ],
};

async function compare() {
  console.log("=== USGAA Comparison ===\n");

  // Get all US clubs from database
  const dbClubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "United States" },
    },
    select: { id: true, name: true, location: true, region: true },
    orderBy: { name: "asc" },
  });

  console.log(`Database US clubs: ${dbClubs.length}`);

  // Flatten USGAA list
  const allUsgaa: string[] = [];
  for (const clubs of Object.values(usgaaClubs)) {
    allUsgaa.push(...clubs);
  }
  console.log(`USGAA official clubs: ${allUsgaa.length}\n`);

  // Normalize for comparison
  const normalize = (name: string) => {
    return name
      .toLowerCase()
      .replace(/gaa$/i, "")
      .replace(/gfc$/i, "")
      .replace(/gac$/i, "")
      .replace(/lgfc$/i, "")
      .replace(/clg$/i, "")
      .replace(/hurling club$/i, "")
      .replace(/hurling$/i, "")
      .replace(/camogie$/i, "")
      .replace(/gaelic football$/i, "")
      .replace(/ladies/i, "")
      .replace(/[''`]/g, "'")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Create normalized maps
  const dbNormalized = new Map<string, (typeof dbClubs)[0]>();
  for (const club of dbClubs) {
    dbNormalized.set(normalize(club.name), club);
  }

  const usgaaNormalized = new Map<string, string>();
  for (const name of allUsgaa) {
    usgaaNormalized.set(normalize(name), name);
  }

  // Find matches and mismatches
  const matched: { db: string; usgaa: string }[] = [];
  const inDbNotUsgaa: typeof dbClubs = [];
  const inUsgaaNotDb: string[] = [];

  // Check DB clubs against USGAA
  for (const club of dbClubs) {
    const norm = normalize(club.name);
    if (usgaaNormalized.has(norm)) {
      matched.push({ db: club.name, usgaa: usgaaNormalized.get(norm)! });
    } else {
      inDbNotUsgaa.push(club);
    }
  }

  // Check USGAA clubs against DB
  for (const name of allUsgaa) {
    const norm = normalize(name);
    if (!dbNormalized.has(norm)) {
      inUsgaaNotDb.push(name);
    }
  }

  // Output results
  console.log(`\n=== MATCHED (${matched.length}) ===`);
  matched.forEach((m) => {
    if (m.db !== m.usgaa) {
      console.log(`  ${m.db} <-> ${m.usgaa}`);
    }
  });

  console.log(
    `\n=== IN DATABASE BUT NOT ON USGAA (${inDbNotUsgaa.length}) ===`
  );
  console.log("(These may be defunct, Canadian, or non-USGAA clubs)\n");
  inDbNotUsgaa.forEach((c) => console.log(`  ${c.name} | ${c.location}`));

  console.log(
    `\n=== ON USGAA BUT NOT IN DATABASE (${inUsgaaNotDb.length}) ===`
  );
  console.log("(These should be added)\n");
  for (const [div, clubs] of Object.entries(usgaaClubs)) {
    const missing = clubs.filter((c) => inUsgaaNotDb.includes(c));
    if (missing.length > 0) {
      console.log(`  -- ${div} --`);
      missing.forEach((c) => console.log(`    ${c}`));
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Matched: ${matched.length}`);
  console.log(`In DB but not USGAA: ${inDbNotUsgaa.length}`);
  console.log(`On USGAA but not in DB: ${inUsgaaNotDb.length}`);
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
