import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function standardizeCountrySuperadmins() {
  console.log("Standardizing country super admin accounts...\n");

  const updates = [
    {
      oldEmail: "france.admin@playaway.com",
      newEmail: "superadmin.france@playawaygaa.com",
      newUsername: "superadmin_france",
      newName: "Superadmin France",
    },
    {
      oldEmail: "germany.admin@playaway.com",
      newEmail: "superadmin.germany@playawaygaa.com",
      newUsername: "superadmin_germany",
      newName: "Superadmin Germany",
    },
  ];

  // Create GAA Full Access super admin
  const gaaFullAccess = {
    email: "gaa.fullaccess@playawaygaa.com",
    username: "gaa_fullaccess",
    name: "GAA - FULL Access",
    password: "GAAFullAccess2025!",
  };

  try {
    const existingGAA = await prisma.user.findUnique({
      where: { email: gaaFullAccess.email },
    });

    if (existingGAA) {
      console.log(`ℹ️  ${gaaFullAccess.name} already exists, skipping.\n`);
    } else {
      const { hash } = await import("bcryptjs");
      const hashedPassword = await hash(gaaFullAccess.password, 12);

      await prisma.user.create({
        data: {
          email: gaaFullAccess.email,
          username: gaaFullAccess.username,
          name: gaaFullAccess.name,
          password: hashedPassword,
          role: "SUPER_ADMIN",
          accountStatus: "APPROVED",
        },
      });

      console.log(`✅ Created ${gaaFullAccess.name}:`);
      console.log(`   Email: ${gaaFullAccess.email}`);
      console.log(`   Username: ${gaaFullAccess.username}`);
      console.log(`   Status: APPROVED\n`);
    }
  } catch (error) {
    console.error(`❌ Failed to create ${gaaFullAccess.name}:`, error);
  }

  for (const update of updates) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: update.oldEmail },
      });

      if (!user) {
        console.log(`User not found: ${update.oldEmail}, skipping.\n`);
        continue;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: update.newEmail,
          username: update.newUsername,
          name: update.newName,
          accountStatus: "APPROVED",
        },
      });

      console.log(`✅ Updated ${update.oldEmail}:`);
      console.log(`   Email: ${update.newEmail}`);
      console.log(`   Username: ${update.newUsername}`);
      console.log(`   Name: ${update.newName}`);
      console.log(`   Status: APPROVED\n`);
    } catch (error) {
      console.error(`❌ Failed to update ${update.oldEmail}:`, error);
    }
  }

  console.log("Done!");
}

standardizeCountrySuperadmins()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
