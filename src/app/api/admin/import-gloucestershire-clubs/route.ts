import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇬🇧 Importing Gloucestershire GAA clubs...');

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

    // Get Gloucestershire region
    const gloucestershireRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'GLO'
    ` as any[];

    if (!gloucestershireRegion.length) {
      return NextResponse.json({ error: 'Gloucestershire region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const gloucestershireRegionId = gloucestershireRegion[0].id;

    // Clear existing Gloucestershire clubs
    console.log('🗑️ Clearing existing Gloucestershire clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${gloucestershireRegionId}
    `;

    // Gloucestershire GAA clubs from GloucestershireGAA.org / Wikipedia
    const gloucestershireClubs = [
      'St Nicholas',
      'St Jude\'s',
      'St Colmcille\'s Cardiff',
      'Western Gaels',
      'Cheltenham Gaels',
      'Gloucester Gaels',
      'Swansea Gaels',
      'Plymouth Parnells',
      'Somerset Gaels',
      'Bristol St Nick\'s'
    ];

    const results = [];

    for (const clubName of gloucestershireClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${gloucestershireRegionId},
            'Gloucestershire, UK', 'GLO', 'GLOUCESTERSHIRE_GAA_MULTI',
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

    // Count total Gloucestershire clubs
    const gloucestershireClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${gloucestershireRegionId}
    ` as any[];

    const totalGloucestershireClubs = gloucestershireClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Gloucestershire GAA clubs imported successfully',
      source: 'GloucestershireGAA.org / Wikipedia',
      totalImported: gloucestershireClubs.length,
      totalGloucestershireClubs: parseInt(totalGloucestershireClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Gloucestershire clubs:', error);
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