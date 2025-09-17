import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Wexford GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Wexford clubs
    console.log('🗑️  Clearing existing Wexford clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'WEX'
    `;

    // Official Wexford GAA clubs from WexfordGAA.ie / Wikipedia
    const wexfordClubs = [
      'Adamstown',
      'Ballygarrett Réalt na Mara',
      'Bannow–Ballymitty',
      'Blackwater (St Brigid\'s)',
      'Buffers Alley',
      'Castletown Liam Mellows',
      'Clongeen',
      'Cloughbawn',
      'Craanford',
      'Crossabeg–Ballymurn',
      'Davidstown–Courtnacuddy',
      'Duffry Rovers',
      'Faythe Harriers',
      'Ferns St Aidan\'s',
      'Fethard St Mogue\'s',
      'Glynn–Barntown',
      'Gusserane O\'Rahilly\'s',
      'Geraldine O\'Hanrahans',
      'Horeswood',
      'HWH Bunclody',
      'Kilanerin–Ballyfad',
      'Kilmore',
      'Kilrush–Askamore',
      'Marshalstown–Castledockrell',
      'Monageer–Boolavogue',
      'Naomh Éanna (Gorey)',
      'Oulart–The Ballagh',
      'Oylegate–Glenbrien',
      'Rathgarogue–Cushinstown',
      'Rathnure St Anne\'s',
      'Rapparees (Enniscorthy)',
      'St Anne\'s Rathangan',
      'St James\' (Ramsgrange)',
      'St John\'s Volunteers',
      'St Martin\'s (Piercestown)',
      'St Mary\'s (Rosslare)',
      'St Fintan\'s (Mayglass)',
      'Shelmaliers (Castlebridge)',
      'Taghmon–Camross'
    ];

    const results = [];

    for (const clubName of wexfordClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Wexford, Ireland', 'WEX', 'WEXFORD_GAA_MULTI',
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

    // Count total Wexford clubs
    const wexfordClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'WEX'
    ` as any[];

    const totalWexfordClubs = wexfordClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Wexford GAA clubs imported successfully',
      source: 'WexfordGAA.ie / Wikipedia',
      totalImported: wexfordClubs.length,
      totalWexfordClubs: parseInt(totalWexfordClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Wexford clubs:', error);
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