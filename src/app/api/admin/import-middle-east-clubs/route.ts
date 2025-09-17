import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🏜️ Importing Middle East GAA clubs...');

    // Get Middle East international unit
    const middleEastUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'MIDDLE_EAST'
    ` as any[];

    if (!middleEastUnit.length) {
      return NextResponse.json({ error: 'Middle East international unit not found' }, { status: 400 });
    }

    const middleEastUnitId = middleEastUnit[0].id;

    // Define countries and their clubs
    const countryData = {
      'United Arab Emirates': { code: 'AE', displayOrder: 1 },
      'Oman': { code: 'OM', displayOrder: 2 },
      'Bahrain': { code: 'BH', displayOrder: 3 },
      'Qatar': { code: 'QA', displayOrder: 4 },
      'Saudi Arabia': { code: 'SA', displayOrder: 5 },
      'Kuwait': { code: 'KW', displayOrder: 6 },
      'Lebanon': { code: 'LB', displayOrder: 7 },
      'Jordan': { code: 'JO', displayOrder: 8 }
    };

    // Club data organized by country
    const clubsByCountry = {
      'United Arab Emirates': ['Dubai Celts', 'Abu Dhabi Na Fianna', 'Al Ain The Greens', 'Sharjah Gaels', 'Arabian Celts'],
      'Oman': ['Muscat Gaels'],
      'Bahrain': ['Arabian Celts Bahrain'],
      'Qatar': ['Qatar GAA'],
      'Saudi Arabia': ['Riyadh Gaels'],
      'Kuwait': ['Kuwait Harps'],
      'Lebanon': ['Beirut Gaels'],
      'Jordan': ['Amman GAA']
    };

    // Create or get countries
    const countryMap: any = {};

    for (const [countryName, countryInfo] of Object.entries(countryData)) {
      // Check if country already exists
      let country = await prisma.$queryRaw`
        SELECT id FROM "Country" 
        WHERE "internationalUnitId" = ${middleEastUnitId} AND code = ${countryInfo.code}
      ` as any[];

      if (!country.length) {
        await prisma.$executeRaw`
          INSERT INTO "Country" (
            id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${countryInfo.code}, ${countryName}, false, ${middleEastUnitId}, 
            ${countryInfo.displayOrder}, NOW(), NOW()
          )
        `;
        
        country = await prisma.$queryRaw`
          SELECT id FROM "Country" 
          WHERE "internationalUnitId" = ${middleEastUnitId} AND code = ${countryInfo.code}
        ` as any[];
      }

      countryMap[countryName] = country[0].id;
    }

    // Clear existing clubs from all Middle East countries
    console.log('🗑️ Clearing existing Middle East clubs...');
    for (const countryId of Object.values(countryMap)) {
      await prisma.$executeRaw`
        DELETE FROM "Club" WHERE "countryId" = ${countryId}
      `;
    }

    // Import all clubs
    const results: any[] = [];
    const countryStats: any = {};

    for (const [countryName, clubs] of Object.entries(clubsByCountry)) {
      const countryId = countryMap[countryName];
      countryStats[countryName] = { count: 0 };

      for (const clubName of clubs) {
        try {
          await prisma.$executeRaw`
            INSERT INTO "Club" (
              id, name, "countryId", location, codes, "dataSource", 
              status, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${clubName}, ${countryId},
              ${countryName}, ${countryData[countryName as keyof typeof countryData].code}, 
              'MIDDLE_EAST_GAA_OFFICIAL_LISTS',
              'APPROVED', NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            club: clubName, 
            country: countryName
          });

          countryStats[countryName].count++;
          console.log(`✅ Imported: ${clubName} (${countryName})`);
        } catch (error) {
          results.push({ 
            success: false, 
            club: clubName, 
            country: countryName,
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          console.error(`❌ Error with ${clubName}:`, error);
        }
      }
    }

    const totalClubs = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: 'Middle East GAA clubs imported successfully',
      source: 'Middle East GAA official lists',
      totalClubs,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      countryBreakdown: Object.entries(countryStats).map(([country, data]: [string, any]) => ({
        country,
        clubCount: data.count
      })).sort((a, b) => a.country.localeCompare(b.country)),
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error importing Middle East clubs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}