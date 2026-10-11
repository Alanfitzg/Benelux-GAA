import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type Row = Record<string, unknown> & {
  id?: string;
  title?: string;
  teams?: string[];
};

async function load(key: string) {
  const row = await prisma.siteData.findUnique({ where: { key } });
  return (row?.data ?? []) as Row[];
}

async function main() {
  const standings = await load("standings");
  const timeline = await load("timeline");
  const dir = join(process.cwd(), "backups", "site-data");
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(
    join(dir, `standings-timeline-${stamp}.json`),
    JSON.stringify({ standings, timeline }, null, 2)
  );

  const hurling = standings.find((s) => s.id === "hurling-15s");
  if (hurling)
    hurling.teams = (hurling.teams ?? []).map((t) =>
      t === "Amsterdam/Maastricht" ? "Amsterdam GAA" : t
    );
  const newStandings = standings.filter((s) => s.id !== "camogie-15s");
  console.log(
    "standings: hurling teams",
    JSON.stringify(hurling?.teams),
    "| removed camogie-15s:",
    standings.length - newStandings.length
  );

  for (const t of timeline) {
    if (t.title === "Luxembourg GAA Founded - Europe's Oldest") {
      t.title = "Luxembourg GAA Founded";
      t.description =
        "Gaelic Sports Club Luxembourg is formally established, one of the earliest GAA clubs on the European mainland. Founded when Irish people moved to the Grand Duchy to work in European institutions.";
      console.log("timeline: Luxembourg fixed");
    }
    if (t.title === "Maastricht Gaels Founded") {
      t.sourceUrl =
        "https://www.gaa.ie/article/a-thriving-club-and-a-european-hub";
      console.log("timeline: Maastricht link fixed");
    }
    if (/^Tony Bass Receives GAA President/.test(t.title ?? "")) {
      t.sourceUrl =
        "https://www.gaa.ie/article/gradaim-an-uachtarain-2021-winners-announced";
      console.log("timeline: Tony Bass link fixed");
    }
    if (t.title === "First Book on Gaelic Games in Europe") {
      t.description =
        'Eoghan Ó hAnnracháin and Cathal Davey publish "More than a Sporting Experience: 30 Years of Gaelic Games in Luxembourg", a 144-page account commemorating the 30th anniversary of Gaelic Sports Club Luxembourg.';
      console.log("timeline: book fixed");
    }
  }

  await prisma.siteData.update({
    where: { key: "standings" },
    data: { data: newStandings },
  });
  await prisma.siteData.update({
    where: { key: "timeline" },
    data: { data: timeline },
  });
  console.log("saved");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
