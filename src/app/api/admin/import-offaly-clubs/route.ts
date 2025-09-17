import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Offaly GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Offaly clubs
    console.log('🗑️  Clearing existing Offaly clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'OFF'
    `;

    // Official Offaly GAA clubs from OffalyGAA.ie / Wikipedia
    const offalyClubs = [
      'Ballinamere',
      'Ballinamere-Durrow',
      'Ballycumber',
      'Belmont',
      'Birr',
      'Bracknagh',
      'Brosna Gaels',
      'Clara',
      'Clodiagh Gaels',
      'Coolderry',
      'Doon',
      'Drumcullen',
      'Durrow',
      'Edenderry',
      'Erin Rovers',
      'Ferbane',
      'Gracefield',
      'Killeigh',
      'Kilcormac-Killoughey',
      'Kinnitty',
      'Lusmagh',
      'Rhode',
      'Seir Kieran',
      'Shamrocks',
      'Shannonbridge',
      'Shinrone',
      'St Brigids (Croghan)',
      'St Rynaghs',
      'Tullamore',
      'Tubber',
      'Walsh Island'
    ];

    const results = [];

    for (const clubName of offalyClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Offaly, Ireland', 'OFF', 'OFFALY_GAA_MULTI',
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

    // Count total Offaly clubs
    const offalyClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'OFF'
    ` as any[];

    const totalOffalyClubs = offalyClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Offaly GAA clubs imported successfully',
      source: 'OffalyGAA.ie / Wikipedia',
      totalImported: offalyClubs.length,
      totalOffalyClubs: parseInt(totalOffalyClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Offaly clubs:', error);
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