import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇫🇷 Importing Brittany - France GAA clubs...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    // Get Brittany - France country
    const brittanyCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${europeUnit[0].id} AND code = 'FR-BR'
    ` as any[];

    if (!brittanyCountry.length) {
      return NextResponse.json({ error: 'Brittany - France country not found' }, { status: 400 });
    }

    const brittanyCountryId = brittanyCountry[0].id;

    // Clear existing Brittany - France clubs
    console.log('🗑️ Clearing existing Brittany - France clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${brittanyCountryId}
    `;

    // Brittany - France GAA clubs from user screenshots
    const brittanyClubs = [
      'Bro Sant Brieg',
      'FG Rostrenen',
      'Football Gaélique Pays de Redon',
      'Gaelic Football Bro Leon',
      'Gaelic Football Club Rennes - Ar Gwazi Gouez',
      'Gwen Rann (Guerande)',
      'Kerne',
      'Lorient GAC',
      'Nantes Football Gaélique',
      'Saint Coulomb GAA',
      'Stade Plouërais Football Gaélique',
      'US Liffre GAA - Entente Gaélique de Haute Bretagne',
      'Vannes'
    ];

    const results = [];

    for (const clubName of brittanyClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${brittanyCountryId},
            'Brittany, France', 'FR-BR', 'BRITTANY_FRANCE_GAA_USER_SCREENSHOTS',
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

    // Count total Brittany - France clubs
    const brittanyClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${brittanyCountryId}
    ` as any[];

    const totalBrittanyClubs = brittanyClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Brittany - France GAA clubs imported successfully',
      source: 'User screenshots',
      totalImported: brittanyClubs.length,
      totalBrittanyClubs: parseInt(totalBrittanyClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Brittany - France clubs:', error);
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