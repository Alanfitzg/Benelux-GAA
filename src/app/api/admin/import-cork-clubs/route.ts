import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Cork GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Cork clubs
    console.log('🗑️  Clearing existing Cork clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'COR'
    `;

    // Official Cork GAA clubs from CorkGAA.ie / Wikipedia / ClubInfo.ie
    const corkClubs = [
      'Adrigole',
      'Aghabullogue',
      'Aghada',
      'Aghinagh',
      'Araglen',
      'Argideen Rangers',
      'Avondhu',
      'Ballinacurra',
      'Ballinascarthy',
      'Ballincollig',
      'Ballinhassig',
      'Ballinora',
      'Beara',
      'Bishopstown',
      'Blarney',
      'Buttevant',
      'Clyda Rovers',
      'Carbery Rangers',
      'Carrigaline',
      'Castlehaven',
      'Clonakilty',
      'Dohenys',
      'Douglas',
      'Imokilly',
      'Midleton',
      'Nemo Rangers',
      'Newcestown',
      'O\'Donovan Rossa (Skibbereen)',
      'Russell Rovers',
      'Sarsfields',
      'St Vincent\'s (Cork)'
    ];

    const results = [];

    for (const clubName of corkClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Cork, Ireland', 'COR', 'CORK_GAA_MULTI',
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

    // Count total Cork clubs
    const corkClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'COR'
    ` as any[];

    const totalCorkClubs = corkClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Cork GAA clubs imported successfully',
      source: 'CorkGAA.ie / Wikipedia / ClubInfo.ie',
      totalImported: corkClubs.length,
      totalCorkClubs: parseInt(totalCorkClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Cork clubs:', error);
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