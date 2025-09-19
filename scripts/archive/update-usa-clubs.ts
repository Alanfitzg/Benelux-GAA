import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function updateUSAClubs() {
  try {
    console.log('Starting USA GAA clubs update...');
    
    // Get USA International Unit
    const usaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'NORTH_AMERICA' }
    });

    if (!usaUnit) {
      throw new Error('USA international unit not found');
    }

    // Get USA Country
    const usaCountry = await prisma.country.findFirst({
      where: { 
        code: 'US',
        internationalUnitId: usaUnit.id
      }
    });

    if (!usaCountry) {
      throw new Error('USA country not found');
    }

    console.log(`Found USA unit: ${usaUnit.name} and country: ${usaCountry.name}`);

    // Delete existing USA clubs to avoid duplicates
    const deleteResult = await prisma.club.deleteMany({
      where: {
        countryId: usaCountry.id
      }
    });
    console.log(`Deleted ${deleteResult.count} existing USA clubs`);

    let totalCreated = 0;
    let totalSkipped = 0;
    const divisionResults: Array<{division: string, created: number}> = [];

    // Process USGAA Clubs Master file
    console.log('\n=== Processing USGAA Divisions ===');
    const usgaaPath = '/Users/alan/Downloads/USGAA_Clubs_Master_Updated.csv';
    const usgaaContent = fs.readFileSync(usgaaPath, 'utf-8');
    const usgaaRecords = parse(usgaaContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${usgaaRecords.length} clubs in USGAA file`);

    // Group by division
    const divisionGroups = new Map();
    usgaaRecords.forEach((record: any) => {
      const division = record.division?.trim();
      if (division && division !== 'division') {
        if (!divisionGroups.has(division)) {
          divisionGroups.set(division, []);
        }
        divisionGroups.get(division).push(record);
      }
    });

    // Process each division
    for (const [divisionName, clubs] of divisionGroups) {
      console.log(`\n--- Processing ${divisionName} Division ---`);
      
      // Get or create region for this division
      let divisionRegion = await prisma.region.findFirst({
        where: {
          name: divisionName,
          countryId: usaCountry.id
        }
      });

      if (!divisionRegion) {
        divisionRegion = await prisma.region.create({
          data: {
            code: divisionName.toUpperCase().substring(0, 6),
            name: divisionName,
            countryId: usaCountry.id,
            displayOrder: getDivisionDisplayOrder(divisionName)
          }
        });
        console.log(`Created region: ${divisionName}`);
      }

      let divisionCreated = 0;
      
      for (const record of clubs) {
        if (!record.club_name || record.club_name.trim() === '') {
          totalSkipped++;
          continue;
        }

        const clubName = record.club_name.trim();
        const baseClubName = clubName.replace(/GAA$/, '').trim() + ' GAA';

        // Parse sports supported
        const sportsSupported = ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'];

        try {
          const club = await prisma.club.create({
            data: {
              name: baseClubName,
              location: `${divisionName}, USA`,
              latitude: null, // No coordinates in this file
              longitude: null,
              imageUrl: null,
              sportsSupported: sportsSupported,
              status: 'APPROVED' as const,
              verificationStatus: 'VERIFIED' as const,
              internationalUnitId: usaUnit.id,
              countryId: usaCountry.id,
              regionId: divisionRegion.id,
              region: divisionName,
              subRegion: null,
              codes: divisionRegion.code,
              dataSource: 'USGAA_CSV'
            }
          });

          divisionCreated++;
          totalCreated++;
          console.log(`✅ Created: ${club.name}`);
        } catch (error) {
          console.error(`❌ Error creating club ${baseClubName}:`, error);
          totalSkipped++;
        }
      }

      divisionResults.push({
        division: divisionName,
        created: divisionCreated
      });

      console.log(`${divisionName} Summary: ${divisionCreated} clubs created`);
    }

    // Process New York GAA file
    console.log('\n=== Processing New York GAA ===');
    const nyPath = '/Users/alan/Downloads/New_York_GAA_Clubs.csv';
    const nyContent = fs.readFileSync(nyPath, 'utf-8');
    const nyRecords = parse(nyContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${nyRecords.length} clubs in New York file`);

    // Get or create New York region
    let nyRegion = await prisma.region.findFirst({
      where: {
        name: 'New York',
        countryId: usaCountry.id
      }
    });

    if (!nyRegion) {
      nyRegion = await prisma.region.create({
        data: {
          code: 'NY',
          name: 'New York',
          countryId: usaCountry.id,
          displayOrder: 1 // Give NY priority
        }
      });
      console.log('Created New York region');
    }

    let nyCreated = 0;
    for (const record of nyRecords) {
      if (!record.club_name || record.club_name.trim() === '') {
        totalSkipped++;
        continue;
      }

      const clubName = record.club_name.trim();
      const baseClubName = clubName.replace(/GAA$/, '').trim() + ' GAA';

      const sportsSupported = ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'];

      try {
        const club = await prisma.club.create({
          data: {
            name: baseClubName,
            location: 'New York, USA',
            latitude: null,
            longitude: null,
            imageUrl: null,
            sportsSupported: sportsSupported,
            status: 'APPROVED' as const,
            verificationStatus: 'VERIFIED' as const,
            internationalUnitId: usaUnit.id,
            countryId: usaCountry.id,
            regionId: nyRegion.id,
            region: 'New York',
            subRegion: null,
            codes: 'NY',
            dataSource: 'NY_GAA_CSV'
          }
        });

        nyCreated++;
        totalCreated++;
        console.log(`✅ Created: ${club.name}`);
      } catch (error) {
        console.error(`❌ Error creating club ${baseClubName}:`, error);
        totalSkipped++;
      }
    }

    console.log(`New York Summary: ${nyCreated} clubs created`);

    console.log('\n=== USA UPDATE COMPLETE ===');
    console.log(`Total clubs created: ${totalCreated}`);
    console.log(`Total records skipped: ${totalSkipped}`);
    
    console.log('\n=== Division Breakdown ===');
    console.log(`New York: ${nyCreated} clubs`);
    divisionResults
      .sort((a, b) => b.created - a.created)
      .forEach(result => {
        console.log(`${result.division}: ${result.created} clubs`);
      });
    
    // Verify the update
    const usaClubCount = await prisma.club.count({
      where: {
        countryId: usaCountry.id
      }
    });
    console.log(`\nTotal USA clubs in database: ${usaClubCount}`);

  } catch (error) {
    console.error('Error updating USA clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getDivisionDisplayOrder(divisionName: string): number {
  const order: Record<string, number> = {
    'New York': 1,
    'Boston': 2,
    'Chicago': 3,
    'Philadelphia': 4,
    'San Francisco': 5,
    'Midwest': 6,
    'South': 7,
    'Mid-Atlantic': 8,
    'Southwest': 9,
    'South Central': 10,
    'Florida': 11,
    'Twin Cities': 12,
    'Northwest': 13,
    'Mexico': 14
  };
  return order[divisionName] || 99;
}

// Run the update
updateUSAClubs();