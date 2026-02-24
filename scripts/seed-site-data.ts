import { PrismaClient } from "@prisma/client";
import { fixtures2026 } from "../src/app/(main)/data/fixtures";

const prisma = new PrismaClient();

const standingsData = [
  {
    id: "football-11s",
    name: "Regional Football Championships (11s)",
    shortName: "Football 11s",
    color: "text-green-700",
    bgColor: "bg-green-600",
    borderColor: "border-green-600",
    subtitle: "4 rounds throughout the season",
    status: "upcoming",
    nextFixture: "Round 1 - March 21, 2026 (Maastricht)",
    teams: [
      "Amsterdam GAA",
      "Brussels GAA",
      "Luxembourg GAA",
      "Den Haag GAA",
      "Leuven Gaels",
      "Maastricht Gaels",
    ],
  },
  {
    id: "football-15s",
    name: "15s Football Championships",
    shortName: "Football 15s",
    color: "text-indigo-700",
    bgColor: "bg-indigo-600",
    borderColor: "border-indigo-600",
    subtitle: "Pool stage followed by knockout rounds",
    status: "upcoming",
    nextFixture: "QFs/SFs - May 30, 2026 (Maastricht)",
    pools: [
      {
        name: "Pool A",
        teams: ["Amsterdam GAA", "Brussels GAA", "Leuven Gaels"],
      },
      {
        name: "Pool B",
        teams: ["Luxembourg GAA", "Den Haag GAA", "Maastricht Gaels"],
      },
    ],
  },
  {
    id: "camogie-hurling-79s",
    name: "Regional Camogie & Hurling Championships (7s/9s)",
    shortName: "Camogie/Hurling 7s/9s",
    color: "text-amber-700",
    bgColor: "bg-amber-600",
    borderColor: "border-amber-600",
    subtitle: "Group stage format",
    status: "upcoming",
    nextFixture: "March 28, 2026 (The Hague)",
    teams: [
      "Brussels GAA",
      "Amsterdam GAA",
      "Luxembourg GAA",
      "Den Haag GAA",
      "Eindhoven GAA",
    ],
  },
  {
    id: "hurling-15s",
    name: "15s Hurling Championship",
    shortName: "Hurling 15s",
    color: "text-amber-800",
    bgColor: "bg-amber-700",
    borderColor: "border-amber-700",
    subtitle: "Round robin format - Finals in August",
    status: "upcoming",
    nextFixture: "Semi-finals - July 4, 2026 (Maastricht)",
    teams: ["Brussels GAA", "Luxembourg GAA", "Amsterdam/Maastricht"],
  },
  {
    id: "camogie-15s",
    name: "15s Camogie & Hurling Championships",
    shortName: "Camogie 15s",
    color: "text-purple-700",
    bgColor: "bg-purple-600",
    borderColor: "border-purple-600",
    subtitle: "Round robin format - Finals in August",
    status: "upcoming",
    nextFixture: "Finals - August 29, 2026 (Maastricht)",
    teams: ["Belgium", "Amsterdam GAA", "Luxembourg/Hague"],
  },
];

