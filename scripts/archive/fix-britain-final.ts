import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBritainFinal() {
  try {
    console.log('Starting final Britain structure cleanup...');
    
    // Get both Britain units
    const britainUnit1 = await prisma.internationalUnit.findFirst({
      where: { code: 'BRITAIN' }
    });
    
    const britainUnit2 = await prisma.internationalUnit.findFirst({
      where: { code: 'REST_WORLD' }
    });
    
    if (!britainUnit1 || !britainUnit2) {
      throw new Error('Britain units not found');
    }
    
    console.log(`Britain Unit 1: ${britainUnit1.name} (${britainUnit1.code})`);
    console.log(`Britain Unit 2: ${britainUnit2.name} (${britainUnit2.code})`);
    
    // Move British countries from REST_WORLD to BRITAIN
    const britishCountries = await prisma.country.findMany({
      where: {
        internationalUnitId: britainUnit2.id,
        code: { in: ['ENGLAN', 'SCOTLA', 'WALES'] }
      }
    });
    
    console.log(`Found ${britishCountries.length} British countries to move`);
    
    for (const country of britishCountries) {
      await prisma.country.update({
        where: { id: country.id },
        data: { internationalUnitId: britainUnit1.id }
      });
      console.log(`✅ Moved ${country.name} to Britain unit`);
    }
    
    // Update the "Great Britain" country name to just "Britain"
    const greatBritainCountry = await prisma.country.findFirst({
      where: {
        code: 'GB',
        internationalUnitId: britainUnit1.id
      }
    });
    
    if (greatBritainCountry) {
      await prisma.country.update({
        where: { id: greatBritainCountry.id },
        data: { name: 'Britain' }
      });
      console.log('✅ Renamed "Great Britain" country to "Britain"');
    }
    
    // Update the REST_WORLD unit back to "Rest of World" since we renamed it
    await prisma.internationalUnit.update({
      where: { id: britainUnit2.id },
      data: { name: 'Rest of World' }
    });
    console.log('✅ Renamed REST_WORLD unit back to "Rest of World"');
    
    // Final verification
    console.log('\n=== Final Structure ===');
    
    const finalBritainUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'BRITAIN' }
    });
    
    if (finalBritainUnit) {
      console.log(`\n${finalBritainUnit.name} (${finalBritainUnit.code}):`);
      const countries = await prisma.country.findMany({
        where: { internationalUnitId: finalBritainUnit.id },
        orderBy: { displayOrder: 'asc' }
      });
      countries.forEach(country => {
        console.log(`  - ${country.name} (${country.code})`);
      });
    }
    
    console.log('\n✅ Britain structure cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error in final Britain cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
fixBritainFinal();