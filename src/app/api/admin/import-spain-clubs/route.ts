import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇪🇸 Importing Spain GAA clubs...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    // Get Spain country
    const spainCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${europeUnit[0].id} AND code = 'ES'
    ` as any[];

    if (!spainCountry.length) {
      return NextResponse.json({ error: 'Spain country not found' }, { status: 400 });
    }

    const spainCountryId = spainCountry[0].id;

    // Clear existing Spain clubs
    console.log('🗑️ Clearing existing Spain clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${spainCountryId}
    `;

    // Spain GAA clubs from user screenshots
    const spainClubs = [
      'Barcelona Gaels GAA Club',
      'Bilbao GAA',
      'Celta Malaga',
      'Éire Óg Sevilla',
      'Madrid Harps',
      'Madrid Harps Youth',
      'Mar Menor GAA',
      'Sitges',
      'Tolosa Gaels',
      'Valencia Sant Vicent',
      'Zaragoza GAA'
    ];

    const results = [];

    for (const clubName of spainClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${spainCountryId},
            'Spain', 'ES', 'SPAIN_GAA_USER_SCREENSHOTS',
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

    // Count total Spain clubs
    const spainClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${spainCountryId}
    ` as any[];

    const totalSpainClubs = spainClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Spain GAA clubs imported successfully',
      source: 'User screenshots',
      totalImported: spainClubs.length,
      totalSpainClubs: parseInt(totalSpainClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Spain clubs:', error);
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