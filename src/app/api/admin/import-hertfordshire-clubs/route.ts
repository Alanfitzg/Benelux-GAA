import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇬🇧 Importing Hertfordshire GAA clubs...');

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

    // Get Hertfordshire region
    const hertfordshireRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'HER'
    ` as any[];

    if (!hertfordshireRegion.length) {
      return NextResponse.json({ error: 'Hertfordshire region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const hertfordshireRegionId = hertfordshireRegion[0].id;

    // Clear existing Hertfordshire clubs
    console.log('🗑️ Clearing existing Hertfordshire clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${hertfordshireRegionId}
    `;

    // Hertfordshire GAA clubs from HertfordshireGAA.com / Wikipedia
    const hertfordshireClubs = [
      'St Colmcille\'s (St Albans)',
      'St Dympna\'s (Luton)',
      'St Joseph\'s (Waltham Cross)',
      'St Vincent\'s (Luton)',
      'Cambridge Parnells',
      'Oxford University GAA',
      'Hertfordshire Gaels'
    ];

    const results = [];

    for (const clubName of hertfordshireClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${hertfordshireRegionId},
            'Hertfordshire, UK', 'HER', 'HERTFORDSHIRE_GAA_MULTI',
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

    // Count total Hertfordshire clubs
    const hertfordshireClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${hertfordshireRegionId}
    ` as any[];

    const totalHertfordshireClubs = hertfordshireClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Hertfordshire GAA clubs imported successfully',
      source: 'HertfordshireGAA.com / Wikipedia',
      totalImported: hertfordshireClubs.length,
      totalHertfordshireClubs: parseInt(totalHertfordshireClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Hertfordshire clubs:', error);
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