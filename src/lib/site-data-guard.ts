import { prisma } from "@/lib/prisma";

const FALLBACK_NEWS = [
  {
    id: "mmot41s5dfqw93d84n",
    date: "2026-03-13",
    tags: [],
    title:
      "Breagh Recruitment Partners with Benelux Championships for 2026 Season",
    author: "",
    status: "published",
    content:
      "Gaelic Games Europe and the Benelux Division are delighted to announce the launch of the [Breagh Recruitment](https://breaghrecruitment.com/) Benelux Championship Season for 2026, marking an exciting new partnership that will support Gaelic Games across the region.\n\nThe collaboration between Gaelic Games Europe and Breagh Recruitment reflects a shared commitment to community, ambition and supporting people striving to achieve more. Following a recent meeting with the Breagh Recruitment team, it was clear that the partnership is built on common values \u2014 hard work, resilience and backing communities to perform whatever the conditions.\n\n![image](https://youtu.be/MMa276pOFI0)\n\nThe Breagh Recruitment Benelux Championships will see clubs from across the region compete in football, LGFA, hurling and camogie competitions throughout the season, across both 11-a-side and 15-a-side formats. The championship calendar will culminate in the Benelux Finals in Eindhoven this September, where the region\u2019s top teams will battle for silverware.\n\nThe partnership comes at a particularly exciting moment for Gaelic Games in the Benelux region.\n\nThe Benelux board is preparing for its first-ever Go Games series this weekend, while also gearing up to host the largest European F\u00e9ile ever organised. Later this year, the region will once again send representative teams to compete at the GAA World Games, marking the second time Benelux players will take part on the global stage.\n\nAll of this momentum comes in the shadow of a historic achievement for the region, as [Amsterdam GAC captured the Leinster Special Junior Cup](https://www.rte.ie/sport/hurling/2025/1124/1545513-mcdermott-relieved-after-amsterdams-leinster-win/), becoming the first Benelux club to win the prestigious competition and further underlining the growing strength of Gaelic Games in mainland Europe.\n\nChris Collins, Head of Operations at Gaelic Games Europe, welcomed the partnership announcement.\n\n\u201cWe are extremely grateful to Breagh Recruitment for their support of Gaelic Games in Europe. Their investment in the Benelux Championships will have a real impact on participation and development across the region. Partnerships like this allow our clubs and volunteers to continue building strong Gaelic Games communities throughout Europe and we are excited about using this additional support to deliver some excellent games development initiatives with the regional board and clubs.\u201d\n\nBreagh Recruitment also expressed their enthusiasm about becoming involved with the Gaelic Games community across the Benelux region.\n\nCathal McKeever of Breagh Recruitment said:\n\n\u201cAt Breagh Recruitment we believe in backing people and communities that are striving to achieve more. The GAA has a unique ability to bring people together and we are delighted to support Gaelic Games Europe and the Benelux region. We are looking forward to attending as many rounds of games as possible and connecting with the community and its members.\u201d\n\nAdding a fun twist to the new partnership, the Breagh Recruitment team have also launched an office sweepstake, selecting the clubs they believe will come out on top during the championship season. With strong competition across the region, it remains to be seen whether one of the traditional powerhouses will dominate or if an underdog story will unfold over the course of the year.\n\n![image](https://youtube.com/shorts/ld_vJIisp-g?feature=share)\n\n\nAcross the season, clubs will travel throughout the region competing in championship rounds that will determine who reaches the Benelux Finals later this year.\n\n**2026 Breagh Recruitment Benelux Championship Calendar**\n\n**21 March \u2013 \ud83d\udccdMaastricht**\nBreagh Recruitment Benelux Football & LGFA Championship \u2013 Round 1\n\n**28 March \u2013 \ud83d\udccdThe Hague**\nBreagh Recruitment Benelux Hurling & Camogie Championship Finals\n\n**18 April \u2013 \ud83d\udccdFrankfurt**\nBreagh Recruitment Benelux Football & LGFA Championship \u2013 Round 2\n\n**30 May \u2013 \ud83d\udccdLuxembourg**\nBreagh Recruitment Benelux Football & LGFA Championship \u2013 Round 3\n\n**13 June \u2013 \ud83d\udccdMaastricht**\nBreagh Recruitment Benelux 15s Football Championship Quarter Finals\n\n**20 / 27 June \u2013 \ud83d\udccdMaastricht**\nBreagh Recruitment Benelux 15s Football Championship Semi Finals\n\n**4 July \u2013 \ud83d\udccdMaastricht**\nBreagh Recruitment Benelux 15s Hurling & Camogie Championship Semi Finals\n\n**22 August \u2013 \ud83d\udccdMaastricht**\nBreagh Recruitment Benelux 15s Football Championship Finals\n\n**29 August \u2013 \ud83d\udccdMaastricht**\nBreagh Recruitment Benelux 15s Hurling & Camogie Championship Finals\n\n**26 September \u2013 \ud83d\udccdEindhoven**\nBreagh Recruitment Benelux Football & LGFA Championship Final",
    excerpt: "",
    category: "Benelux News",
    featured: true,
    imageUrl:
      "https://udzsj3px04tot0xe.public.blob.vercel-storage.com/news/1773400109656-Deal%20confirmed%20-%20Breagh%20%281%29.png",
    readTime: 3,
  },
  {
    id: "mmnb0p2tvle8ydwckr",
    date: "2026-01-19",
    tags: ["Featured", "New Club"],
    title: "New Club Spotlight \u2013 Aachen Gaels",
    author: "Alan Fitzgerald",
    status: "published",
    content:
      "Germany's first new GAA club in a decade has emerged at the crossroads of Germany, Belgium, and the Netherlands.\n\nAachen Gaels brings Germany's total to 12 clubs, making it the third-largest GAA nation in continental Europe.\n\nThe club was founded in late 2025 by a group of Irish expatriates working at RWTH Aachen University and local tech companies. Their inaugural training session drew over 30 participants, a promising start for the fledgling club.\n\n\"We've been overwhelmed by the response,\" said club chairperson Siobhan Murphy. \"There's clearly a hunger for GAA in this part of Germany.\"\n\nThe Gaels have already registered for the 2026 Benelux Championships and are actively recruiting players of all skill levels.",
    excerpt:
      "Germany's first new GAA club in a decade has emerged at the crossroads of Germany, Belgium, and the Netherlands. Aachen Gaels brings Germany's total to 12 clubs, making it the third-largest GAA nation in continental Europe.",
    category: "Benelux News",
    featured: true,
    imageUrl: "/club-crests/benelux-aachen-gaels.png",
    readTime: 4,
  },
];

async function ensureSiteDataTable(): Promise<void> {
  console.warn("[SiteData Guard] Table missing - recreating...");
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "SiteData" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteData_pkey" PRIMARY KEY ("id")
  )`;
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "SiteData_key_key" ON "SiteData"("key")`;

  await prisma.siteData.upsert({
    where: { key: "news" },
    update: { data: FALLBACK_NEWS as unknown as object },
    create: { key: "news", data: FALLBACK_NEWS as unknown as object },
  });
  console.warn("[SiteData Guard] Table recreated with fallback articles");
}

export async function withSiteDataGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error.code === "P2021") {
      await ensureSiteDataTable();
      return await fn();
    }
    throw e;
  }
}
