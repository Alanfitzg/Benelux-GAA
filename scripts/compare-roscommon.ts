import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from Roscommon GAA website (gaaroscommon.ie)
  // Note: Oran Football and Oran Hurling are the same club
  const official = [
    "Athleague",
    "Ballinameen",
    "Boyle",
    "Castlerea St Kevins",
    "Clann na nGael",
    "Creggs",
    "Eire Óg",
    "Elphin",
    "Four Roads",
    "Fuerty",
    "Kilbride",
    "Kilglass Gaels",
    "Kilmore",
    "Michael Glaveys",
    "Oran",
    "Padraig Pearses",
    "Roscommon Gaels",
    "Shannon Gaels",
    "St. Aidans",
    "St. Barrys",
    "St. Brigids",
    "St. Croans",
    "St. Dominics",
    "St. Faithleachs",
    "St. Josephs",
    "St. Michaels",
    "St. Ronans",
    "Strokestown",
    "Tremane",
    "Tulsk Lord Edwards",
    "Western Gaels",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Roscommon" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Roscommon Clubs Comparison ===\n");
  console.log(`Official: ${official.length} clubs`);
  console.log(`Database: ${dbNames.length} clubs\n`);

  // Normalize names for comparison
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+gaa$/i, "")
      .replace(/\s+gac$/i, "")
      .replace(/st\./g, "st")
      .replace(/ó/g, "o")
      .replace(/í/g, "i")
      .replace(/ú/g, "u")
      .replace(/é/g, "e")
      .replace(/á/g, "a")
      .replace(/'/g, "")
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim();

  // Find matches and missing
  const matched: { official: string; db: string }[] = [];
  const missing: string[] = [];

  for (const off of official) {
    const normOff = normalize(off);
    const match = dbNames.find((db) => {
      const normDb = normalize(db);
      return (
        normDb === normOff ||
        normDb.includes(normOff) ||
        normOff.includes(normDb) ||
        normOff
          .split(" ")
          .some((word) => word.length > 3 && normDb.includes(word))
      );
    });

    if (match) {
      matched.push({ official: off, db: match });
    } else {
      missing.push(off);
    }
  }

  // Find extras in DB (not matching any official)
  const extras = dbNames.filter((db) => {
    const normDb = normalize(db);
    return !official.some((off) => {
      const normOff = normalize(off);
      return (
        normDb === normOff ||
        normDb.includes(normOff) ||
        normOff.includes(normDb) ||
        normOff
          .split(" ")
          .some((word) => word.length > 3 && normDb.includes(word))
      );
    });
  });

  console.log("--- Matched clubs ---");
  matched.forEach((m) => console.log(`  ✓ ${m.official} -> ${m.db}`));

  console.log("\n--- Missing from database ---");
  if (missing.length === 0) {
    console.log("  (none)");
  } else {
    missing.forEach((m) => console.log("  - " + m));
  }

  console.log("\n--- Extra in database (not in official list) ---");
  if (extras.length === 0) {
    console.log("  (none)");
  } else {
    extras.forEach((e) => console.log("  - " + e));
  }

  console.log("\n=== Summary ===");
  console.log(`Official clubs: ${official.length}`);
  console.log(`Database clubs: ${dbNames.length}`);
  console.log(`Matched: ${matched.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Extras: ${extras.length}`);
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
