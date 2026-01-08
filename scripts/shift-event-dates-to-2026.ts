import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function shiftEventDates() {
  console.log("Shifting all event dates from 2025 to 2026...\n");

  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
    },
  });

  console.log(`Found ${events.length} events to update\n`);

  let updated = 0;

  for (const event of events) {
    const oldStartDate = event.startDate;
    const newStartDate = new Date(oldStartDate);
    newStartDate.setFullYear(newStartDate.getFullYear() + 1);

    let newEndDate: Date | null = null;
    if (event.endDate) {
      newEndDate = new Date(event.endDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    await prisma.event.update({
      where: { id: event.id },
      data: {
        startDate: newStartDate,
        endDate: newEndDate,
      },
    });

    console.log(
      `✅ ${event.title}: ${oldStartDate.toISOString().split("T")[0]} -> ${newStartDate.toISOString().split("T")[0]}`
    );
    updated++;
  }

  console.log("\n========================================");
  console.log("Event Date Shift Summary:");
  console.log(`  Updated: ${updated} events`);
  console.log("========================================\n");
}

shiftEventDates()
  .catch((e) => {
    console.error("Failed to shift dates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
