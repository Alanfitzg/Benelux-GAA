import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇬🇧 Importing London GAA clubs...');

    // Get Britain international unit and country
    const britainUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'BRITAIN'
    ` as any[];

    if (!britainUnit.length) {
      return NextResponse.json({ error: 'Britain international unit not found' }, { status: 400 });
    }

    const britainCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${britainUnit[0].id} AND code = 'BRITAIN'
    ` as any[];

    if (!britainCountry.length) {
      return NextResponse.json({ error: 'Britain country not found' }, { status: 400 });
    }

    // Get London region
    const londonRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'LON'
    ` as any[];

    if (!londonRegion.length) {
      return NextResponse.json({ error: 'London region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const londonRegionId = londonRegion[0].id;

    // Clear existing London clubs
    console.log('🗑️ Clearing existing London clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${londonRegionId}
    `;

    // London GAA clubs from LondonGAA.org / Wikipedia
    const londonClubs = [
      'Brothers Pearse',
      'Cu Chulainns',
      'Dulwich Harps',
      'Eire Og',
      'Fulham Irish',
      'Garngoch',
      'Harlesden Harps',
      'Heston Gaels',
      'Holloway Gaels (Ladies)',
      'Kingdom Kerry Gaels',
      'Knockanaire',
      'North London Shamrocks',
      'Parnells',
      'Round Towers',
      'St Anthony\'s',
      'St Brendans',
      'St Clarets',
      'St Gabriel\'s',
      'St Joseph\'s',
      'St Kiernan\'s',
      'St Mary\'s',
      'St Theresa\'s',
      'Taras',
      'Thomas McCurtains',
      'Tir Chonaill Gaels',
      'Treacys'
    ];

    const results = [];

    for (const clubName of londonClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${londonRegionId},
            'London, UK', 'LON', 'LONDON_GAA_MULTI',
            'APPROVED', NOW(), NOW()
          )
        `;
        
        results.push({ success: true, club: clubName });
        console.log(`✅ Imported: ${clubName}`);
      } catch (error) {
        results.push({ 
          success: false, 
          club: clubName, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${clubName}:`, error);
      }
    }

    // Count total London clubs
    const londonClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${londonRegionId}
    ` as any[];

    const totalLondonClubs = londonClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'London GAA clubs imported successfully',
      source: 'LondonGAA.org / Wikipedia',
      totalImported: londonClubs.length,
      totalLondonClubs: parseInt(totalLondonClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing London clubs:', error);
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