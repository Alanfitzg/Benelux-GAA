import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createYouthOfficer() {
  const username = "youth_officer";
  const email = "youth@gaelicgameseurope.com";
  const password = "YouthGGE2026!"; // Change this after first login
  const name = "Youth Officer";

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    console.log("Youth Officer user already exists:");
    console.log(`  Username: ${existingUser.username}`);
    console.log(`  Email: ${existingUser.email}`);
    console.log(`  Role: ${existingUser.role}`);
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      role: "YOUTH_OFFICER",
      accountStatus: "APPROVED",
    },
  });

  console.log("Youth Officer user created successfully!");
  console.log("----------------------------------------");
  console.log(`Username: ${username}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("----------------------------------------");
  console.log("IMPORTANT: Please change the password after first login!");
}

createYouthOfficer()
  .catch((error) => {
    console.error("Error creating Youth Officer:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
