import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportToSeeds() {
  console.log('Starting database export to seed files...');
  
  const seedsDir = path.join(process.cwd(), 'prisma', 'seeds');
  
  if (!fs.existsSync(seedsDir)) {
    fs.mkdirSync(seedsDir, { recursive: true });
  }

  try {
    console.log('Exporting User data...');
    const users = await prisma.user.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '01-users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`✓ Exported ${users.length} users`);

    console.log('Exporting Account data...');
    const accounts = await prisma.account.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '02-accounts.json'),
      JSON.stringify(accounts, null, 2)
    );
    console.log(`✓ Exported ${accounts.length} accounts`);

    console.log('Exporting Session data...');
    const sessions = await prisma.session.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '03-sessions.json'),
      JSON.stringify(sessions, null, 2)
    );
    console.log(`✓ Exported ${sessions.length} sessions`);

    console.log('Exporting UserPreferences data...');
    const userPreferences = await prisma.userPreferences.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '04-user-preferences.json'),
      JSON.stringify(userPreferences, null, 2)
    );
    console.log(`✓ Exported ${userPreferences.length} user preferences`);

    console.log('Exporting Club data...');
    const clubs = await prisma.club.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '05-clubs.json'),
      JSON.stringify(clubs, null, 2)
    );
    console.log(`✓ Exported ${clubs.length} clubs`);

    console.log('Exporting ClubAdminRequest data...');
    const clubAdminRequests = await prisma.clubAdminRequest.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '06-club-admin-requests.json'),
      JSON.stringify(clubAdminRequests, null, 2)
    );
    console.log(`✓ Exported ${clubAdminRequests.length} club admin requests`);

    console.log('Exporting PitchLocation data...');
    const pitchLocations = await prisma.pitchLocation.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '07-pitch-locations.json'),
      JSON.stringify(pitchLocations, null, 2)
    );
    console.log(`✓ Exported ${pitchLocations.length} pitch locations`);

    console.log('Exporting PitchRequest data...');
    const pitchRequests = await prisma.pitchRequest.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '08-pitch-requests.json'),
      JSON.stringify(pitchRequests, null, 2)
    );
    console.log(`✓ Exported ${pitchRequests.length} pitch requests`);

    console.log('Exporting Event data...');
    const events = await prisma.event.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '09-events.json'),
      JSON.stringify(events, null, 2)
    );
    console.log(`✓ Exported ${events.length} events`);

    console.log('Exporting EventReport data...');
    const eventReports = await prisma.eventReport.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '10-event-reports.json'),
      JSON.stringify(eventReports, null, 2)
    );
    console.log(`✓ Exported ${eventReports.length} event reports`);

    console.log('Exporting Interest data...');
    const interests = await prisma.interest.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '11-interests.json'),
      JSON.stringify(interests, null, 2)
    );
    console.log(`✓ Exported ${interests.length} interests`);

    console.log('Exporting TournamentTeam data...');
    const tournamentTeams = await prisma.tournamentTeam.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '12-tournament-teams.json'),
      JSON.stringify(tournamentTeams, null, 2)
    );
    console.log(`✓ Exported ${tournamentTeams.length} tournament teams`);

    console.log('Exporting Match data...');
    const matches = await prisma.match.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '13-matches.json'),
      JSON.stringify(matches, null, 2)
    );
    console.log(`✓ Exported ${matches.length} matches`);

    console.log('Exporting SurveyResponse data...');
    const surveyResponses = await prisma.surveyResponse.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '14-survey-responses.json'),
      JSON.stringify(surveyResponses, null, 2)
    );
    console.log(`✓ Exported ${surveyResponses.length} survey responses`);

    console.log('Exporting ClubInterest data...');
    const clubInterests = await prisma.clubInterest.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '15-club-interests.json'),
      JSON.stringify(clubInterests, null, 2)
    );
    console.log(`✓ Exported ${clubInterests.length} club interests`);

    console.log('Exporting TournamentInterest data...');
    const tournamentInterests = await prisma.tournamentInterest.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '16-tournament-interests.json'),
      JSON.stringify(tournamentInterests, null, 2)
    );
    console.log(`✓ Exported ${tournamentInterests.length} tournament interests`);

    console.log('Exporting HostingPackage data...');
    const hostingPackages = await prisma.hostingPackage.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '17-hosting-packages.json'),
      JSON.stringify(hostingPackages, null, 2)
    );
    console.log(`✓ Exported ${hostingPackages.length} hosting packages`);

    console.log('Exporting Booking data...');
    const bookings = await prisma.booking.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '18-bookings.json'),
      JSON.stringify(bookings, null, 2)
    );
    console.log(`✓ Exported ${bookings.length} bookings`);

    console.log('Exporting Payment data...');
    const payments = await prisma.payment.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '19-payments.json'),
      JSON.stringify(payments, null, 2)
    );
    console.log(`✓ Exported ${payments.length} payments`);

    console.log('Exporting AvailabilitySlot data...');
    const availabilitySlots = await prisma.availabilitySlot.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '20-availability-slots.json'),
      JSON.stringify(availabilitySlots, null, 2)
    );
    console.log(`✓ Exported ${availabilitySlots.length} availability slots`);

    console.log('Exporting CityDefaultImage data...');
    const cityDefaultImages = await prisma.cityDefaultImage.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '21-city-default-images.json'),
      JSON.stringify(cityDefaultImages, null, 2)
    );
    console.log(`✓ Exported ${cityDefaultImages.length} city default images`);

    console.log('Exporting PasswordResetToken data...');
    const passwordResetTokens = await prisma.passwordResetToken.findMany();
    fs.writeFileSync(
      path.join(seedsDir, '22-password-reset-tokens.json'),
      JSON.stringify(passwordResetTokens, null, 2)
    );
    console.log(`✓ Exported ${passwordResetTokens.length} password reset tokens`);

    const metadata = {
      exportDate: new Date().toISOString(),
      tableCounts: {
        users: users.length,
        accounts: accounts.length,
        sessions: sessions.length,
        userPreferences: userPreferences.length,
        clubs: clubs.length,
        clubAdminRequests: clubAdminRequests.length,
        pitchLocations: pitchLocations.length,
        pitchRequests: pitchRequests.length,
        events: events.length,
        eventReports: eventReports.length,
        interests: interests.length,
        tournamentTeams: tournamentTeams.length,
        matches: matches.length,
        surveyResponses: surveyResponses.length,
        clubInterests: clubInterests.length,
        tournamentInterests: tournamentInterests.length,
        hostingPackages: hostingPackages.length,
        bookings: bookings.length,
        payments: payments.length,
        availabilitySlots: availabilitySlots.length,
        cityDefaultImages: cityDefaultImages.length,
        passwordResetTokens: passwordResetTokens.length
      }
    };

    fs.writeFileSync(
      path.join(seedsDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('\n✅ Database export completed successfully!');
    console.log(`📁 Seed files saved to: ${seedsDir}`);
    console.log('\nTo import these seeds in another environment, run:');
    console.log('  npx tsx scripts/import-seeds.ts');

  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportToSeeds();