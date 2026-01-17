import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from meath.gaa.ie (60 clubs)
  // Note: Donaghmore / Ashbourne is one club
  // Note: Duleek / Bellewstown is one club
  // Note: St. Peter's Dunboyne may be listed as Dunboyne
  const official = [
    "Ballinabrackey",
    "Ballinlough",
    "Ballivor",
    "Bective",
    "Blackhall Gaels",
    "Boardsmill",
    "Carnaross",
    "Castletown",
    "Clann na nGael",
    "Clonard",
    "Cortown",
    "Curraha",
    "Donaghmore / Ashbourne",
    "Drumbaragh Emmets",
    "Drumconrath",
    "Drumree",
    "Duleek / Bellewstown",
    "Dunderry",
    "Dunsany",
    "Dunshaughlin",
    "Eastern Gaels",
    "Gaeil Colmcille",
    "Kilbride",
    "Kildalkey",
    "Killyon",
    "Kilmainham",
    "Kilmainhamwood",
    "Kilmessan",
    "Kilskyre",
    "Kiltale",
    "Longwood",
    "Meath Hill",
    "Moylagh",
    "Moynalty",
    "Moynalvey",
    "Na Fianna",
    "Nobber",
    "O'Mahony's",
    "Oldcastle",
    "Rathkenny",
    "Rathmolyon",
    "Ratoath",
    "Seneschalstown",
    "Simonstown Gaels",
    "Skryne",
    "Slane",
    "St. Brigid's",
    "St. Colmcille's",
    "St. Mary's",
    "St. Michael's",
    "St. Patrick's",
    "St. Paul's",
    "St. Peter's Dunboyne",
    "St. Ultan's",
    "St. Vincent's",
    "Summerhill",
    "Syddan",
    "Trim",
    "Walterstown",
    "Wolfe Tones",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Meath" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Meath Clubs Comparison ===\n");
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
      .replace(/\//g, "-")
      .replace(/ & /g, "-")
      .replace(/ó/g, "o")
      .replace(/í/g, "i")
      .replace(/ú/g, "u")
      .replace(/é/g, "e")
      .replace(/á/g, "a")
      .replace(/'/g, "")
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .replace(/-/g, " ")
      .replace(/\(meath\)/gi, "")
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
          .split(/[\s]/)
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
          .split(/[\s]/)
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
