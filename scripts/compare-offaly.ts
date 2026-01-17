import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from Offaly GAA website (offaly.gaa.ie)
  // Note: St Rynagh's Football and Hurling are the same club
  // Note: Ballyskenach / Killavilla is one club
  // Note: Kilcormac / Killoughey is one club
  const official = [
    "Ballinagar",
    "Ballinamere",
    "Ballycommon",
    "Ballycumber",
    "Ballyfore",
    "Ballyskenach / Killavilla",
    "Belmont",
    "Birr",
    "Bracknagh",
    "Cappincur",
    "Carrig & Riverstown",
    "Clara",
    "Clodiagh Gaels",
    "Clonbullogue",
    "Clonmore Harps",
    "Coolderry",
    "Crinkle",
    "Daingean",
    "Doon",
    "Drumcullen",
    "Durrow",
    "Edenderry",
    "Erin Rovers",
    "Ferbane",
    "Gracefield",
    "Kilclonfert",
    "Kilcormac / Killoughey",
    "Kinnitty",
    "Lusmagh",
    "Raheen",
    "Rhode",
    "Seir Kieran",
    "Shamrocks",
    "Shannonbridge",
    "Shinrone",
    "St Brigid's",
    "St Rynagh's",
    "Tubber",
    "Tullamore",
    "Walsh Island",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Offaly" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Offaly Clubs Comparison ===\n");
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
      .replace(/ \/ /g, "-")
      .replace(/ & /g, "-")
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
          .split(/[-\s]/)
          .some((word) => word.length > 4 && normDb.includes(word))
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
          .split(/[-\s]/)
          .some((word) => word.length > 4 && normDb.includes(word))
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
