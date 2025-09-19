import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function updateDublinClubs() {
  try {
    console.log('Starting Dublin GAA clubs update...');
    
    // Read the CSV file
    const csvPath = '/Users/alan/Downloads/Dublin_GAA_Clubs (1).csv';
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} clubs in CSV`);

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

    // Get or create Dublin region
    let dublinRegion = await prisma.region.findFirst({
      where: {
        code: 'DUB',
        countryId: irelandCountry.id
      }
    });

    if (!dublinRegion) {
      dublinRegion = await prisma.region.create({
        data: {
          code: 'DUB',
          name: 'Dublin',
          countryId: irelandCountry.id,
          displayOrder: 1
        }
      });
      console.log('Created Dublin region');
    }

    // First, delete all existing Dublin clubs to avoid duplicates
    const deleteResult = await prisma.club.deleteMany({
      where: {
        location: { contains: 'Dublin' },
        countryId: irelandCountry.id
      }
    });
    console.log(`Deleted ${deleteResult.count} existing Dublin clubs`);

    // Process each club from CSV
    let created = 0;
    let skipped = 0;
    const uniqueClubs = new Map();

    for (const record of records) {
      if (!record.Club || record.Club.trim() === '') {
        skipped++;
        continue;
      }

      const clubName = record.Club.trim();
      
      // Handle clubs with multiple pitches - only create one club entry
      const baseClubName = clubName
        .replace(/,.*$/, '') // Remove anything after comma
        .replace(/GAA$/, '').trim() + ' GAA'; // Ensure GAA suffix

      // Skip if we've already processed this club
      if (uniqueClubs.has(baseClubName)) {
        // Update the existing club with additional pitch info if needed
        const existingClub = uniqueClubs.get(baseClubName);
        if (record.Pitch && !existingClub.pitches.includes(record.Pitch)) {
          existingClub.pitches.push(record.Pitch);
        }
        continue;
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
        location: `${record.County}, ${record.Province}, ${record.Country}`,
        latitude: record.Latitude ? parseFloat(record.Latitude) : null,
        longitude: record.Longitude ? parseFloat(record.Longitude) : null,
        imageUrl: record.crest_url || null,
        sportsSupported: sportsSupported,
        pitches: record.Pitch ? [record.Pitch] : [],
        status: 'APPROVED' as const,
        verificationStatus: 'VERIFIED' as const,
        internationalUnitId: irelandUnit.id,
        countryId: irelandCountry.id,
        regionId: dublinRegion.id,
        region: 'Dublin',
        subRegion: record.Pitch || null,
        codes: 'DUB', // Set the county code for Dublin
        dataSource: 'DUBLIN_GAA_CSV'
      };

      uniqueClubs.set(baseClubName, clubData);
    }

    // Create all unique clubs
    for (const [clubName, clubData] of uniqueClubs) {
      try {
        const { pitches, ...createData } = clubData;
        
        const club = await prisma.club.create({
          data: createData
        });

        created++;
        console.log(`Created: ${club.name}`);
      } catch (error) {
        console.error(`Error creating club ${clubName}:`, error);
        skipped++;
      }
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total records in CSV: ${records.length}`);
    console.log(`Unique clubs processed: ${uniqueClubs.size}`);
    console.log(`Clubs created: ${created}`);
    console.log(`Records skipped: ${skipped}`);
    
    // Verify the update
    const dublinClubCount = await prisma.club.count({
      where: {
        location: { contains: 'Dublin' },
        countryId: irelandCountry.id
      }
    });
    console.log(`\nTotal Dublin clubs in database: ${dublinClubCount}`);

  } catch (error) {
    console.error('Error updating Dublin clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateDublinClubs();