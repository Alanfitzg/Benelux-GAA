import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixClubCountryIds() {
  console.log("=== Fixing Club Country IDs ===\n");

  // Get all countries with their names for matching
  const countries = await prisma.country.findMany();
  console.log(`Found ${countries.length} countries in database\n`);

  // Create a mapping of country names/keywords to country IDs
  const countryMap: Record<string, string> = {};

  for (const country of countries) {
    countryMap[country.name.toLowerCase()] = country.id;
    countryMap[country.code.toLowerCase()] = country.id;
  }

  // Add common variations and city mappings
  const locationMappings: Record<string, string> = {
    // Spain
    spain: "cmfram2xl0019r388ada0ndmd",
    madrid: "cmfram2xl0019r388ada0ndmd",
    barcelona: "cmfram2xl0019r388ada0ndmd",
    marbella: "cmfram2xl0019r388ada0ndmd",
    vigo: "cmfram2xl0019r388ada0ndmd",
    zaragoza: "cmfram2xl0019r388ada0ndmd",
    sevilla: "cmfram2xl0019r388ada0ndmd",
    catalonia: "cmfram2xl0019r388ada0ndmd",
    galicia: "cmfram2xl0019r388ada0ndmd",
    valencia: "cmfram2xl0019r388ada0ndmd",
    málaga: "cmfram2xl0019r388ada0ndmd",
    malaga: "cmfram2xl0019r388ada0ndmd",
    bilbao: "cmfram2xl0019r388ada0ndmd",
    coruña: "cmfram2xl0019r388ada0ndmd",
    coruna: "cmfram2xl0019r388ada0ndmd",

    // Belgium
    belgium: "cmfralwm9000dr388z3yflc48",
    brussels: "cmfralwm9000dr388z3yflc48",
    leuven: "cmfralwm9000dr388z3yflc48",
    antwerp: "cmfralwm9000dr388z3yflc48",

    // France
    france: "cmfralyr0000nr388mrvduspe",
    paris: "cmfralyr0000nr388mrvduspe",
    lyon: "cmfralyr0000nr388mrvduspe",
    marseille: "cmfralyr0000nr388mrvduspe",
    toulouse: "cmfralyr0000nr388mrvduspe",
    bordeaux: "cmfralyr0000nr388mrvduspe",
    nantes: "cmfralyr0000nr388mrvduspe",
    rennes: "cmfralyr0000nr388mrvduspe",
    brittany: "cmfralyr0000nr388mrvduspe",

    // Germany
    germany: "cmfram3sd001dr388ekgqrcer",
    berlin: "cmfram3sd001dr388ekgqrcer",
    munich: "cmfram3sd001dr388ekgqrcer",
    frankfurt: "cmfram3sd001dr388ekgqrcer",
    hamburg: "cmfram3sd001dr388ekgqrcer",
    düsseldorf: "cmfram3sd001dr388ekgqrcer",
    dusseldorf: "cmfram3sd001dr388ekgqrcer",
    cologne: "cmfram3sd001dr388ekgqrcer",
    köln: "cmfram3sd001dr388ekgqrcer",

    // Netherlands
    netherlands: "cmfralwky000br3885s6p9juy",
    holland: "cmfralwky000br3885s6p9juy",
    amsterdam: "cmfralwky000br3885s6p9juy",
    rotterdam: "cmfralwky000br3885s6p9juy",
    "den haag": "cmfralwky000br3885s6p9juy",
    "the hague": "cmfralwky000br3885s6p9juy",

    // Italy
    italy: "cmfram9xb0028r388d03jicpd",
    rome: "cmfram9xb0028r388d03jicpd",
    roma: "cmfram9xb0028r388d03jicpd",
    milan: "cmfram9xb0028r388d03jicpd",
    milano: "cmfram9xb0028r388d03jicpd",
    florence: "cmfram9xb0028r388d03jicpd",

    // Portugal
    portugal: "cmframahe002cr3882v753nto",
    lisbon: "cmframahe002cr3882v753nto",
    lisboa: "cmframahe002cr3882v753nto",
    porto: "cmframahe002cr3882v753nto",

    // Switzerland
    switzerland: "cmfram46x001hr388srqa5igk",
    zurich: "cmfram46x001hr388srqa5igk",
    zürich: "cmfram46x001hr388srqa5igk",
    geneva: "cmfram46x001hr388srqa5igk",
    bern: "cmfram46x001hr388srqa5igk",

    // Austria
    austria: "cmfp3j8mj000u8obh3w7s0msi",
    vienna: "cmfp3j8mj000u8obh3w7s0msi",
    wien: "cmfp3j8mj000u8obh3w7s0msi",

    // Sweden
    sweden: "cmfram4l6001jr3880j5n5kur",
    stockholm: "cmfram4l6001jr3880j5n5kur",
    gothenburg: "cmfram4l6001jr3880j5n5kur",
    malmö: "cmfram4l6001jr3880j5n5kur",
    malmo: "cmfram4l6001jr3880j5n5kur",

    // Norway
    norway: "cmfram9rw0026r388lnay0ldo",
    oslo: "cmfram9rw0026r388lnay0ldo",
    bergen: "cmfram9rw0026r388lnay0ldo",

    // Finland
    finland: "cmfram4vw001lr388hb6ord98",
    helsinki: "cmfram4vw001lr388hb6ord98",

    // Denmark
    denmark: "cmfr8ca600013r3hafp363d3o",
    copenhagen: "cmfr8ca600013r3hafp363d3o",
    københavn: "cmfr8ca600013r3hafp363d3o",

    // Poland
    poland: "cmfr8caks0017r3hafizm3f52",
    warsaw: "cmfr8caks0017r3hafizm3f52",
    warszawa: "cmfr8caks0017r3hafizm3f52",
    krakow: "cmfr8caks0017r3hafizm3f52",
    kraków: "cmfr8caks0017r3hafizm3f52",

    // Luxembourg
    luxembourg: "cmfram3yn001fr388ekp0fkfo",

    // Croatia
    croatia: "cmfr8cad00015r3hau02crng6",
    zagreb: "cmfr8cad00015r3hau02crng6",

    // Slovenia
    slovenia: "cmfr8ctfz0010r3ijhnxm2hh0",
    ljubljana: "cmfr8ctfz0010r3ijhnxm2hh0",

    // Romania
    romania: "cmfralz3s000sr388c6w517zm",
    bucharest: "cmfralz3s000sr388c6w517zm",
    bucuresti: "cmfralz3s000sr388c6w517zm",

    // Russia
    russia: "cmfr8cq2j000kr3ijvg2h3nph",
    moscow: "cmfr8cq2j000kr3ijvg2h3nph",
    "st petersburg": "cmfr8cq2j000kr3ijvg2h3nph",

    // Gibraltar
    gibraltar: "cmfr8cmse0005r3ij48ghooww",
  };

  // Get all clubs with null countryId
  const clubsWithNullCountry = await prisma.club.findMany({
    where: { countryId: null },
    select: { id: true, name: true, location: true },
  });

  console.log(
    `Found ${clubsWithNullCountry.length} clubs with null countryId\n`
  );

  let updated = 0;
  const notMatched: { name: string; location: string | null }[] = [];

  for (const club of clubsWithNullCountry) {
    if (!club.location) {
      notMatched.push({ name: club.name, location: club.location });
      continue;
    }

    const locationLower = club.location.toLowerCase();
    let matchedCountryId: string | null = null;

    // Check each keyword in our mapping
    for (const [keyword, countryId] of Object.entries(locationMappings)) {
      if (locationLower.includes(keyword)) {
        matchedCountryId = countryId;
        break;
      }
    }

    if (matchedCountryId) {
      await prisma.club.update({
        where: { id: club.id },
        data: { countryId: matchedCountryId },
      });
      updated++;
    } else {
      notMatched.push({ name: club.name, location: club.location });
    }
  }

  console.log(`\n✅ Updated ${updated} clubs with correct countryId`);

  // Show stats by country after update
  console.log("\n=== Updated Club Counts by European Country ===");
  const europeUnitId = "cmfralwk30009r3887wwhc9xp";
  const europeCountries = await prisma.country.findMany({
    where: { internationalUnitId: europeUnitId },
    orderBy: { name: "asc" },
  });

  for (const country of europeCountries) {
    const count = await prisma.club.count({
      where: { countryId: country.id },
    });
    if (count > 0) {
      console.log(`  ${country.name}: ${count} clubs`);
    }
  }

  // Show some unmatched clubs (non-European)
  const unmatchedNonIrish = notMatched
    .filter((c) => c.location && !c.location.toLowerCase().includes("ireland"))
    .slice(0, 20);

  if (unmatchedNonIrish.length > 0) {
    console.log(
      `\nSample unmatched non-Irish clubs (${unmatchedNonIrish.length} shown):`
    );
    unmatchedNonIrish.forEach((c) =>
      console.log(`  - ${c.name}: ${c.location}`)
    );
  }

  await prisma.$disconnect();
}

fixClubCountryIds().catch((e) => {
  console.error("Error:", e);
  prisma.$disconnect();
  process.exit(1);
});
