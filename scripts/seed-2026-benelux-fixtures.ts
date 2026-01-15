import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Club IDs from actual database
const CLUBS = {
  maastricht: "cmfwotxx200uzr39yhsjauesv", // Maastricht Gaels
  amsterdam: "cmh2i59on0000r3pxyt4h8k77", // Amsterdam GAC
  eindhoven: "cmfwotlly007dr39yj8rf0r1b", // Eindhoven Shamrocks GAA
  copenhagen: "cmfwotktn005pr39ysb7vutlv", // Copenhagen GAA
  vienna: "cmh388qph001fr3k72ltsbvie", // Vienna Gaels GAA
  leuven: "cmfwotlk10079r39y0hn1jdfz", // Earls of Leuven
};

// Location coordinates
const LOCATIONS = {
  maastricht: {
    location: "Maastricht, Limburg, Netherlands",
    latitude: 50.848976,
    longitude: 5.692651,
  },
  amsterdam: {
    location: "Amsterdam, North Holland, Netherlands",
    latitude: 52.378,
    longitude: 4.9,
  },
  eindhoven: {
    location: "Eindhoven, North Brabant, Netherlands",
    latitude: 51.43773,
    longitude: 5.480267,
  },
  copenhagen: {
    location: "Copenhagen, Denmark",
    latitude: 55.675313,
    longitude: 12.569734,
  },
  vienna: {
    location: "Vienna, Austria",
    latitude: 48.208354,
    longitude: 16.372504,
  },
  leuven: {
    location: "Leuven, Flemish Brabant, Belgium",
    latitude: 50.879202,
    longitude: 4.701168,
  },
  waterford: {
    location: "Waterford, Ireland",
    latitude: 52.2593,
    longitude: -7.1101,
  },
};

interface EventData {
  title: string;
  eventType: string;
  location: string;
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  acceptedTeamTypes: string[];
  visibility: "PRIVATE" | "PUBLIC";
  clubId: string | null;
  cost: number | null;
}

