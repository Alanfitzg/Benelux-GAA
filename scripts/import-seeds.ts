import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importSeeds() {
  console.log('Starting seed data import...');
  
  const seedsDir = path.join(process.cwd(), 'prisma', 'seeds');
  
  if (!fs.existsSync(seedsDir)) {
    console.error(`Seeds directory not found: ${seedsDir}`);
    console.log('Please run export-to-seeds.ts first to generate seed files.');
    process.exit(1);
  }

  const metadataPath = path.join(seedsDir, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    console.log(`\nImporting seeds exported on: ${metadata.exportDate}`);
    console.log('Table counts:', metadata.tableCounts);
  }

  try {
    console.log('\n⚠️  WARNING: This will delete all existing data in the database!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Clearing existing data...');
    
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.availabilitySlot.deleteMany(),
      prisma.match.deleteMany(),
      prisma.tournamentTeam.deleteMany(),
      prisma.tournamentInterest.deleteMany(),
      prisma.clubInterest.deleteMany(),
      prisma.surveyResponse.deleteMany(),
      prisma.interest.deleteMany(),
      prisma.eventReport.deleteMany(),
      prisma.event.deleteMany(),
      prisma.hostingPackage.deleteMany(),
      prisma.pitchRequest.deleteMany(),
      prisma.pitchLocation.deleteMany(),
      prisma.clubAdminRequest.deleteMany(),
      prisma.club.deleteMany(),
      prisma.cityDefaultImage.deleteMany(),
      prisma.userPreferences.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    
    console.log('✓ Existing data cleared');

    console.log('\nImporting seed data...\n');

    const importFile = async (filename: string, modelName: string, importFn: (data: unknown) => Promise<unknown>) => {
      const filePath = path.join(seedsDir, filename);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.length > 0) {
          console.log(`Importing ${modelName}...`);
          for (const item of data) {
            await importFn(item);
          }
          console.log(`✓ Imported ${data.length} ${modelName}`);
        }
      }
    };

    await importFile('01-users.json', 'users', (data) => 
      prisma.user.create({ data })
    );

    await importFile('02-accounts.json', 'accounts', (data) => 
      prisma.account.create({ data })
    );

    await importFile('03-sessions.json', 'sessions', (data) => 
      prisma.session.create({ data })
    );

    await importFile('04-user-preferences.json', 'user preferences', (data) => 
      prisma.userPreferences.create({ data })
    );

    await importFile('05-clubs.json', 'clubs', (data) => 
      prisma.club.create({ data })
    );

    await importFile('06-club-admin-requests.json', 'club admin requests', (data) => 
      prisma.clubAdminRequest.create({ data })
    );

    await importFile('07-pitch-locations.json', 'pitch locations', (data) => 
      prisma.pitchLocation.create({ data })
    );

    await importFile('08-pitch-requests.json', 'pitch requests', (data) => 
      prisma.pitchRequest.create({ data })
    );

    await importFile('09-events.json', 'events', (data) => 
      prisma.event.create({ data })
    );

    await importFile('10-event-reports.json', 'event reports', (data) => 
      prisma.eventReport.create({ data })
    );

    await importFile('11-interests.json', 'interests', (data) => 
      prisma.interest.create({ data })
    );

    await importFile('12-tournament-teams.json', 'tournament teams', (data) => 
      prisma.tournamentTeam.create({ data })
    );

    await importFile('13-matches.json', 'matches', (data) => 
      prisma.match.create({ data })
    );

    await importFile('14-survey-responses.json', 'survey responses', (data) => 
      prisma.surveyResponse.create({ data })
    );

    await importFile('15-club-interests.json', 'club interests', (data) => 
      prisma.clubInterest.create({ data })
    );

    await importFile('16-tournament-interests.json', 'tournament interests', (data) => 
      prisma.tournamentInterest.create({ data })
    );

    await importFile('17-hosting-packages.json', 'hosting packages', (data) => 
      prisma.hostingPackage.create({ data })
    );

    await importFile('18-bookings.json', 'bookings', (data) => 
      prisma.booking.create({ data })
    );

    await importFile('19-payments.json', 'payments', (data) => 
      prisma.payment.create({ data })
    );

    await importFile('20-availability-slots.json', 'availability slots', (data) => 
      prisma.availabilitySlot.create({ data })
    );

    await importFile('21-city-default-images.json', 'city default images', (data) => 
      prisma.cityDefaultImage.create({ data })
    );

    await importFile('22-password-reset-tokens.json', 'password reset tokens', (data) => 
      prisma.passwordResetToken.create({ data })
    );

    console.log('\n✅ Seed data import completed successfully!');

  } catch (error) {
    console.error('Error importing seed data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importSeeds();