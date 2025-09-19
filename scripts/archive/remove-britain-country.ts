import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeBritainCountry() {
  try {
    console.log('Removing Britain country from filter...');
    
    // Find the Britain international unit
    const britainUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'BRITAIN' }
    });
    
    if (!britainUnit) {
      throw new Error('Britain international unit not found');
    }
    
    // Find the Britain country (not England, Scotland, or Wales)
    const britainCountry = await prisma.country.findFirst({
      where: {
        code: 'GB',
        internationalUnitId: britainUnit.id
      }
    });
    
    if (!britainCountry) {
      console.log('Britain country (GB) not found - may already be removed');
      return;
    }
    
    console.log(`Found Britain country: ${britainCountry.name} (${britainCountry.code})`);
    
    // Check if any clubs are associated with Britain country
    const clubCount = await prisma.club.count({
      where: { countryId: britainCountry.id }
    });
    
    console.log(`Britain country has ${clubCount} clubs associated`);
    
    if (clubCount > 0) {
      console.log('WARNING: Britain country has clubs. Cannot delete safely.');
      return;
    }
    
    // Check for regions associated with Britain country
    const regions = await prisma.region.findMany({
      where: { countryId: britainCountry.id }
    });
    
    if (regions.length > 0) {
      console.log(`Found ${regions.length} regions to delete first`);
      await prisma.region.deleteMany({
        where: { countryId: britainCountry.id }
      });
      console.log('✅ Deleted regions associated with Britain country');
    }
    
    // Delete the Britain country
    await prisma.country.delete({
      where: { id: britainCountry.id }
    });
    
    console.log('✅ Deleted Britain country from filter');
    
    // Verify final structure
    console.log('\n=== Final Britain Structure ===');
    const remainingCountries = await prisma.country.findMany({
      where: { internationalUnitId: britainUnit.id },
      orderBy: { name: 'asc' }
    });
    
    for (const country of remainingCountries) {
      const clubCount = await prisma.club.count({
        where: { countryId: country.id }
      });
      console.log(`- ${country.name} (${country.code}): ${clubCount} clubs`);
    }
    
    console.log('\n✅ Britain country successfully removed from filter!');
    console.log('Users will now see: England, Scotland, Wales as country options');
    
  } catch (error) {
    console.error('Error removing Britain country:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal
removeBritainCountry();