const events2026: EventData[] = [
  // March 14 - Benelux Regional Football Championships R.1 (tbc - clashes with Cologne invitational)
  {
    title: "2026 Benelux Regional Football Championships (11s) R.1",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // Using Maastricht as placeholder - tbc
    startDate: new Date("2026-03-14"),
    endDate: new Date("2026-03-14"),
    description:
      "Round 1 of the 2026 Benelux Regional Football Championships. Host TBC.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // March 28 - Benelux Regional Camogie & Hurling Championships (tbc)
  {
    title: "Benelux Regional Camogie & Hurling Championships (11s)",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // Using Maastricht as placeholder - tbc
    startDate: new Date("2026-03-28"),
    endDate: new Date("2026-03-28"),
    description: "Benelux Regional Camogie & Hurling Championships. Host TBC.",
    acceptedTeamTypes: ["Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // April 11 - Benelux Regional Football Championships R.2 (tbc - clashes with German Cup)
  {
    title: "2026 Benelux Regional Football Championships (11s) R.2",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // Using Maastricht as placeholder - tbc
    startDate: new Date("2026-04-11"),
    endDate: new Date("2026-04-11"),
    description:
      "Round 2 of the 2026 Benelux Regional Football Championships. Host TBC.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // May 2 - European Collegiate Football Championships - LEUVEN (confirmed)
  {
    title: "European Collegiate Football Championships 2026",
    eventType: "Tournament",
    ...LOCATIONS.leuven,
    startDate: new Date("2026-05-02"),
    endDate: new Date("2026-05-02"),
    description:
      "European Collegiate Football Championships hosted by Earls of Leuven.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: CLUBS.leuven,
    cost: null,
  },

  // May 2 - European Camogie/Hurling (9s) Championships R.1 - EINDHOVEN (confirmed)
  {
    title: "European Camogie/Hurling (9s) Championships - R.1",
    eventType: "Tournament",
    ...LOCATIONS.eindhoven,
    startDate: new Date("2026-05-02"),
    endDate: new Date("2026-05-02"),
    description:
      "Round 1 of the European Camogie/Hurling (9s) Championships. Hosted by Eindhoven Shamrocks.",
    acceptedTeamTypes: ["Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: CLUBS.eindhoven,
    cost: null,
  },

  // May 2 - European "Féile" Youth Football Championships - MAASTRICHT (confirmed)
  {
    title: 'European "Féile" Youth Football Championships 2026',
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-05-02"),
    endDate: new Date("2026-05-02"),
    description:
      "European Youth Football Championships (Féile). Hosted by Maastricht Gaels.",
    acceptedTeamTypes: ["Youth"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht,
    cost: null,
  },

  // May 16 - Benelux Regional Football Championships R.3 (tbc)
  {
    title: "2026 Benelux Regional Football Championships (11s) R.3",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // Using Maastricht as placeholder - tbc
    startDate: new Date("2026-05-16"),
    endDate: new Date("2026-05-16"),
    description:
      "Round 3 of the 2026 Benelux Regional Football Championships. Host TBC.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // May 30 - Benelux 15s Football Championships QF - MAASTRICHT (possible)
  {
    title: "Benelux 15s Football Championships - Quarter-finals",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-05-30"),
    endDate: new Date("2026-05-30"),
    description:
      "Benelux 15s Football Championships Quarter-final window (if required). Hosted by Maastricht Gaels.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht,
    cost: null,
  },

  // June 6 - European Camogie/Hurling (9s) Championships R.2 - COPENHAGEN (confirmed)
  {
    title: "European Camogie/Hurling (9s) Championships - R.2",
    eventType: "Tournament",
    ...LOCATIONS.copenhagen,
    startDate: new Date("2026-06-06"),
    endDate: new Date("2026-06-06"),
    description:
      "Round 2 of the European Camogie/Hurling (9s) Championships. Hosted by Copenhagen GAA.",
    acceptedTeamTypes: ["Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: CLUBS.copenhagen,
    cost: null,
  },

  // June 13 - Football Development Tournament (tbc)
  {
    title: "Football Development Tournament (11s) - June",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // placeholder
    startDate: new Date("2026-06-13"),
    endDate: new Date("2026-06-13"),
    description: "Benelux Football Development Tournament. Host TBC.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // June 20/27 - Benelux 15s Football Championships SF - MAASTRICHT (possible)
  {
    title: "Benelux 15s Football Championships - Semi-finals",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-06-20"),
    endDate: new Date("2026-06-27"),
    description:
      "Benelux 15s Football Championships Semi-finals window. Hosted by Maastricht Gaels.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht,
    cost: null,
  },

  // July 4 - Benelux 15s Hurling Championship SF - MAASTRICHT (confirmed)
  {
    title: "Benelux 15s Hurling Championship - Semi-finals",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-07-04"),
    endDate: new Date("2026-07-04"),
    description:
      "Benelux 15s Hurling Championship Semi-finals. Hosted by Maastricht Gaels.",
    acceptedTeamTypes: ["Hurling"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht,
    cost: null,
  },

  // July 13-17 - World Games - WATERFORD (confirmed)
  {
    title: "GAA World Games 2026",
    eventType: "Tournament",
    ...LOCATIONS.waterford,
    startDate: new Date("2026-07-13"),
    endDate: new Date("2026-07-17"),
    description:
      "The GAA World Games in Waterford, Ireland. The premier international GAA event.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA", "Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: null, // Ireland-based, no European club
    cost: null,
  },

  // Aug 22 - Benelux 15s Football Championships Finals - MAASTRICHT (confirmed)
  {
    title: "Benelux 15s Football Championships - Finals",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-08-22"),
    endDate: new Date("2026-08-22"),
    description:
      "Benelux 15s Football Championships Finals. Hosted by Maastricht Gaels.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht,
    cost: null,
  },

  // Aug 29 - Benelux 15s Hurling Championship Final - MAASTRICHT (confirmed)
  {
    title: "Benelux 15s Hurling Championship - Final",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-08-29"),
    endDate: new Date("2026-08-29"),
    description:
      "Benelux 15s Hurling Championship Final. Hosted by Maastricht Gaels.",
    acceptedTeamTypes: ["Hurling"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht,
    cost: null,
  },

  // Sept 5 - European Camogie/Hurling (9s) Championships R.3 - VIENNA (confirmed)
  {
    title: "European Camogie/Hurling (9s) Championships - R.3",
    eventType: "Tournament",
    ...LOCATIONS.vienna,
    startDate: new Date("2026-09-05"),
    endDate: new Date("2026-09-05"),
    description:
      "Round 3 of the European Camogie/Hurling (9s) Championships. Hosted by Vienna Gaels.",
    acceptedTeamTypes: ["Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: CLUBS.vienna,
    cost: null,
  },

  // Sept 12-13 - European Premier Football Championships (15s) - poss Maastricht
  {
    title: "European Premier Football Championships (15s)",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-09-12"),
    endDate: new Date("2026-09-13"),
    description:
      "European Premier Football Championships (15s). Semi-Finals (Sat) & Finals (Sun). Location TBC (possibly Maastricht).",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht, // tentative
    cost: null,
  },

  // Sept 19-20 - European Premier Camogie/Hurling Championships (15s) - poss Maastricht
  {
    title: "European Premier Camogie/Hurling Championships (15s)",
    eventType: "Tournament",
    ...LOCATIONS.maastricht,
    startDate: new Date("2026-09-19"),
    endDate: new Date("2026-09-20"),
    description:
      "European Premier Camogie/Hurling Championships (15s). Semi-Finals (Sat) & Finals (Sun). Location TBC (possibly Maastricht).",
    acceptedTeamTypes: ["Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: CLUBS.maastricht, // tentative
    cost: null,
  },

  // Sept 26 - Benelux Regional Football Championships (11s) (tbc)
  {
    title: "2026 Benelux Regional Football Championships (11s) R.4",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // placeholder
    startDate: new Date("2026-09-26"),
    endDate: new Date("2026-09-26"),
    description:
      "Round 4 of the 2026 Benelux Regional Football Championships. Host TBC.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // Oct 3 - European Camogie/Hurling (9s) Championships R.4 - AMSTERDAM (confirmed)
  {
    title: "European Camogie/Hurling (9s) Championships - R.4",
    eventType: "Tournament",
    ...LOCATIONS.amsterdam,
    startDate: new Date("2026-10-03"),
    endDate: new Date("2026-10-03"),
    description:
      "Round 4 of the European Camogie/Hurling (9s) Championships. Hosted by Amsterdam GAA.",
    acceptedTeamTypes: ["Hurling", "Camogie"],
    visibility: "PRIVATE",
    clubId: CLUBS.amsterdam,
    cost: null,
  },

  // Oct 17 - "Pan-Euros" European Football Championships (11s) (tbc)
  {
    title: '"Pan-Euros" European Football Championships (11s)',
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // placeholder
    startDate: new Date("2026-10-17"),
    endDate: new Date("2026-10-17"),
    description:
      "Pan-European Football Championships (11s). Host TBC. Europe's flagship 11-a-side tournament.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },

  // Nov 7 - Football Development Tournament (tbc)
  {
    title: "Football Development Tournament (11s) - November",
    eventType: "Tournament",
    ...LOCATIONS.maastricht, // placeholder
    startDate: new Date("2026-11-07"),
    endDate: new Date("2026-11-07"),
    description: "Benelux Football Development Tournament. Host TBC.",
    acceptedTeamTypes: ["Mens Gaelic Football", "LGFA"],
    visibility: "PRIVATE",
    clubId: null, // tbc
    cost: null,
  },
];

async function seedEvents() {
  console.log("🏐 Seeding 2026 Benelux Fixtures Programme...\n");

  let created = 0;
  let skipped = 0;

  for (const event of events2026) {
    // Check if event already exists (by title and date)
    const existing = await prisma.event.findFirst({
      where: {
        title: event.title,
        startDate: event.startDate,
      },
    });

    if (existing) {
      console.log(`⏭️  Skipping (already exists): ${event.title}`);
      skipped++;
      continue;
    }

    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        eventType: event.eventType,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        acceptedTeamTypes: event.acceptedTeamTypes,
        visibility: event.visibility,
        clubId: event.clubId,
        cost: event.cost,
        isRecurring: false,
      },
    });

    const hostInfo = event.clubId ? "✅" : "❓ (host tbc)";
    console.log(`${hostInfo} Created: ${createdEvent.title}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created} events`);
  console.log(`   Skipped: ${skipped} events (already existed)`);
  console.log(`\n✨ Done!`);
}

seedEvents()
  .catch((e) => {
    console.error("Error seeding events:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
