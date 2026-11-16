import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type Entry = Record<string, unknown> & { title?: string };

const OLD_AUGUST_TITLE = "Amsterdam Retain Both 15s Titles";

const august: Entry = {
  year: 2026,
  month: "August",
  title: "Amsterdam Win Eighth Straight 15s Football Title",
  description:
    "Amsterdam GAC defeat Luxembourg in the Benelux 15s Football final in Maastricht, extending their run of Men's 15s Football Championships to eight in a row stretching back to 2017.",
  category: "championship",
  clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
};

const european: Entry[] = [
  {
    year: 2026,
    month: "September",
    title: "Brussels Ladies Crowned European 15s Champions",
    description:
      "Brussels Craobh Rua win the European Ladies Football 15s Championship in Rennes, France, beating Paris/Bordeaux in the semi-final and Barcelona Gaels 4-10 to 0-7 in the final. It is the club's first European 15s title since 2023.",
    category: "championship",
    clubCrests: ["/club-crests/benelux-brussels.png"],
  },
  {
    year: 2026,
    month: "September",
    title: "Amsterdam Retain European Hurling Title",
    description:
      "Amsterdam GAC beat GSC Luxembourg 1-26 to 3-5 in the European Hurling 15s final at Sportpark West in Maastricht, a fifth consecutive European 15s hurling title for the club.",
    category: "championship",
    sourceUrl:
      "https://maastrichtgaels.nl/amsterdam-retain-european-hurling-15s-title-in-maastricht/",
    sourceName: "Maastricht Gaels",
    clubCrests: ["/club-crests/benelux-amsterdam-gac.png"],
  },
];

async function main() {
  const row = await prisma.siteData.findUnique({ where: { key: "timeline" } });
  const timeline = (row?.data ?? []) as Entry[];

  const dir = join(process.cwd(), "backups", "site-data");
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(
    join(dir, `timeline-${stamp}.json`),
    JSON.stringify(timeline, null, 2)
  );

  const managed = new Set([
    OLD_AUGUST_TITLE,
    august.title,
    ...european.map((e) => e.title),
  ]);
  const anchor = timeline.findIndex(
    (t) => t.title === OLD_AUGUST_TITLE || t.title === august.title
  );
  if (anchor < 0)
    throw new Error("August 15s entry not found; timeline has changed");

  const before = timeline.slice(0, anchor).filter((t) => !managed.has(t.title));
  const after = timeline.slice(anchor).filter((t) => !managed.has(t.title));
  const updated = [...before, august, ...european, ...after];

  await prisma.siteData.update({
    where: { key: "timeline" },
    data: { data: updated },
  });
  console.log(`timeline: ${timeline.length} -> ${updated.length} entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
