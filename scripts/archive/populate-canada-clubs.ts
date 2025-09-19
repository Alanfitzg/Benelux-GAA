import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function populateCanadaClubs() {
  try {
    console.log('Starting Canada GAA clubs population...');
    
    // Get Canada International Unit
    const canadaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'CANADA' }
    });

    if (!canadaUnit) {
      throw new Error('Canada international unit not found. Run create-canada-unit.ts first.');
    }

    // Get Canada Country
    const canadaCountry = await prisma.country.findFirst({
      where: { 
        code: 'CA',
        internationalUnitId: canadaUnit.id
      }
    });

    if (!canadaCountry) {
      throw new Error('Canada country not found');
    }

    console.log(`Found Canada unit: ${canadaUnit.name} and country: ${canadaCountry.name}`);

    // Delete existing Canada clubs to avoid duplicates
    const deleteResult = await prisma.club.deleteMany({
      where: {
        countryId: canadaCountry.id
      }
    });
    console.log(`Deleted ${deleteResult.count} existing Canada clubs`);

    let totalCreated = 0;
    const divisionResults: Array<{division: string, created: number}> = [];

    // Process Canada Clubs file
    console.log('\\n=== Processing Canadian Clubs ===');
    const canadaPath = '/Users/alan/Downloads/Canada_GAA_Clubs_Updated.csv';
    const canadaContent = fs.readFileSync(canadaPath, 'utf-8');
    const canadaRecords = parse(canadaContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${canadaRecords.length} clubs in Canada file`);

    // Group by division
    const divisionGroups = new Map();
    canadaRecords.forEach((record: any) => {
      const division = record.division?.trim();
      if (division && division !== 'division') {
        if (!divisionGroups.has(division)) {
          divisionGroups.set(division, []);
        }
        divisionGroups.get(division).push(record);
      }
    });

    // Create division display order
    const getDivisionDisplayOrder = (divisionName: string): number => {
      const order: Record<string, number> = {
        'Toronto': 1,
        'Eastern Canada': 2,
        'Western Canada': 3
      };
      return order[divisionName] || 99;
    };

    // Process each division
    for (const [divisionName, clubs] of divisionGroups) {
      console.log(`\\n--- Processing ${divisionName} Division ---`);
      
      // Get or create region for this division
      let divisionRegion = await prisma.region.findFirst({
        where: {
          name: divisionName,
          countryId: canadaCountry.id
        }
      });

      if (!divisionRegion) {
        divisionRegion = await prisma.region.create({
          data: {
            code: divisionName.toUpperCase().substring(0, 10).replace(/\\s+/g, '_'),
            name: divisionName,
            countryId: canadaCountry.id,
            displayOrder: getDivisionDisplayOrder(divisionName)
          }
        });
        console.log(`Created region: ${divisionName}`);
      }

      let divisionCreated = 0;
      
      for (const record of clubs) {
        if (!record.club_name || record.club_name.trim() === '') {
          continue;
        }

        const clubName = record.club_name.trim();
        const baseClubName = clubName.endsWith(' GAA') ? clubName : clubName + ' GAA';

        // Parse sports supported - Canada has same sports as other regions
        const sportsSupported = ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'];

        try {
          const club = await prisma.club.create({
            data: {
              name: baseClubName,
              location: `${divisionName}, Canada`,
              latitude: null, // No coordinates in this file
              longitude: null,
              imageUrl: null,
              sportsSupported: sportsSupported,
              status: 'APPROVED' as const,
              verificationStatus: 'VERIFIED' as const,
              internationalUnitId: canadaUnit.id,
              countryId: canadaCountry.id,
              regionId: divisionRegion.id,
              region: divisionName,
              subRegion: null,
              codes: divisionRegion.code,
              dataSource: 'CANADA_GAA_CSV'
            }
          });

          divisionCreated++;
          totalCreated++;
          console.log(`✅ Created: ${club.name}`);
        } catch (error) {
          console.error(`❌ Error creating club ${baseClubName}:`, error);
        }
      }

      divisionResults.push({
        division: divisionName,
        created: divisionCreated
      });

      console.log(`${divisionName} Summary: ${divisionCreated} clubs created`);
    }

    console.log('\\n=== CANADA POPULATION COMPLETE ===');
    console.log(`Total clubs created: ${totalCreated}`);
    
    console.log('\\n=== Division Breakdown ===');
    divisionResults
      .sort((a, b) => b.created - a.created)
      .forEach(result => {
        console.log(`${result.division}: ${result.created} clubs`);
      });
    
    // Verify the update
    const canadaClubCount = await prisma.club.count({
      where: {
        countryId: canadaCountry.id
      }
    });
    console.log(`\\nTotal Canada clubs in database: ${canadaClubCount}`);

    console.log('\\n🍁 Canada successfully populated with GAA clubs!');

  } catch (error) {
    console.error('Error populating Canada clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the population
populateCanadaClubs();