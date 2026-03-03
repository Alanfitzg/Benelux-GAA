import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const accounts = [
  {
    email: "pro.europe@gaa.ie",
    username: "pro.europe",
    name: "PRO Europe",
    password: "pro.europe@gaa.ie",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "chairperson.benelux.europe@gaa.ie",
    username: "chairperson.benelux",
    name: "Chairperson Benelux",
    password: "chairperson.benelux.europe@gaa.ie",
    role: "SUPER_ADMIN" as const,
  },
];

async function main() {
  for (const account of accounts) {
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

    const hashedPassword = await bcrypt.hash(account.password, 12);

    if (existing) {
      await prisma.user.update({
        where: { email: account.email },
        data: {
          password: hashedPassword,
          role: account.role,
          accountStatus: "APPROVED",
        },
      });
      console.log(`✅ Updated: ${account.email} (password reset)`);
    } else {
      await prisma.user.create({
        data: {
          email: account.email,
          username: account.username,
          name: account.name,
          password: hashedPassword,
          role: account.role,
          accountStatus: "APPROVED",
          approvedAt: new Date(),
        },
      });
      console.log(`✅ Created: ${account.email}`);
    }
  }

  console.log("\nDone! These accounts can now log in.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
