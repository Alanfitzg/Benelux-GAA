import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVRow {
  File: string;
  Club: string;
  Pitch: string;
  Code: string;
  Latitude: string;
  Longitude: string;
  Province: string;
  County: string;
  Division: string;
  Directions: string;
  Twitter: string;
  Elevation: string;
  [key: string]: string; // Allow for additional columns
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

// Enhanced geographic mapping with support for creating new regions
const GEOGRAPHIC_MAPPING = {
  // Ireland provinces to regions (these should already exist)
  'Munster': { unit: 'IRELAND', country: 'IE', type: 'province' },
  'Leinster': { unit: 'IRELAND', country: 'IE', type: 'province' },
  'Connacht': { unit: 'IRELAND', country: 'IE', type: 'province' },
  'Connaught': { unit: 'IRELAND', country: 'IE', type: 'province' }, // Alternative spelling
  'Ulster': { unit: 'IRELAND', country: 'IE', type: 'province' },
  
  // International units - these will create new countries/regions as needed
  'Europe': { unit: 'EUROPE', type: 'international' },
  'North America': { unit: 'NORTH_AMERICA', type: 'international' },
  'USA': { unit: 'NORTH_AMERICA', country: 'US', type: 'country' },
  'Canada': { unit: 'NORTH_AMERICA', country: 'CA', type: 'country' },
  'Britain': { unit: 'BRITAIN', country: 'GB', type: 'country' },
  'Scotland': { unit: 'BRITAIN', country: 'GB', region: 'SCO', type: 'region' },
  'England': { unit: 'BRITAIN', country: 'GB', type: 'country' },
  'Wales': { unit: 'BRITAIN', country: 'GB', region: 'WAL', type: 'region' },
  'Australasia': { unit: 'AUSTRALASIA', type: 'international' },
  'Australia': { unit: 'AUSTRALASIA', country: 'AU', type: 'country' },
  'New Zealand': { unit: 'AUSTRALASIA', country: 'NZ', type: 'country' },
  'Asia': { unit: 'ASIA', type: 'international' },
  'Middle East': { unit: 'MIDDLE_EAST', type: 'international' },
  'Africa': { unit: 'AFRICA', type: 'international' },
  'Rest of World': { unit: 'REST_WORLD', type: 'international' },
};

async function ensureInternationalUnit(unitCode: string, unitName: string) {
  const unit = await prisma.internationalUnit.upsert({
    where: { code: unitCode },
    update: { name: unitName },
    create: {
      code: unitCode,
      name: unitName,
      displayOrder: Object.keys(GEOGRAPHIC_MAPPING).length + stats.unitsCreated
    }
  });
  
  if (!await prisma.internationalUnit.findUnique({ where: { code: unitCode } })) {
    stats.unitsCreated++;
  }
  
  return unit;
}

async function ensureCountry(countryCode: string, countryName: string, unitId: string, hasRegions: boolean = false) {
  const existing = await prisma.country.findUnique({ where: { code: countryCode } });
  
  const country = await prisma.country.upsert({
    where: { code: countryCode },
    update: { 
      name: countryName,
      hasRegions,
      internationalUnitId: unitId
    },
    create: {
      code: countryCode,
      name: countryName,
      internationalUnitId: unitId,
      hasRegions,
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
    console.log(`✅ Created region: ${regionName} (${regionCode}) in country ${countryId}`);
  }
  
  return region;
}

function generateRegionCode(regionName: string): string {
  // Generate a region code from the name
  return regionName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .substring(0, 6);
}

function generateCountryCode(countryName: string): string {
  // Generate a country code from the name (try to use ISO codes where possible)
  const commonCodes: { [key: string]: string } = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Great Britain': 'GB',
    'Germany': 'DE',
    'France': 'FR',
    'Spain': 'ES',
    'Italy': 'IT',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Switzerland': 'CH',
    'Portugal': 'PT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Greece': 'GR',
    'Turkey': 'TR',
    'Russia': 'RU',
    'Japan': 'JP',
    'China': 'CN',
    'South Korea': 'KR',
    'India': 'IN',
    'Thailand': 'TH',
    'Malaysia': 'MY',
    'Singapore': 'SG',
    'Indonesia': 'ID',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'South Africa': 'ZA',
    'Egypt': 'EG',
    'Nigeria': 'NG',
    'Kenya': 'KE',
    'Argentina': 'AR',
    'Brazil': 'BR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Mexico': 'MX',
    'Venezuela': 'VE'
  };
  
  return commonCodes[countryName] || countryName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 3);
}

async function resolveGeography(province: string, county: string, division: string) {
  // First, try to match against known mapping
  const mapping = GEOGRAPHIC_MAPPING[province] || GEOGRAPHIC_MAPPING[county] || GEOGRAPHIC_MAPPING[division];
  
  if (mapping) {
    const unit = await ensureInternationalUnit(mapping.unit, mapping.unit.replace('_', ' '));
    
    if (mapping.country) {
      const country = await ensureCountry(mapping.country, mapping.country, unit.id, true);
      
      if (mapping.region) {
        const region = await ensureRegion(mapping.region, mapping.region, country.id);
        return { unit, country, region };
      }
      
      // If we have county info, create it as a region
      if (county && county !== province) {
        const regionCode = generateRegionCode(county);
        const region = await ensureRegion(regionCode, county, country.id);
        return { unit, country, region };
      }
      
      return { unit, country, region: null };
    }
  }
  
  // If no direct mapping, create new geographic entities
  let unitCode = 'REST_WORLD';
  let unitName = 'Rest of World';
  
  // Try to infer from geographic names
  if (province.toLowerCase().includes('europe') || 
      ['germany', 'france', 'spain', 'italy', 'netherlands', 'belgium'].some(c => 
        province.toLowerCase().includes(c) || county.toLowerCase().includes(c))) {
    unitCode = 'EUROPE';
    unitName = 'Europe';
  } else if (province.toLowerCase().includes('america') || 
             ['usa', 'united states', 'canada'].some(c => 
               province.toLowerCase().includes(c) || county.toLowerCase().includes(c))) {
    unitCode = 'NORTH_AMERICA';
    unitName = 'North America';
  } else if (['australia', 'new zealand'].some(c => 
             province.toLowerCase().includes(c) || county.toLowerCase().includes(c))) {
    unitCode = 'AUSTRALASIA';
    unitName = 'Australasia';
  } else if (['asia', 'japan', 'china', 'singapore', 'thailand'].some(c => 
             province.toLowerCase().includes(c) || county.toLowerCase().includes(c))) {
    unitCode = 'ASIA';
    unitName = 'Asia';
  }
  
  const unit = await ensureInternationalUnit(unitCode, unitName);
  
  // Create country
  const countryName = county || province;
  const countryCode = generateCountryCode(countryName);
  const country = await ensureCountry(countryCode, countryName, unit.id, true);
  
  // Create region if we have additional subdivision info
  let region = null;
  if (division || (county && county !== province)) {
    const regionName = division || county;
    const regionCode = generateRegionCode(regionName);
    region = await ensureRegion(regionCode, regionName, country.id);
  }
  
  return { unit, country, region };
}

function parseCoordinate(coord: string): number | null {
  if (!coord || coord.trim() === '') return null;
  const parsed = parseFloat(coord.trim());
  return isNaN(parsed) ? null : parsed;
}

function cleanClubName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

async function processCSVRow(row: CSVRow, rowIndex: number) {
  try {
    const clubName = cleanClubName(row.Club);
    if (!clubName) {
      stats.errors.push({ 
        row: rowIndex, 
        error: 'Missing club name' 
      });
      return;
    }
    
    // Resolve geography and create regions as needed
    const { unit, country, region } = await resolveGeography(
      row.Province || '', 
      row.County || '', 
      row.Division || ''
    );
    
    // Parse coordinates
    const latitude = parseCoordinate(row.Latitude);
    const longitude = parseCoordinate(row.Longitude);
    
    // Check if club already exists (by name and location)
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
      latitude,
      longitude,
      codes: row.Code || null,
      location: [row.Province, row.County, row.Division].filter(Boolean).join(', ') || null,
    };
    
    if (existingClub) {
      // Update existing club
      await prisma.club.update({
        where: { id: existingClub.id },
        data: clubData
      });
      stats.clubsUpdated++;
      console.log(`🔄 Updated club: ${clubName}`);
    } else {
      // Create new club
      await prisma.club.create({
        data: clubData
      });
      stats.clubsCreated++;
      console.log(`✅ Created club: ${clubName}`);
    }
    
    stats.processed++;
    
    // Progress indicator
    if (stats.processed % 50 === 0) {
      console.log(`📊 Progress: ${stats.processed}/${stats.totalRows} (${Math.round(stats.processed/stats.totalRows*100)}%)`);
    }
    
  } catch (error) {
    stats.errors.push({
      row: rowIndex,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: row
    });
    console.error(`❌ Error processing row ${rowIndex}:`, error);
  }
}

