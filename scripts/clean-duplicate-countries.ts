#!/usr/bin/env npx tsx
import { prisma } from '../src/lib/prisma';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function cleanDuplicateCountries() {
  console.log(`${colors.cyan}${colors.bright}=== Cleaning Duplicate Countries ===${colors.reset}\n`);

  try {
    // Get all countries grouped by name and international unit
    const allCountries = await prisma.country.findMany({
      orderBy: [{ internationalUnitId: 'asc' }, { name: 'asc' }]
    });

    console.log(`${colors.blue}Found ${allCountries.length} total countries${colors.reset}`);

    // Group countries by name and international unit
    const grouped: { [key: string]: any[] } = {};
    allCountries.forEach(country => {
      const key = `${country.internationalUnitId}:${country.name}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(country);
    });

    // Find duplicates
    const duplicateGroups = Object.entries(grouped).filter(([_, countries]) => countries.length > 1);

    console.log(`${colors.yellow}Found ${duplicateGroups.length} duplicate country groups:${colors.reset}`);

    let totalMigrated = 0;
    let totalDeleted = 0;

    for (const [key, duplicates] of duplicateGroups) {
      const countryName = duplicates[0].name;
      console.log(`\n${colors.cyan}Processing: ${countryName} (${duplicates.length} duplicates)${colors.reset}`);

      // Choose which one to keep (prefer shorter codes)
      const preferred = duplicates.reduce((best, current) => {
        // Prefer codes without underscores and shorter codes
        const bestScore = (best.code.includes('_') ? 100 : 0) + best.code.length;
        const currentScore = (current.code.includes('_') ? 100 : 0) + current.code.length;
        return currentScore < bestScore ? current : best;
      });

      console.log(`${colors.green}  Keep: ${preferred.name} (${preferred.code})${colors.reset}`);

      // Get others to remove
      const toRemove = duplicates.filter(d => d.id !== preferred.id);

      for (const duplicate of toRemove) {
        console.log(`${colors.red}  Remove: ${duplicate.name} (${duplicate.code})${colors.reset}`);

        // Check for related records
        const clubCount = await prisma.club.count({
          where: { countryId: duplicate.id }
        });

        const regionCount = await prisma.region.count({
          where: { countryId: duplicate.id }
        });

        if (clubCount > 0 || regionCount > 0) {
          console.log(`${colors.yellow}    Has ${clubCount} clubs and ${regionCount} regions - migrating...${colors.reset}`);

          // Migrate clubs
          if (clubCount > 0) {
            await prisma.club.updateMany({
              where: { countryId: duplicate.id },
              data: { countryId: preferred.id }
            });
            totalMigrated += clubCount;
            console.log(`${colors.green}    ✓ Migrated ${clubCount} clubs${colors.reset}`);
          }

          // Migrate regions (handle constraint conflicts)
          if (regionCount > 0) {
            const regionsToMigrate = await prisma.region.findMany({
              where: { countryId: duplicate.id }
            });

            for (const region of regionsToMigrate) {
              // Check if a region with same code already exists in preferred country
              const existingRegion = await prisma.region.findFirst({
                where: {
                  countryId: preferred.id,
                  code: region.code
                }
              });

              if (existingRegion) {
                // Region with same code exists, migrate any clubs from this region to existing one
                const regionClubCount = await prisma.club.count({
                  where: { regionId: region.id }
                });

                if (regionClubCount > 0) {
                  await prisma.club.updateMany({
                    where: { regionId: region.id },
                    data: { regionId: existingRegion.id }
                  });
                  console.log(`${colors.yellow}    ✓ Migrated ${regionClubCount} clubs from duplicate region ${region.code}${colors.reset}`);
                }

                // Delete the duplicate region
                await prisma.region.delete({
                  where: { id: region.id }
                });
                console.log(`${colors.red}    ✓ Deleted duplicate region ${region.code}${colors.reset}`);
              } else {
                // No conflict, just migrate the region
                await prisma.region.update({
                  where: { id: region.id },
                  data: { countryId: preferred.id }
                });
                console.log(`${colors.green}    ✓ Migrated region ${region.code}${colors.reset}`);
              }
            }
          }
        }

        // Delete the duplicate country
        await prisma.country.delete({
          where: { id: duplicate.id }
        });
        totalDeleted++;
        console.log(`${colors.red}    ✓ Deleted duplicate${colors.reset}`);
      }
    }

    console.log(`\n${colors.green}${colors.bright}Cleanup Summary:${colors.reset}`);
    console.log(`${colors.green}✓ Migrated ${totalMigrated} clubs to preferred countries${colors.reset}`);
    console.log(`${colors.green}✓ Deleted ${totalDeleted} duplicate countries${colors.reset}`);

    // Show final count
    const finalCount = await prisma.country.count();
    console.log(`${colors.blue}Final country count: ${finalCount}${colors.reset}`);

    // Show some examples of cleaned countries
    const sampleCountries = await prisma.country.findMany({
      where: {
        name: {
          in: ['United States', 'Germany', 'France', 'China', 'Japan']
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\n${colors.cyan}Sample cleaned countries:${colors.reset}`);
    sampleCountries.forEach(country => {
      console.log(`${colors.green}  ${country.name} (${country.code})${colors.reset}`);
    });

  } catch (error) {
    console.error(`${colors.red}Error cleaning countries:${colors.reset}`, error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await cleanDuplicateCountries();
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Fatal error:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);