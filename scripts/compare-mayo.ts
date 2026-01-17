import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from mayogaa.com (61 entries, but some duplicates like Westport/Westport GAA)
  // Consolidated to unique clubs
  const official = [
    "Achill",
    "Aghamore",
    "Ardagh",
    "Ardnaree",
    "Balla",
    "Ballaghaderreen",
    "Ballina Stephenites",
    "Ballinrobe",
    "Ballintubber",
    "Ballycastle",
    "Ballycroy",
    "Ballyhaunis",
    "Ballyvary",
    "Belmullet",
    "Bonniconlon",
    "Breaffy",
    "Burrishoole",
    "Caiseal Gaels",
    "Carras",
    "Castlebar Mitchels",
    "Charlestown Sarsfields",
    "Cill Chomain",
    "Claremorris",
    "Crossmolina Deel Rovers",
    "Davitts",
    "Eastern Gaels",
    "Erris St. Pats",
    "Gaeltacht Iorrais",
    "Garrymore",
    "Hollymount-Carramore",
    "Islandeady",
    "Kilfian",
    "Killala",
    "Kilmaine",
    "Kilmeena",
    "Kilmovee Shamrocks",
    "Kiltane",
    "Kiltimagh",
    "Knockmore",
    "Lacken",
    "Lahardane",
    "Louisburgh",
    "Mayo Gaels",
    "Moy Davitts",
    "Moygownagh",
    "Moytura Hurling",
    "Naomh Padraig",
    "Northern Gaels",
    "Parke/Keelogues/Crimlin",
    "Shrule/Glencorrib",
    "St. Jarlath's",
    "Swinford",
    "The Neale",
    "Tooreen",
    "Tuar Mhic Éadaigh",
    "Westport",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Mayo" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Mayo Clubs Comparison ===\n");
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
      .replace(/clg\s+/gi, "")
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
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
