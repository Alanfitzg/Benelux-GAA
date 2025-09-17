import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇬🇧 Importing Lancashire GAA clubs...');

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

    // Get Lancashire region
    const lancashireRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE "countryId" = ${britainCountry[0].id} AND code = 'LAN'
    ` as any[];

    if (!lancashireRegion.length) {
      return NextResponse.json({ error: 'Lancashire region not found' }, { status: 400 });
    }

    const britainCountryId = britainCountry[0].id;
    const lancashireRegionId = lancashireRegion[0].id;

    // Clear existing Lancashire clubs
    console.log('🗑️ Clearing existing Lancashire clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${britainCountryId} 
      AND "regionId" = ${lancashireRegionId}
    `;

    // Lancashire GAA clubs from LancashireGAA.com / Wikipedia
    // Note: Roger Casements (Coventry) moved to Warwickshire region
    const lancashireClubs = [
      'Fullen Gaels (Manchester)',
      'Oisin CLG (Manchester)',
      'St Brendan\'s (Manchester)',
      'St Lawrence\'s (Manchester)',
      'St Mary\'s (Manchester)',
      'St Peter\'s (Manchester)',
      'St Jude\'s (Wigan)',
      'John Mitchels (Liverpool)',
      'Liverpool Wolfe Tones',
      'St Patrick\'s (Liverpool)',
      'St Mary\'s (Liverpool)',
      'St Peter\'s (Liverpool)',
      'Cu Chulainns (Liverpool)',
      'St Anthony\'s (Liverpool)',
      'St Finbarr\'s (Liverpool)'
    ];

    const results = [];

    for (const clubName of lancashireClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${britainCountryId}, ${lancashireRegionId},
            'Lancashire, UK', 'LAN', 'LANCASHIRE_GAA_MULTI',
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

    // Count total Lancashire clubs
    const lancashireClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${britainCountryId} AND "regionId" = ${lancashireRegionId}
    ` as any[];

    const totalLancashireClubs = lancashireClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Lancashire GAA clubs imported successfully',
      source: 'LancashireGAA.com / Wikipedia',
      totalImported: lancashireClubs.length,
      totalLancashireClubs: parseInt(totalLancashireClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Lancashire clubs:', error);
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