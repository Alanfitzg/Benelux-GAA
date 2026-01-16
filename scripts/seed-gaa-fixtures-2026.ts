import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 2026 GAA Master Fixture Plan - Key dates
const fixtures2026 = [
  {
    date: new Date("2026-01-10"),
    endDate: new Date("2026-01-11"),
    title: "AIB Club Finals (Intermediate/Junior)",
    description:
      "AIB All-Ireland Club Championship Intermediate and Junior Finals",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-01-17"),
    endDate: new Date("2026-01-18"),
    title: "AIB Club Finals (Senior)",
    description: "AIB All-Ireland Club Championship Senior Finals",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-03-28"),
    endDate: new Date("2026-03-29"),
    title: "AFL/AHL Finals",
    description: "Allianz Football League and Hurling League Finals",
    impact: "MEDIUM" as const,
  },
  {
    date: new Date("2026-05-09"),
    endDate: new Date("2026-05-10"),
    title: "Munster & Connacht SF Finals",
    description:
      "Munster Senior Football Final and Connacht Senior Football Final",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-05-16"),
    endDate: new Date("2026-05-17"),
    title: "Leinster & Ulster SFC Finals",
    description:
      "Leinster Senior Football Championship Final and Ulster Senior Football Championship Final",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-06-13"),
    endDate: new Date("2026-06-14"),
    title: "Sam Maguire R2, Tailteann QFs, Prelim SHC QFs",
    description:
      "Sam Maguire Cup Round 2, Tailteann Cup Quarter-Finals, Preliminary Senior Hurling Championship Quarter-Finals",
    impact: "MEDIUM" as const,
  },
  {
    date: new Date("2026-06-20"),
    endDate: new Date("2026-06-21"),
    title: "Sam Maguire R3, Tailteann SFs, SHC QFs",
    description:
      "Sam Maguire Cup Round 3, Tailteann Cup Semi-Finals, Senior Hurling Championship Quarter-Finals",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-06-27"),
    endDate: new Date("2026-06-28"),
    title: "SFC Quarter-Finals",
    description: "All-Ireland Senior Football Championship Quarter-Finals",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-07-04"),
    endDate: new Date("2026-07-05"),
    title: "SHC Semi-Finals",
    description: "All-Ireland Senior Hurling Championship Semi-Finals",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-07-11"),
    endDate: new Date("2026-07-12"),
    title: "SFC Semi-Finals & Tailteann Cup Final",
    description:
      "All-Ireland Senior Football Championship Semi-Finals (Sat & Sun), Tailteann Cup Final (Saturday)",
    impact: "HIGH" as const,
  },
  {
    date: new Date("2026-07-19"),
    endDate: null,
    title: "All-Ireland Hurling Final",
    description: "All-Ireland Senior Hurling Championship Final - Croke Park",
    impact: "CRITICAL" as const,
  },
  {
    date: new Date("2026-07-26"),
    endDate: null,
    title: "All-Ireland Football Final",
    description: "All-Ireland Senior Football Championship Final - Croke Park",
    impact: "CRITICAL" as const,
  },
  {
    date: new Date("2026-08-01"),
    endDate: null,
    title: "All-Ireland Hurling Final Replay",
    description:
      "Reserved date for All-Ireland Senior Hurling Championship Final Replay",
    impact: "CRITICAL" as const,
  },
  {
    date: new Date("2026-08-08"),
    endDate: null,
    title: "All-Ireland Football Final Replay",
    description:
      "Reserved date for All-Ireland Senior Football Championship Final Replay",
    impact: "CRITICAL" as const,
  },
];

async function seedFixtures() {
  console.log("Seeding 2026 GAA fixtures...\n");

  // Check if fixtures already exist for 2026
  const existingCount = await prisma.gAAFixture.count({
    where: { year: 2026 },
  });

  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing fixtures for 2026.`);
    console.log("Deleting existing fixtures before re-seeding...\n");
    await prisma.gAAFixture.deleteMany({
      where: { year: 2026 },
    });
  }

  // Insert all fixtures
  for (const fixture of fixtures2026) {
    const created = await prisma.gAAFixture.create({
      data: {
        ...fixture,
        year: 2026,
      },
    });
    console.log(`✓ ${created.title} (${fixture.date.toLocaleDateString()})`);
  }

  console.log(
    `\n✅ Successfully seeded ${fixtures2026.length} fixtures for 2026`
  );
}

seedFixtures()
  .catch((error) => {
    console.error("Error seeding fixtures:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
