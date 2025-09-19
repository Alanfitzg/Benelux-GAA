import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixClubRegions() {
  console.log('🔧 Fixing club-region relationships...\n');

  try {
    // Count clubs without regions
    const clubsWithoutRegions = await prisma.club.count({
      where: { regionId: null }
    });

    const totalClubs = await prisma.club.count();
    console.log(`📊 Clubs without regions: ${clubsWithoutRegions}/${totalClubs}`);

    // Get sample of clubs without regions to understand the data
    const sampleClubs = await prisma.club.findMany({
      where: { regionId: null },
      include: {
        country: true,
        internationalUnit: true
      },
      take: 10
    });

    console.log('\n📋 Sample clubs without regions:');
    sampleClubs.forEach(club => {
      console.log(`   ${club.name}`);
      console.log(`     Country: ${club.country?.name}`);
      console.log(`     Location: ${club.location || 'No location'}`);
      console.log(`     Legacy region: ${club.region || 'None'}\n`);
    });

    // Try to fix by mapping based on legacy region field and location
    console.log('🔧 Attempting to fix region assignments...\n');

    let fixed = 0;

    // Get all clubs without regionId
    const clubsToFix = await prisma.club.findMany({
      where: { regionId: null },
      include: { country: true }
    });

    for (const club of clubsToFix) {
      if (!club.countryId) continue;

      let regionName = null;

      // Try to extract region from legacy field or location
      if (club.region) {
        regionName = club.region;
      } else if (club.location) {
        // Extract from location string (often has Province, County, Division)
        const locationParts = club.location.split(',').map(s => s.trim());
        regionName = locationParts[0]; // First part is usually most specific
      }

      if (regionName) {
        // Find matching region in the same country
        const matchingRegion = await prisma.region.findFirst({
          where: {
            countryId: club.countryId,
            OR: [
              { name: { contains: regionName, mode: 'insensitive' } },
              { name: { equals: regionName, mode: 'insensitive' } }
            ]
          }
        });

        if (matchingRegion) {
          await prisma.club.update({
            where: { id: club.id },
            data: { regionId: matchingRegion.id }
          });
          fixed++;
          console.log(`✅ Fixed ${club.name} → ${matchingRegion.name}`);
        }
      }
    }

    console.log(`\n🎉 Fixed ${fixed} club region assignments!`);

    // Final stats
    const clubsStillWithoutRegions = await prisma.club.count({
      where: { regionId: null }
    });
    console.log(`📊 Clubs still without regions: ${clubsStillWithoutRegions}/${totalClubs}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixClubRegions();