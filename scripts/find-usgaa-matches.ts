import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Official USGAA clubs that weren't matched automatically
const unmatchedUsgaa = [
  { name: "CuChulainns Hurling Club", division: "Central" },
  { name: "Harry Bolands", division: "Central" },
  { name: "John McBrides GFC", division: "Central" },
  { name: "Na Aisling Gaels", division: "Central" },
  { name: "Parnell's GFC", division: "Central" },
  { name: "St. Brigid's LGFC", division: "Central" },
  { name: "Wolfe Tones", division: "Central" },
  { name: "Erin's Rovers", division: "Central" },
  { name: "James Joyce GFC", division: "Central" },
  { name: "Limerick Hurling Club", division: "Central" },
  { name: "Michael Cusack Hurling Club", division: "Central" },
  { name: "Padraig Pearses", division: "Central" },
  { name: "Patriots GFC", division: "Central" },
  { name: "St. Brendan's GFC", division: "Central" },
  { name: "St. Mary's Camogie", division: "Central" },
  { name: "Hurling Club of Madison", division: "Heartland" },
  { name: "Miltown Gaels", division: "Heartland" },
  { name: "Milwaukee Hurling Club", division: "Heartland" },
  { name: "St. Louis GAC", division: "Heartland" },
  { name: "Twin Cities GFC", division: "Heartland" },
  { name: "Robert Emmets Hurling", division: "Heartland" },
  { name: "Cleveland St Pats/St Jarlaths", division: "Midwest" },
  { name: "Columbus GFC", division: "Midwest" },
  { name: "Detroit Wolfetones", division: "Midwest" },
  { name: "Pittsburgh GAA", division: "Midwest" },
  { name: "Pittsburgh Pucas Hurling", division: "Midwest" },
  { name: "Roc City Gaelic", division: "Midwest" },
  { name: "Boston Shamrocks", division: "Northeast" },
  { name: "Connacht Ladies LGFC", division: "Northeast" },
  { name: "Fr. Tom Burke's Hurling Club", division: "Northeast" },
  { name: "Portland Hurling Club", division: "Northeast" },
  { name: "Shannon Blues GFC", division: "Northeast" },
  { name: "Tir Na Nog LGFC", division: "Northeast" },
  { name: "New Hampshire Wolves", division: "Northeast" },
  { name: "Offaly Boston Hurling Club", division: "Northeast" },
  { name: "Tipperary Boston Hurling Club", division: "Northeast" },
  { name: "Wexford Boston Hurling Club", division: "Northeast" },
  { name: "Wolfetones GFC", division: "Northeast" },
  { name: "Grit City Hounds", division: "Northwest" },
  { name: "Thomas Meagher Hurling Club", division: "Northwest" },
  { name: "Na Toraidhe Hurling", division: "Philadelphia" },
  { name: "Shamrocks", division: "Philadelphia" },
  { name: "Young Irelanders GFC", division: "Philadelphia" },
  { name: "South Jersey Hurling", division: "Philadelphia" },
  { name: "Kevin Barry GFC", division: "Philadelphia" },
  { name: "Notre Dame Ladies GFC", division: "Philadelphia" },
  { name: "St. Patricks/Donegal", division: "Philadelphia" },
  { name: "Jersey Shore GAA Club", division: "Philadelphia" },
  { name: "Atlanta Clan na nGael", division: "Southeast" },
  { name: "Cayman Islands GFC", division: "Southeast" },
  { name: "Red Wolves Hurling Club", division: "Southeast" },
  { name: "Dallas Fionn Mac Cumhaills", division: "Southwest" },
  { name: "Flagstaff Mountainhounds", division: "Southwest" },
  { name: "Los Angeles Hurling Club", division: "Southwest" },
  { name: "Los San Patricios GAA Club, Mexico City", division: "Southwest" },
  { name: "Mulhollands Ladies Gaelic Football", division: "Southwest" },
  { name: "San Antonio GAC", division: "Southwest" },
  { name: "San Diego Na Fianna", division: "Southwest" },
  { name: "St. Peters Hurling", division: "Southwest" },
  { name: "Wild Geese GFC", division: "Southwest" },
  { name: "Clan na Gael", division: "Western" },
  { name: "Cú Chulainn Camogie", division: "Western" },
  { name: "Eire Og", division: "Western" },
  { name: "Fog City Harps", division: "Western" },
  { name: "Irish Football Youth League", division: "Western" },
  { name: "Na Fianna", division: "Western" },
  { name: "Naomh Padraig", division: "Western" },
  { name: "Pearse Og's", division: "Western" },
  { name: "Sean Treacys", division: "Western" },
  { name: "Sons of Boru/Celts", division: "Western" },
  { name: "St. Joseph's", division: "Western" },
  { name: "Tipperary Hurling Club", division: "Western" },
  { name: "Ulster", division: "Western" },
  { name: "Young Irelanders/St Brendans", division: "Western" },
];

