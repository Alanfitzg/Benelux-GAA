import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Importing Yorkshire GAA clubs...');

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

    // Get Yorkshire region
    const yorkshireRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'YOR'
    ` as any[];

    if (!yorkshireRegion.length) {
      return NextResponse.json({ error: 'Yorkshire region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const yorkshireRegionId = yorkshireRegion[0].id;

    // Clear existing Yorkshire clubs
    console.log('🗑️ Clearing existing Yorkshire clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${yorkshireRegionId}
    `;

    // Yorkshire GAA clubs from YorkshireGAA.org / Wikipedia
    const yorkshireClubs = [
      'Brothers Pearse (Huddersfield)',
      'Cu Chulainns (Newcastle)',
      'Hugh O\'Neills (Leeds)',
      'St Benedict\'s Harps (Leeds)',
      'St Brendan\'s (Leeds)',
      'St Patrick\'s (Leeds)',
      'York Éire Óg',
      'Yorkshire Emeralds (Sheffield)'
    ];

    const results = [];

    for (const clubName of yorkshireClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${yorkshireRegionId},
            'Yorkshire, UK', 'YOR', 'YORKSHIRE_GAA_MULTI',
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

    // Count total Yorkshire clubs
    const yorkshireClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${yorkshireRegionId}
    ` as any[];

    const totalYorkshireClubs = yorkshireClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Yorkshire GAA clubs imported successfully',
      source: 'YorkshireGAA.org / Wikipedia',
      totalImported: yorkshireClubs.length,
      totalYorkshireClubs: parseInt(totalYorkshireClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Yorkshire clubs:', error);
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