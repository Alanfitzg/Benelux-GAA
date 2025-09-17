import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Importing Scotland GAA clubs...');

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

    // Get Scotland region
    const scotlandRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'SCO'
    ` as any[];

    if (!scotlandRegion.length) {
      return NextResponse.json({ error: 'Scotland region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const scotlandRegionId = scotlandRegion[0].id;

    // Clear existing Scotland clubs
    console.log('🗑️ Clearing existing Scotland clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${scotlandRegionId}
    `;

    // Scotland GAA clubs from ScotlandGAA.org / Wikipedia
    const scotlandClubs = [
      'Glasgow Gaels',
      'Glasgow Harps',
      'Glasgow Wolfetones',
      'Coatbridge Davitts',
      'Dalriada (Glasgow)',
      'Edinburgh Kevin\'s',
      'Dunedin Connollys (Edinburgh)',
      'Tir Conaill Harps (Glasgow)',
      'St Ninian\'s (Glasgow)',
      'St Patrick\'s (Glasgow)',
      'Ceann Creige Hurling & Camogie Club'
    ];

    const results = [];

    for (const clubName of scotlandClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${scotlandRegionId},
            'Scotland, UK', 'SCO', 'SCOTLAND_GAA_MULTI',
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

    // Count total Scotland clubs
    const scotlandClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${scotlandRegionId}
    ` as any[];

    const totalScotlandClubs = scotlandClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Scotland GAA clubs imported successfully',
      source: 'ScotlandGAA.org / Wikipedia',
      totalImported: scotlandClubs.length,
      totalScotlandClubs: parseInt(totalScotlandClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Scotland clubs:', error);
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