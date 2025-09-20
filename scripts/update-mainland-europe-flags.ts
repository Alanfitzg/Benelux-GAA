import { prisma } from "../src/lib/prisma";
import { updateAllClubsGeoStatus } from "../src/lib/calendar/geo-restrictions";

async function updateMainlandEuropeFlags() {
  console.log("Starting mainland Europe flag update...");

  try {
    await updateAllClubsGeoStatus();

    const updated = await prisma.club.count({
      where: { isMainlandEurope: true },
    });

    console.log(`Successfully updated geo flags. ${updated} clubs are now marked as mainland Europe.`);

    // Show some examples
    const sampleClubs = await prisma.club.findMany({
      where: { isMainlandEurope: true },
      select: {
        name: true,
        location: true,
        country: {
          select: { name: true }
        }
      },
      take: 10,
    });

    console.log("Sample mainland Europe clubs:");
    sampleClubs.forEach(club => {
      console.log(`- ${club.name} (${club.country?.name || club.location})`);
    });

  } catch (error) {
    console.error("Error updating mainland Europe flags:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMainlandEuropeFlags();