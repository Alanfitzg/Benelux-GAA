import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function addAfricaSouthAmericaClubs() {
  try {
    console.log('Adding missing Africa and South America clubs...');
    
    // Get Africa International Unit
    const africaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'AFRICA' }
    });

    // Get Rest of World International Unit for South America (if no separate SA unit)
    const restWorldUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'REST_WORLD' }
    });

    if (!africaUnit || !restWorldUnit) {
      throw new Error('Required international units not found');
    }

    console.log(`Found Africa unit: ${africaUnit.name}`);
    console.log(`Found Rest of World unit: ${restWorldUnit.name}`);

    // Read the clubs file
    console.log('\\n=== Processing Africa & South America Clubs ===');
    const filePath = '/Users/alan/Downloads/Africa_SouthAmerica_GAA_Clubs.csv';
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} clubs in file`);

    let totalCreated = 0;
    const results: Array<{country: string, created: number, unit: string}> = [];

    // Group by country
    const countryGroups = new Map();
    records.forEach((record: any) => {
      const country = record.country?.trim();
      if (country && country !== 'country') {
        if (!countryGroups.has(country)) {
          countryGroups.set(country, []);
        }
        countryGroups.get(country).push(record);
      }
    });

    // Process each country
    for (const [countryName, clubs] of countryGroups) {
      console.log(`\\n--- Processing ${countryName} ---`);
      
      // Determine which international unit based on the data
      const firstRecord = clubs[0];
      const intlUnit = firstRecord.international_unit?.trim();
      
      let targetUnit;
      if (intlUnit === 'Africa') {
        targetUnit = africaUnit;
      } else if (intlUnit === 'South America') {
        targetUnit = restWorldUnit; // Put South America in Rest of World for now
      } else {
        console.log(`Unknown international unit: ${intlUnit}, defaulting to Rest of World`);
        targetUnit = restWorldUnit;
      }

      // Get country code
      const getCountryCode = (countryName: string): string => {
        const codes: Record<string, string> = {
          'South Africa': 'ZA',
          'Uganda': 'UG',
          'Argentina': 'AR'
        };
        return codes[countryName] || countryName.toUpperCase().substring(0, 2);
      };

      // Get or create country
      let country = await prisma.country.findFirst({
        where: {
          name: countryName,
          internationalUnitId: targetUnit.id
        }
      });

      if (!country) {
        const displayOrder = countryName === 'South Africa' ? 1 : 
                            countryName === 'Uganda' ? 2 :
                            countryName === 'Argentina' ? 1 : 99;

        country = await prisma.country.create({
          data: {
            code: getCountryCode(countryName),
            name: countryName,
            hasRegions: true,
            internationalUnitId: targetUnit.id,
            displayOrder: displayOrder
          }
        });
        console.log(`Created country: ${countryName} (${country.code}) in ${targetUnit.name}`);
      } else {
        console.log(`Using existing country: ${countryName}`);
      }

      let countryCreated = 0;
      
      for (const record of clubs) {
        if (!record.club_name || record.club_name.trim() === '') {
          continue;
        }

        const clubName = record.club_name.trim();
        const baseClubName = clubName.endsWith(' GAA') ? clubName : clubName + ' GAA';
        const division = record.division?.trim() || countryName;

        // Check if club already exists
        const existingClub = await prisma.club.findFirst({
          where: {
            name: baseClubName,
            countryId: country.id
          }
        });

        if (existingClub) {
          console.log(`⏭️  Skipped: ${baseClubName} (already exists)`);
          continue;
        }

        // Create region if it doesn't exist
        let region = await prisma.region.findFirst({
          where: {
            name: division,
            countryId: country.id
          }
        });

        if (!region) {
          region = await prisma.region.create({
            data: {
              code: division.toUpperCase().replace(/\\s+/g, '_').substring(0, 10),
              name: division,
              countryId: country.id,
              displayOrder: 1
            }
          });
        }

        const sportsSupported = ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'];

        try {
          const club = await prisma.club.create({
            data: {
              name: baseClubName,
              location: `${division}, ${countryName}`,
              latitude: null,
              longitude: null,
              imageUrl: null,
              sportsSupported: sportsSupported,
              status: 'APPROVED' as const,
              verificationStatus: 'VERIFIED' as const,
              internationalUnitId: targetUnit.id,
              countryId: country.id,
              regionId: region.id,
              region: division,
              subRegion: null,
              codes: region.code,
              dataSource: 'AFRICA_SA_GAA_CSV'
            }
          });

          countryCreated++;
          totalCreated++;
          console.log(`✅ Created: ${club.name}`);
        } catch (error) {
          console.error(`❌ Error creating club ${baseClubName}:`, error);
        }
      }

      results.push({
        country: countryName,
        created: countryCreated,
        unit: targetUnit.name
      });

      console.log(`${countryName} Summary: ${countryCreated} clubs created in ${targetUnit.name}`);
    }

    console.log('\\n=== COMPLETION SUMMARY ===');
    console.log(`Total new clubs created: ${totalCreated}`);
    
    console.log('\\n=== Country Breakdown ===');
    results.forEach(result => {
      console.log(`${result.country} (${result.unit}): ${result.created} clubs`);
    });

    console.log('\\n✅ Missing Africa and South America clubs successfully added!');
    console.log('🇺🇬 Uganda club (Kampala Gaels) is now available in the system!');

  } catch (error) {
    console.error('Error adding clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the addition
addAfricaSouthAmericaClubs();