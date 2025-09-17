import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇩🇪 Importing Germany GAA clubs...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    // Get Germany country
    const germanyCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${europeUnit[0].id} AND code = 'DE'
    ` as any[];

    if (!germanyCountry.length) {
      return NextResponse.json({ error: 'Germany country not found' }, { status: 400 });
    }

    const germanyCountryId = germanyCountry[0].id;

    // Clear existing Germany clubs
    console.log('🗑️ Clearing existing Germany clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${germanyCountryId}
    `;

    // Germany GAA clubs from user screenshots
    const germanyClubs = [
      'Aachen GAA',
      'Berlin',
      'Cologne Celtics',
      'Darmstadt',
      'Dresden Hurling',
      'Düsseldorf GFC',
      'Eintracht Frankfurt GAA',
      'Hamburg GAA',
      'München Colmcilles GAA Club',
      'Setanta Berlin',
      'Stuttgart GAA',
      'Augsburg'
    ];

    const results = [];

    for (const clubName of germanyClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${germanyCountryId},
            'Germany', 'DE', 'GERMANY_GAA_USER_SCREENSHOTS',
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

    // Count total Germany clubs
    const germanyClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${germanyCountryId}
    ` as any[];

    const totalGermanyClubs = germanyClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Germany GAA clubs imported successfully',
      source: 'User screenshots',
      totalImported: germanyClubs.length,
      totalGermanyClubs: parseInt(totalGermanyClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Germany clubs:', error);
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