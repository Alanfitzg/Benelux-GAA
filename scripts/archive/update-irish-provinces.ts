import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Irish counties organized by province (excluding Leinster which is already done)
const provincialCounties = [
  // MUNSTER
  {
    province: 'Munster',
    provinceCode: 'MUNSTER',
    counties: [
      { name: 'Cork', csvFile: '/Users/alan/Downloads/Cork_GAA_Clubs.csv', code: 'COR' },
      { name: 'Kerry', csvFile: '/Users/alan/Downloads/Kerry_GAA_Clubs.csv', code: 'KER' },
      { name: 'Limerick', csvFile: '/Users/alan/Downloads/Limerick_GAA_Clubs.csv', code: 'LIM' },
      { name: 'Tipperary', csvFile: '/Users/alan/Downloads/Tipperary_GAA_Clubs.csv', code: 'TIP' },
      { name: 'Waterford', csvFile: '/Users/alan/Downloads/Waterford_GAA_Clubs.csv', code: 'WAT' },
      { name: 'Clare', csvFile: '/Users/alan/Downloads/Clare_GAA_Clubs.csv', code: 'CLA' },
    ]
  },
  // CONNACHT
  {
    province: 'Connacht',
    provinceCode: 'CONNACHT',
    counties: [
      { name: 'Galway', csvFile: '/Users/alan/Downloads/Galway_GAA_Clubs.csv', code: 'GAL' },
      { name: 'Mayo', csvFile: '/Users/alan/Downloads/Mayo_GAA_Clubs.csv', code: 'MAY' },
      { name: 'Roscommon', csvFile: '/Users/alan/Downloads/Roscommon_GAA_Clubs.csv', code: 'ROS' },
      { name: 'Sligo', csvFile: '/Users/alan/Downloads/Sligo_GAA_Clubs.csv', code: 'SLI' },
      { name: 'Leitrim', csvFile: '/Users/alan/Downloads/Leitrim_GAA_Clubs.csv', code: 'LEI' },
    ]
  },
  // ULSTER
  {
    province: 'Ulster',
    provinceCode: 'ULSTER',
    counties: [
      // Northern Ireland
      { name: 'Antrim', csvFile: '/Users/alan/Downloads/Antrim_GAA_Clubs.csv', code: 'ANT' },
      { name: 'Armagh', csvFile: '/Users/alan/Downloads/Armagh_GAA_Clubs.csv', code: 'ARM' },
      { name: 'Down', csvFile: '/Users/alan/Downloads/Down_GAA_Clubs.csv', code: 'DOW' },
      { name: 'Fermanagh', csvFile: '/Users/alan/Downloads/Fermanagh_GAA_Clubs.csv', code: 'FER' },
      { name: 'Derry', csvFile: '/Users/alan/Downloads/Derry_GAA_Clubs.csv', code: 'DER' },
      { name: 'Tyrone', csvFile: '/Users/alan/Downloads/Tyrone_GAA_Clubs.csv', code: 'TYR' },
      // Republic of Ireland Ulster counties
      { name: 'Donegal', csvFile: '/Users/alan/Downloads/Donegal_GAA_Clubs.csv', code: 'DON' },
      { name: 'Cavan', csvFile: '/Users/alan/Downloads/Cavan_GAA_Clubs.csv', code: 'CAV' },
      { name: 'Monaghan', csvFile: '/Users/alan/Downloads/Monaghan_GAA_Clubs.csv', code: 'MON' },
    ]
  }
];

