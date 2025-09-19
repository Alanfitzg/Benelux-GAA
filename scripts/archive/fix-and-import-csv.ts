import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

interface ClubRecord {
  File: string;
  Club: string;
  Pitch: string;
  Code: string;
  Latitude: string;
  Longitude: string;
  Province: string;
  Country: string;
  Division: string;
  County: string;
  Directions: string;
  Twitter: string;
  Elevation: string;
  annual_rainfall: string;
  rain_days: string;
  crest_url: string;
}

interface ImportStats {
  totalRows: number;
  processed: number;
  clubsCreated: number;
  clubsUpdated: number;
  regionsCreated: number;
  countriesCreated: number;
  unitsCreated: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

const stats: ImportStats = {
  totalRows: 0,
  processed: 0,
  clubsCreated: 0,
  clubsUpdated: 0,
  regionsCreated: 0,
  countriesCreated: 0,
  unitsCreated: 0,
  errors: []
};

// Geographic mapping
const UNIT_MAPPING: { [key: string]: string } = {
  'Ireland': 'IRELAND',
  'Middle East': 'MIDDLE_EAST', 
  'Europe': 'EUROPE',
  'North America': 'NORTH_AMERICA',
  'USA': 'NORTH_AMERICA',
  'Australasia': 'AUSTRALASIA',
  'Asia': 'ASIA',
  'Africa': 'AFRICA'
};

async function ensureInternationalUnit(unitCode: string, unitName: string) {
  const unit = await prisma.internationalUnit.upsert({
    where: { code: unitCode },
    update: { name: unitName },
    create: {
      code: unitCode,
      name: unitName,
      displayOrder: Object.keys(UNIT_MAPPING).length + stats.unitsCreated
    }
  });
  
  const existing = await prisma.internationalUnit.findUnique({ where: { code: unitCode } });
  if (!existing) {
    stats.unitsCreated++;
  }
  
  return unit;
}

async function ensureCountry(countryCode: string, countryName: string, unitId: string) {
  const existing = await prisma.country.findUnique({ where: { code: countryCode } });
  
  const country = await prisma.country.upsert({
    where: { code: countryCode },
    update: { 
      name: countryName,
      internationalUnitId: unitId,
      hasRegions: true
    },
    create: {
      code: countryCode,
      name: countryName,
      internationalUnitId: unitId,
      hasRegions: true,
      displayOrder: stats.countriesCreated
    }
  });
  
  if (!existing) {
    stats.countriesCreated++;
    console.log(`✅ Created country: ${countryName} (${countryCode})`);
  }
  
  return country;
}

async function ensureRegion(regionCode: string, regionName: string, countryId: string) {
  const existing = await prisma.region.findUnique({
    where: {
      countryId_code: {
        countryId,
        code: regionCode
      }
    }
  });
  
  const region = await prisma.region.upsert({
    where: {
      countryId_code: {
        countryId,
        code: regionCode
      }
    },
    update: { name: regionName },
    create: {
      code: regionCode,
      name: regionName,
      countryId,
      displayOrder: stats.regionsCreated
    }
  });
  
  if (!existing) {
    stats.regionsCreated++;
    console.log(`✅ Created region: ${regionName} (${regionCode})`);
  }
  
  return region;
}

function generateCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .substring(0, 6);
}

function parseCSVManually(csvContent: string): ClubRecord[] {
  const lines = csvContent.split('\n');
  const header = lines[0].split(',');
  const records: ClubRecord[] = [];
  
  console.log('Header columns:', header);
  console.log('Expected columns:', header.length);
  
  // Process each line after header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma but respect quoted fields
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add the last field
    fields.push(currentField);
    
    // If we have the right number of fields, create a record
    if (fields.length >= 16) {
      const record: ClubRecord = {
        File: fields[0] || '',
        Club: fields[1] || '',
        Pitch: fields[2] || '',
        Code: fields[3] || '',
        Latitude: fields[4] || '',
        Longitude: fields[5] || '',
        Province: fields[6] || '',
        Country: fields[7] || '',
        Division: fields[8] || '',
        County: fields[9] || '',
        Directions: fields[10] || '',
        Twitter: fields[11] || '',
        Elevation: fields[12] || '',
        annual_rainfall: fields[13] || '',
        rain_days: fields[14] || '',
        crest_url: fields[15] || ''
      };
      
      records.push(record);
    } else {
      console.log(`⚠️ Skipping line ${i + 1}: found ${fields.length} fields, expected 16`);
    }
  }
  
  return records;
}

