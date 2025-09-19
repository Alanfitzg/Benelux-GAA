import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log('Checking for duplicate countries to remove...');
    
    // Get Rest of World International Unit
    const restWorldUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'REST_WORLD' }
    });

    // Get Canada International Unit  
    const canadaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'CANADA' }
    });

    if (!restWorldUnit || !canadaUnit) {
      throw new Error('Required international units not found');
    }

    console.log(`Found Rest of World unit: ${restWorldUnit.name}`);
    console.log(`Found Canada unit: ${canadaUnit.name}`);

    // Check for Canada in Rest of World
    const canadaInRestWorld = await prisma.country.findFirst({
      where: { 
        name: 'Canada',
        internationalUnitId: restWorldUnit.id 
      },
      include: {
        regions: true,
        clubs: true
      }
    });

    if (canadaInRestWorld) {
      console.log(`\nFound Canada in Rest of World with ${canadaInRestWorld.clubs.length} clubs and ${canadaInRestWorld.regions.length} regions`);
      
      if (canadaInRestWorld.clubs.length > 0) {
        console.log('ERROR: Canada in Rest of World has clubs. Manual review needed.');
        canadaInRestWorld.clubs.forEach(club => {
          console.log(`  - ${club.name}`);
        });
      } else {
        // Delete regions first, then country
        if (canadaInRestWorld.regions.length > 0) {
          await prisma.region.deleteMany({
            where: { countryId: canadaInRestWorld.id }
          });
          console.log(`✅ Deleted ${canadaInRestWorld.regions.length} regions for Canada in Rest of World`);
        }

        await prisma.country.delete({
          where: { id: canadaInRestWorld.id }
        });
        console.log('✅ Deleted Canada from Rest of World');
      }
    } else {
      console.log('No Canada found in Rest of World');
    }

    // Check for duplicate Argentina in Rest of World
    const argentinasInRestWorld = await prisma.country.findMany({
      where: { 
        name: 'Argentina',
        internationalUnitId: restWorldUnit.id 
      },
      include: {
        regions: true,
        clubs: true
      }
    });

    console.log(`\nFound ${argentinasInRestWorld.length} Argentina entries in Rest of World`);

    if (argentinasInRestWorld.length > 1) {
      // Keep the one with clubs, remove the empty one(s)
      const argentinaWithClubs = argentinasInRestWorld.find(country => country.clubs.length > 0);
      const emptyArgentinas = argentinasInRestWorld.filter(country => country.clubs.length === 0);

      if (argentinaWithClubs && emptyArgentinas.length > 0) {
        for (const emptyArgentina of emptyArgentinas) {
          console.log(`Removing empty Argentina (${emptyArgentina.id}) with ${emptyArgentina.regions.length} regions`);
          
          // Delete regions first
          if (emptyArgentina.regions.length > 0) {
            await prisma.region.deleteMany({
              where: { countryId: emptyArgentina.id }
            });
            console.log(`✅ Deleted ${emptyArgentina.regions.length} regions for empty Argentina`);
          }

          await prisma.country.delete({
            where: { id: emptyArgentina.id }
          });
          console.log('✅ Deleted empty Argentina from Rest of World');
        }
      } else {
        console.log('Multiple Argentinas found but unable to determine which to keep - manual review needed');
        argentinasInRestWorld.forEach((arg, index) => {
          console.log(`  Argentina ${index + 1}: ${arg.clubs.length} clubs, ${arg.regions.length} regions (ID: ${arg.id})`);
        });
      }
    } else if (argentinasInRestWorld.length === 1) {
      console.log('Only one Argentina found in Rest of World - no duplicates to remove');
    }

    // Show final Rest of World structure
    console.log('\n=== Final Rest of World Structure ===');
    const restWorldCountries = await prisma.country.findMany({
      where: { internationalUnitId: restWorldUnit.id },
      orderBy: { name: 'asc' },
      include: {
        clubs: true
      }
    });

    for (const country of restWorldCountries) {
      console.log(`- ${country.name} (${country.code}): ${country.clubs.length} clubs`);
    }

    console.log('\n✅ Duplicate removal completed!');

  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal
removeDuplicates();