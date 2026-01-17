import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from tipperary.gaa.ie (71 clubs)
  const official = [
    "Aherlow",
    "Ardfinnan",
    "Arravale Rovers",
    "Ballina",
    "Ballinahinch",
    "Ballingarry",
    "Ballybacon/Grange",
    "Ballylooby-Castlegrace",
    "Ballyporeen",
    "Boherlahan/Dualla",
    "Borris-Ileigh",
    "Borrisokane",
    "Burgess",
    "Cahir",
    "Cappawhite",
    "Carrick Davins",
    "Carrick Swan",
    "Cashel King Cormacs",
    "CJ Kickhams Mullinahone",
    "Clerihan",
    "Clonakenny",
    "Clonmel Commercials",
    "Clonmel Og",
    "Clonoulty-Rossmore",
    "Drom & Inch",
    "Durlas Óg",
    "Eire Óg Annacarthy Donohill",
    "Emly",
    "Fethard",
    "Fr. Sheehys",
    "Galtee Rovers",
    "Golden-Kilfeacle",
    "Gortnahoe-Glengoole",
    "Grangemockler-Ballyneale",
    "Holycross/Ballycahill",
    "JK Brackens",
    "Kiladangan",
    "Killea",
    "Killenaule",
    "Kilruane MacDonaghs",
    "Kilsheelan-Kilcash",
    "Knock",
    "Knockavilla-Donaskeigh Kickhams",
    "Knockshegowna",
    "Lattin-Cullen",
    "Lorrha and Dorrha",
    "Loughmore Castleiney",
    "Marlfield",
    "Moneygall",
    "Moycarkey-Borris",
    "Moyle Rovers",
    "Moyne-Templetuohy",
    "Nenagh Éire Óg",
    "Newcastle",
    "Newport",
    "Portroe",
    "Rockwell Rovers",
    "Roscrea",
    "Rosegreen",
    "Sean Treacy's",
    "Shannon Rovers",
    "Silvermines",
    "Skeheenarinky",
    "Solohead",
    "St. Mary's Clonmel",
    "St. Patricks",
    "Templederry Kenyons",
    "Thurles Gaels",
    "Thurles Sarsfields",
    "Toomevara",
    "Upperchurch Drombane",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Tipperary" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Tipperary Clubs Comparison ===\n");
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
      .replace(/fr\./g, "fr")
      .replace(/ \/ /g, "-")
      .replace(/\//g, "-")
      .replace(/ & /g, "-")
      .replace(/ and /g, "-")
      .replace(/ó/g, "o")
      .replace(/í/g, "i")
      .replace(/ú/g, "u")
      .replace(/é/g, "e")
      .replace(/á/g, "a")
      .replace(/'/g, "")
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .replace(/-/g, " ")
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

  // Check for duplicates in database
  const duplicates = dbNames.filter(
    (name, index) => dbNames.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    console.log("\n--- Duplicates in database ---");
    duplicates.forEach((d) => console.log("  ⚠️ " + d));
  }

  console.log("\n=== Summary ===");
  console.log(`Official clubs: ${official.length}`);
  console.log(`Database clubs: ${dbNames.length}`);
  console.log(`Matched: ${matched.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Extras: ${extras.length}`);
  console.log(`Duplicates: ${duplicates.length}`);
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