async function findMatches() {
  console.log("=== Finding Potential Duplicate Matches ===\n");

  const dbClubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "United States" },
    },
    select: { id: true, name: true, location: true },
    orderBy: { name: "asc" },
  });

  // Helper to extract key words from a name
  const getKeyWords = (name: string) => {
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
      .replace(/camogie club$/i, "")
      .replace(/gaelic football$/i, "")
      .replace(/ladies/i, "")
      .replace(/[''`]/g, "'")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((w) => w.length > 2);
  };

  const matches: {
    usgaa: string;
    division: string;
    dbName: string;
    dbLocation: string;
    confidence: string;
  }[] = [];

  for (const usgaa of unmatchedUsgaa) {
    const usgaaWords = getKeyWords(usgaa.name);

    for (const db of dbClubs) {
      const dbWords = getKeyWords(db.name);

      // Check for word overlap
      const commonWords = usgaaWords.filter((w) => dbWords.includes(w));

      if (commonWords.length >= 1) {
        // Calculate confidence
        const totalUniqueWords = new Set([...usgaaWords, ...dbWords]).size;
        const overlapRatio = commonWords.length / totalUniqueWords;

        let confidence = "LOW";
        if (overlapRatio >= 0.7) confidence = "HIGH";
        else if (overlapRatio >= 0.4) confidence = "MEDIUM";
        else if (commonWords.length >= 2) confidence = "MEDIUM";

        // Only show medium+ confidence
        if (confidence !== "LOW" || commonWords.length >= 2) {
          matches.push({
            usgaa: usgaa.name,
            division: usgaa.division,
            dbName: db.name,
            dbLocation: db.location || "",
            confidence,
          });
        }
      }
    }
  }

  // Group by USGAA club
  const grouped: Record<string, typeof matches> = {};
  for (const m of matches) {
    const key = `${m.division}: ${m.usgaa}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  }

  console.log("=== POTENTIAL MATCHES (USGAA -> Database) ===\n");

  let highCount = 0;
  let mediumCount = 0;

  for (const [usgaaKey, dbMatches] of Object.entries(grouped).sort()) {
    const hasHigh = dbMatches.some((m) => m.confidence === "HIGH");
    const hasMedium = dbMatches.some((m) => m.confidence === "MEDIUM");

    if (hasHigh) highCount++;
    else if (hasMedium) mediumCount++;

    console.log(`\n${usgaaKey}`);
    dbMatches
      .sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (
          order[a.confidence as keyof typeof order] -
          order[b.confidence as keyof typeof order]
        );
      })
      .forEach((m) => {
        const marker =
          m.confidence === "HIGH"
            ? "✓✓"
            : m.confidence === "MEDIUM"
              ? "✓"
              : "?";
        console.log(
          `  ${marker} [${m.confidence}] "${m.dbName}" (${m.dbLocation})`
        );
      });
  }

  // Show unmatched USGAA clubs
  const matchedUsgaa = new Set(
    Object.keys(grouped).map((k) => k.split(": ")[1])
  );
  const unmatched = unmatchedUsgaa.filter((u) => !matchedUsgaa.has(u.name));

  console.log(
    `\n\n=== USGAA CLUBS WITH NO POTENTIAL MATCHES (${unmatched.length}) ===`
  );
  console.log("(These are likely genuinely missing from database)\n");

  let currentDiv = "";
  for (const u of unmatched) {
    if (u.division !== currentDiv) {
      currentDiv = u.division;
      console.log(`\n  -- ${u.division} Division --`);
    }
    console.log(`    ${u.name}`);
  }

  console.log("\n\n=== SUMMARY ===");
  console.log(`USGAA clubs with HIGH confidence match: ${highCount}`);
  console.log(`USGAA clubs with MEDIUM confidence match: ${mediumCount}`);
  console.log(`USGAA clubs with no potential match: ${unmatched.length}`);
}

findMatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
