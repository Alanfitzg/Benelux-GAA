import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function compare() {
  // Official 40 clubs from Derry GAA website
  const official = [
    "St Mary's Ardmore",
    "Sarsfields Ballerin",
    "St Colm's Ballinascreen",
    "Shamrocks Ballinderry",
    "St Treas Ballymaguigan",
    "St Mary's Banagher",
    "Wolfe Tones Bellaghy",
    "St Malachy's Castledawson",
    "John Mitchell's Claudy",
    "Eoghan Rua Coleraine",
    "St Josephs Craigbane",
    "St Martins Desertmartin",
    "Doire Colmcille",
    "Na Piarsaigh Doire Trasna",
    "St Colm's Drum",
    "St Matthews Drumsurn",
    "St Canice's Dungiven",
    "St Mary's Faughanvale",
    "O'Brien's Foreglen",
    "O'Connor's Glack",
    "Watty Grahams Glen",
    "John Mitchell's Glenullin",
    "St Oliver Plunketts Greenlough",
    "Kevin Lynch's Dungiven",
    "Pearses Kilrea",
    "Erin's Own Lavey",
    "Wolfhounds Limavady",
    "St Michaels Lissan",
    "St Patrick's Loup",
    "O'Donovan Rossa Magherafelt",
    "St Aidan's Magilligan",
    "Henry Joy McCracken's Moneymore",
    "Na Magha",
    "Sean O'Leary's Newbridge",
    "Ogra Colmcille",
    "Sean Dolan's",
    "St Mary's Slaughtmanus",
    "Robert Emmett's Slaughtneil",
    "Brian Ogs Steelstown",
    "Michael Davitts Swatragh",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { subRegion: "Derry" },
    select: { name: true },
  });

  const dbNames = dbClubs.map((c) => c.name);

  console.log("=== Derry Clubs Comparison ===\n");
  console.log(`Official: ${official.length} clubs`);
  console.log(`Database: ${dbNames.length} clubs\n`);

  // Check what we have that's not in official
  console.log("--- University clubs (extra, expected) ---");
  const uniClubs = dbNames.filter((n) => n.includes("Ulster University"));
  uniClubs.forEach((n) => console.log("  - " + n));

  // Check if St Colm's Drum is missing
  console.log("\n--- Missing from database ---");
  const drumExists = dbNames.some(
    (n) =>
      n.toLowerCase().includes("drum") &&
      n.toLowerCase().indexOf("drumsurn") === -1
  );
  if (!drumExists) {
    console.log("  - St Colm's Drum GAA");
  }

  // Final summary
  console.log("\n=== Summary ===");
  console.log(`Official clubs: 40`);
  console.log(`Database clubs: ${dbNames.length}`);
  console.log(`  - Regular clubs: ${dbNames.length - uniClubs.length}`);
  console.log(`  - University clubs: ${uniClubs.length}`);

  const missing = drumExists ? 0 : 1;
  console.log(`Missing: ${missing}`);
}

compare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