const timelineData = [
  {
    year: 1747,
    title: "First Documented Hurling Match in Europe",
    description:
      "The earliest recorded hurling match outside of Ireland takes place, laying the foundation for Gaelic Games abroad.",
    category: "milestone",
  },
  {
    year: 1884,
    title: "GAA Founded in Ireland",
    description:
      "The Gaelic Athletic Association is founded in Thurles, Ireland, to preserve and promote Irish sports and culture.",
    category: "milestone",
  },
  {
    year: 1973,
    title: "Ireland Joins the EEC",
    description:
      "The Republic of Ireland joins the European Economic Community, sending diplomats to establish new missions on the continent - setting the stage for GAA clubs to follow.",
    category: "milestone",
    sourceUrl: "https://epicchq.com/story/playing-the-world/",
    sourceName: "EPIC Museum",
  },
  {
    year: 1974,
    title: "Den Haag GAA Founded",
    description:
      "Mary Gavin founds Den Haag GAA in the Netherlands, establishing one of the oldest GAA clubs on mainland Europe.",
    category: "founding",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/benelux-den-haag.png"],
  },
  {
    year: 1978,
    title: "Luxembourg GAA Founded - Europe's Oldest",
    description:
      "Gaelic Sports Club Luxembourg is formally established, becoming the oldest GAA club on the European mainland.",
    category: "founding",
    sourceUrl: "https://en.wikipedia.org/wiki/Gaelic_Sports_Club_Luxembourg",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/benelux-luxembourg.png"],
  },
  {
    year: 1980,
    title: "EC Brussels (Youth) Established",
    description:
      "EC Brussels Youth section is established, beginning youth development in Gaelic Games in Belgium.",
    category: "founding",
    sourceUrl:
      "https://gaelicgameseurope.com/2024/03/11/the-5-leagues-of-europe-the-benelux/",
    sourceName: "Gaelic Games Europe",
    clubCrests: ["/club-crests/benelux-ec-brussels.png"],
  },
  {
    year: 1999,
    month: "November",
    title: "European County Board Founded",
    description:
      "On November 22, 1999, GAA President Joe McDonagh and representatives from five clubs meet in Amsterdam to formally found the GAA's European County Board.",
    category: "milestone",
    sourceUrl: "https://en.wikipedia.org/wiki/Gaelic_Games_Europe",
    sourceName: "Wikipedia",
  },
  {
    year: 2003,
    month: "March",
    title: "Amsterdam GAA Founded",
    description:
      "Amsterdam Gaelic Athletic Club is founded on St. Patrick's Day. The club grows to become one of Europe's leading GAA clubs.",
    category: "founding",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
  },
  {
    year: 2003,
    title: "Brussels Craobh Rua GAA Founded",
    description:
      "Brussels Craobh Rua (formerly Belgium GAA) is founded, becoming one of the cornerstones of the Irish expat community in Belgium.",
    category: "founding",
    sourceUrl: "https://brussels-gaa.com/about/",
    sourceName: "Brussels Craobh Rua",
    clubCrests: ["/club-crests/benelux-brussels.png"],
  },
  {
    year: 2004,
    title: "Maastricht Gaels Founded",
    description:
      "Tony Bass establishes the Maastricht Gaels club in the Netherlands.",
    category: "founding",
    sourceUrl:
      "https://www.gaa.ie/article/gaelic-games-europe-is-open-for-business",
    sourceName: "GAA.ie",
    clubCrests: ["/club-crests/benelux-maastricht-gaels.png"],
  },
  {
    year: 2007,
    title: "First Official Benelux Championship",
    description:
      "The inaugural Benelux GAA Championship is held, with Luxembourg winning the first Men's Football title.",
    category: "championship",
    clubCrests: ["/club-crests/benelux-luxembourg.png"],
  },
  {
    year: 2008,
    title: "First Book on Gaelic Games in Europe",
    description:
      "Cathal mac Daibhi publishes a 144-page account commemorating the 30th anniversary of Gaelic Sports Club Luxembourg.",
    category: "milestone",
    sourceUrl:
      "https://ladiesgaelic.ie/more-than-a-sporting-experience-the-first-thirty-years-of-gaelic-games-in-luxembourg/",
    sourceName: "Ladies Gaelic Football",
    clubCrests: ["/club-crests/benelux-luxembourg.png"],
  },
  {
    year: 2008,
    title: "Brussels Ladies Football Established",
    description:
      "Dubliner Barbara Wynne establishes the Brussels ladies football team, expanding the women's game in Belgium.",
    category: "founding",
    sourceUrl: "https://www.balls.ie/gaa/florina-tobon-belgium-gaa-533601",
    sourceName: "Balls.ie",
    clubCrests: ["/club-crests/benelux-brussels.png"],
  },
  {
    year: 2012,
    title: "Cologne Celtics Founded",
    description:
      "The Cologne Celtics are established in Germany, expanding the Benelux-affiliated clubs into the Rhineland.",
    category: "founding",
    clubCrests: ["/club-crests/benelux-cologne-celts.png"],
  },
  {
    year: 2013,
    title: "Mary Gavin Receives GAA President's Award",
    description:
      "Mary Gavin, founder of Den Haag GAA, is recognized with a GAA President's Award for her outstanding contribution to Gaelic Games in Europe.",
    category: "award",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/benelux-den-haag.png"],
  },
  {
    year: 2013,
    title: "Eindhoven Shamrocks Founded",
    description: "Eindhoven Shamrocks GAA is established in the Netherlands.",
    category: "founding",
    clubCrests: ["/club-crests/benelux-eindhoven-shamrocks.png"],
  },
  {
    year: 2014,
    title: "Amsterdam Begins European Dominance",
    description:
      "Amsterdam GAA wins the first of seven European Senior Football Championships.",
    category: "championship",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
  },
  {
    year: 2015,
    title: "Leuven, Hamburg & Darmstadt GAA Founded",
    description:
      "Three new clubs are established, significantly expanding the region's footprint.",
    category: "founding",
    clubCrests: [
      "/club-crests/benelux-earls-of-leuven.png",
      "/club-crests/benelux-hamburg-gaa.png",
      "/club-crests/benelux-darmstadt.png",
    ],
  },
  {
    year: 2017,
    title: "Luxembourg Wins European Championship",
    description:
      "Luxembourg GAA wins the European 15-a-side Championship, breaking Amsterdam's winning streak.",
    category: "championship",
    clubCrests: ["/club-crests/benelux-luxembourg.png"],
  },
  {
    year: 2018,
    title: "Groningen Gaels Founded",
    description: "Groningen Gaels are established in the northern Netherlands.",
    category: "founding",
    clubCrests: ["/club-crests/benelux-groningen-gaels.png"],
  },
  {
    year: 2019,
    title: "Mary Gavin's World Gaelic Games Trophy",
    description:
      "The Camogie Association names their World Gaelic Games trophy in honor of Mary Gavin.",
    category: "award",
    sourceUrl: "https://denhaaggaa.com/den-haag-gaa-about-us/",
    sourceName: "Den Haag GAA",
    clubCrests: ["/club-crests/benelux-den-haag.png"],
  },
  {
    year: 2020,
    title: "COVID-19 Pandemic Challenges",
    description:
      "Despite global challenges, Benelux GAA clubs adapt with online training and virtual tournaments. Championships not played.",
    category: "milestone",
  },
  {
    year: 2021,
    month: "May",
    title: '"The Rise of Gaelic Sports in Europe" Published',
    description:
      "Denis O'Brien publishes a comprehensive account of how GAA spread across the continent.",
    category: "milestone",
    sourceUrl:
      "https://www.amazon.co.uk/RISE-GAELIC-SPORTS-EUROPE/dp/B0948KS7QG",
    sourceName: "Amazon",
  },
  {
    year: 2021,
    title: "Tony Bass Receives GAA President's Award",
    description:
      "Tony Bass is honored with a GAA President's Award for his tireless work in European GAA.",
    category: "award",
    sourceUrl:
      "https://www.gaa.ie/article/gaelic-games-europe-is-open-for-business",
    sourceName: "GAA.ie",
    clubCrests: ["/club-crests/benelux-maastricht-gaels.png"],
  },
  {
    year: 2021,
    title: "Nijmegen GFC Founded",
    description:
      "Nijmegen Gaelic Football Club is established in the Netherlands.",
    category: "founding",
    clubCrests: ["/club-crests/benelux-nijmegen-gfc.png"],
  },
  {
    year: 2022,
    title: "Amsterdam Makes Hurling History",
    description:
      "Amsterdam GAA becomes the first team to represent Europe in the All-Ireland Junior Club Hurling Championship.",
    category: "championship",
    sourceUrl: "https://en.wikipedia.org/wiki/Amsterdam_GAC",
    sourceName: "Wikipedia",
    clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
  },
  {
    year: 2022,
    title: "Benelux GAA Formally Established",
    description:
      "Benelux GAA is officially established as the governing body for Gaelic Games across Belgium, Netherlands, Luxembourg, and affiliated German clubs.",
    category: "milestone",
    sourceUrl: "https://www.gaelicgamesbenelux.com/",
    sourceName: "Benelux GAA",
  },
  {
    year: 2023,
    month: "July",
    title: "GAA World Games Participation",
    description:
      "Players from across the Benelux region represent their clubs at the GAA World Games in Derry, Ireland.",
    category: "international",
  },
  {
    year: 2024,
    title: "Brussels Reaches 34 European Titles",
    description:
      "Brussels Craobh Rua celebrates 34 championship wins in just over 20 years.",
    category: "championship",
    sourceUrl: "https://brussels-gaa.com/about/",
    sourceName: "Brussels Craobh Rua",
    clubCrests: ["/club-crests/benelux-brussels.png"],
  },
  {
    year: 2025,
    month: "November",
    title: "Amsterdam Makes History: First European Club to Win Leinster Title",
    description:
      "Amsterdam GAC defeats Longford Slashers 0-15 to 0-14 in the Leinster Special Junior Club Hurling Championship Final.",
    category: "championship",
    sourceUrl:
      "https://www.rte.ie/sport/hurling/2025/1124/1545513-mcdermott-relieved-after-amsterdams-leinster-win/",
    sourceName: "RTE Sport",
    clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
  },
  {
    year: 2025,
    title: "Aachen Gaels Founded",
    description:
      "Germany's first new GAA club in a decade is established at the crossroads of Germany, Belgium, and the Netherlands.",
    category: "founding",
    clubCrests: ["/club-crests/benelux-aachen-gaels.png"],
  },
  {
    year: 2026,
    month: "February",
    title: "Breagh Recruiting Becomes First Benelux GAA Sponsor",
    description:
      "Breagh Recruiting partners with Benelux GAA as the organisation's first official sponsor, supporting youth development programs.",
    category: "sponsorship",
    sourceUrl: "https://www.breagh.com",
    sourceName: "Breagh Recruiting",
    imageUrl: "/sponsors/breagh-blue.png",
    featured: true,
  },
];

