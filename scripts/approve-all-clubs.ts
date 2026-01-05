import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function approveAllClubs() {
  console.log("Starting to approve all clubs...");

  // First, check current status distribution
  const statusCounts = await prisma.club.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  console.log("\nCurrent club status distribution:");
  statusCounts.forEach((s) => {
    console.log(`  ${s.status}: ${s._count.id} clubs`);
  });

  // Update all non-approved clubs to APPROVED
  const result = await prisma.club.updateMany({
    where: {
      status: {
        not: "APPROVED",
      },
    },
    data: {
      status: "APPROVED",
    },
  });

  console.log(`\n✅ Updated ${result.count} clubs to APPROVED status`);

  // Verify the update
  const totalApproved = await prisma.club.count({
    where: { status: "APPROVED" },
  });

  console.log(`\nTotal clubs now with APPROVED status: ${totalApproved}`);

  await prisma.$disconnect();
}

approveAllClubs().catch((e) => {
  console.error("Error:", e);
  prisma.$disconnect();
  process.exit(1);
});
