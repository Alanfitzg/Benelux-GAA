import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official clubs from officialwicklowgaa.ie (38 clubs)
  // Note: Shillelagh-Coolboy is one amalgamated club
  // Note: Arklow Geraldines Ballymoney is one amalgamated club
  // Note: Donard The Glen is one amalgamated club (may be listed as Donard Glen)
  // Note: Stratford / Grangecon is one amalgamated club
  const official = [
    "An Tóchar",
    "Annacurra",
    "Arklow Geraldines Ballymoney",
    "Arklow Rock Parnells",
    "Ashford",
    "Aughrim",
    "Avoca",
    "Avondale",
    "Ballinacor",
    "Ballymanus",
    "Baltinglass",
    "Barndarrig",
    "Blessington",
    "Bray Emmets",
    "Carnew Emmets",
    "Cill Bhríde / Kilbride",
    "Coolkenno",
    "Donard The Glen",
    "Dunlavin",
    "Éire Óg Greystones",
    "Enniskerry",
    "Fergal Og",
    "Glenealy",
    "Hollywood",
    "Kilcoole",
    "Kilmacanogue",
    "Kiltegan",
    "Knockananna",
    "Laragh",
    "Newcastle",
    "Newtown",
    "Rathnew",
    "Shillelagh-Coolboy",
    "St Patricks Wicklow Town",
    "Stratford / Grangecon",
    "Tinahely",
    "Valleymount",
    "Western Gaels",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Wicklow" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Wicklow Clubs Comparison ===\n");
  console.log(`Official: ${official.length} clubs`);
  console.log(`Database: ${dbNames.length} clubs\n`);

  // Normalize names for comparison
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+gaa$/i, "")
      .replace(/\s+gac$/i, "")
      .replace(/\s+gfc$/i, "")
      .replace(/\s+clg$/i, "")
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
