import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇬🇧 Importing Warwickshire GAA clubs...');

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

    // Get Warwickshire region
    const warwickshireRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'WAR'
    ` as any[];

    if (!warwickshireRegion.length) {
      return NextResponse.json({ error: 'Warwickshire region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const warwickshireRegionId = warwickshireRegion[0].id;

    // Clear existing Warwickshire clubs
    console.log('🗑️ Clearing existing Warwickshire clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${warwickshireRegionId}
    `;

    // Warwickshire GAA clubs from WarwickshireGAA.com / Wikipedia
    const warwickshireClubs = [
      'Roger Casements (Coventry)',
      'John Mitchels (Birmingham)',
      'St Brendan\'s (Birmingham)',
      'Sean McDermotts (Birmingham)',
      'Erin go Bragh (Birmingham)',
      'St Finbarr\'s (Coventry)',
      'St Mary\'s (Coventry)',
      'Warwickshire Cúchulainns',
      'Warwickshire Gaels'
    ];

    const results = [];

    for (const clubName of warwickshireClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${warwickshireRegionId},
            'Warwickshire, UK', 'WAR', 'WARWICKSHIRE_GAA_MULTI',
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

    // Count total Warwickshire clubs
    const warwickshireClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${warwickshireRegionId}
    ` as any[];

    const totalWarwickshireClubs = warwickshireClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Warwickshire GAA clubs imported successfully',
      source: 'WarwickshireGAA.com / Wikipedia',
      totalImported: warwickshireClubs.length,
      totalWarwickshireClubs: parseInt(totalWarwickshireClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Warwickshire clubs:', error);
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