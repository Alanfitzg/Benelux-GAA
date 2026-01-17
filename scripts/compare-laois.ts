import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from laoisgaa.ie (48 clubs listed, but some are amalgamations)
  // Removing duplicates where clubs merge for different codes
  const official = [
    "Annanough",
    "Arles-Kilcruise",
    "Arles-Killeen",
    "Ballinakill",
    "Ballyfin",
    "Ballylinan",
    "Ballypickas",
    "Ballyroan Abbey",
    "Barrowhouse",
    "Borris-in-Ossory",
    "Camross",
    "Castletown",
    "Clonad",
    "Clonaslee St Manman's",
    "Clough-Ballacolla",
    "Colt-Shanahoe",
    "Courtwood",
    "Crettyard",
    "Emo",
    "Errill",
    "Graiguecullen",
    "Kilcavan",
    "Kilcotton",
    "Killeshin",
    "Kyle",
    "Mountmellick",
    "O'Dempsey's",
    "Park-Ratheniska",
    "Portarlington",
    "Portlaoise",
    "Rathdowney-Errill",
    "Rosenallis",
    "Shanahoe",
    "Slieve Bloom",
    "Spink",
    "St Fintan's Mountrath",
    "St Joseph's",
    "St Lazerian's Abbeyleix",
    "Stradbally",
    "The Harps",
    "The Heath",
    "The Rock",
    "Timahoe",
    "Trumera",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Laois" },
    select: { name: true, imageUrl: true },
    orderBy: { name: "asc" },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Laois Clubs Comparison ===\n");
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
  const matched: { official: string; db: string; hasCrest: boolean }[] = [];
  const missing: string[] = [];

  for (const off of official) {
    const normOff = normalize(off);
    const match = dbClubs.find((db) => {
      const normDb = normalize(db.name);
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
      matched.push({
        official: off,
        db: match.name,
        hasCrest: Boolean(match.imageUrl && match.imageUrl.length > 0),
      });
    } else {
      missing.push(off);
    }
  }

  // Find extras in DB
  const extras = dbClubs.filter((db) => {
    const normDb = normalize(db.name);
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
  matched.forEach((m) => {
    const crest = m.hasCrest ? "✓" : "✗";
    console.log(`  ${crest} ${m.official} -> ${m.db}`);
  });

  console.log("\n--- Missing from database ---");
  if (missing.length === 0) {
    console.log("  (none)");
  } else {
    missing.forEach((m) => console.log("  - " + m));
  }

  console.log("\n--- Extra in database ---");
  if (extras.length === 0) {
    console.log("  (none)");
  } else {
    extras.forEach((e) => {
      const crest = e.imageUrl ? "✓" : "✗";
      console.log(`  ${crest} ${e.name}`);
    });
  }

  // Summary
  const withCrest = matched.filter((m) => m.hasCrest).length;
  console.log("\n=== Summary ===");
  console.log(`Official clubs: ${official.length}`);
  console.log(`Database clubs: ${dbNames.length}`);
  console.log(`Matched: ${matched.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Extras: ${extras.length}`);
  console.log(`With crests: ${withCrest}/${matched.length}`);
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
