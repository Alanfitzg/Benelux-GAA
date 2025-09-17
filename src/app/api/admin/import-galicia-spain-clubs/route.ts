import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇪🇸 Importing Galicia - Spain GAA clubs...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    // Get Galicia - Spain country
    const galiciaCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${europeUnit[0].id} AND code = 'ES-GA'
    ` as any[];

    if (!galiciaCountry.length) {
      return NextResponse.json({ error: 'Galicia - Spain country not found' }, { status: 400 });
    }

    const galiciaCountryId = galiciaCountry[0].id;

    // Clear existing Galicia - Spain clubs
    console.log('🗑️ Clearing existing Galicia - Spain clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${galiciaCountryId}
    `;

    // Galicia - Spain GAA clubs from user screenshots (updated)
    const galiciaClubs = [
      'A Coruña Fillos de Breogán',
      'Cambados Gaelico',
      'Irmandinhos A Estrada F. G.',
      'Keltoi Vigo G.A.C.',
      'Lavandeiras de San Simón',
      'Lorchos GAA',
      'LX Celtiberos',
      'Turonia GFG',
      'Lugh GAA',
      'Gróvias GAA',
      'Lume de Beltane'
    ];

    const results = [];

    for (const clubName of galiciaClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${galiciaCountryId},
            'Galicia, Spain', 'ES-GA', 'GALICIA_SPAIN_GAA_USER_SCREENSHOTS',
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

    // Count total Galicia - Spain clubs
    const galiciaClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${galiciaCountryId}
    ` as any[];

    const totalGaliciaClubs = galiciaClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Galicia - Spain GAA clubs imported successfully',
      source: 'User screenshots',
      totalImported: galiciaClubs.length,
      totalGaliciaClubs: parseInt(totalGaliciaClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Galicia - Spain clubs:', error);
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