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

async function cleanDuplicateInternationalUnits() {
  console.log(`${colors.cyan}${colors.bright}=== Cleaning Duplicate International Units ===${colors.reset}\n`);

  try {
    // Get all international units
    const allUnits = await prisma.internationalUnit.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    console.log(`${colors.blue}Found ${allUnits.length} international units:${colors.reset}`);
    allUnits.forEach(unit => {
      console.log(`  ${unit.displayOrder}: ${unit.code} - ${unit.name} (${unit.id})`);
    });

    // Define which units to keep (the cleaner ones without underscores)
    const unitsToKeep = [
      { code: 'IRE', name: 'Ireland', displayOrder: 0 },
      { code: 'GB', name: 'Britain', displayOrder: 1 },
      { code: 'EUR', name: 'Europe', displayOrder: 2 },
      { code: 'USA', name: 'North America', displayOrder: 3 },
      { code: 'CAN', name: 'North America', displayOrder: 4 },
      { code: 'AUS', name: 'Australasia', displayOrder: 5 },
      { code: 'ASIA', name: 'Asia', displayOrder: 6 },
      { code: 'ME', name: 'Middle East', displayOrder: 7 },
      { code: 'SA', name: 'South America', displayOrder: 8 },
    ];

    console.log(`\n${colors.yellow}Identifying units to keep and remove...${colors.reset}`);

    const keepIds: string[] = [];
    const removeIds: string[] = [];

    for (const targetUnit of unitsToKeep) {
      const matchingUnits = allUnits.filter(unit =>
        unit.name === targetUnit.name ||
        unit.code === targetUnit.code ||
        (unit.code === 'NORTH_AMERICA' && targetUnit.name === 'North America') ||
        (unit.code === 'AUSTRALASIA' && targetUnit.name === 'Australasia') ||
        (unit.code === 'MIDDLE_EAST' && targetUnit.name === 'Middle East') ||
        (unit.code === 'AFRICA' && targetUnit.name === 'Africa') ||
        (unit.code === 'REST_WORLD' && targetUnit.name === 'Rest of World') ||
        (unit.code === 'CANADA' && targetUnit.name === 'Canada')
      );

      if (matchingUnits.length > 0) {
        // Prefer the unit with the shorter/cleaner code
        const preferred = matchingUnits.find(unit => unit.code === targetUnit.code) || matchingUnits[0];
        keepIds.push(preferred.id);

        // Mark others for removal
        matchingUnits.forEach(unit => {
          if (unit.id !== preferred.id) {
            removeIds.push(unit.id);
          }
        });

        console.log(`${colors.green}  Keep: ${preferred.code} - ${preferred.name}${colors.reset}`);
        matchingUnits.forEach(unit => {
          if (unit.id !== preferred.id) {
            console.log(`${colors.red}  Remove: ${unit.code} - ${unit.name}${colors.reset}`);
          }
        });
      }
    }

    // Handle special cases that don't fit the pattern
    const specialUnits = allUnits.filter(unit =>
      ['AFRICA', 'REST_WORLD', 'CANADA'].includes(unit.code)
    );

    specialUnits.forEach(unit => {
      if (!removeIds.includes(unit.id)) {
        console.log(`${colors.yellow}  Special case - Remove: ${unit.code} - ${unit.name}${colors.reset}`);
        removeIds.push(unit.id);
      }
    });

    console.log(`\n${colors.blue}Summary:${colors.reset}`);
    console.log(`${colors.green}Units to keep: ${keepIds.length}${colors.reset}`);
    console.log(`${colors.red}Units to remove: ${removeIds.length}${colors.reset}`);

    if (removeIds.length === 0) {
      console.log(`\n${colors.green}No duplicates found to remove!${colors.reset}`);
      return;
    }

    // Check for related records that would be affected
    console.log(`\n${colors.yellow}Checking for related records...${colors.reset}`);

    for (const removeId of removeIds) {
      const unit = allUnits.find(u => u.id === removeId);
      console.log(`\nChecking ${unit?.code} - ${unit?.name}:`);

      const countries = await prisma.country.count({
        where: { internationalUnitId: removeId }
      });
      console.log(`  Countries: ${countries}`);

      const clubs = await prisma.club.count({
        where: { internationalUnitId: removeId }
      });
      console.log(`  Clubs: ${clubs}`);

      if (countries > 0 || clubs > 0) {
        console.log(`${colors.red}  ⚠️  This unit has related records - need to migrate them first${colors.reset}`);

        // Find the corresponding unit to migrate to
        let unitToKeep = allUnits.find(u =>
          keepIds.includes(u.id) &&
          (u.name === unit?.name ||
           (unit?.name === 'North America' && u.code === 'USA') ||
           (unit?.name === 'Australasia' && u.code === 'AUS') ||
           (unit?.name === 'Middle East' && u.code === 'ME'))
        );

        // Handle special cases
        if (!unitToKeep) {
          if (unit?.code === 'AFRICA') {
            // Create South America mapping for Africa clubs
            unitToKeep = allUnits.find(u => keepIds.includes(u.id) && u.code === 'SA');
          } else if (unit?.code === 'REST_WORLD') {
            // Map Rest of World to Asia
            unitToKeep = allUnits.find(u => keepIds.includes(u.id) && u.code === 'ASIA');
          } else if (unit?.code === 'CANADA') {
            // Map Canada to USA (North America)
            unitToKeep = allUnits.find(u => keepIds.includes(u.id) && u.code === 'USA');
          } else if (unit?.code === 'NORTH_AMERICA' && unit?.name === 'USA') {
            // Map NORTH_AMERICA with name USA to the USA unit
            unitToKeep = allUnits.find(u => keepIds.includes(u.id) && u.code === 'USA');
          }
        }

        if (unitToKeep) {
          console.log(`${colors.cyan}  → Will migrate to: ${unitToKeep.code} - ${unitToKeep.name}${colors.reset}`);

          // Migrate countries
          if (countries > 0) {
            await prisma.country.updateMany({
              where: { internationalUnitId: removeId },
              data: { internationalUnitId: unitToKeep.id }
            });
            console.log(`${colors.green}  ✓ Migrated ${countries} countries${colors.reset}`);
          }

          // Migrate clubs
          if (clubs > 0) {
            await prisma.club.updateMany({
              where: { internationalUnitId: removeId },
              data: { internationalUnitId: unitToKeep.id }
            });
            console.log(`${colors.green}  ✓ Migrated ${clubs} clubs${colors.reset}`);
          }
        }
      }
    }

    // Now remove the duplicate units
    console.log(`\n${colors.cyan}Removing duplicate international units...${colors.reset}`);

    const deleteResult = await prisma.internationalUnit.deleteMany({
      where: {
        id: {
          in: removeIds
        }
      }
    });

    console.log(`${colors.green}✓ Removed ${deleteResult.count} duplicate international units${colors.reset}`);

    // Show final state
    const finalUnits = await prisma.internationalUnit.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    console.log(`\n${colors.green}${colors.bright}Final International Units:${colors.reset}`);
    finalUnits.forEach(unit => {
      console.log(`${colors.green}  ${unit.displayOrder}: ${unit.code} - ${unit.name}${colors.reset}`);
    });

    console.log(`\n${colors.green}${colors.bright}✓ Cleanup completed successfully!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error cleaning international units:${colors.reset}`, error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await cleanDuplicateInternationalUnits();
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Fatal error:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);