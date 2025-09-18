#!/usr/bin/env tsx

/**
 * Export Current Database Data
 * 
 * This script exports all current database data to JSON files for backup purposes.
 * Run this script to create a snapshot of your current database state.
 * 
 * Usage: npx tsx scripts/export-current-data.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function exportCurrentData() {
  console.log('🚀 Starting database export...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportDir = path.join(process.cwd(), 'backups', `export-${timestamp}`);
  
  try {
    // Create export directory
    await fs.mkdir(exportDir, { recursive: true });
    console.log(`📁 Created export directory: ${exportDir}`);

    // Export Users
    console.log('👥 Exporting users...');
    const users = await prisma.user.findMany({
      include: {
        preferences: true,
        clubAdminRequests: true,
        accounts: true,
        passwordResetTokens: true,
      }
    });
    await fs.writeFile(
      path.join(exportDir, 'users.json'), 
      JSON.stringify(users, null, 2)
    );
    console.log(`✅ Exported ${users.length} users`);

    // Export Clubs
    console.log('🏟️ Exporting clubs...');
    const clubs = await prisma.club.findMany({
      include: {
        events: true,
        availabilitySlots: true,
        tournamentInterests: true,
      }
    });
    await fs.writeFile(
      path.join(exportDir, 'clubs.json'), 
      JSON.stringify(clubs, null, 2)
    );
    console.log(`✅ Exported ${clubs.length} clubs`);

    // Export Events
    console.log('🎯 Exporting events...');
    const events = await prisma.event.findMany({
      include: {
        club: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    await fs.writeFile(
      path.join(exportDir, 'events.json'), 
      JSON.stringify(events, null, 2)
    );
    console.log(`✅ Exported ${events.length} events`);

    // Export Feature Flags - Commented out as model doesn't exist
    // console.log('🚩 Exporting feature flags...');
    // const featureFlags = await prisma.featureFlag.findMany();
    // await fs.writeFile(
    //   path.join(exportDir, 'feature-flags.json'), 
    //   JSON.stringify(featureFlags, null, 2)
    // );
    // console.log(`✅ Exported ${featureFlags.length} feature flags`);

    // Export Survey Responses
    console.log('📋 Exporting survey responses...');
    const surveys = await prisma.surveyResponse.findMany();
    await fs.writeFile(
      path.join(exportDir, 'surveys.json'), 
      JSON.stringify(surveys, null, 2)
    );
    console.log(`✅ Exported ${surveys.length} surveys`);

    // Export Hierarchical Structure (CRITICAL for club selection)
    console.log('🌍 Exporting hierarchical structure...');
    
    const internationalUnits = await prisma.internationalUnit.findMany();
    await fs.writeFile(
      path.join(exportDir, 'international-units.json'), 
      JSON.stringify(internationalUnits, null, 2)
    );
    console.log(`✅ Exported ${internationalUnits.length} international units`);

    const countries = await prisma.country.findMany();
    await fs.writeFile(
      path.join(exportDir, 'countries.json'), 
      JSON.stringify(countries, null, 2)
    );
    console.log(`✅ Exported ${countries.length} countries`);

    const regions = await prisma.region.findMany();
    await fs.writeFile(
      path.join(exportDir, 'regions.json'), 
      JSON.stringify(regions, null, 2)
    );
    console.log(`✅ Exported ${regions.length} regions`);

    // Export Club Submissions
    console.log('📝 Exporting club submissions...');
    const clubSubmissions = await prisma.clubSubmission.findMany();
    await fs.writeFile(
      path.join(exportDir, 'club-submissions.json'), 
      JSON.stringify(clubSubmissions, null, 2)
    );
    console.log(`✅ Exported ${clubSubmissions.length} club submissions`);

    // Export Pitch Locations
    console.log('⚽ Exporting pitch locations...');
    const pitchLocations = await prisma.pitchLocation.findMany();
    await fs.writeFile(
      path.join(exportDir, 'pitch-locations.json'), 
      JSON.stringify(pitchLocations, null, 2)
    );
    console.log(`✅ Exported ${pitchLocations.length} pitch locations`);

    const pitchRequests = await prisma.pitchRequest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'pitch-requests.json'), 
      JSON.stringify(pitchRequests, null, 2)
    );
    console.log(`✅ Exported ${pitchRequests.length} pitch requests`);

    // Export Event-related data
    console.log('🏆 Exporting event-related data...');
    
    const eventReports = await prisma.eventReport.findMany();
    await fs.writeFile(
      path.join(exportDir, 'event-reports.json'), 
      JSON.stringify(eventReports, null, 2)
    );
    console.log(`✅ Exported ${eventReports.length} event reports`);

    const eventPitchLocations = await prisma.eventPitchLocation.findMany();
    await fs.writeFile(
      path.join(exportDir, 'event-pitch-locations.json'), 
      JSON.stringify(eventPitchLocations, null, 2)
    );
    console.log(`✅ Exported ${eventPitchLocations.length} event-pitch associations`);

    const interests = await prisma.interest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'interests.json'), 
      JSON.stringify(interests, null, 2)
    );
    console.log(`✅ Exported ${interests.length} interests`);

    const tournamentTeams = await prisma.tournamentTeam.findMany();
    await fs.writeFile(
      path.join(exportDir, 'tournament-teams.json'), 
      JSON.stringify(tournamentTeams, null, 2)
    );
    console.log(`✅ Exported ${tournamentTeams.length} tournament teams`);

    const matches = await prisma.match.findMany();
    await fs.writeFile(
      path.join(exportDir, 'matches.json'), 
      JSON.stringify(matches, null, 2)
    );
    console.log(`✅ Exported ${matches.length} matches`);

    // Export Club-related data
    console.log('🏛️ Exporting additional club data...');
    
    const clubInterests = await prisma.clubInterest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'club-interests.json'), 
      JSON.stringify(clubInterests, null, 2)
    );
    console.log(`✅ Exported ${clubInterests.length} club interests`);

    const availabilitySlots = await prisma.availabilitySlot.findMany();
    await fs.writeFile(
      path.join(exportDir, 'availability-slots.json'), 
      JSON.stringify(availabilitySlots, null, 2)
    );
    console.log(`✅ Exported ${availabilitySlots.length} availability slots`);

    const tournamentInterests = await prisma.tournamentInterest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'tournament-interests.json'), 
      JSON.stringify(tournamentInterests, null, 2)
    );
    console.log(`✅ Exported ${tournamentInterests.length} tournament interests`);

    const clubAdminRequests = await prisma.clubAdminRequest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'club-admin-requests.json'), 
      JSON.stringify(clubAdminRequests, null, 2)
    );
    console.log(`✅ Exported ${clubAdminRequests.length} club admin requests`);

    const hostingPackages = await prisma.hostingPackage.findMany();
    await fs.writeFile(
      path.join(exportDir, 'hosting-packages.json'), 
      JSON.stringify(hostingPackages, null, 2)
    );
    console.log(`✅ Exported ${hostingPackages.length} hosting packages`);

    const bookings = await prisma.booking.findMany();
    await fs.writeFile(
      path.join(exportDir, 'bookings.json'), 
      JSON.stringify(bookings, null, 2)
    );
    console.log(`✅ Exported ${bookings.length} bookings`);

    const payments = await prisma.payment.findMany();
    await fs.writeFile(
      path.join(exportDir, 'payments.json'), 
      JSON.stringify(payments, null, 2)
    );
    console.log(`✅ Exported ${payments.length} payments`);

    // Export Testimonials
    console.log('💬 Exporting testimonials...');
    const testimonials = await prisma.testimonial.findMany();
    await fs.writeFile(
      path.join(exportDir, 'testimonials.json'), 
      JSON.stringify(testimonials, null, 2)
    );
    console.log(`✅ Exported ${testimonials.length} testimonials`);

    // Export City Images
    console.log('🏙️ Exporting city images...');
    const cityImages = await prisma.cityDefaultImage.findMany();
    await fs.writeFile(
      path.join(exportDir, 'city-images.json'), 
      JSON.stringify(cityImages, null, 2)
    );
    console.log(`✅ Exported ${cityImages.length} city images`);

    // Create export summary
    const summary = {
      exportDate: new Date().toISOString(),
      exportDir: exportDir,
      counts: {
        // Core data
        users: users.length,
        clubs: clubs.length,
        events: events.length,
        surveys: surveys.length,
        
        // Hierarchical structure (CRITICAL)
        internationalUnits: internationalUnits.length,
        countries: countries.length,
        regions: regions.length,
        
        // Club-related
        clubSubmissions: clubSubmissions.length,
        clubInterests: clubInterests.length,
        clubAdminRequests: clubAdminRequests.length,
        availabilitySlots: availabilitySlots.length,
        hostingPackages: hostingPackages.length,
        
        // Event-related  
        eventReports: eventReports.length,
        eventPitchLocations: eventPitchLocations.length,
        interests: interests.length,
        tournamentTeams: tournamentTeams.length,
        tournamentInterests: tournamentInterests.length,
        matches: matches.length,
        
        // Pitch-related
        pitchLocations: pitchLocations.length,
        pitchRequests: pitchRequests.length,
        
        // Booking & Payment
        bookings: bookings.length,
        payments: payments.length,
        
        // Other
        testimonials: testimonials.length,
        cityImages: cityImages.length,
      },
      note: 'This export contains ALL database data including hierarchical structure for complete backup.'
    };

    await fs.writeFile(
      path.join(exportDir, 'export-summary.json'), 
      JSON.stringify(summary, null, 2)
    );

    console.log('\n🎉 Database export completed successfully!');
    console.log(`📍 Location: ${exportDir}`);
    console.log('📊 Summary:', summary.counts);
    console.log('\n💡 To restore this data later, use: npx tsx scripts/restore-data.ts [backup-directory]');

  } catch (error) {
    console.error('❌ Error during export:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportCurrentData();