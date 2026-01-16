import { prisma } from "../src/lib/prisma";
import crypto from "crypto";

async function createTestToken() {
  // Find an event with a club
  const event = await prisma.event.findFirst({
    where: { clubId: { not: null } },
    include: {
      club: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!event || !event.clubId) {
    console.log("No events with clubs found");
    return;
  }

  // Find another club to be the reviewer
  const reviewerClub = await prisma.club.findFirst({
    where: {
      id: { not: event.clubId },
    },
  });

  if (!reviewerClub) {
    console.log("Could not find a reviewer club");
    return;
  }

  // Create a test token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.reviewToken.create({
    data: {
      token: hashedToken,
      eventId: event.id,
      reviewerClubId: reviewerClub.id,
      targetClubId: event.clubId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log("\n=== Test Review Token Created ===");
  console.log(`Event: ${event.title}`);
  console.log(`Reviewer Club: ${reviewerClub.name}`);
  console.log(`Target Club (being reviewed): ${event.club?.name}`);
  console.log(`\nReview URL: http://localhost:3000/review/${rawToken}`);
  console.log("\nThis token expires in 7 days.");
}

createTestToken()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
