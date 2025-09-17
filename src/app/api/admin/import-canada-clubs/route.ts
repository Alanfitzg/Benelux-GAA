import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇨🇦 Importing Canada GAA clubs...');

    // Get Canada international unit
    const canadaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'CANADA'
    ` as any[];

    if (!canadaUnit.length) {
      return NextResponse.json({ error: 'Canada international unit not found' }, { status: 400 });
    }

    const canadaUnitId = canadaUnit[0].id;

    // Define divisions for Canada
    const divisions = [
      { code: 'TORONTO', name: 'Toronto', displayOrder: 1 },
      { code: 'WESTERN_CANADA', name: 'Western Canada', displayOrder: 2 },
      { code: 'EASTERN_CANADA', name: 'Eastern Canada', displayOrder: 3 }
    ];

    // Create or get Canada country
    let canadaCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" 
      WHERE "internationalUnitId" = ${canadaUnitId} AND code = 'CAN'
    ` as any[];

    if (!canadaCountry.length) {
      await prisma.$executeRaw`
        INSERT INTO "Country" (
          id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), 'CAN', 'Canada', true, ${canadaUnitId}, 1, NOW(), NOW()
        )
      `;
      
      canadaCountry = await prisma.$queryRaw`
        SELECT id FROM "Country" 
        WHERE "internationalUnitId" = ${canadaUnitId} AND code = 'CAN'
      ` as any[];
    }

    const canadaCountryId = canadaCountry[0].id;

    // Clear existing regions for Canada
    await prisma.$executeRaw`
      DELETE FROM "Region" WHERE "countryId" = ${canadaCountryId}
    `;

    // Create regions (divisions) for Canada
    const regionMap: any = {};
    for (const division of divisions) {
      await prisma.$executeRaw`
        INSERT INTO "Region" (
          id, code, name, "countryId", "displayOrder", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), ${division.code}, ${division.name}, ${canadaCountryId}, 
          ${division.displayOrder}, NOW(), NOW()
        )
      `;

      const region = await prisma.$queryRaw`
        SELECT id FROM "Region" 
        WHERE "countryId" = ${canadaCountryId} AND code = ${division.code}
      ` as any[];

      regionMap[division.name] = region[0].id;
    }

    // Clear existing clubs from Canada
    console.log('🗑️ Clearing existing Canada clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${canadaCountryId}
    `;

    // Club data organized by division
    const clubsByDivision = {
      'Toronto': [
        'Toronto GAA', 'St. Michael\'s Toronto', 'Durham Robert Emmets', 'Clann na Gael Toronto',
        'St. Pat\'s Toronto', 'St. Vincent\'s Toronto', 'Toronto Camogie Club', 'Toronto Chieftains Hurling'
      ],
      'Western Canada': [
        'Vancouver Harps', 'Vancouver ISSC', 'Fraser Valley Gaels', 'Edmonton Wolfe Tones',
        'Calgary Chieftains', 'Red Deer Éire Óg', 'Regina Gaels', 'Winnipeg GAA'
      ],
      'Eastern Canada': [
        'Montreal Shamrocks', 'Quebec Celtic', 'Ottawa Gaels', 'Ottawa Éire Óg',
        'Halifax Gaels', 'St. John\'s Avalon Harps', 'Prince Edward Island Gaels', 'Saint John\'s GAA (New Brunswick)'
      ]
    };

    // Import all clubs
    const results: any[] = [];
    const divisionStats: any = {};

    for (const [divisionName, clubs] of Object.entries(clubsByDivision)) {
      const regionId = regionMap[divisionName];
      divisionStats[divisionName] = { count: 0 };

      for (const clubName of clubs) {
        try {
          await prisma.$executeRaw`
            INSERT INTO "Club" (
              id, name, "countryId", "regionId", location, codes, "dataSource", 
              status, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${clubName}, ${canadaCountryId}, ${regionId},
              ${divisionName + ', Canada'}, 'CAN-' || UPPER(REPLACE(${divisionName}, ' ', '_')), 
              'GAELIC_GAMES_CANADA',
              'APPROVED', NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            club: clubName, 
            division: divisionName
          });

          divisionStats[divisionName].count++;
          console.log(`✅ Imported: ${clubName} (${divisionName})`);
        } catch (error) {
          results.push({ 
            success: false, 
            club: clubName, 
            division: divisionName,
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          console.error(`❌ Error with ${clubName}:`, error);
        }
      }
    }

    const totalClubs = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: 'Canada GAA clubs imported successfully',
      source: 'Gaelic Games Canada',
      totalClubs,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      divisionBreakdown: Object.entries(divisionStats).map(([division, data]: [string, any]) => ({
        division,
        clubCount: data.count
      })).sort((a, b) => a.division.localeCompare(b.division)),
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error importing Canada clubs:', error);
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