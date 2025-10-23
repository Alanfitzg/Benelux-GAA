#!/usr/bin/env tsx

/**
 * Restore Database Data from Backup
 *
 * This script restores database data from a backup directory created by export-current-data.ts
 * SAFETY: This script will NOT overwrite existing data - it only adds missing records.
 *
 * Usage: npx tsx scripts/restore-data.ts [backup-directory]
 * Example: npx tsx scripts/restore-data.ts backups/export-2025-08-03T10-30-00-000Z
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function restoreData() {
  const backupDir = process.argv[2];

  if (!backupDir) {
    console.error("❌ Please provide backup directory path");
    console.log("Usage: npx tsx scripts/restore-data.ts [backup-directory]");
    console.log(
      "Example: npx tsx scripts/restore-data.ts backups/export-2025-08-03T10-30-00-000Z"
    );
    process.exit(1);
  }

  if (!(await directoryExists(backupDir))) {
    console.error(`❌ Backup directory not found: ${backupDir}`);
    process.exit(1);
  }

  console.log(`🚀 Starting data restore from: ${backupDir}`);
  console.log(
    "⚠️  SAFETY MODE: Will only add missing records, never overwrite existing data"
  );

  try {
    // Read summary file
    const summaryPath = path.join(backupDir, "export-summary.json");
    let summary = null;
    try {
      const summaryData = await fs.readFile(summaryPath, "utf-8");
      summary = JSON.parse(summaryData);
      console.log("📊 Backup summary:", summary.counts);
    } catch {
      console.log("⚠️  No summary file found, proceeding with restore...");
    }

    let totalRestored = 0;

    // Restore Hierarchical Structure FIRST (no dependencies, required for clubs)
    totalRestored += await restoreInternationalUnits(backupDir);
    totalRestored += await restoreCountries(backupDir);
    totalRestored += await restoreRegions(backupDir);

    // Restore Users (before clubs that might reference users)
    totalRestored += await restoreUsers(backupDir);

    // Restore Clubs (after hierarchical structure, before events)
    totalRestored += await restoreClubs(backupDir);

    // Restore Club-related data
    totalRestored += await restoreClubSubmissions(backupDir);
    totalRestored += await restoreClubInterests(backupDir);
    totalRestored += await restoreClubAdminRequests(backupDir);
    totalRestored += await restoreAvailabilitySlots(backupDir);
    totalRestored += await restoreHostingPackages(backupDir);

    // Restore Pitch data (depends on clubs)
    totalRestored += await restorePitchLocations(backupDir);
    totalRestored += await restorePitchRequests(backupDir);

    // Restore Events (references clubs and pitches)
    totalRestored += await restoreEvents(backupDir);

    // Restore Event-related data
    totalRestored += await restoreEventReports(backupDir);
    totalRestored += await restoreEventPitchLocations(backupDir);
    totalRestored += await restoreInterests(backupDir);
    totalRestored += await restoreTournamentTeams(backupDir);
    totalRestored += await restoreTournamentInterests(backupDir);
    totalRestored += await restoreMatches(backupDir);

    // Restore Booking & Payment data
    totalRestored += await restoreBookings(backupDir);
    totalRestored += await restorePayments(backupDir);

    // Restore Other data
    totalRestored += await restoreSurveys(backupDir);
    totalRestored += await restoreTestimonials(backupDir);
    totalRestored += await restoreCityImages(backupDir);

    console.log(`\n🎉 Data restore completed successfully!`);
    console.log(`📊 Total records restored: ${totalRestored}`);
    console.log("✅ All existing data was preserved (no overwrites)");
  } catch (error) {
    console.error("❌ Error during restore:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Commented out as FeatureFlag model doesn't exist in current schema
// async function restoreFeatureFlags(backupDir: string): Promise<number> {
//   const filePath = path.join(backupDir, 'feature-flags.json');
//   if (!await fileExists(filePath)) {
//     console.log('⚠️  No feature flags backup found, skipping...');
//     return 0;
//   }

//   console.log('🚩 Restoring feature flags...');
//   const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
//   let restored = 0;

//   for (const flag of data) {
//     const existing = await prisma.featureFlag.findUnique({
//       where: { key: flag.key }
//     });

//     if (!existing) {
//       await prisma.featureFlag.create({
//         data: {
//           key: flag.key,
//           enabled: flag.enabled,
//           description: flag.description,
//         }
//       });
//       restored++;
//     }
//   }

//   console.log(`✅ Restored ${restored} feature flags (${data.length - restored} already existed)`);
//   return restored;
// }

async function restoreUsers(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "users.json");
  if (!(await fileExists(filePath))) {
    console.log("⚠️  No users backup found, skipping...");
    return 0;
  }

  console.log("👥 Restoring users...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const user of data) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existing) {
      // Create user without relations first
      const { preferences, ...userData } = user;

      const newUser = await prisma.user.create({
        data: userData,
      });

      // Create user preferences if they exist
      if (preferences) {
        await prisma.userPreferences.create({
          data: {
            ...preferences,
            userId: newUser.id,
          },
        });
      }

      restored++;
    }
  }

  console.log(
    `✅ Restored ${restored} users (${data.length - restored} already existed)`
  );
  return restored;
}

async function restoreClubs(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "clubs.json");
  if (!(await fileExists(filePath))) {
    console.log("⚠️  No clubs backup found, skipping...");
    return 0;
  }

  console.log("🏟️ Restoring clubs...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const club of data) {
    const existing = await prisma.club.findFirst({
      where: {
        name: club.name,
        location: club.location,
      },
    });

    if (!existing) {
      // Create club without relations
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        events,
        availabilitySlots,
        tournamentInterests,
        hostingPackages,
        clubSubmissions,
        ...clubData
      } = club;

      await prisma.club.create({
        data: clubData,
      });
      restored++;
    }
  }

  console.log(
    `✅ Restored ${restored} clubs (${data.length - restored} already existed)`
  );
  return restored;
}

async function restoreEvents(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "events.json");
  if (!(await fileExists(filePath))) {
    console.log("⚠️  No events backup found, skipping...");
    return 0;
  }

  console.log("🎯 Restoring events...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const event of data) {
    const existing = await prisma.event.findFirst({
      where: {
        title: event.title,
        startDate: new Date(event.startDate),
        location: event.location,
      },
    });

    if (!existing) {
      // Remove nested club data and create event
      const { ...eventData } = event;

      // Convert date strings back to Date objects
      eventData.startDate = new Date(eventData.startDate);
      if (eventData.endDate) {
        eventData.endDate = new Date(eventData.endDate);
      }
      if (eventData.createdAt) {
        eventData.createdAt = new Date(eventData.createdAt);
      }
      if (eventData.updatedAt) {
        eventData.updatedAt = new Date(eventData.updatedAt);
      }

      await prisma.event.create({
        data: eventData,
      });
      restored++;
    }
  }

  console.log(
    `✅ Restored ${restored} events (${data.length - restored} already existed)`
  );
  return restored;
}

async function restoreSurveys(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "surveys.json");
  if (!(await fileExists(filePath))) {
    console.log("⚠️  No surveys backup found, skipping...");
    return 0;
  }

  console.log("📋 Restoring surveys...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const survey of data) {
    const existing = await prisma.surveyResponse.findFirst({
      where: {
        contactEmail: survey.contactEmail,
        submittedAt: new Date(survey.submittedAt || survey.createdAt),
      },
    });

    if (!existing) {
      // Convert date strings
      if (survey.submittedAt) {
        survey.submittedAt = new Date(survey.submittedAt);
      } else if (survey.createdAt) {
        survey.submittedAt = new Date(survey.createdAt);
        delete survey.createdAt;
      }
      delete survey.updatedAt;

      await prisma.surveyResponse.create({
        data: survey,
      });
      restored++;
    }
  }

  console.log(
    `✅ Restored ${restored} surveys (${data.length - restored} already existed)`
  );
  return restored;
}

async function restoreAvailabilitySlots(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "availability-slots.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("📅 Restoring availability slots...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const slot of data) {
    const existing = await prisma.availabilitySlot.findFirst({
      where: {
        clubId: slot.clubId,
        date: new Date(slot.date),
      },
    });

    if (!existing) {
      slot.date = new Date(slot.date);
      if (slot.createdAt) slot.createdAt = new Date(slot.createdAt);
      if (slot.updatedAt) slot.updatedAt = new Date(slot.updatedAt);

      await prisma.availabilitySlot.create({ data: slot });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} availability slots`);
  return restored;
}

async function restoreTournamentInterests(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "tournament-interests.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🏆 Restoring tournament interests...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const interest of data) {
    const existing = await prisma.tournamentInterest.findFirst({
      where: {
        clubId: interest.clubId,
        userId: interest.userId,
        createdAt: new Date(interest.createdAt),
      },
    });

    if (!existing) {
      if (interest.createdAt) interest.createdAt = new Date(interest.createdAt);
      if (interest.updatedAt) interest.updatedAt = new Date(interest.updatedAt);

      await prisma.tournamentInterest.create({ data: interest });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} tournament interests`);
  return restored;
}

async function restoreClubAdminRequests(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "club-admin-requests.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("👑 Restoring club admin requests...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const request of data) {
    const existing = await prisma.clubAdminRequest.findFirst({
      where: {
        userId: request.userId,
        clubId: request.clubId,
      },
    });

    if (!existing) {
      if (request.createdAt) request.createdAt = new Date(request.createdAt);
      if (request.updatedAt) request.updatedAt = new Date(request.updatedAt);

      await prisma.clubAdminRequest.create({ data: request });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} club admin requests`);
  return restored;
}

// Hierarchical Structure Restore Functions
async function restoreInternationalUnits(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "international-units.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🌍 Restoring international units...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const unit of data) {
    const existing = await prisma.internationalUnit.findUnique({
      where: { code: unit.code },
    });

    if (!existing) {
      await prisma.internationalUnit.create({ data: unit });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} international units`);
  return restored;
}

async function restoreCountries(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "countries.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🏳️ Restoring countries...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const country of data) {
    const existing = await prisma.country.findUnique({
      where: { code: country.code },
    });

    if (!existing) {
      await prisma.country.create({ data: country });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} countries`);
  return restored;
}

async function restoreRegions(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "regions.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🗺️ Restoring regions...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const region of data) {
    const existing = await prisma.region.findFirst({
      where: {
        code: region.code,
        countryId: region.countryId,
      },
    });

    if (!existing) {
      await prisma.region.create({ data: region });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} regions`);
  return restored;
}

async function restoreClubSubmissions(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "club-submissions.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("📝 Restoring club submissions...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const submission of data) {
    const existing = await prisma.clubSubmission.findFirst({
      where: {
        name: submission.name,
        submittedBy: submission.submittedBy,
      },
    });

    if (!existing) {
      if (submission.submittedAt)
        submission.submittedAt = new Date(submission.submittedAt);
      if (submission.reviewedAt)
        submission.reviewedAt = new Date(submission.reviewedAt);

      await prisma.clubSubmission.create({ data: submission });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} club submissions`);
  return restored;
}

async function restorePitchLocations(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "pitch-locations.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("⚽ Restoring pitch locations...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const pitch of data) {
    const existing = await prisma.pitchLocation.findFirst({
      where: {
        name: pitch.name,
        clubId: pitch.clubId,
      },
    });

    if (!existing) {
      if (pitch.createdAt) pitch.createdAt = new Date(pitch.createdAt);
      if (pitch.updatedAt) pitch.updatedAt = new Date(pitch.updatedAt);

      await prisma.pitchLocation.create({ data: pitch });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} pitch locations`);
  return restored;
}

async function restorePitchRequests(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "pitch-requests.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("📋 Restoring pitch requests...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const request of data) {
    const existing = await prisma.pitchRequest.findFirst({
      where: {
        userId: request.userId,
        clubId: request.clubId,
        pitchName: request.pitchName,
      },
    });

    if (!existing) {
      if (request.createdAt) request.createdAt = new Date(request.createdAt);
      if (request.processedAt)
        request.processedAt = new Date(request.processedAt);

      await prisma.pitchRequest.create({ data: request });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} pitch requests`);
  return restored;
}

async function restoreEventReports(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "event-reports.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("📊 Restoring event reports...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const report of data) {
    const existing = await prisma.eventReport.findUnique({
      where: { eventId: report.eventId },
    });

    if (!existing) {
      if (report.createdAt) report.createdAt = new Date(report.createdAt);
      if (report.updatedAt) report.updatedAt = new Date(report.updatedAt);
      if (report.publishedAt) report.publishedAt = new Date(report.publishedAt);

      await prisma.eventReport.create({ data: report });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} event reports`);
  return restored;
}

async function restoreEventPitchLocations(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "event-pitch-locations.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🎯 Restoring event-pitch associations...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const association of data) {
    const existing = await prisma.eventPitchLocation.findFirst({
      where: {
        eventId: association.eventId,
        pitchLocationId: association.pitchLocationId,
      },
    });

    if (!existing) {
      if (association.createdAt)
        association.createdAt = new Date(association.createdAt);

      await prisma.eventPitchLocation.create({ data: association });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} event-pitch associations`);
  return restored;
}

async function restoreInterests(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "interests.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("❤️ Restoring interests...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const interest of data) {
    const existing = await prisma.interest.findFirst({
      where: {
        eventId: interest.eventId,
        email: interest.email,
      },
    });

    if (!existing) {
      if (interest.submittedAt)
        interest.submittedAt = new Date(interest.submittedAt);

      await prisma.interest.create({ data: interest });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} interests`);
  return restored;
}

async function restoreTournamentTeams(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "tournament-teams.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🏆 Restoring tournament teams...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const team of data) {
    const existing = await prisma.tournamentTeam.findFirst({
      where: {
        eventId: team.eventId,
        clubId: team.clubId,
        teamName: team.teamName,
      },
    });

    if (!existing) {
      if (team.registeredAt) team.registeredAt = new Date(team.registeredAt);

      await prisma.tournamentTeam.create({ data: team });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} tournament teams`);
  return restored;
}

async function restoreMatches(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "matches.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("⚽ Restoring matches...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const match of data) {
    const existing = await prisma.match.findFirst({
      where: {
        eventId: match.eventId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
      },
    });

    if (!existing) {
      if (match.matchDate) match.matchDate = new Date(match.matchDate);
      if (match.createdAt) match.createdAt = new Date(match.createdAt);
      if (match.updatedAt) match.updatedAt = new Date(match.updatedAt);

      await prisma.match.create({ data: match });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} matches`);
  return restored;
}

async function restoreClubInterests(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "club-interests.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🏛️ Restoring club interests...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const interest of data) {
    const existing = await prisma.clubInterest.findFirst({
      where: {
        clubId: interest.clubId,
        email: interest.email,
      },
    });

    if (!existing) {
      if (interest.submittedAt)
        interest.submittedAt = new Date(interest.submittedAt);

      await prisma.clubInterest.create({ data: interest });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} club interests`);
  return restored;
}

async function restoreHostingPackages(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "hosting-packages.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("📦 Restoring hosting packages...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const pkg of data) {
    const existing = await prisma.hostingPackage.findFirst({
      where: {
        clubId: pkg.clubId,
        name: pkg.name,
      },
    });

    if (!existing) {
      if (pkg.createdAt) pkg.createdAt = new Date(pkg.createdAt);
      if (pkg.updatedAt) pkg.updatedAt = new Date(pkg.updatedAt);

      await prisma.hostingPackage.create({ data: pkg });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} hosting packages`);
  return restored;
}

async function restoreBookings(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "bookings.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("📅 Restoring bookings...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const booking of data) {
    const existing = await prisma.booking.findFirst({
      where: {
        clubId: booking.clubId,
        contactEmail: booking.contactEmail,
        arrivalDate: new Date(booking.arrivalDate),
      },
    });

    if (!existing) {
      if (booking.arrivalDate)
        booking.arrivalDate = new Date(booking.arrivalDate);
      if (booking.departureDate)
        booking.departureDate = new Date(booking.departureDate);
      if (booking.createdAt) booking.createdAt = new Date(booking.createdAt);
      if (booking.updatedAt) booking.updatedAt = new Date(booking.updatedAt);

      await prisma.booking.create({ data: booking });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} bookings`);
  return restored;
}

async function restorePayments(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "payments.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("💳 Restoring payments...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const payment of data) {
    const existing = await prisma.payment.findFirst({
      where: {
        bookingId: payment.bookingId,
        amount: payment.amount,
        type: payment.type,
      },
    });

    if (!existing) {
      if (payment.processedAt)
        payment.processedAt = new Date(payment.processedAt);
      if (payment.createdAt) payment.createdAt = new Date(payment.createdAt);

      await prisma.payment.create({ data: payment });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} payments`);
  return restored;
}

async function restoreTestimonials(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "testimonials.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("💬 Restoring testimonials...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const testimonial of data) {
    const existing = await prisma.testimonial.findFirst({
      where: {
        clubId: testimonial.clubId,
        userId: testimonial.userId,
      },
    });

    if (!existing) {
      if (testimonial.submittedAt)
        testimonial.submittedAt = new Date(testimonial.submittedAt);
      if (testimonial.superAdminApprovedAt)
        testimonial.superAdminApprovedAt = new Date(
          testimonial.superAdminApprovedAt
        );
      if (testimonial.clubAdminApprovedAt)
        testimonial.clubAdminApprovedAt = new Date(
          testimonial.clubAdminApprovedAt
        );
      if (testimonial.deleteRequestedAt)
        testimonial.deleteRequestedAt = new Date(testimonial.deleteRequestedAt);
      if (testimonial.updatedAt)
        testimonial.updatedAt = new Date(testimonial.updatedAt);

      await prisma.testimonial.create({ data: testimonial });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} testimonials`);
  return restored;
}

async function restoreCityImages(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, "city-images.json");
  if (!(await fileExists(filePath))) return 0;

  console.log("🏙️ Restoring city images...");
  const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  let restored = 0;

  for (const cityImage of data) {
    const existing = await prisma.cityDefaultImage.findUnique({
      where: { city: cityImage.city },
    });

    if (!existing) {
      if (cityImage.createdAt)
        cityImage.createdAt = new Date(cityImage.createdAt);
      if (cityImage.updatedAt)
        cityImage.updatedAt = new Date(cityImage.updatedAt);

      await prisma.cityDefaultImage.create({ data: cityImage });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} city images`);
  return restored;
}

restoreData();
