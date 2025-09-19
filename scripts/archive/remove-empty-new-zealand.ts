import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeEmptyNewZealand() {
  try {
    console.log('Removing empty New Zealand entry from Australasia...');
    
    // Find the empty New Zealand country (NZ code with 0 clubs)
    const emptyNZ = await prisma.country.findUnique({
      where: { id: 'cmfp3j94400168obhnj18tyf3' }
    });

    if (!emptyNZ) {
      console.log('Empty New Zealand country not found - may already be removed');
      return;
    }

    console.log(`Found empty New Zealand: ${emptyNZ.name} (${emptyNZ.code})`);

    // Double-check it has no clubs
    const clubCount = await prisma.club.count({
      where: { countryId: emptyNZ.id }
    });

    console.log(`This New Zealand entry has ${clubCount} clubs`);

    if (clubCount > 0) {
      console.log('ERROR: This New Zealand entry has clubs. Aborting to prevent data loss.');
      return;
    }

    // Check for regions associated with this country
    const regions = await prisma.region.findMany({
      where: { countryId: emptyNZ.id }
    });

    if (regions.length > 0) {
      console.log(`Found ${regions.length} regions to delete first`);
      await prisma.region.deleteMany({
        where: { countryId: emptyNZ.id }
      });
      console.log('✅ Deleted regions associated with empty New Zealand');
    }

    // Delete the empty New Zealand country
    await prisma.country.delete({
      where: { id: emptyNZ.id }
    });

    console.log('✅ Deleted empty New Zealand country');

    // Verify final structure
    console.log('\\n=== Final Australasia Structure ===');
    const australasiaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'AUSTRALASIA' }
    });

    if (australasiaUnit) {
      const remainingCountries = await prisma.country.findMany({
        where: { internationalUnitId: australasiaUnit.id },
        orderBy: { name: 'asc' }
      });

      for (const country of remainingCountries) {
        const clubCount = await prisma.club.count({
          where: { countryId: country.id }
        });
        console.log(`- ${country.name} (${country.code}): ${clubCount} clubs`);
      }
    }

    console.log('\\n✅ Empty New Zealand successfully removed from Australasia!');
    console.log('Now users will only see one New Zealand option with actual clubs.');

  } catch (error) {
    console.error('Error removing empty New Zealand:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal
removeEmptyNewZealand();