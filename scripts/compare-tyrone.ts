import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official 54 clubs from Tyrone GAA website
  const official = [
    "Aghaloo Ó Neills",
    "Aghyaran Saint Davogs",
    "Ardboe Ó Donovan Rossa",
    "Augher St Macartans",
    "Beragh Red Knights",
    "Brackaville Owen Roes",
    "Brocagh Emmetts",
    "Carrickmore St Colmcilles",
    "Castlederg St Eugenes",
    "Clann na nGael",
    "Clogher Eire Óg",
    "Clonoe Ó Rahillys",
    "Coalisland Fianna",
    "Cookstown Fr.Rocks",
    "Cúchulainn an Ghleanna",
    "Derrylaughan Kevin Barrys",
    "Derrytresk Fír-a-Chnoic",
    "Donaghmore St Patricks",
    "Dromore St Dympna's",
    "Drumquin Wolfe Tones",
    "Drumragh Sarsfields",
    "Dúiche Néill An Bhinn Bhorb",
    "Dungannon Clarkes",
    "Dungannon Eoghan Ruadh",
    "Edendork St Malachys",
    "Eglish St Patricks",
    "Eire Óg",
    "Errigal Ciaran",
    "Eskra Emmetts",
    "Fintona Pearses",
    "Galbally Pearses",
    "Glenelly St Josephs",
    "Gortin St Patricks",
    "Greencastle St Patricks",
    "Kildress Wolfe Tones",
    "Killeeshil St Marys",
    "Killyclogher St Marys",
    "Killyman St Marys",
    "Loughmacroy St Teresas",
    "Moortown St Malachys",
    "Moy Tír na nÓg",
    "Naomh Columcille",
    "Naomh Eoghan",
    "Omagh St Endas",
    "Owen Roe O'Neills Leckpatrick",
    "Pomeroy Plunketts",
    "Rock St Patricks",
    "Stewartstown Harps",
    "Strabane Shamrocks",
    "Strabane Sigersons",
    "Tattyreagh St Patricks",
    "Trillick St Macartans",
    "Tulach Óg",
    "Urney St Columba's",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Tyrone" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Tyrone Clubs Comparison ===\n");
  console.log(`Official: ${official.length} clubs`);
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
      // Check for exact match or partial match
      return (
        normDb === normOff ||
        normDb.includes(normOff) ||
        normOff.includes(normDb) ||
        // Check key words
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

  console.log("--- Missing from database ---");
  missing.forEach((m) => console.log("  - " + m));

  console.log("\n--- Extra in database (not in official list) ---");
  extras.forEach((e) => console.log("  - " + e));

  console.log("\n--- Potential duplicates ---");
  // Check for duplicates like "Carrickmore GAA" and "Carrickmore St Colmcille's GAA"
  const carrickmore = dbNames.filter((n) =>
    n.toLowerCase().includes("carrickmore")
  );
  if (carrickmore.length > 1) {
    console.log("  Carrickmore:");
    carrickmore.forEach((c) => console.log("    - " + c));
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
