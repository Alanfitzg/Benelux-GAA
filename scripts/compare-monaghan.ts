import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from Monaghan GAA website
  // Note: Some clubs have separate Football and Hurling entries - these are the same club
  const official = [
    "Aghabog",
    "Aughnamullen",
    "Ballybay",
    "Blackhill",
    "Carrickmacross",
    "Castleblayney",
    "Clones",
    "Clontibret",
    "Corduff",
    "Cremartin",
    "Currin",
    "Donaghmoyne",
    "Doohamlet",
    "Drumhowan",
    "Éire Óg",
    "Emyvale",
    "Inniskeen",
    "Killanny",
    "Killeevan Sarsfields",
    "Latton",
    "Magheracloone",
    "Monaghan Harps",
    "Oram",
    "Rockcorry",
    "Scotstown",
    "Sean McDermotts",
    "Toome",
    "Truagh",
    "Tyholland",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Monaghan" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Monaghan Clubs Comparison ===\n");
  console.log(
    `Official: ${official.length} clubs (excluding hurling-only duplicates)`
  );
  console.log(`Database: ${dbNames.length} clubs\n`);

  // Normalize names for comparison
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+gaa$/i, "")
      .replace(/\s+gac$/i, "")
      .replace(/ st /g, " saint ")
      .replace(/^st /g, "saint ")
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
          .split(" ")
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
