#!/usr/bin/env npx tsx
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { ClubStatus } from '@prisma/client';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Types
interface ExistingClub {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  countryId?: string | null;
  region?: string | null;
  subRegion?: string | null;
}

// CSV Row Interface
interface CSVRow {
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

// Statistics tracking
const stats = {
  totalRows: 0,
  processed: 0,
  created: 0,
  skipped: 0,
  updated: 0,
  errors: 0,
  duplicates: [] as { csv: string; existing: string; csvRow: CSVRow; matchReason: string }[],
};

// Normalize club name for matching
function normalizeClubName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\bgaa\b/gi, '')
    .replace(/\bgfc\b/gi, '')
    .replace(/\bhc\b/gi, '')
    .replace(/\bclg\b/gi, '')
    .replace(/\blgfa\b/gi, '')
    .replace(/\bcamogie\b/gi, '')
    .replace(/\bhurling\b/gi, '')
    .replace(/\bfootball\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate distance between two coordinates (in kilometers)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Check for duplicate club
async function findDuplicateClub(row: CSVRow, existingClubs: ExistingClub[]): Promise<{ club: ExistingClub; reason: string } | null> {
  const normalizedName = normalizeClubName(row.Club);
  const lat = parseFloat(row.Latitude);
  const lon = parseFloat(row.Longitude);

  for (const club of existingClubs) {
    const existingNormalized = normalizeClubName(club.name);

    // Level 1: Exact name match
    if (club.name.toLowerCase() === row.Club.toLowerCase()) {
      return { club, reason: 'Exact name match' };
    }

    // Level 2: Normalized name match in same location
    if (existingNormalized === normalizedName) {
      // Check if same county/division
      if (row.County && club.location?.toLowerCase().includes(row.County.toLowerCase())) {
        return { club, reason: 'Normalized name + same county' };
      }
      if (row.Division && club.location?.toLowerCase().includes(row.Division.toLowerCase())) {
        return { club, reason: 'Normalized name + same division' };
      }
    }

    // Level 3: Coordinate match (within 0.5km)
    if (!isNaN(lat) && !isNaN(lon) && club.latitude && club.longitude) {
      const distance = calculateDistance(lat, lon, club.latitude, club.longitude);
      if (distance < 0.5) {
        // Very close coordinates, check if name is similar
        if (existingNormalized.includes(normalizedName) || normalizedName.includes(existingNormalized)) {
          return { club, reason: `Coordinates match (${distance.toFixed(2)}km)` };
        }
      }
    }

    // Level 4: Fuzzy match - similar name in same country
    if (row.Country && club.location?.toLowerCase().includes(row.Country.toLowerCase())) {
      const similarity = calculateSimilarity(normalizedName, existingNormalized);
      if (similarity > 0.8) {
        return { club, reason: `Fuzzy match (${(similarity * 100).toFixed(0)}% similar)` };
      }
    }
  }

  return null;
}

// Calculate string similarity (0-1)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance algorithm
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Map File column to InternationalUnit
async function getOrCreateInternationalUnit(file: string): Promise<string> {
  // Map CSV File values to InternationalUnit codes
  const mappings: { [key: string]: { code: string; name: string } } = {
    'Ireland': { code: 'IRE', name: 'Ireland' },
    'Great Britain': { code: 'GB', name: 'Britain' },
    'Europe': { code: 'EUR', name: 'Europe' },
    'USA': { code: 'USA', name: 'North America' },
    'Canada': { code: 'CAN', name: 'North America' },
    'Australasia': { code: 'AUS', name: 'Australasia' },
    'Asia': { code: 'ASIA', name: 'Asia' },
    'Middle East': { code: 'ME', name: 'Middle East' },
    'South America': { code: 'SA', name: 'South America' },
  };

  const mapping = mappings[file];
  if (!mapping) {
    console.log(`${colors.yellow}Warning: Unknown international unit "${file}", using as-is${colors.reset}`);
    return file;
  }

  // Check if InternationalUnit exists
  let unit = await prisma.internationalUnit.findUnique({
    where: { code: mapping.code },
  });

  if (!unit) {
    // Create if doesn't exist
    unit = await prisma.internationalUnit.create({
      data: {
        code: mapping.code,
        name: mapping.name,
        displayOrder: Object.keys(mappings).indexOf(file),
      },
    });
    console.log(`${colors.green}Created InternationalUnit: ${mapping.name}${colors.reset}`);
  }

  return unit.id;
}

// Map Country to database
async function getOrCreateCountry(countryName: string, internationalUnitId: string): Promise<string | null> {
  if (!countryName || countryName === 'Ireland') {
    return null; // Ireland clubs don't need country reference as it's implicit
  }

  // Generate a code from country name
  const code = countryName.substring(0, 3).toUpperCase();

  let country = await prisma.country.findFirst({
    where: {
      name: countryName,
      internationalUnitId: internationalUnitId,
    },
  });

  if (!country) {
    // Check if we need a unique code
    const existingCode = await prisma.country.findUnique({
      where: { code },
    });

    const uniqueCode = existingCode ? `${code}${Date.now().toString().slice(-3)}` : code;

    country = await prisma.country.create({
      data: {
        code: uniqueCode,
        name: countryName,
        internationalUnitId,
        hasRegions: false,
        displayOrder: 0,
      },
    });
    console.log(`${colors.green}Created Country: ${countryName}${colors.reset}`);
  }

  return country.id;
}

// Build location string
function buildLocation(row: CSVRow): string {
  const parts = [];

  if (row.Division && row.Division !== row.County) {
    parts.push(row.Division);
  }
  if (row.County) {
    parts.push(row.County);
  }
  if (row.Province && !['Ireland', 'Ulster', 'Munster', 'Leinster', 'Connacht'].includes(row.Province)) {
    parts.push(row.Province);
  }
  if (row.Country && row.Country !== 'Ireland') {
    parts.push(row.Country);
  }

  // For Irish clubs, add Ireland if not already present
  if (row.File === 'Ireland' && !parts.includes('Ireland')) {
    parts.push('Ireland');
  }

  return parts.join(', ');
}

// Main import function
async function importClubs(dryRun: boolean = false): Promise<void> {
  const csvPath = path.join(process.cwd(), 'docs', 'Allgaaclubs.csv');
  const duplicatesPath = path.join(process.cwd(), 'docs', 'duplicates-report.csv');

  console.log(`${colors.cyan}${colors.bright}=== GAA Clubs Import Script ===${colors.reset}`);
  console.log(`${colors.blue}Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}${colors.reset}`);
  console.log(`${colors.blue}CSV File: ${csvPath}${colors.reset}\n`);

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`${colors.red}Error: CSV file not found at ${csvPath}${colors.reset}`);
    process.exit(1);
  }

  // Read and parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];

  stats.totalRows = rows.length;
  console.log(`${colors.green}Found ${stats.totalRows} clubs in CSV${colors.reset}\n`);

  // Fetch all existing clubs for duplicate detection
  console.log(`${colors.blue}Loading existing clubs from database...${colors.reset}`);
  const existingClubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      latitude: true,
      longitude: true,
      region: true,
      subRegion: true,
    },
  });
  console.log(`${colors.green}Found ${existingClubs.length} existing clubs${colors.reset}\n`);

  // Process each row
  console.log(`${colors.cyan}Processing clubs...${colors.reset}`);

  for (const [index, row] of rows.entries()) {
    stats.processed++;

    // Skip header row if accidentally included
    if (row.Club === 'Club' || !row.Club) {
      stats.skipped++;
      continue;
    }

    try {
      // Check for duplicates
      const duplicateResult = await findDuplicateClub(row, existingClubs);

      if (duplicateResult) {
        stats.duplicates.push({
          csv: `${row.Club} (${row.County || row.Division || row.Country})`,
          existing: `${duplicateResult.club.name} (${duplicateResult.club.location || 'No location'})`,
          csvRow: row,
          matchReason: duplicateResult.reason,
        });
        stats.skipped++;

        if (stats.duplicates.length <= 10) {
          console.log(`${colors.yellow}[${index + 1}/${stats.totalRows}] Duplicate found: ${row.Club} matches "${duplicateResult.club.name}" (${duplicateResult.reason})${colors.reset}`);
        }
        continue;
      }

      // Prepare club data
      const internationalUnitId = await getOrCreateInternationalUnit(row.File);
      const countryId = row.Country ? await getOrCreateCountry(row.Country, internationalUnitId) : null;
      const location = buildLocation(row);

      const clubData = {
        name: row.Club,
        internationalUnitId,
        countryId,
        region: row.Province || row.File,
        subRegion: row.County || row.Division || null,
        location,
        latitude: row.Latitude ? parseFloat(row.Latitude) : null,
        longitude: row.Longitude ? parseFloat(row.Longitude) : null,
        website: row.Twitter || null,
        imageUrl: row.crest_url || null,
        codes: row.Code || null,
        status: 'APPROVED' as ClubStatus,
        dataSource: 'BULK_IMPORT_2024',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!dryRun) {
        // Create the club
        await prisma.club.create({
          data: clubData,
        });
        stats.created++;

        if (stats.created % 50 === 0) {
          console.log(`${colors.green}[${index + 1}/${stats.totalRows}] Created ${stats.created} clubs so far...${colors.reset}`);
        }
      } else {
        stats.created++;
        if (stats.created <= 5) {
          console.log(`${colors.cyan}[DRY RUN] Would create: ${row.Club} in ${location}${colors.reset}`);
        }
      }

    } catch (error) {
      stats.errors++;
      console.error(`${colors.red}[${index + 1}/${stats.totalRows}] Error processing ${row.Club}: ${error}${colors.reset}`);
    }
  }

  // Print summary
  console.log(`\n${colors.cyan}${colors.bright}=== Import Summary ===${colors.reset}`);
  console.log(`${colors.blue}Total rows processed: ${stats.processed}${colors.reset}`);
  console.log(`${colors.green}Clubs to be created: ${stats.created}${colors.reset}`);
  console.log(`${colors.yellow}Duplicates skipped: ${stats.skipped}${colors.reset}`);
  console.log(`${colors.red}Errors: ${stats.errors}${colors.reset}`);

  if (stats.duplicates.length > 0) {
    console.log(`\n${colors.yellow}${colors.bright}=== Duplicate Details (first 10) ===${colors.reset}`);
    stats.duplicates.slice(0, 10).forEach(dup => {
      console.log(`${colors.yellow}CSV: ${dup.csv} → Existing: ${dup.existing}${colors.reset}`);
    });
    if (stats.duplicates.length > 10) {
      console.log(`${colors.yellow}... and ${stats.duplicates.length - 10} more duplicates${colors.reset}`);
    }

    // Write duplicates to CSV file with more details
    const duplicatesCsv = [
      'CSV_Club_Name,CSV_Location,CSV_Latitude,CSV_Longitude,Existing_Club_Name,Existing_Location,Match_Reason',
      ...stats.duplicates.map(dup => {
        const csvParts = dup.csv.match(/^(.*?) \((.*?)\)$/);
        const existingParts = dup.existing.match(/^(.*?) \((.*?)\)$/);
        const csvName = csvParts ? csvParts[1] : dup.csv;
        const csvLocation = csvParts ? csvParts[2] : '';
        const existingName = existingParts ? existingParts[1] : dup.existing;
        const existingLocation = existingParts ? existingParts[2] : '';
        return `"${csvName}","${csvLocation}","${dup.csvRow.Latitude}","${dup.csvRow.Longitude}","${existingName}","${existingLocation}","${dup.matchReason}"`;
      })
    ].join('\n');

    fs.writeFileSync(duplicatesPath, duplicatesCsv);
    console.log(`\n${colors.blue}Duplicates report saved to: ${duplicatesPath}${colors.reset}`);
  }

  if (dryRun) {
    console.log(`\n${colors.cyan}${colors.bright}This was a DRY RUN - no changes were made${colors.reset}`);
    console.log(`${colors.blue}Run with --import flag to perform actual import${colors.reset}`);
  } else {
    console.log(`\n${colors.green}${colors.bright}Import completed successfully!${colors.reset}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--import');

  try {
    await importClubs(dryRun);
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Fatal error: ${error}${colors.reset}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(console.error);