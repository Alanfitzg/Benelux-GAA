import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCanadaClubs() {
  try {
    console.log('Migrating Canadian clubs from Rest of World to Canada unit...');
    
    // Get international units
    const restWorldUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'REST_WORLD' }
    });

    const canadaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'CANADA' }
    });

    if (!restWorldUnit || !canadaUnit) {
      throw new Error('Required international units not found');
    }

    // Get Canada country in Rest of World with all clubs
    const canadaInRestWorld = await prisma.country.findFirst({
      where: { 
        name: 'Canada',
        internationalUnitId: restWorldUnit.id 
      },
      include: {
        clubs: true,
        regions: true
      }
    });

    // Get Canada country in Canada unit
    const canadaInCanadaUnit = await prisma.country.findFirst({
      where: { 
        internationalUnitId: canadaUnit.id 
      },
      include: {
        regions: true
      }
    });

    if (!canadaInRestWorld) {
      console.log('No Canada found in Rest of World to migrate');
      return;
    }

    if (!canadaInCanadaUnit) {
      console.log('ERROR: No Canada country found in Canada unit');
      return;
    }

    console.log(`Found ${canadaInRestWorld.clubs.length} clubs in Rest of World Canada`);
    console.log(`Target Canada unit has ${canadaInCanadaUnit.regions.length} regions`);

    // Map clubs to appropriate regions in Canada unit
    const regionMapping: { [key: string]: string } = {
      'Toronto': 'Toronto',
      'Eastern Canada': 'Eastern Canada', 
      'Western Canada': 'Western Canada'
    };

    // Get regions in Canada unit
    const canadaRegions = await prisma.region.findMany({
      where: { countryId: canadaInCanadaUnit.id }
    });

    const regionMap = new Map(canadaRegions.map(r => [r.name, r.id]));

    let migratedCount = 0;
    
    // Migrate each club
    for (const club of canadaInRestWorld.clubs) {
      // Determine target region (default to Toronto if unclear)
      let targetRegionId = regionMap.get('Toronto'); // default
      
      // Try to map based on club region
      if (club.region && regionMapping[club.region]) {
        const mappedRegion = regionMapping[club.region];
        targetRegionId = regionMap.get(mappedRegion) || targetRegionId;
      }
      
      // Update club to point to Canada unit
      await prisma.club.update({
        where: { id: club.id },
        data: {
          internationalUnitId: canadaUnit.id,
          countryId: canadaInCanadaUnit.id,
          regionId: targetRegionId,
          region: canadaRegions.find(r => r.id === targetRegionId)?.name || 'Toronto'
        }
      });

      migratedCount++;
      console.log(`✅ Migrated: ${club.name} to Canada unit`);
    }

    console.log(`\nMigrated ${migratedCount} clubs to Canada unit`);

    // Now delete regions and country from Rest of World
    if (canadaInRestWorld.regions.length > 0) {
      await prisma.region.deleteMany({
        where: { countryId: canadaInRestWorld.id }
      });
      console.log(`✅ Deleted ${canadaInRestWorld.regions.length} regions from Rest of World Canada`);
    }

    await prisma.country.delete({
      where: { id: canadaInRestWorld.id }
    });
    console.log('✅ Deleted Canada country from Rest of World');

    // Now handle Argentina duplicates
    console.log('\n--- Handling Argentina duplicates ---');
    
    const argentinasInRestWorld = await prisma.country.findMany({
      where: { 
        name: 'Argentina',
        internationalUnitId: restWorldUnit.id 
      },
      include: {
        clubs: true,
        regions: true
      }
    });

    if (argentinasInRestWorld.length > 1) {
      // Find the one with most clubs
      const argentinaWithMostClubs = argentinasInRestWorld.reduce((prev, current) => 
        prev.clubs.length > current.clubs.length ? prev : current
      );
      
      const argentinasToDelete = argentinasInRestWorld.filter(a => a.id !== argentinaWithMostClubs.id);

      for (const argentina of argentinasToDelete) {
        console.log(`Removing duplicate Argentina with ${argentina.clubs.length} clubs`);
        
        // Move clubs to the main Argentina if any
        for (const club of argentina.clubs) {
          // Find or create matching region in main Argentina
          let targetRegion = await prisma.region.findFirst({
            where: {
              name: club.region || 'Buenos Aires',
              countryId: argentinaWithMostClubs.id
            }
          });

          if (!targetRegion) {
            targetRegion = await prisma.region.create({
              data: {
                code: (club.region || 'Buenos Aires').toUpperCase().replace(/\s+/g, '_').substring(0, 10),
                name: club.region || 'Buenos Aires',
                countryId: argentinaWithMostClubs.id,
                displayOrder: 1
              }
            });
          }

          await prisma.club.update({
            where: { id: club.id },
            data: {
              countryId: argentinaWithMostClubs.id,
              regionId: targetRegion.id
            }
          });
          
          console.log(`  ✅ Moved club ${club.name} to main Argentina`);
        }

        // Delete regions and country
        if (argentina.regions.length > 0) {
          await prisma.region.deleteMany({
            where: { countryId: argentina.id }
          });
        }

        await prisma.country.delete({
          where: { id: argentina.id }
        });
        
        console.log(`✅ Deleted duplicate Argentina`);
      }
    }

    // Show final structure
    console.log('\n=== Final Canada Unit Structure ===');
    const canadaClubs = await prisma.club.count({
      where: { internationalUnitId: canadaUnit.id }
    });
    console.log(`Canada unit now has ${canadaClubs} clubs`);

    console.log('\n=== Final Rest of World Structure ===');
    const restWorldCountries = await prisma.country.findMany({
      where: { internationalUnitId: restWorldUnit.id },
      orderBy: { name: 'asc' },
      include: { clubs: true }
    });

    for (const country of restWorldCountries) {
      console.log(`- ${country.name} (${country.code}): ${country.clubs.length} clubs`);
    }

    console.log('\n✅ Migration and cleanup completed!');

  } catch (error) {
    console.error('Error migrating Canada clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateCanadaClubs();