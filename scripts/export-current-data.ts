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

    // Export Additional Tables
    console.log('📊 Exporting additional data...');
    
    const availabilitySlots = await prisma.availabilitySlot.findMany();
    await fs.writeFile(
      path.join(exportDir, 'availability-slots.json'), 
      JSON.stringify(availabilitySlots, null, 2)
    );

    const tournamentInterests = await prisma.tournamentInterest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'tournament-interests.json'), 
      JSON.stringify(tournamentInterests, null, 2)
    );

    const clubAdminRequests = await prisma.clubAdminRequest.findMany();
    await fs.writeFile(
      path.join(exportDir, 'club-admin-requests.json'), 
      JSON.stringify(clubAdminRequests, null, 2)
    );

    // Create export summary
    const summary = {
      exportDate: new Date().toISOString(),
      exportDir: exportDir,
      counts: {
        users: users.length,
        clubs: clubs.length,
        events: events.length,
        // featureFlags: featureFlags.length,
        surveys: surveys.length,
        availabilitySlots: availabilitySlots.length,
        tournamentInterests: tournamentInterests.length,
        clubAdminRequests: clubAdminRequests.length,
      },
      note: 'This export contains all current database data for backup purposes.'
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