async function processClub(record: ClubRecord, index: number) {
  try {
    const clubName = record.Club.trim();
    if (!clubName) {
      stats.errors.push({ row: index, error: 'Missing club name' });
      return;
    }
    
    // Map to international unit
    const unitName = record.File || 'Rest of World';
    const unitCode = UNIT_MAPPING[unitName] || 'REST_WORLD';
    const unit = await ensureInternationalUnit(unitCode, unitName);
    
    // Create/find country
    const countryName = record.Country || record.Province || 'Unknown';
    const countryCode = countryName === 'Ireland' ? 'IE' : 
                       countryName === 'Spain' ? 'ES' :
                       countryName === 'Australia' ? 'AU' :
                       countryName === 'UAE' ? 'AE' :
                       generateCode(countryName);
    
    const country = await ensureCountry(countryCode, countryName, unit.id);
    
    // Create/find region
    let region = null;
    if (record.Province && record.Province !== countryName) {
      const regionCode = generateCode(record.Province);
      region = await ensureRegion(regionCode, record.Province, country.id);
    } else if (record.Division) {
      const regionCode = generateCode(record.Division);
      region = await ensureRegion(regionCode, record.Division, country.id);
    }
    
    // Parse coordinates
    const latitude = record.Latitude ? parseFloat(record.Latitude) : null;
    const longitude = record.Longitude ? parseFloat(record.Longitude) : null;
    
    // Check if club exists
    const existingClub = await prisma.club.findFirst({
      where: {
        name: clubName,
        countryId: country.id
      }
    });
    
    const clubData = {
      name: clubName,
      internationalUnitId: unit.id,
      countryId: country.id,
      regionId: region?.id || null,
      latitude: isNaN(latitude!) ? null : latitude,
      longitude: isNaN(longitude!) ? null : longitude,
      codes: record.Code || null,
      location: [record.Province, record.County, record.Division].filter(Boolean).join(', ') || null,
    };
    
    if (existingClub) {
      await prisma.club.update({
        where: { id: existingClub.id },
        data: clubData
      });
      stats.clubsUpdated++;
      console.log(`🔄 Updated: ${clubName}`);
    } else {
      await prisma.club.create({
        data: clubData
      });
      stats.clubsCreated++;
      console.log(`✅ Created: ${clubName}`);
    }
    
    stats.processed++;
    
    if (stats.processed % 50 === 0) {
      console.log(`📊 Progress: ${stats.processed}/${stats.totalRows} (${Math.round(stats.processed/stats.totalRows*100)}%)`);
    }
    
  } catch (error) {
    stats.errors.push({
      row: index,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: record
    });
    console.error(`❌ Error processing ${record.Club}:`, error);
  }
}

async function importCSV(csvPath: string) {
  console.log('🚀 Starting manual CSV import...');
  
  try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCSVManually(content);
    
    stats.totalRows = records.length;
    console.log(`📊 Found ${stats.totalRows} clubs to import`);
    
    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map((record, batchIndex) => 
          processClub(record, i + batchIndex + 1)
        )
      );
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Import completed!');
    console.log('📊 Final Statistics:');
    console.log(`   📁 Total rows processed: ${stats.processed}/${stats.totalRows}`);
    console.log(`   🏛️ International units created: ${stats.unitsCreated}`);
    console.log(`   🌍 Countries created: ${stats.countriesCreated}`);
    console.log(`   📍 Regions created: ${stats.regionsCreated}`);
    console.log(`   🏠 Clubs created: ${stats.clubsCreated}`);
    console.log(`   🔄 Clubs updated: ${stats.clubsUpdated}`);
    console.log(`   ❌ Errors: ${stats.errors.length}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importCSV('/Users/alan/Downloads/GAA_Pitchfinder_Crest_URLs_Fixed.csv');