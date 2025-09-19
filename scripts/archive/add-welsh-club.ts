import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function addWelshClub() {
  try {
    console.log('Adding Welsh club...');
    
    // Read the CSV file to find the Welsh club
    const csvPath = '/Users/alan/Downloads/UK_GAA_Clubs.csv';
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });
    
    const welshClub = records.find((record: any) => record.Country === 'Wales');
    
    if (!welshClub) {
      console.log('No Welsh club found in CSV');
      return;
    }
    
    console.log(`Found Welsh club: ${welshClub.Club}`);
    
    // Get Britain unit and Wales country
    const britainUnit = await prisma.internationalUnit.findFirst({
      where: { code: 'BRITAIN' }
    });
    
    const wales = await prisma.country.findFirst({
      where: { 
        code: 'WALES',
        internationalUnitId: britainUnit?.id
      }
    });
    
    if (!britainUnit || !wales) {
      throw new Error('Britain unit or Wales country not found');
    }
    
    // Get or create Wales region
    const regionName = welshClub.County || welshClub.Province || 'Wales';
    let region = await prisma.region.findFirst({
      where: {
        name: regionName,
        countryId: wales.id
      }
    });
    
    if (!region) {
      region = await prisma.region.create({
        data: {
          code: regionName.toUpperCase().substring(0, 6),
          name: regionName,
          countryId: wales.id,
          displayOrder: 1
        }
      });
      console.log(`Created Wales region: ${regionName}`);
    }
    
    // Create the club
    const clubName = welshClub.Club.trim() + ' GAA';
    const sportsSupported = ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'];
    
    const club = await prisma.club.create({
      data: {
        name: clubName,
        location: `${regionName}, Wales, Britain`,
        latitude: welshClub.Latitude ? parseFloat(welshClub.Latitude) : null,
        longitude: welshClub.Longitude ? parseFloat(welshClub.Longitude) : null,
        imageUrl: welshClub.crest_url || null,
        sportsSupported: sportsSupported,
        status: 'APPROVED' as const,
        verificationStatus: 'VERIFIED' as const,
        internationalUnitId: britainUnit.id,
        countryId: wales.id,
        regionId: region.id,
        region: regionName,
        subRegion: welshClub.Pitch || null,
        codes: region.code,
        dataSource: 'UK_GAA_CSV'
      }
    });
    
    console.log(`✅ Created Welsh club: ${club.name}`);
    
    // Final count
    const totalBritishClubs = await prisma.club.count({
      where: { internationalUnitId: britainUnit.id }
    });
    
    console.log(`Total British clubs now: ${totalBritishClubs}`);
    
  } catch (error) {
    console.error('Error adding Welsh club:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWelshClub();