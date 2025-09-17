import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Galway GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Galway clubs
    console.log('🗑️  Clearing existing Galway clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'GAL'
    `;

    // Official Galway GAA clubs from GalwayGAA.ie / Wikipedia
    const galwayClubs = [
      'Abbeyknockmoy',
      'Ahascragh-Fohenagh',
      'An Cheathrú Rua',
      'Annaghdown',
      'Ardrahan',
      'Ballinderreen',
      'Ballinasloe',
      'Ballinrobe',
      'Barna',
      'Bearna-Na Forbacha',
      'Bullaun',
      'Caherlistrane',
      'Caltra',
      'Carnmore',
      'Carraroe',
      'Castlegar',
      'Clarinbridge',
      'Clifden',
      'Cortoon Shamrocks',
      'Corofin',
      'Craughwell',
      'Dunmore MacHales',
      'Glenamaddy',
      'Gort',
      'Headford',
      'Killannin',
      'Killererin',
      'Kilnadeema-Leitrim',
      'Kilconieron',
      'Kinvara',
      'Kiltormer',
      'Lackagh',
      'Liam Mellows',
      'Loughrea',
      'Menlough',
      'Mervue',
      'Moycullen',
      'Mountbellew-Moylough',
      'Mullagh',
      'Oranmore-Maree',
      'Padraig Pearses (Roscommon border)',
      'Portumna',
      'Salthill-Knocknacarra',
      'St Brendan\'s',
      'St James\'',
      'St Mary\'s Athenry',
      'Sylane',
      'Turloughmore',
      'Tuam Stars',
      'Williamstown'
    ];

    const results = [];

    for (const clubName of galwayClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Galway, Ireland', 'GAL', 'GALWAY_GAA_MULTI',
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

    // Count total Galway clubs
    const galwayClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'GAL'
    ` as any[];

    const totalGalwayClubs = galwayClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Galway GAA clubs imported successfully',
      source: 'GalwayGAA.ie / Wikipedia',
      totalImported: galwayClubs.length,
      totalGalwayClubs: parseInt(totalGalwayClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Galway clubs:', error);
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