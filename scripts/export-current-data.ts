#!/usr/bin/env tsx

/**
 * Export Current Database Data
 *
 * This script exports all current database data to JSON files for backup purposes.
 * Each table is exported independently so one missing table won't break the whole backup.
 *
 * Usage: npx tsx --env-file=.env.local scripts/export-current-data.ts
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

interface ExportResult {
  name: string;
  file: string;
  count: number;
  skipped?: boolean;
}

async function safeExport(
  exportDir: string,
  name: string,
  fileName: string,
  queryFn: () => Promise<Record<string, unknown>[]>
): Promise<ExportResult> {
  try {
    const data = await queryFn();
    await fs.writeFile(
      path.join(exportDir, fileName),
      JSON.stringify(data, null, 2)
    );
    console.log(`  ${name}: ${data.length} records`);
    return { name, file: fileName, count: data.length };
  } catch (err: unknown) {
    const error = err as { meta?: { table?: string }; message?: string };
    const msg = error?.meta?.table || error?.message || "unknown error";
    console.log(`  ${name}: SKIPPED (${msg})`);
    return { name, file: fileName, count: 0, skipped: true };
  }
}

async function exportCurrentData() {
  console.log("Starting database export...\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportDir = path.join(process.cwd(), "backups", `export-${timestamp}`);
  await fs.mkdir(exportDir, { recursive: true });

  const results: ExportResult[] = [];

  // Core tables
  results.push(
    await safeExport(exportDir, "Users", "users.json", () =>
      prisma.user.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Clubs", "clubs.json", () =>
      prisma.club.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Events", "events.json", () =>
      prisma.event.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Surveys", "surveys.json", () =>
      prisma.surveyResponse.findMany()
    )
  );

  // Hierarchical structure
  results.push(
    await safeExport(
      exportDir,
      "InternationalUnits",
      "international-units.json",
      () => prisma.internationalUnit.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Countries", "countries.json", () =>
      prisma.country.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Regions", "regions.json", () =>
      prisma.region.findMany()
    )
  );

  // Club-related
  results.push(
    await safeExport(
      exportDir,
      "ClubSubmissions",
      "club-submissions.json",
      () => prisma.clubSubmission.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "ClubInterests", "club-interests.json", () =>
      prisma.clubInterest.findMany()
    )
  );
  results.push(
    await safeExport(
      exportDir,
      "ClubAdminRequests",
      "club-admin-requests.json",
      () => prisma.clubAdminRequest.findMany()
    )
  );
  results.push(
    await safeExport(
      exportDir,
      "AvailabilitySlots",
      "availability-slots.json",
      () => prisma.availabilitySlot.findMany()
    )
  );
  results.push(
    await safeExport(
      exportDir,
      "HostingPackages",
      "hosting-packages.json",
      () => prisma.hostingPackage.findMany()
    )
  );

  // Event-related
  results.push(
    await safeExport(exportDir, "EventReports", "event-reports.json", () =>
      prisma.eventReport.findMany()
    )
  );
  results.push(
    await safeExport(
      exportDir,
      "EventPitchLocations",
      "event-pitch-locations.json",
      () => prisma.eventPitchLocation.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Interests", "interests.json", () =>
      prisma.interest.findMany()
    )
  );
  results.push(
    await safeExport(
      exportDir,
      "TournamentTeams",
      "tournament-teams.json",
      () => prisma.tournamentTeam.findMany()
    )
  );
  results.push(
    await safeExport(
      exportDir,
      "TournamentInterests",
      "tournament-interests.json",
      () => prisma.tournamentInterest.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Matches", "matches.json", () =>
      prisma.match.findMany()
    )
  );

  // Pitch-related
  results.push(
    await safeExport(exportDir, "PitchLocations", "pitch-locations.json", () =>
      prisma.pitchLocation.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "PitchRequests", "pitch-requests.json", () =>
      prisma.pitchRequest.findMany()
    )
  );

  // Booking & Payment
  results.push(
    await safeExport(exportDir, "Bookings", "bookings.json", () =>
      prisma.booking.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "Payments", "payments.json", () =>
      prisma.payment.findMany()
    )
  );

  // Other
  results.push(
    await safeExport(exportDir, "Testimonials", "testimonials.json", () =>
      prisma.testimonial.findMany()
    )
  );
  results.push(
    await safeExport(exportDir, "CityImages", "city-images.json", () =>
      prisma.cityDefaultImage.findMany()
    )
  );

  // SiteData (news, fixtures, standings, timeline)
  results.push(
    await safeExport(exportDir, "SiteData", "site-data.json", () =>
      prisma.siteData.findMany()
    )
  );

  // Write summary
  const exported = results.filter((r) => !r.skipped);
  const skipped = results.filter((r) => r.skipped);

  const summary = {
    exportDate: new Date().toISOString(),
    exportDir,
    exported: exported.length,
    skipped: skipped.length,
    counts: Object.fromEntries(
      results.map((r) => [r.name, r.skipped ? "SKIPPED" : r.count])
    ),
  };

  await fs.writeFile(
    path.join(exportDir, "export-summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log(
    `\nDone! ${exported.length} tables exported, ${skipped.length} skipped.`
  );
  console.log(`Location: ${exportDir}`);

  await prisma.$disconnect();
}

exportCurrentData().catch((err) => {
  console.error("Fatal error:", err);
  prisma.$disconnect();
  process.exit(1);
});
