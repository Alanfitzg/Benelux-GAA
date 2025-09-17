import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇫🇷 Importing France GAA clubs...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    // Get France country
    const franceCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${europeUnit[0].id} AND code = 'FR'
    ` as any[];

    if (!franceCountry.length) {
      return NextResponse.json({ error: 'France country not found' }, { status: 400 });
    }

    const franceCountryId = franceCountry[0].id;

    // Clear existing France clubs
    console.log('🗑️ Clearing existing France clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${franceCountryId}
    `;

    // France GAA clubs from user screenshots
    const franceClubs = [
      'Agen',
      'Anjou Gaels',
      'Azur Gaels',
      'Bordeaux Gaelic Football Club',
      'Cherbourg Gaels',
      'Clermont Gaelic Football Club',
      'Football gaélique Le Havre',
      'Football Gaélique Mondeville',
      'Grenoble Alpes Gaels',
      'Le Mans',
      'Lille',
      'Lugdunum CLG (Lyon)',
      'Montpellier',
      'Niort Gaels',
      'Paris Gaels',
      'Pas en Artois GAC',
      'Pau Bearn Sports Gaeliques',
      'Poitiers Gaels',
      'Strasbourg Gaels'
    ];

    const results = [];

    for (const clubName of franceClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${franceCountryId},
            'France', 'FR', 'FRANCE_GAA_USER_SCREENSHOTS',
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

    // Count total France clubs
    const franceClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${franceCountryId}
    ` as any[];

    const totalFranceClubs = franceClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'France GAA clubs imported successfully',
      source: 'User screenshots',
      totalImported: franceClubs.length,
      totalFranceClubs: parseInt(totalFranceClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing France clubs:', error);
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