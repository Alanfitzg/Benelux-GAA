import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Tipperary GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Tipperary clubs
    console.log('🗑️  Clearing existing Tipperary clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'TIP'
    `;

    // Official Tipperary GAA clubs from TipperaryGAA.ie / Wikipedia
    const tipperaryClubs = [
      'Arravale Rovers',
      'Ballina',
      'Ballingarry',
      'Ballinahinch',
      'Ballylooby-Castlegrace',
      'Boherlahan-Dualla',
      'Borris-Ileigh',
      'Borrisokane',
      'Burgess',
      'Cappawhite',
      'Carrick Davins',
      'Carrick Swan',
      'Carrickshock',
      'Clonakenny',
      'Clonmel Commercials',
      'Clonmel Óg',
      'Drom & Inch',
      'Éire Óg Annacarty-Donohill',
      'Éire Óg Nenagh',
      'Galtee Rovers',
      'Golden-Kilfeacle',
      'Holycross-Ballycahill',
      'JK Brackens',
      'Killenaule',
      'Kilsheelan-Kilcash',
      'Knockavilla-Donaskeigh Kickhams',
      'Lattin-Cullen',
      'Loughmore-Castleiney',
      'Moycarkey-Borris',
      'Moyne-Templetuohy',
      'Mullinahone',
      'Portroe',
      'Roscrea',
      'Seán Treacy\'s',
      'Silvermines',
      'Skeheenarinky',
      'St Mary\'s Clonmel',
      'Templederry Kenyons',
      'Thurles Sarsfields',
      'Toomevara',
      'Upperchurch-Drombane'
    ];

    const results = [];

    for (const clubName of tipperaryClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Tipperary, Ireland', 'TIP', 'TIPPERARY_GAA_MULTI',
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

    // Count total Tipperary clubs
    const tipperaryClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'TIP'
    ` as any[];

    const totalTipperaryClubs = tipperaryClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Tipperary GAA clubs imported successfully',
      source: 'TipperaryGAA.ie / Wikipedia',
      totalImported: tipperaryClubs.length,
      totalTipperaryClubs: parseInt(totalTipperaryClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Tipperary clubs:', error);
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