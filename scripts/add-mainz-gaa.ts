import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.club.findFirst({
    where: { name: { equals: "Mainz GAA", mode: "insensitive" } },
  });
  if (existing) {
    console.log(`Mainz GAA already exists (${existing.id}). Nothing to do.`);
    return;
  }

  const reference = await prisma.club.findFirst({
    where: { name: "Darmstadt GAA" },
    select: { internationalUnitId: true, countryId: true },
  });
  if (!reference) {
    throw new Error("Reference club Darmstadt GAA not found");
  }

  const club = await prisma.club.create({
    data: {
      name: "Mainz GAA",
      location: "Mainz, Germany",
      latitude: 49.9995205,
      longitude: 8.2736253,
      internationalUnitId: reference.internationalUnitId,
      countryId: reference.countryId,
      region: "benelux",
      subRegion: "Germany",
      imageUrl: "/club-crests/benelux-mainz-gaa.png",
      sportsSupported: ["Hurling", "Camogie"],
      foundedYear: 2026,
      status: "APPROVED",
      isMainlandEurope: true,
      dataSource: "MANUAL_2026_09",
    },
  });
  console.log(`Created Mainz GAA (${club.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
