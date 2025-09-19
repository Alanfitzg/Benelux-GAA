import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeCanadaFromUSA() {
  try {
    console.log('Removing Canada from USA section...');
    
    // Find Canada in USA section
    const usaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'NORTH_AMERICA' }
    });

    if (!usaUnit) {
      throw new Error('USA international unit not found');
    }

    const canadaCountry = await prisma.country.findFirst({
      where: {
        code: 'CA',
        internationalUnitId: usaUnit.id
      }
    });

    if (!canadaCountry) {
      console.log('Canada country not found in USA section - may already be removed');
      return;
    }

    console.log(`Found Canada: ${canadaCountry.name} (${canadaCountry.code})`);

    // Check if any clubs are associated with Canada
    const clubCount = await prisma.club.count({
      where: { countryId: canadaCountry.id }
    });

    console.log(`Canada has ${clubCount} clubs associated`);

    if (clubCount > 0) {
      console.log('Deleting Canada clubs first...');
      const deleteClubsResult = await prisma.club.deleteMany({
        where: { countryId: canadaCountry.id }
      });
      console.log(`✅ Deleted ${deleteClubsResult.count} Canadian clubs`);
    }

    // Check for regions associated with Canada
    const regions = await prisma.region.findMany({
      where: { countryId: canadaCountry.id }
    });

    if (regions.length > 0) {
      console.log(`Found ${regions.length} regions to delete first`);
      await prisma.region.deleteMany({
        where: { countryId: canadaCountry.id }
      });
      console.log('✅ Deleted regions associated with Canada');
    }

    // Delete Canada country
    await prisma.country.delete({
      where: { id: canadaCountry.id }
    });

    console.log('✅ Deleted Canada from USA section');

    // Verify final structure
    console.log('\n=== Final USA Section Structure ===');
    const remainingCountries = await prisma.country.findMany({
      where: { internationalUnitId: usaUnit.id },
      orderBy: { name: 'asc' }
    });

    for (const country of remainingCountries) {
      const clubCount = await prisma.club.count({
        where: { countryId: country.id }
      });
      console.log(`- ${country.name} (${country.code}): ${clubCount} clubs`);
    }

    console.log('\n✅ Canada successfully removed from USA section!');

  } catch (error) {
    console.error('Error removing Canada:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal
removeCanadaFromUSA();