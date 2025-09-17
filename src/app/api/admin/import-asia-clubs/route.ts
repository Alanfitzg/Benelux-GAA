import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌏 Importing Asia GAA clubs...');

    // Get Asia international unit
    const asiaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'ASIA'
    ` as any[];

    if (!asiaUnit.length) {
      return NextResponse.json({ error: 'Asia international unit not found' }, { status: 400 });
    }

    const asiaUnitId = asiaUnit[0].id;

    // Define countries and their clubs
    const countryData = {
      'Hong Kong': { code: 'HK', displayOrder: 1 },
      'China': { code: 'CN', displayOrder: 2 },
      'Singapore': { code: 'SG', displayOrder: 3 },
      'Japan': { code: 'JP', displayOrder: 4 },
      'South Korea': { code: 'KR', displayOrder: 5 },
      'Malaysia': { code: 'MY', displayOrder: 6 },
      'Thailand': { code: 'TH', displayOrder: 7 },
      'Vietnam': { code: 'VN', displayOrder: 8 },
      'Indonesia': { code: 'ID', displayOrder: 9 },
      'Cambodia': { code: 'KH', displayOrder: 10 },
      'India': { code: 'IN', displayOrder: 11 },
      'Pakistan': { code: 'PK', displayOrder: 12 }
    };

    // Club data organized by country
    const clubsByCountry = {
      'Hong Kong': ['Hong Kong GAA'],
      'China': ['Beijing GAA', 'Shanghai GAA', 'Shenzhen Celts', 'Suzhou Éire Óg', 'Guangzhou GAA'],
      'Singapore': ['Singapore Gaelic Lions'],
      'Japan': ['Japan GAA', 'Tokyo Gaels', 'Osaka Celts'],
      'South Korea': ['Seoul Gaels'],
      'Malaysia': ['Kuala Lumpur GAA', 'Penang Pumas'],
      'Thailand': ['Bangkok GAA', 'Phuket Celts'],
      'Vietnam': ['Saigon Gaels', 'Hanoi Gaels'],
      'Indonesia': ['Jakarta Dragons'],
      'Cambodia': ['Phnom Penh Gaels'],
      'India': ['Mumbai GAA'],
      'Pakistan': ['Lahore GAA']
    };

    // Create or get countries
    const countryMap: any = {};

    for (const [countryName, countryInfo] of Object.entries(countryData)) {
      // Check if country already exists
      let country = await prisma.$queryRaw`
        SELECT id FROM "Country" 
        WHERE "internationalUnitId" = ${asiaUnitId} AND code = ${countryInfo.code}
      ` as any[];

      if (!country.length) {
        await prisma.$executeRaw`
          INSERT INTO "Country" (
            id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${countryInfo.code}, ${countryName}, false, ${asiaUnitId}, 
            ${countryInfo.displayOrder}, NOW(), NOW()
          )
        `;
        
        country = await prisma.$queryRaw`
          SELECT id FROM "Country" 
          WHERE "internationalUnitId" = ${asiaUnitId} AND code = ${countryInfo.code}
        ` as any[];
      }

      countryMap[countryName] = country[0].id;
    }

    // Clear existing clubs from all Asia countries
    console.log('🗑️ Clearing existing Asia clubs...');
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
              'ASIAN_COUNTY_BOARD_AGG_CLUB_LISTS',
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
      message: 'Asia GAA clubs imported successfully',
      source: 'Asian County Board / AGG club lists',
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
    console.error('❌ Error importing Asia clubs:', error);
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