async function updateIrishProvinces() {
  try {
    console.log('Starting Irish provinces GAA clubs update...');
    
    // Get Ireland International Unit
    const irelandUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'IRELAND' }
    });

    if (!irelandUnit) {
      throw new Error('Ireland international unit not found');
    }

    // Get Ireland Country
    const irelandCountry = await prisma.country.findFirst({
      where: { 
        code: 'IE',
        internationalUnitId: irelandUnit.id
      }
    });

    if (!irelandCountry) {
      throw new Error('Ireland country not found');
    }

    let grandTotalCreated = 0;
    let grandTotalSkipped = 0;
    const provinceResults: Array<{province: string, counties: Array<{county: string, created: number, skipped: number}>}> = [];

    for (const provinceData of provincialCounties) {
      console.log(`\n=== Processing ${provinceData.province} Province ===`);
      
      let provinceTotalCreated = 0;
      let provinceTotalSkipped = 0;
      const countyResults: Array<{county: string, created: number, skipped: number}> = [];

      for (const county of provinceData.counties) {
        console.log(`\n--- Processing ${county.name} County ---`);

        // Check if CSV file exists
        if (!fs.existsSync(county.csvFile)) {
          console.log(`❌ CSV file not found: ${county.csvFile}`);
          countyResults.push({county: county.name, created: 0, skipped: 0});
          continue;
        }

        // Read the CSV file
        const fileContent = fs.readFileSync(county.csvFile, 'utf-8');
        
        // Parse CSV
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });

        console.log(`Found ${records.length} records in ${county.name} CSV`);

        // Get or create county region
        let countyRegion = await prisma.region.findFirst({
          where: {
            code: county.code,
            countryId: irelandCountry.id
          }
        });

        if (!countyRegion) {
          countyRegion = await prisma.region.create({
            data: {
              code: county.code,
              name: county.name,
              countryId: irelandCountry.id,
              displayOrder: getCountyDisplayOrder(county.name)
            }
          });
          console.log(`Created ${county.name} region`);
        }

        // Delete existing clubs for this county to avoid duplicates
        const deleteResult = await prisma.club.deleteMany({
          where: {
            codes: county.code,
            countryId: irelandCountry.id
          }
        });
        console.log(`Deleted ${deleteResult.count} existing ${county.name} clubs`);

        // Process each club from CSV
        let created = 0;
        let skipped = 0;
        const uniqueClubs = new Map();

        for (const record of records) {
          if (!record.club_name || record.club_name.trim() === '') {
            skipped++;
            continue;
          }

          const clubName = record.club_name.trim();
          
          // Handle clubs with multiple pitches - only create one club entry
          const baseClubName = clubName
            .replace(/,.*$/, '') // Remove anything after comma
            .replace(/GAA$/, '').trim() + ' GAA'; // Ensure GAA suffix

          // Skip if we've already processed this club
          if (uniqueClubs.has(baseClubName)) {
            continue;
          }

          // Parse sports supported
          const sportsSupported = [];
          if (record.code && record.code.toLowerCase().includes('hurling')) {
            sportsSupported.push('Hurling');
          }
          // Default sports for GAA clubs
          sportsSupported.push('Gaelic Football');
          if (!sportsSupported.includes('Hurling')) {
            sportsSupported.push('Hurling');
          }
          sportsSupported.push('Camogie');
          sportsSupported.push('Ladies Football');

          const clubData = {
            name: baseClubName,
            location: `${record.county || county.name}, ${record.province || provinceData.province}, ${record.country || 'Ireland'}`,
            latitude: record.latitude ? parseFloat(record.latitude) : null,
            longitude: record.longitude ? parseFloat(record.longitude) : null,
            imageUrl: record.crest_url || null,
            sportsSupported: sportsSupported,
            status: 'APPROVED' as const,
            verificationStatus: 'VERIFIED' as const,
            internationalUnitId: irelandUnit.id,
            countryId: irelandCountry.id,
            regionId: countyRegion.id,
            region: county.name,
            subRegion: record.pitch || null,
            codes: county.code,
            dataSource: `${county.name.toUpperCase()}_GAA_CSV`
          };

          uniqueClubs.set(baseClubName, clubData);
        }

        // Create all unique clubs for this county
        for (const [clubName, clubData] of uniqueClubs) {
          try {
            const club = await prisma.club.create({
              data: clubData
            });

            created++;
            console.log(`✅ Created: ${club.name}`);
          } catch (error) {
            console.error(`❌ Error creating club ${clubName}:`, error);
            skipped++;
          }
        }

        const countyResult = {
          county: county.name,
          created: created,
          skipped: skipped
        };
        countyResults.push(countyResult);
        provinceTotalCreated += created;
        provinceTotalSkipped += skipped;

        console.log(`${county.name} Summary: ${created} created, ${skipped} skipped`);
      }

      provinceResults.push({
        province: provinceData.province,
        counties: countyResults
      });

      grandTotalCreated += provinceTotalCreated;
      grandTotalSkipped += provinceTotalSkipped;

      console.log(`\n${provinceData.province} Province Summary: ${provinceTotalCreated} clubs created, ${provinceTotalSkipped} skipped`);
    }

    console.log('\n=== IRISH PROVINCES UPDATE COMPLETE ===');
    console.log(`Grand total clubs created: ${grandTotalCreated}`);
    console.log(`Grand total records skipped: ${grandTotalSkipped}`);
    
    console.log('\n=== Province Breakdown ===');
    provinceResults.forEach(province => {
      console.log(`\n${province.province}:`);
      province.counties.forEach(county => {
        console.log(`  ${county.county}: ${county.created} clubs created`);
      });
    });
    
    // Verify the update
    const totalIrishClubs = await prisma.club.count({
      where: {
        countryId: irelandCountry.id
      }
    });
    console.log(`\nTotal Irish clubs in database: ${totalIrishClubs}`);

  } catch (error) {
    console.error('Error updating Irish provinces:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCountyDisplayOrder(countyName: string): number {
  const order: Record<string, number> = {
    // Leinster (1-12) - already done
    'Carlow': 1, 'Dublin': 2, 'Kildare': 3, 'Kilkenny': 4, 'Laois': 5, 'Longford': 6,
    'Louth': 7, 'Meath': 8, 'Offaly': 9, 'Westmeath': 10, 'Wexford': 11, 'Wicklow': 12,
    
    // Munster (13-18)
    'Cork': 13, 'Kerry': 14, 'Limerick': 15, 'Tipperary': 16, 'Waterford': 17, 'Clare': 18,
    
    // Connacht (19-23)
    'Galway': 19, 'Mayo': 20, 'Roscommon': 21, 'Sligo': 22, 'Leitrim': 23,
    
    // Ulster (24-32)
    'Antrim': 24, 'Armagh': 25, 'Down': 26, 'Fermanagh': 27, 'Derry': 28, 'Tyrone': 29,
    'Donegal': 30, 'Cavan': 31, 'Monaghan': 32,
  };
  return order[countyName] || 99;
}

// Run the update
updateIrishProvinces();