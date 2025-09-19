import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyImport() {
  console.log('🔍 Verifying GAA Clubs Import Results...\n');

  try {
    // Count totals
    const clubCount = await prisma.club.count();
    const countryCount = await prisma.country.count();
    const regionCount = await prisma.region.count();
    const unitCount = await prisma.internationalUnit.count();

    console.log('📊 Import Statistics:');
    console.log(`   🏛️ International Units: ${unitCount}`);
    console.log(`   🌍 Countries: ${countryCount}`);
    console.log(`   📍 Regions: ${regionCount}`);
    console.log(`   🏠 Clubs: ${clubCount}\n`);

    // Sample of international units
    const units = await prisma.internationalUnit.findMany({
      orderBy: { displayOrder: 'asc' },
      take: 10
    });

    console.log('🏛️ International Units:');
    units.forEach(unit => {
      console.log(`   ${unit.name} (${unit.code})`);
    });

    // Sample of countries with club counts
    const countriesWithCounts = await prisma.country.findMany({
      include: {
        _count: {
          select: { clubs: true }
        }
      },
      orderBy: {
        clubs: {
          _count: 'desc'
        }
      },
      take: 10
    });

    console.log('\n🌍 Top Countries by Club Count:');
    countriesWithCounts.forEach(country => {
      console.log(`   ${country.name}: ${country._count.clubs} clubs`);
    });

    // Sample of regions with club counts
    const regionsWithCounts = await prisma.region.findMany({
      include: {
        country: true,
        _count: {
          select: { clubs: true }
        }
      },
      orderBy: {
        clubs: {
          _count: 'desc'
        }
      },
      take: 10
    });

    console.log('\n📍 Top Regions by Club Count:');
    regionsWithCounts.forEach(region => {
      console.log(`   ${region.name} (${region.country.name}): ${region._count.clubs} clubs`);
    });

    // Geographic distribution
    const clubsByUnit = await prisma.internationalUnit.findMany({
      include: {
        _count: {
          select: { clubs: true }
        }
      },
      orderBy: {
        clubs: {
          _count: 'desc'
        }
      }
    });

    console.log('\n🌐 Geographic Distribution:');
    clubsByUnit.forEach(unit => {
      console.log(`   ${unit.name}: ${unit._count.clubs} clubs`);
    });

    // Check for clubs with coordinates
    const clubsWithCoords = await prisma.club.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });

    console.log(`\n🗺️ Clubs with coordinates: ${clubsWithCoords}/${clubCount} (${Math.round(clubsWithCoords/clubCount*100)}%)`);

    console.log('\n✅ Import verification completed!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyImport();