import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Leinster counties with their CSV files and county codes
const leinsterCounties = [
  { name: 'Carlow', csvFile: '/Users/alan/Downloads/Carlow_GAA_Clubs.csv', code: 'CAR' },
  { name: 'Kildare', csvFile: '/Users/alan/Downloads/Kildare_GAA_Clubs (1).csv', code: 'KIL' }, // Use the newer file
  { name: 'Kilkenny', csvFile: '/Users/alan/Downloads/Kilkenny_GAA_Clubs (1).csv', code: 'KLK' }, // Use the newer file
  { name: 'Laois', csvFile: '/Users/alan/Downloads/Laois_GAA_Clubs.csv', code: 'LAO' },
  { name: 'Longford', csvFile: '/Users/alan/Downloads/Longford_GAA_Clubs.csv', code: 'LON' },
  { name: 'Louth', csvFile: '/Users/alan/Downloads/Louth_GAA_Clubs.csv', code: 'LOU' },
  { name: 'Meath', csvFile: '/Users/alan/Downloads/Meath_GAA_Clubs.csv', code: 'MEA' },
  { name: 'Offaly', csvFile: '/Users/alan/Downloads/Offaly_GAA_Clubs.csv', code: 'OFF' },
  { name: 'Westmeath', csvFile: '/Users/alan/Downloads/Westmeath_GAA_Clubs.csv', code: 'WES' },
  { name: 'Wexford', csvFile: '/Users/alan/Downloads/Wexford_GAA_Clubs.csv', code: 'WEX' },
  { name: 'Wicklow', csvFile: '/Users/alan/Downloads/Wicklow_GAA_Clubs.csv', code: 'WIC' },
];

async function updateLeinsterClubs() {
  try {
    console.log('Starting Leinster GAA clubs update...');
    
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

    let totalCreated = 0;
    let totalSkipped = 0;
    const results: Array<{county: string, created: number, skipped: number}> = [];

    for (const county of leinsterCounties) {
      console.log(`\n=== Processing ${county.name} County ===`);

      // Check if CSV file exists
      if (!fs.existsSync(county.csvFile)) {
        console.log(`❌ CSV file not found: ${county.csvFile}`);
        results.push({county: county.name, created: 0, skipped: 0});
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
          location: `${record.county || county.name}, ${record.province || 'Leinster'}, ${record.country || 'Ireland'}`,
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
      results.push(countyResult);
      totalCreated += created;
      totalSkipped += skipped;

      console.log(`${county.name} Summary: ${created} created, ${skipped} skipped`);
    }

    console.log('\n=== LEINSTER UPDATE COMPLETE ===');
    console.log(`Total clubs created: ${totalCreated}`);
    console.log(`Total records skipped: ${totalSkipped}`);
    
    console.log('\n=== County Breakdown ===');
    results.forEach(result => {
      console.log(`${result.county}: ${result.created} clubs created`);
    });
    
    // Verify the update
    const leinsterClubCount = await prisma.club.count({
      where: {
        location: { contains: 'Leinster' },
        countryId: irelandCountry.id,
        codes: { not: 'DUB' } // Exclude Dublin as it was updated separately
      }
    });
    console.log(`\nTotal Leinster clubs in database (excluding Dublin): ${leinsterClubCount}`);

  } catch (error) {
    console.error('Error updating Leinster clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCountyDisplayOrder(countyName: string): number {
  const order: Record<string, number> = {
    'Carlow': 1,
    'Dublin': 2, // Already updated
    'Kildare': 3,
    'Kilkenny': 4,
    'Laois': 5,
    'Longford': 6,
    'Louth': 7,
    'Meath': 8,
    'Offaly': 9,
    'Westmeath': 10,
    'Wexford': 11,
    'Wicklow': 12,
  };
  return order[countyName] || 99;
}

// Run the update
updateLeinsterClubs();