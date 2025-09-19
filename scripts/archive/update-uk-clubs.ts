import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function updateUKClubs() {
  try {
    console.log('Starting UK GAA clubs update...');
    
    // Read the CSV file
    const csvPath = '/Users/alan/Downloads/UK_GAA_Clubs.csv';
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} clubs in UK CSV`);

    // Get Britain International Unit
    const britainUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'BRITAIN' }
    });

    if (!britainUnit) {
      throw new Error('Britain international unit not found');
    }

    // Get countries
    const england = await prisma.country.findFirst({
      where: { 
        code: 'ENGLAN',
        internationalUnitId: britainUnit.id
      }
    });

    const scotland = await prisma.country.findFirst({
      where: { 
        code: 'SCOTLA',
        internationalUnitId: britainUnit.id
      }
    });

    if (!england || !scotland) {
      throw new Error('England or Scotland country not found');
    }

    // Delete existing clubs for Britain to avoid duplicates
    const deleteResult = await prisma.club.deleteMany({
      where: {
        internationalUnitId: britainUnit.id
      }
    });
    console.log(`Deleted ${deleteResult.count} existing British clubs`);

    let totalCreated = 0;
    let totalSkipped = 0;
    let englandCount = 0;
    let scotlandCount = 0;

    // Process each club from CSV
    const uniqueClubs = new Map();

    for (const record of records) {
      if (!record.Club || record.Club.trim() === '') {
        totalSkipped++;
        continue;
      }

      const clubName = record.Club.trim();
      
      // Handle clubs with multiple pitches - only create one club entry
      const baseClubName = clubName
        .replace(/,.*$/, '') // Remove anything after comma
        .replace(/GAA$/, '').trim() + ' GAA'; // Ensure GAA suffix

      // Skip if we've already processed this club
      if (uniqueClubs.has(baseClubName)) {
        continue;
      }

      // Determine country based on the Country field
      const countryName = record.Country?.trim();
      let targetCountry;
      let regionName;
      
      if (countryName === 'England') {
        targetCountry = england;
        regionName = record.County || record.Province || 'England';
        englandCount++;
      } else if (countryName === 'Scotland') {
        targetCountry = scotland;
        regionName = record.Province || record.County || 'Scotland';
        scotlandCount++;
      } else {
        console.log(`Skipping club ${clubName} - unknown country: ${countryName}`);
        totalSkipped++;
        continue;
      }

      // Get or create region for this club
      let region = await prisma.region.findFirst({
        where: {
          name: regionName,
          countryId: targetCountry.id
        }
      });

      if (!region) {
        region = await prisma.region.create({
          data: {
            code: regionName.toUpperCase().substring(0, 6),
            name: regionName,
            countryId: targetCountry.id,
            displayOrder: englandCount + scotlandCount
          }
        });
        console.log(`Created region: ${regionName}`);
      }

      // Parse sports supported
      const sportsSupported = [];
      if (record.Code && record.Code.toLowerCase().includes('hurling')) {
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
        location: `${regionName}, ${countryName}, Britain`,
        latitude: record.Latitude ? parseFloat(record.Latitude) : null,
        longitude: record.Longitude ? parseFloat(record.Longitude) : null,
        imageUrl: record.crest_url || null,
        sportsSupported: sportsSupported,
        status: 'APPROVED' as const,
        verificationStatus: 'VERIFIED' as const,
        internationalUnitId: britainUnit.id,
        countryId: targetCountry.id,
        regionId: region.id,
        region: regionName,
        subRegion: record.Pitch || null,
        codes: region.code,
        dataSource: 'UK_GAA_CSV'
      };

      uniqueClubs.set(baseClubName, clubData);
    }

    // Create all unique clubs
    for (const [clubName, clubData] of uniqueClubs) {
      try {
        const club = await prisma.club.create({
          data: clubData
        });

        totalCreated++;
        console.log(`✅ Created: ${club.name} (${clubData.region})`);
      } catch (error) {
        console.error(`❌ Error creating club ${clubName}:`, error);
        totalSkipped++;
      }
    }

    console.log('\n=== UK UPDATE SUMMARY ===');
    console.log(`Total records in CSV: ${records.length}`);
    console.log(`Unique clubs processed: ${uniqueClubs.size}`);
    console.log(`Clubs created: ${totalCreated}`);
    console.log(`Records skipped: ${totalSkipped}`);
    console.log(`England clubs: ${englandCount}`);
    console.log(`Scotland clubs: ${scotlandCount}`);
    
    // Verify the update
    const britishClubCount = await prisma.club.count({
      where: {
        internationalUnitId: britainUnit.id
      }
    });
    console.log(`\nTotal British clubs in database: ${britishClubCount}`);

  } catch (error) {
    console.error('Error updating UK clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateUKClubs();