import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reviewNonUsgaa() {
  console.log("=== Review: US Clubs Not on USGAA ===\n");

  const clubs = await prisma.club.findMany({
    where: {
      internationalUnit: { name: "North America" },
      country: { name: "United States" },
    },
    select: {
      id: true,
      name: true,
      location: true,
      region: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  // USGAA club names (normalized) for comparison
  const usgaaNames = new Set([
    "aidan mcanespies",
    "akron celtic guards",
    "albany rebels",
    "allentown hibernians",
    "atlanta clan na ngael",
    "augusta gaelic sports club",
    "austin celtic cowboys",
    "baltimore bohemians",
    "boston shamrocks",
    "buffalo fenians",
    "butte wolfe tones",
    "cayman islands",
    "charleston hurling",
    "charlotte gaa",
    "christophers",
    "cincinnati gaa",
    "clan na gael",
    "cleveland st pats",
    "coastal virginia",
    "columbia red branch",
    "columbus",
    "connemara gaels",
    "connacht ladies",
    "cork boston",
    "cu chulainn camogie",
    "cuchulainns hurling",
    "dallas fionn mac cumhaills",
    "delco gaels",
    "denver gaels",
    "detroit wolfetones",
    "donegal boston",
    "eire og",
    "erins rovers",
    "flagstaff mountainhounds",
    "fog city harps",
    "fox river hurling",
    "fr tom burkes hurling",
    "galway boston hurling",
    "galway boston",
    "greenville gaels",
    "grit city hounds",
    "harry bolands",
    "houston gaels",
    "hurling club of madison",
    "indianapolis gaa",
    "irish football youth league",
    "james joyce",
    "jersey shore gaa",
    "john mcbrides",
    "kalamazoo gaa",
    "kansas city gac",
    "kerry boston",
    "kevin barry",
    "knoxville gac",
    "la cougars",
    "limerick hurling",
    "little rock gac",
    "los angeles hurling",
    "los san patricios",
    "memphis gaa",
    "michael cusack hurling",
    "michael cusacks",
    "miltown gaels",
    "milwaukee hurling",
    "mulhollands ladies",
    "na aisling gaels",
    "na fianna",
    "na toraidhe hurling",
    "naomh padraig",
    "naperville hurling",
    "nashville gac",
    "new hampshire wolves",
    "notre dame ladies",
    "offaly boston hurling",
    "orlando gaa",
    "padraig pearses",
    "parnells",
    "patriots",
    "pearse ogs",
    "phoenix gaels",
    "pittsburgh gaa",
    "pittsburgh pucas hurling",
    "portland eireannach",
    "portland hurling",
    "providence hurling",
    "raleigh gaa",
    "red wolves hurling",
    "regulators hurling",
    "richmond battery gaa",
    "robert emmets hurling",
    "roc city gaelic",
    "san antonio gac",
    "san diego na fianna",
    "san diego setanta",
    "savannah gaa",
    "sean ogs gaa",
    "sean treacys",
    "seattle gaels",
    "shamrocks",
    "shannon blues",
    "sons of boru",
    "south jersey hurling",
    "st brendans",
    "st brigids",
    "st josephs",
    "st louis gac",
    "st marys camogie",
    "st patricks donegal",
    "st peters hurling",
    "tacoma rangers",
    "tampa bay gaa",
    "thomas meagher hurling",
    "tipperary boston hurling",
    "tipperary hurling",
    "tir na nog",
    "tulsa gac",
    "twin cities",
    "ulster",
    "washington dc gaels",
    "wexford boston hurling",
    "wild geese",
    "willamette valley nomads",
    "winston salem gaa",
    "wolfe tones",
    "wolfetones",
    "worcester gaa",
    "young irelanders",
    "st vincents hurling",
  ]);

  const normalize = (name: string) => {
    return name
      .toLowerCase()
      .replace(/gaa$/i, "")
      .replace(/gfc$/i, "")
      .replace(/gac$/i, "")
      .replace(/lgfc$/i, "")
      .replace(/clg$/i, "")
      .replace(/hurling club$/i, "hurling")
      .replace(/camogie club$/i, "camogie")
      .replace(/gaelic football club$/i, "")
      .replace(/ladies/i, "")
      .replace(/[''`]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Categorize clubs
  const categories = {
    possibleDuplicates: [] as typeof clubs,
    countyClubs: [] as typeof clubs,
    cityRegionalClubs: [] as typeof clubs,
    ladiesTeams: [] as typeof clubs,
    likelyDefunct: [] as typeof clubs,
    other: [] as typeof clubs,
  };

  // County names to detect county-based clubs
  const irishCounties = [
    "antrim",
    "armagh",
    "carlow",
    "cavan",
    "clare",
    "cork",
    "derry",
    "donegal",
    "down",
    "dublin",
    "fermanagh",
    "galway",
    "kerry",
    "kildare",
    "kilkenny",
    "laois",
    "leitrim",
    "limerick",
    "longford",
    "louth",
    "mayo",
    "meath",
    "monaghan",
    "offaly",
    "roscommon",
    "sligo",
    "tipperary",
    "tyrone",
    "waterford",
    "westmeath",
    "wexford",
    "wicklow",
  ];

  for (const club of clubs) {
    const norm = normalize(club.name);
    const nameLower = club.name.toLowerCase();

    // Check if it matches USGAA (skip if matched)
    let isUsgaa = false;
    for (const usgaaName of usgaaNames) {
      if (norm.includes(usgaaName) || usgaaName.includes(norm)) {
        isUsgaa = true;
        break;
      }
    }
    if (isUsgaa) continue;

    // Categorize
    if (
      nameLower.includes("ladies") ||
      nameLower.includes("lgfc") ||
      nameLower.includes("camogie")
    ) {
      categories.ladiesTeams.push(club);
    } else if (irishCounties.some((county) => nameLower.includes(county))) {
      categories.countyClubs.push(club);
    } else if (
      nameLower.includes("miami") ||
      nameLower.includes("jacksonville") ||
      nameLower.includes("las vegas") ||
      nameLower.includes("fort lauderdale") ||
      nameLower.includes("south florida") ||
      nameLower.includes("new haven") ||
      nameLower.includes("hoboken") ||
      nameLower.includes("orange county") ||
      nameLower.includes("alexandria") ||
      nameLower.includes("virginia gaels")
    ) {
      categories.cityRegionalClubs.push(club);
    } else if (
      nameLower.includes("annacurra") ||
      nameLower.includes("ardglass") ||
      nameLower.includes("clg naomh") ||
      nameLower.includes("currin") ||
      nameLower.includes("bohola") ||
      nameLower.includes("greystones") ||
      nameLower.includes("barely house")
    ) {
      categories.likelyDefunct.push(club);
    } else {
      // Check for possible duplicates with USGAA clubs
      const possibleMatch = Array.from(usgaaNames).find((u) => {
        const words1 = norm.split(" ").filter((w) => w.length > 2);
        const words2 = u.split(" ").filter((w) => w.length > 2);
        return words1.some((w) => words2.includes(w));
      });
      if (possibleMatch) {
        categories.possibleDuplicates.push(club);
      } else {
        categories.other.push(club);
      }
    }
  }

  // Print results
  console.log("=== LADIES TEAMS (Keep - separate from mens) ===");
  console.log(`Count: ${categories.ladiesTeams.length}\n`);
  categories.ladiesTeams.forEach((c) => console.log(`  ${c.name}`));

  console.log("\n\n=== COUNTY-BASED CLUBS (Keep - affiliate clubs) ===");
  console.log(`Count: ${categories.countyClubs.length}\n`);
  categories.countyClubs.forEach((c) =>
    console.log(`  ${c.name} | ${c.location}`)
  );

  console.log("\n\n=== CITY/REGIONAL CLUBS (Review - may be independent) ===");
  console.log(`Count: ${categories.cityRegionalClubs.length}\n`);
  categories.cityRegionalClubs.forEach((c) =>
    console.log(`  ${c.name} | ${c.location}`)
  );

  console.log("\n\n=== LIKELY DEFUNCT/OBSCURE (Consider removal) ===");
  console.log(`Count: ${categories.likelyDefunct.length}\n`);
  categories.likelyDefunct.forEach((c) =>
    console.log(`  ${c.name} | ${c.location}`)
  );

  console.log("\n\n=== POSSIBLE DUPLICATES OF USGAA CLUBS (Review) ===");
  console.log(`Count: ${categories.possibleDuplicates.length}\n`);
  categories.possibleDuplicates.forEach((c) =>
    console.log(`  ${c.name} | ${c.location}`)
  );

  console.log("\n\n=== OTHER (Review individually) ===");
  console.log(`Count: ${categories.other.length}\n`);
  categories.other.forEach((c) => console.log(`  ${c.name} | ${c.location}`));

  console.log("\n\n=== SUMMARY ===");
  console.log(`Ladies teams: ${categories.ladiesTeams.length}`);
  console.log(`County clubs: ${categories.countyClubs.length}`);
  console.log(`City/Regional: ${categories.cityRegionalClubs.length}`);
  console.log(`Likely defunct: ${categories.likelyDefunct.length}`);
  console.log(`Possible duplicates: ${categories.possibleDuplicates.length}`);
  console.log(`Other: ${categories.other.length}`);
}

reviewNonUsgaa()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
