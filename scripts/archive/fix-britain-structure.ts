import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBritainStructure() {
  try {
    console.log('Starting Britain structure fix...');
    
    // 1. Find the Britain international unit
    const britainUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'BRITAIN' }
    });
    
    if (!britainUnit) {
      throw new Error('Britain international unit not found');
    }
    
    // 2. Find the "Great Britain" international unit (code: REST_WORLD)
    const greatBritainUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'REST_WORLD' }
    });
    
    if (!greatBritainUnit) {
      throw new Error('Great Britain international unit not found');
    }
    
    console.log(`Found Britain unit: ${britainUnit.name} (${britainUnit.code})`);
    console.log(`Found Great Britain unit: ${greatBritainUnit.name} (${greatBritainUnit.code})`);
    
    // 3. Remove "Northern Ireland" country from Britain
    const northernIrelandCountry = await prisma.country.findFirst({
      where: { 
        code: 'NI',
        internationalUnitId: britainUnit.id
      }
    });
    
    if (northernIrelandCountry) {
      console.log(`Found Northern Ireland country: ${northernIrelandCountry.name}`);
      
      // Check if there are any clubs associated with Northern Ireland
      const clubsCount = await prisma.club.count({
        where: { countryId: northernIrelandCountry.id }
      });
      
      console.log(`Northern Ireland has ${clubsCount} clubs associated`);
      
      if (clubsCount > 0) {
        console.log('WARNING: Northern Ireland has clubs. Please reassign them before deletion.');
        // For now, we'll just update the name and move on
      } else {
        // First delete any regions associated with Northern Ireland
        const regions = await prisma.region.findMany({
          where: { countryId: northernIrelandCountry.id }
        });
        
        if (regions.length > 0) {
          console.log(`Found ${regions.length} regions to delete`);
          await prisma.region.deleteMany({
            where: { countryId: northernIrelandCountry.id }
          });
          console.log('✅ Deleted regions associated with Northern Ireland');
        }
        
        // Now delete Northern Ireland country
        await prisma.country.delete({
          where: { id: northernIrelandCountry.id }
        });
        console.log('✅ Deleted Northern Ireland country from Britain');
      }
    } else {
      console.log('Northern Ireland country not found under Britain');
    }
    
    // 4. Rename "Great Britain" international unit to "Britain"
    await prisma.internationalUnit.update({
      where: { id: greatBritainUnit.id },
      data: {
        name: 'Britain'
      }
    });
    console.log('✅ Renamed "Great Britain" international unit to "Britain"');
    
    // 5. Check the final structure
    console.log('\n=== Final Structure ===');
    
    const updatedUnits = await prisma.internationalUnit.findMany({
      where: {
        OR: [
          { code: 'BRITAIN' },
          { code: 'REST_WORLD' }
        ]
      },
      orderBy: { displayOrder: 'asc' }
    });
    
    for (const unit of updatedUnits) {
      console.log(`\n${unit.name} (${unit.code}):`);
      const countries = await prisma.country.findMany({
        where: { internationalUnitId: unit.id },
        orderBy: { displayOrder: 'asc' }
      });
      countries.forEach(country => {
        console.log(`  - ${country.name} (${country.code})`);
      });
    }
    
    console.log('\n✅ Britain structure fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing Britain structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixBritainStructure();