import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Derry GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Derry clubs
    console.log('🗑️  Clearing existing Derry clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'DER'
    `;

    // Official Derry GAA clubs from DerryGAA.ie / Wikipedia
    const derryClubs = [
      'Ballinderry Shamrocks',
      'Ballinascreen',
      'Ballymaguigan',
      'Banagher',
      'Bellaghy Wolfe Tones',
      'Brocagh Emmetts',
      'Claudy St Colm\'s',
      'Craigbane',
      'Desertmartin',
      'Doire Trasna',
      'Drumsurn',
      'Dungiven (St Canice\'s)',
      'Foreglen',
      'Faughanvale',
      'Glen (Maghera)',
      'Greenlough',
      'Kilrea',
      'Lavey',
      'Limavady Wolfhounds',
      'Loup',
      'Magherafelt O\'Donovan Rossa',
      'Newbridge',
      'Ogra Colmcille',
      'Slaughtmanus',
      'Slaughtneil',
      'Steelstown Brian Óg\'s',
      'Swatragh',
      'Watty Graham\'s GAC (Glen)'
    ];

    const results = [];

    for (const clubName of derryClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Derry, Ireland', 'DER', 'DERRY_GAA_MULTI',
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

    // Count total Derry clubs
    const derryClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'DER'
    ` as any[];

    const totalDerryClubs = derryClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Derry GAA clubs imported successfully',
      source: 'DerryGAA.ie / Wikipedia',
      totalImported: derryClubs.length,
      totalDerryClubs: parseInt(totalDerryClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Derry clubs:', error);
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