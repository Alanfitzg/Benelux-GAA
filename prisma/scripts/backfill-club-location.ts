// @ts-check
// @ts-ignore: Prisma types require ES2015 target
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillClubLocations() {
  const clubs = await prisma.club.findMany();
  let updatedCount = 0;
  for (const club of clubs) {
    // Cast to include legacy fields for backfill
    const legacyClub = club as typeof club & { location?: string; city?: string; country?: string };
    if (legacyClub.location) continue;
    const location = [legacyClub.city, legacyClub.country].filter(Boolean).join(', ');
    if (location) {
      await prisma.club.update({ where: { id: club.id }, data: { location } });
      updatedCount++;
      console.log(`Updated club ${club.id} (${club.name}) with location: ${location}`);
    }
  }
  console.log(`Backfill complete. Updated ${updatedCount} clubs.`);
  await prisma.$disconnect();
}

backfillClubLocations().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 