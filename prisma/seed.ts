import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.event.createMany({
    data: [
      {
        title: "Amsterdam Gaelic Spring Festival",
        eventType: "Tournament",
        location: "Amsterdam, Netherlands",
        latitude: 52.3676,
        longitude: 4.9041,
        startDate: new Date("2025-04-20"),
        endDate: new Date("2025-04-21"),
        cost: 30.00,
        description: "A spring tournament bringing together teams from across the Benelux region.",
        isRecurring: true,
        imageUrl: null,
      },
      {
        title: "Berlin City Match Day",
        eventType: "Tournament",
        location: "Berlin, Germany",
        latitude: 52.52,
        longitude: 13.405,
        startDate: new Date("2025-05-15"),
        cost: 15.00,
        description: "Local clubs clash in a friendly but competitive Berlin showcase.",
        isRecurring: true,
        imageUrl: null,
      },
      {
        title: "Munich Summer Youth Camp",
        eventType: "Individual Team Trip",
        location: "Munich, Germany",
        latitude: 48.1351,
        longitude: 11.5820,
        startDate: new Date("2025-07-01"),
        endDate: new Date("2025-07-05"),
        cost: 25.00,
        description: "An immersive training week for young players across Europe.",
        isRecurring: false,
        imageUrl: null,
      },
      {
        title: "Leuven Invitational",
        eventType: "Tournament",
        location: "Leuven, Belgium",
        latitude: 50.8798,
        longitude: 4.7005,
        startDate: new Date("2025-09-10"),
        cost: 35.00,
        description: "A fast-paced tournament featuring clubs from across Western Europe.",
        isRecurring: true,
        imageUrl: null,
      },
      {
        title: "Madrid Autumn Social",
        eventType: "Individual Team Trip",
        location: "Madrid, Spain",
        latitude: 40.4168,
        longitude: -3.7038,
        startDate: new Date("2025-10-12"),
        cost: 10.00,
        description: "An end-of-season celebration for players, families, and fans.",
        isRecurring: true,
        imageUrl: null,
      },
      {
        title: "Paris Gaelic Interclub Challenge",
        eventType: "Tournament",
        location: "Paris, France",
        latitude: 48.8566,
        longitude: 2.3522,
        startDate: new Date("2025-06-18"),
        cost: 20.00,
        description: "Interclub challenge match between Paris-based Gaelic football teams.",
        isRecurring: true,
        imageUrl: null,
      }
    ]
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 