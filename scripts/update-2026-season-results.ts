import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const ARTICLE_ID = "season-wrap-2026-11s";
const TIMELINE_TITLE = "Luxembourg and Brussels Crowned 2026 Benelux Champions";

const article = {
  id: ARTICLE_ID,
  title:
    "Luxembourg and Brussels crowned 2026 Breagh Benelux Football Champions",
  excerpt:
    "GSC Luxembourg 'A' and Brussels Craobh Rua 'A' lifted the Men's and Ladies Cups as the 2026 Breagh Benelux 11s season closed in Eindhoven.",
  content: `The 2026 Breagh Benelux Football Championships came to a close in Eindhoven on 26 September, with GSC Luxembourg 'A' crowned Men's champions and Brussels Craobh Rua 'A' completing a dominant Ladies campaign.

## Men's Football

Luxembourg 'A' won two of the four rounds, taking top spot in Maastricht and again on home soil in Luxembourg, and finished the season on 79 points. Amsterdam GAC, who won Round 2 in Frankfurt, finished as runners-up on 67. Eindhoven Shamrocks 'A' won the final round in front of their home crowd to secure third place, with Brussels 'A' fourth.

Earls of Leuven 'A' took the Shield ahead of the combined Maastricht Gaels / Nijmegen GFC side, while Brussels 'B' held off Groningen Gaels 'A' to win the Plate.

**Men's honours**
- Champions: GSC Luxembourg 'A' (runners-up: Amsterdam GAC)
- Shield: Earls of Leuven 'A' (runners-up: Maastricht Gaels / Nijmegen GFC)
- Plate: Brussels Craobh Rua 'B' (runners-up: Groningen Gaels 'A')

## Ladies Football

Brussels 'A' won the first three rounds outright and finished with 95 points, nearly 30 clear of GSC Luxembourg. Eindhoven finished third, while Groningen Gaels topped the final round in Eindhoven to climb into fourth.

The combined Maastricht Gaels / Nijmegen GFC side won the Shield ahead of Leuven, and Dusseldorf GFC claimed the Plate from Hamburg GAA.

**Ladies honours**
- Champions: Brussels Craobh Rua 'A' (runners-up: GSC Luxembourg)
- Shield: Maastricht Gaels / Nijmegen GFC (runners-up: Earls of Leuven)
- Plate: Dusseldorf GFC (runners-up: Hamburg GAA)

## A record season

Across the four rounds, 984 players took part in 177 games for 66 teams, an average of 246 players per round. That is a 5% increase in players on 2025, with Men's participation up 13%. Round 4 in Eindhoven produced 53 games, the most of any round this year.

Combined with Brussels' historic camogie and hurling double in The Hague in March, and Amsterdam retaining both 15s titles, 2026 has been one of the busiest seasons in Benelux GAA history.

Full final tables are available on the [Standings](/standings) page, and the [Roll of Honour](/roll-of-honor) has been updated with all 2026 winners.

Thank you to Breagh Recruitment for sponsoring the 2026 championships, to every host club, and to all the players, officials and volunteers who made the season possible.`,
  date: "2026-09-27",
  author: "",
  readTime: 3,
  category: "Benelux News",
  tags: [],
  imageUrl: "",
  featured: false,
  status: "draft",
};

const timelineEntries = [
  {
    year: 2026,
    month: "March",
    title: "Brussels Complete First-Ever Benelux Small Ball Double",
    description:
      "Brussels Craobh Rua win both the Regional Camogie (7s) and Hurling (9s) Championships on the same day in The Hague, beating Eindhoven in the camogie final and Amsterdam in the hurling final. No club had previously won both Benelux small ball titles in a single season.",
    category: "championship",
    sourceUrl: "/news/mnfthwoltg73s0gv99c",
    sourceName: "Benelux GAA News",
    clubCrests: ["/club-crests/benelux-brussels.png"],
  },
  {
    year: 2026,
    month: "August",
    title: "Amsterdam Retain Both 15s Titles",
    description:
      "Amsterdam GAC defeat Luxembourg in both the 15s Football and 15s Hurling finals in Maastricht, extending their run to eight consecutive Men's 15s Football Championships stretching back to 2017.",
    category: "championship",
    clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
  },
  {
    year: 2026,
    month: "September",
    title: TIMELINE_TITLE,
    description:
      "The first Breagh-sponsored Benelux 11s season closes in Eindhoven. GSC Luxembourg 'A' win the Men's Championship and Brussels Craobh Rua 'A' the Ladies Championship, with a record 984 players taking part across four rounds.",
    category: "championship",
    sourceUrl: "/roll-of-honor",
    sourceName: "Roll of Honour",
    clubCrests: [
      "/club-crests/benelux-luxembourg.png",
      "/club-crests/benelux-brussels.png",
    ],
  },
];

async function loadKey(key: string): Promise<unknown[]> {
  const row = await prisma.siteData.findUnique({ where: { key } });
  return Array.isArray(row?.data) ? (row!.data as unknown[]) : [];
}

async function main() {
  const backupDir = join(process.cwd(), "backups", "site-data");
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  const keys = ["fixtures", "standings", "timeline", "news"] as const;
  const current: Record<string, unknown[]> = {};
  for (const key of keys) current[key] = await loadKey(key);
  writeFileSync(
    join(backupDir, `site-data-${stamp}.json`),
    JSON.stringify(current, null, 2)
  );
  console.log(`Backup written to backups/site-data/site-data-${stamp}.json`);

  const fixtures = (current.fixtures as Record<string, unknown>[]).map((f) =>
    f.id === "11"
      ? (() => {
          const { tbc: _tbc, ...rest } = f;
          return { ...rest, date: "2026-05-30", venue: "Luxembourg" };
        })()
      : f
  );

  const standings = (current.standings as Record<string, unknown>[]).map(
    (s) => {
      if (s.id !== "football-15s" && s.id !== "hurling-15s") return s;
      const { nextFixture: _nf, ...rest } = s;
      return {
        ...rest,
        status: "complete",
        result: { winner: "Amsterdam GAA", runnerUp: "Luxembourg GAA" },
      };
    }
  );

  const newTitles = new Set(timelineEntries.map((t) => t.title));
  const timeline = (current.timeline as Record<string, unknown>[]).filter(
    (t) => !newTitles.has(t.title as string)
  );
  timeline.push(...timelineEntries);

  const news = current.news as Record<string, unknown>[];
  if (!news.some((n) => n.id === ARTICLE_ID)) {
    news.unshift(article);
  }

  const updates: Record<string, unknown[]> = {
    fixtures,
    standings,
    timeline,
    news,
  };
  for (const key of keys) {
    await prisma.siteData.upsert({
      where: { key },
      update: { data: updates[key] as object },
      create: { key, data: updates[key] as object },
    });
    console.log(`Updated ${key} (${updates[key].length} items)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