async function importGAAClubs(csvFilePath: string) {
  console.log('🚀 Starting GAA Clubs CSV Import...');
  console.log(`📁 Reading file: ${csvFilePath}`);
  
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Try to parse with more permissive settings
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      skip_records_with_error: false, // Don't skip errors, let's see them
      on_record: (record, { lines }) => {
        // Log progress every 100 records
        if (lines % 100 === 0) {
          console.log(`📖 Processing line ${lines}...`);
        }
        return record;
      }
    });
    
    stats.totalRows = records.length;
    console.log(`📊 Found ${stats.totalRows} clubs to import`);
    
    // Process records in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map((record, batchIndex) => 
          processCSVRow(record, i + batchIndex + 1)
        )
      );
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Print final statistics
    console.log('\n🎉 Import completed!');
    console.log('📊 Final Statistics:');
    console.log(`   📁 Total rows processed: ${stats.processed}/${stats.totalRows}`);
    console.log(`   🏛️ International units created: ${stats.unitsCreated}`);
    console.log(`   🌍 Countries created: ${stats.countriesCreated}`);
    console.log(`   📍 Regions created: ${stats.regionsCreated}`);
    console.log(`   🏠 Clubs created: ${stats.clubsCreated}`);
    console.log(`   🔄 Clubs updated: ${stats.clubsUpdated}`);
    console.log(`   ❌ Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      stats.errors.slice(0, 10).forEach(error => {
        console.log(`   Row ${error.row}: ${error.error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more errors`);
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
if (require.main === module) {
  const csvPath = process.argv[2];
  
  if (!csvPath) {
    console.error('❌ Please provide the CSV file path as an argument');
    console.error('Usage: npx tsx scripts/import-gaa-clubs-csv.ts /path/to/clubs.csv');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }
  
  importGAAClubs(csvPath);
}

export { importGAAClubs };