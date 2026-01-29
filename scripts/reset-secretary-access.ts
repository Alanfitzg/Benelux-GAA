import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetSecretaryAccess() {
  const secretary = {
    position: "Secretary",
    name: "Dave Reilly",
    club: "Zürich Inneoin",
    email: "Secretary.europe@gaa.ie",
    username: "secretary_europe",
    password: "DaveReilly",
  };

  console.log("Resetting Secretary access...\n");
  console.log("=".repeat(60));

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: secretary.email.toLowerCase() },
          { username: secretary.username },
        ],
      },
    });

    const hashedPassword = await bcrypt.hash(secretary.password, 12);

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: secretary.email.toLowerCase(),
          username: secretary.username,
          password: hashedPassword,
          name: secretary.name,
          role: "SUPER_ADMIN",
          accountStatus: "APPROVED",
        },
      });
      console.log(`✅ Updated existing user: ${secretary.name}`);
    } else {
      await prisma.user.create({
        data: {
          email: secretary.email.toLowerCase(),
          username: secretary.username,
          password: hashedPassword,
          name: secretary.name,
          role: "SUPER_ADMIN",
          accountStatus: "APPROVED",
        },
      });
      console.log(`✅ Created new user: ${secretary.name}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n📋 SECRETARY CREDENTIALS:\n");
    console.log("-".repeat(60));
    console.log(`Position: ${secretary.position}`);
    console.log(`Name:     ${secretary.name}`);
    console.log(`Club:     ${secretary.club}`);
    console.log(`Email:    ${secretary.email}`);
    console.log(`Username: ${secretary.username}`);
    console.log(`Password: ${secretary.password}`);
    console.log(`Role:     SUPER_ADMIN`);
    console.log("-".repeat(60));
    console.log("\n✅ Secretary access has been reset successfully!");
  } catch (error) {
    console.error("❌ Error resetting secretary access:", error);
    process.exit(1);
  }
}

resetSecretaryAccess()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