async function seedSiteData() {
  console.log("Seeding SiteData table...\n");

  const fixturesResult = await prisma.siteData.upsert({
    where: { key: "fixtures" },
    update: { data: fixtures2026 as unknown as Record<string, unknown>[] },
    create: {
      key: "fixtures",
      data: fixtures2026 as unknown as Record<string, unknown>[],
    },
  });
  console.log(
    `Upserted "fixtures" (${fixtures2026.length} fixtures) - ID: ${fixturesResult.id}`
  );

  const standingsResult = await prisma.siteData.upsert({
    where: { key: "standings" },
    update: { data: standingsData as unknown as Record<string, unknown>[] },
    create: {
      key: "standings",
      data: standingsData as unknown as Record<string, unknown>[],
    },
  });
  console.log(
    `Upserted "standings" (${standingsData.length} competition sections) - ID: ${standingsResult.id}`
  );

  const timelineResult = await prisma.siteData.upsert({
    where: { key: "timeline" },
    update: { data: timelineData as unknown as Record<string, unknown>[] },
    create: {
      key: "timeline",
      data: timelineData as unknown as Record<string, unknown>[],
    },
  });
  console.log(
    `Upserted "timeline" (${timelineData.length} events) - ID: ${timelineResult.id}`
  );

  console.log("\nSiteData seeding complete.");
}

seedSiteData()
  .catch((e) => {
    console.error("Error seeding site data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
