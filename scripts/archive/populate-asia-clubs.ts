import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function populateAsiaClubs() {
  try {
    console.log('Starting Asia GAA clubs population...');
    
    // Get Asia International Unit
    const asiaUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'ASIA' }
    });

    if (!asiaUnit) {
      throw new Error('Asia international unit not found');
    }

    console.log(`Found Asia unit: ${asiaUnit.name}`);

    // Delete existing Asia clubs to avoid duplicates
    const deleteResult = await prisma.club.deleteMany({
      where: {
        internationalUnitId: asiaUnit.id
      }
    });
    console.log(`Deleted ${deleteResult.count} existing Asia clubs`);

    let totalCreated = 0;
    const countryResults: Array<{country: string, created: number}> = [];

    // Process Asia Clubs file
    console.log('\\n=== Processing Asian Clubs ===');
    const asiaPath = '/Users/alan/Downloads/Asia_GAA_Clubs.csv';
    const asiaContent = fs.readFileSync(asiaPath, 'utf-8');
    const asiaRecords = parse(asiaContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${asiaRecords.length} clubs in Asia file`);

    // Group by country
    const countryGroups = new Map();
    asiaRecords.forEach((record: any) => {
      const country = record.country?.trim();
      if (country && country !== 'country') {
        if (!countryGroups.has(country)) {
          countryGroups.set(country, []);
        }
        countryGroups.get(country).push(record);
      }
    });

    // Create country display order mapping
    const getCountryDisplayOrder = (countryName: string): number => {
      const order: Record<string, number> = {
        'China': 1,
        'Japan': 2,
        'South Korea': 3,
        'Hong Kong': 4,
        'Singapore': 5,
        'Malaysia': 6,
        'Thailand': 7,
        'Vietnam': 8,
        'Indonesia': 9,
        'Cambodia': 10,
        'India': 11,
        'Pakistan': 12
      };
      return order[countryName] || 99;
    };

    // Get country codes mapping
    const getCountryCode = (countryName: string): string => {
      const codes: Record<string, string> = {
        'China': 'CN',
        'Japan': 'JP', 
        'South Korea': 'KR',
        'Hong Kong': 'HK',
        'Singapore': 'SG',
        'Malaysia': 'MY',
        'Thailand': 'TH',
        'Vietnam': 'VN',
        'Indonesia': 'ID',
        'Cambodia': 'KH',
        'India': 'IN',
        'Pakistan': 'PK'
      };
      return codes[countryName] || countryName.toUpperCase().substring(0, 2);
    };

    // Process each country
    for (const [countryName, clubs] of countryGroups) {
      console.log(`\\n--- Processing ${countryName} ---`);
      
      // Get or create country for this region
      let country = await prisma.country.findFirst({
        where: {
          name: countryName,
          internationalUnitId: asiaUnit.id
        }
      });

      if (!country) {
        country = await prisma.country.create({
          data: {
            code: getCountryCode(countryName),
            name: countryName,
            hasRegions: true,
            internationalUnitId: asiaUnit.id,
            displayOrder: getCountryDisplayOrder(countryName)
          }
        });
        console.log(`Created country: ${countryName} (${country.code})`);
      }

      let countryCreated = 0;
      
      for (const record of clubs) {
        if (!record.club_name || record.club_name.trim() === '') {
          continue;
        }

        const clubName = record.club_name.trim();
        const baseClubName = clubName.endsWith(' GAA') ? clubName : clubName + ' GAA';
        const division = record.division?.trim() || countryName;

        // Create region if it doesn't exist (using division/city as region)
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

        // Standard GAA sports for Asia
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
              internationalUnitId: asiaUnit.id,
              countryId: country.id,
              regionId: region.id,
              region: division,
              subRegion: null,
              codes: region.code,
              dataSource: 'ASIA_GAA_CSV'
            }
          });

          countryCreated++;
          totalCreated++;
          console.log(`✅ Created: ${club.name}`);
        } catch (error) {
          console.error(`❌ Error creating club ${baseClubName}:`, error);
        }
      }

      countryResults.push({
        country: countryName,
        created: countryCreated
      });

      console.log(`${countryName} Summary: ${countryCreated} clubs created`);
    }

    console.log('\\n=== ASIA POPULATION COMPLETE ===');
    console.log(`Total clubs created: ${totalCreated}`);
    
    console.log('\\n=== Country Breakdown ===');
    countryResults
      .sort((a, b) => b.created - a.created)
      .forEach(result => {
        console.log(`${result.country}: ${result.created} clubs`);
      });
    
    // Verify the update
    const asiaClubCount = await prisma.club.count({
      where: {
        internationalUnitId: asiaUnit.id
      }
    });
    console.log(`\\nTotal Asia clubs in database: ${asiaClubCount}`);

    console.log('\\n🏯 Asia successfully populated with GAA clubs!');

  } catch (error) {
    console.error('Error populating Asia clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the population
populateAsiaClubs();