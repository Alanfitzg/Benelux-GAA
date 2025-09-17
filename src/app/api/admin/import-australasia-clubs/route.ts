import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇦🇺🇳🇿 Importing Australasia GAA clubs...');

    // Get Australasia international unit
    const australasiaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'AUSTRALASIA'
    ` as any[];

    if (!australasiaUnit.length) {
      return NextResponse.json({ error: 'Australasia international unit not found' }, { status: 400 });
    }

    const australasiaUnitId = australasiaUnit[0].id;

    // Define countries and their divisions
    const countryData = {
      'Australia': {
        code: 'AU',
        divisions: [
          { code: 'SYDNEY', name: 'Sydney', displayOrder: 1 },
          { code: 'MELBOURNE', name: 'Melbourne', displayOrder: 2 },
          { code: 'QUEENSLAND', name: 'Queensland', displayOrder: 3 },
          { code: 'PERTH', name: 'Perth', displayOrder: 4 },
          { code: 'ADELAIDE', name: 'Adelaide', displayOrder: 5 }
        ]
      },
      'New Zealand': {
        code: 'NZ',
        divisions: [
          { code: 'AUCKLAND', name: 'Auckland', displayOrder: 1 },
          { code: 'WELLINGTON', name: 'Wellington', displayOrder: 2 },
          { code: 'CHRISTCHURCH', name: 'Christchurch', displayOrder: 3 },
          { code: 'DUNEDIN', name: 'Dunedin', displayOrder: 4 },
          { code: 'HAMILTON', name: 'Hamilton', displayOrder: 5 }
        ]
      }
    };

    // Club data organized by division
    const clubsByDivision = {
      'Sydney': [
        'Central Coast GAA', 'Cormac McAnallens', 'Clan na Gael Sydney', 'Michael Cusack\'s Sydney',
        'Penrith Gaels', 'Young Ireland Sydney', 'Sydney Shamrocks'
      ],
      'Melbourne': [
        'Garryowen', 'Wolfe Tones Melbourne', 'Padraig Pearse Melbourne', 'Shamrocks Melbourne',
        'Sinn Féin Melbourne', 'St. Kevin\'s Melbourne'
      ],
      'Queensland': [
        'East Celts', 'John Mitchel\'s Brisbane', 'Souths GAA', 'Harps GAA', 'Gold Coast Gaels'
      ],
      'Perth': [
        'St. Finbarr\'s Perth', 'Greenwood GAA', 'Morley Gaels', 'St. Pat\'s Perth', 'Southern Districts'
      ],
      'Adelaide': [
        'Young Ireland Adelaide', 'Éire Óg Adelaide', 'Na Fianna Adelaide'
      ],
      'Auckland': [
        'Auckland GAA', 'Celtic Rugby & GAA Club', 'Marist Rangers', 'Eastern Harps'
      ],
      'Wellington': [
        'Wellington/Hutt Valley Gaels', 'St. Pat\'s Wellington'
      ],
      'Christchurch': ['Christchurch McKennas'],
      'Dunedin': ['Dunedin Celts'],
      'Hamilton': ['Hamilton GAA']
    };

    // Create or get countries and regions
    const countryMap: any = {};
    const regionMap: any = {};

    for (const [countryName, countryInfo] of Object.entries(countryData)) {
      // Create or get country
      let country = await prisma.$queryRaw`
        SELECT id FROM "Country" 
        WHERE "internationalUnitId" = ${australasiaUnitId} AND code = ${countryInfo.code}
      ` as any[];

      if (!country.length) {
        await prisma.$executeRaw`
          INSERT INTO "Country" (
            id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${countryInfo.code}, ${countryName}, true, ${australasiaUnitId}, 
            ${countryName === 'Australia' ? 1 : 2}, NOW(), NOW()
          )
        `;
        
        country = await prisma.$queryRaw`
          SELECT id FROM "Country" 
          WHERE "internationalUnitId" = ${australasiaUnitId} AND code = ${countryInfo.code}
        ` as any[];
      }

      countryMap[countryName] = country[0].id;

      // Clear existing regions for this country
      await prisma.$executeRaw`
        DELETE FROM "Region" WHERE "countryId" = ${country[0].id}
      `;

      // Create regions for this country
      for (const division of countryInfo.divisions) {
        await prisma.$executeRaw`
          INSERT INTO "Region" (
            id, code, name, "countryId", "displayOrder", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${division.code}, ${division.name}, ${country[0].id}, 
            ${division.displayOrder}, NOW(), NOW()
          )
        `;

        const region = await prisma.$queryRaw`
          SELECT id FROM "Region" 
          WHERE "countryId" = ${country[0].id} AND code = ${division.code}
        ` as any[];

        regionMap[division.name] = region[0].id;
      }
    }

    // Clear existing clubs from all Australasia countries
    console.log('🗑️ Clearing existing Australasia clubs...');
    for (const countryId of Object.values(countryMap)) {
      await prisma.$executeRaw`
        DELETE FROM "Club" WHERE "countryId" = ${countryId}
      `;
    }

    // Import all clubs
    const results: any[] = [];
    const divisionStats: any = {};

    for (const [divisionName, clubs] of Object.entries(clubsByDivision)) {
      const regionId = regionMap[divisionName];
      const countryName = divisionName === 'Sydney' || divisionName === 'Melbourne' || 
                           divisionName === 'Queensland' || divisionName === 'Perth' || 
                           divisionName === 'Adelaide' ? 'Australia' : 'New Zealand';
      const countryId = countryMap[countryName];

      divisionStats[divisionName] = { country: countryName, count: 0 };

      for (const clubName of clubs) {
        try {
          await prisma.$executeRaw`
            INSERT INTO "Club" (
              id, name, "countryId", "regionId", location, codes, "dataSource", 
              status, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${clubName}, ${countryId}, ${regionId},
              ${divisionName + ', ' + countryName}, 
              ${countryName === 'Australia' ? 'AU' : 'NZ'} || '-' || UPPER(REPLACE(${divisionName}, ' ', '_')), 
              'AUSTRALASIAN_GAA_OFFICIAL_CLUB_LISTS',
              'APPROVED', NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            club: clubName, 
            division: divisionName,
            country: countryName
          });

          divisionStats[divisionName].count++;
          console.log(`✅ Imported: ${clubName} (${divisionName}, ${countryName})`);
        } catch (error) {
          results.push({ 
            success: false, 
            club: clubName, 
            division: divisionName,
            country: countryName,
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          console.error(`❌ Error with ${clubName}:`, error);
        }
      }
    }

    const totalClubs = results.filter(r => r.success).length;
    const australiaClubs = results.filter(r => r.success && r.country === 'Australia').length;
    const newZealandClubs = results.filter(r => r.success && r.country === 'New Zealand').length;

    return NextResponse.json({
      success: true,
      message: 'Australasia GAA clubs imported successfully',
      source: 'Australasian GAA official & club lists',
      totalClubs,
      australiaClubs,
      newZealandClubs,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      divisionBreakdown: Object.entries(divisionStats).map(([division, data]: [string, any]) => ({
        division,
        country: data.country,
        clubCount: data.count
      })).sort((a, b) => a.country.localeCompare(b.country) || a.division.localeCompare(b.division)),
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error importing Australasia clubs:', error);
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