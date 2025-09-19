import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('Verifying staging database data...\n');
  
  try {
    const userCount = await prisma.user.count();
    const clubCount = await prisma.club.count();
    const eventCount = await prisma.event.count();
    const pitchLocationCount = await prisma.pitchLocation.count();
    const eventReportCount = await prisma.eventReport.count();
    const userPreferencesCount = await prisma.userPreferences.count();
    const clubAdminRequestCount = await prisma.clubAdminRequest.count();

    console.log('📊 Data Summary:');
    console.log('================');
    console.log(`✓ Users: ${userCount}`);
    console.log(`✓ Clubs: ${clubCount}`);
    console.log(`✓ Events: ${eventCount}`);
    console.log(`✓ Pitch Locations: ${pitchLocationCount}`);
    console.log(`✓ Event Reports: ${eventReportCount}`);
    console.log(`✓ User Preferences: ${userPreferencesCount}`);
    console.log(`✓ Club Admin Requests: ${clubAdminRequestCount}`);

    const sampleClubs = await prisma.club.findMany({
      take: 5,
      select: { name: true, location: true }
    });

    console.log('\n📍 Sample Clubs:');
    console.log('================');
    sampleClubs.forEach(club => {
      console.log(`- ${club.name} (${club.location || 'No location'})`);
    });

    const sampleEvents = await prisma.event.findMany({
      take: 5,
      select: { title: true, eventType: true, startDate: true }
    });

    console.log('\n🏆 Sample Events:');
    console.log('=================');
    sampleEvents.forEach(event => {
      console.log(`- ${event.title} (${event.eventType}) - ${event.startDate.toLocaleDateString()}`);
    });

    const users = await prisma.user.findMany({
      select: { email: true, role: true, name: true }
    });

    console.log('\n👤 Users:');
    console.log('=========');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name || 'No name'}`);
    });

    console.log('\n✅ Staging database successfully populated with seed data!');

  } catch (error) {
    console.error('Error verifying data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();