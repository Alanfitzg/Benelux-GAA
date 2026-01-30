import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "secretary.rome.europe@gaa.ie";
  const username = "rome-secretary";

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    },
  });

  if (existingUser) {
    console.log("User already exists:", existingUser.email);

    // Still add as ClubSiteAdmin if not already
    const existingAdmin = await prisma.clubSiteAdmin.findUnique({
      where: {
        clubId_email: {
          clubId: "rome-hibernia",
          email: email.toLowerCase(),
        },
      },
    });

    if (!existingAdmin) {
      await prisma.clubSiteAdmin.create({
        data: {
          clubId: "rome-hibernia",
          email: email.toLowerCase(),
          name: "Rome Secretary",
        },
      });
      console.log("Added as ClubSiteAdmin for rome-hibernia");
    } else {
      console.log("Already a ClubSiteAdmin for rome-hibernia");
    }

    // Create password reset token for existing user
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: existingUser.id,
        expiresAt,
      },
    });

    console.log("\n=== PASSWORD SETUP LINK ===");
    console.log(`https://playaway.ie/reset-password?token=${resetToken}`);
    console.log("(Valid for 7 days)");
    return;
  }

  // Create new user with temporary password
  const tempPassword = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      name: "Rome Secretary",
      role: "USER",
      accountStatus: "APPROVED",
    },
  });

  console.log("Created user:", user.email);

  // Add as ClubSiteAdmin
  await prisma.clubSiteAdmin.create({
    data: {
      clubId: "rome-hibernia",
      email: email.toLowerCase(),
      name: "Rome Secretary",
    },
  });

  console.log("Added as ClubSiteAdmin for rome-hibernia");

  // Create password reset token so they can set their own password
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.passwordResetToken.create({
    data: {
      token: resetToken,
      userId: user.id,
      expiresAt,
    },
  });

  console.log("\n=== PASSWORD SETUP LINK ===");
  console.log(`https://playaway.ie/reset-password?token=${resetToken}`);
  console.log("(Valid for 7 days)");
  console.log(
    "\nSend this link to the Rome secretary so they can set their password."
  );
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
