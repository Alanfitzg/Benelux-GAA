import { createUser } from "../src/lib/user";
import { UserRole } from "@prisma/client";

async function createCountrySuperAdmins() {
  console.log("Creating country super admin users...\n");

  const admins = [
    {
      email: "france.admin@playaway.com",
      username: "france_admin",
      password: "FranceAdmin2025!",
      name: "France Super Admin",
    },
    {
      email: "germany.admin@playaway.com",
      username: "germany_admin",
      password: "GermanyAdmin2025!",
      name: "Germany Super Admin",
    },
  ];

  for (const admin of admins) {
    try {
      const user = await createUser(
        admin.email,
        admin.username,
        admin.password,
        admin.name,
        UserRole.SUPER_ADMIN
      );

      console.log(`✅ ${admin.name} created successfully!`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}\n`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        console.log(`ℹ️  ${admin.name} already exists, skipping.\n`);
      } else {
        console.error(`❌ Failed to create ${admin.name}:`, error);
      }
    }
  }

  console.log(
    "⚠️  IMPORTANT: Please change the default passwords after first login!"
  );
  process.exit(0);
}

createCountrySuperAdmins();
