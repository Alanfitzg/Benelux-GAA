import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedGGEAdmins() {
  console.log("Seeding GGE Admin users...");

  const admins = [
    {
      email: "recreationalofficer.europe@gaa.ie",
      name: "Charlie Jameson",
    },
    {
      email: "chris.collins@gaa.ie",
      name: "Chris Collins",
    },
  ];

  for (const admin of admins) {
    const existing = await prisma.socialGAAAdmin.findUnique({
      where: { email: admin.email.toLowerCase() },
    });

    if (existing) {
      console.log(`Admin already exists: ${admin.email}`);
    } else {
      await prisma.socialGAAAdmin.create({
        data: {
          email: admin.email.toLowerCase(),
          name: admin.name,
        },
      });
      console.log(`Created admin: ${admin.name} (${admin.email})`);
    }
  }

  console.log("Done seeding GGE admins!");
}

seedGGEAdmins()
  .catch((e) => {
    console.error("Error seeding GGE admins:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
