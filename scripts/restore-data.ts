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

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function restoreData() {
  const backupDir = process.argv[2];
  
  if (!backupDir) {
    console.error('❌ Please provide backup directory path');
    console.log('Usage: npx tsx scripts/restore-data.ts [backup-directory]');
    console.log('Example: npx tsx scripts/restore-data.ts backups/export-2025-08-03T10-30-00-000Z');
    process.exit(1);
  }

  if (!await directoryExists(backupDir)) {
    console.error(`❌ Backup directory not found: ${backupDir}`);
    process.exit(1);
  }

  console.log(`🚀 Starting data restore from: ${backupDir}`);
  console.log('⚠️  SAFETY MODE: Will only add missing records, never overwrite existing data');

  try {
    // Read summary file
    const summaryPath = path.join(backupDir, 'export-summary.json');
    let summary = null;
    try {
      const summaryData = await fs.readFile(summaryPath, 'utf-8');
      summary = JSON.parse(summaryData);
      console.log('📊 Backup summary:', summary.counts);
    } catch (error) {
      console.log('⚠️  No summary file found, proceeding with restore...');
    }

    let totalRestored = 0;

    // Restore Feature Flags first (no dependencies)
    // totalRestored += await restoreFeatureFlags(backupDir);

    // Restore Users (before clubs that might reference users)
    totalRestored += await restoreUsers(backupDir);

    // Restore Clubs (before events that reference clubs)
    totalRestored += await restoreClubs(backupDir);

    // Restore Events (references clubs)
    totalRestored += await restoreEvents(backupDir);

    // Restore Surveys
    totalRestored += await restoreSurveys(backupDir);

    // Restore Additional Tables
    totalRestored += await restoreAvailabilitySlots(backupDir);
    totalRestored += await restoreTournamentInterests(backupDir);
    totalRestored += await restoreClubAdminRequests(backupDir);

    console.log(`\n🎉 Data restore completed successfully!`);
    console.log(`📊 Total records restored: ${totalRestored}`);
    console.log('✅ All existing data was preserved (no overwrites)');

  } catch (error) {
    console.error('❌ Error during restore:', error);
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
  const filePath = path.join(backupDir, 'users.json');
  if (!await fileExists(filePath)) {
    console.log('⚠️  No users backup found, skipping...');
    return 0;
  }

  console.log('👥 Restoring users...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const user of data) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!existing) {
      // Create user without relations first
      const { preferences, clubAdminRequests, accounts, passwordResetTokens, ...userData } = user;
      
      const newUser = await prisma.user.create({
        data: userData
      });

      // Create user preferences if they exist
      if (preferences) {
        await prisma.userPreferences.create({
          data: {
            ...preferences,
            userId: newUser.id,
          }
        });
      }

      restored++;
    }
  }

  console.log(`✅ Restored ${restored} users (${data.length - restored} already existed)`);
  return restored;
}

async function restoreClubs(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, 'clubs.json');
  if (!await fileExists(filePath)) {
    console.log('⚠️  No clubs backup found, skipping...');
    return 0;
  }

  console.log('🏟️ Restoring clubs...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const club of data) {
    const existing = await prisma.club.findFirst({
      where: { 
        name: club.name,
        location: club.location 
      }
    });

    if (!existing) {
      // Create club without relations
      const { events, availabilitySlots, tournamentInterests, ...clubData } = club;
      
      await prisma.club.create({
        data: clubData
      });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} clubs (${data.length - restored} already existed)`);
  return restored;
}

async function restoreEvents(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, 'events.json');
  if (!await fileExists(filePath)) {
    console.log('⚠️  No events backup found, skipping...');
    return 0;
  }

  console.log('🎯 Restoring events...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const event of data) {
    const existing = await prisma.event.findFirst({
      where: { 
        title: event.title,
        startDate: new Date(event.startDate),
        location: event.location
      }
    });

    if (!existing) {
      // Remove nested club data and create event
      const { club, ...eventData } = event;
      
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
        data: eventData
      });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} events (${data.length - restored} already existed)`);
  return restored;
}

async function restoreSurveys(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, 'surveys.json');
  if (!await fileExists(filePath)) {
    console.log('⚠️  No surveys backup found, skipping...');
    return 0;
  }

  console.log('📋 Restoring surveys...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const survey of data) {
    const existing = await prisma.surveyResponse.findFirst({
      where: { 
        contactEmail: survey.contactEmail,
        submittedAt: new Date(survey.submittedAt || survey.createdAt)
      }
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
        data: survey
      });
      restored++;
    }
  }

  console.log(`✅ Restored ${restored} surveys (${data.length - restored} already existed)`);
  return restored;
}

async function restoreAvailabilitySlots(backupDir: string): Promise<number> {
  const filePath = path.join(backupDir, 'availability-slots.json');
  if (!await fileExists(filePath)) return 0;

  console.log('📅 Restoring availability slots...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const slot of data) {
    const existing = await prisma.availabilitySlot.findFirst({
      where: { 
        clubId: slot.clubId,
        date: new Date(slot.date)
      }
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
  const filePath = path.join(backupDir, 'tournament-interests.json');
  if (!await fileExists(filePath)) return 0;

  console.log('🏆 Restoring tournament interests...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const interest of data) {
    const existing = await prisma.tournamentInterest.findFirst({
      where: { 
        clubId: interest.clubId,
        userId: interest.userId,
        createdAt: new Date(interest.createdAt)
      }
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
  const filePath = path.join(backupDir, 'club-admin-requests.json');
  if (!await fileExists(filePath)) return 0;

  console.log('👑 Restoring club admin requests...');
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  let restored = 0;

  for (const request of data) {
    const existing = await prisma.clubAdminRequest.findFirst({
      where: { 
        userId: request.userId,
        clubId: request.clubId
      }
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

restoreData();