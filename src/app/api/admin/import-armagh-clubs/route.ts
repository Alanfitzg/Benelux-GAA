import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Armagh GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Armagh clubs
    console.log('🗑️  Clearing existing Armagh clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'ARM'
    `;

    // Official Armagh GAA clubs from ArmaghGAA.ie / Wikipedia
    const armaghClubs = [
      'Annaghmore Pearses',
      'Armagh Harps',
      'Ballyhegan Davitts',
      'Belleeks St Laurence O\'Tooles',
      'Clady Mitchells',
      'Clan na Gael',
      'Clann Eireann',
      'Clonmore Robert Emmets',
      'Collegeland O\'Rahilly\'s',
      'Crossmaglen Rangers',
      'Culloville Blues',
      'Derrynoose St Mochua\'s',
      'Dorsey Emmetts',
      'Forkhill',
      'Granemore',
      'Grange St Colmcille\'s',
      'Keady Michael Dwyer\'s',
      'Killeavy St Moninna\'s',
      'Lissummon',
      'Madden Raparees',
      'Madden St Josephs',
      'Maghery Sean MacDermott\'s',
      'Mullaghbawn Cúchullain\'s',
      'Pearse Óg Armagh',
      'Port Mor',
      'Poyntzpass',
      'Shane O\'Neill\'s',
      'Silverbridge Harps',
      'St Malachy\'s (Armagh)',
      'St Michael\'s (Newtownhamilton)',
      'St Patrick\'s (Cullyhanna)',
      'St Paul\'s (Lurgan)',
      'St Peter\'s (Lurgan)',
      'Tir na nÓg (Portadown)',
      'Whitecross'
    ];

    const results = [];

    for (const clubName of armaghClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Armagh, Ireland', 'ARM', 'ARMAGH_GAA_MULTI',
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

    // Count total Armagh clubs
    const armaghClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'ARM'
    ` as any[];

    const totalArmaghClubs = armaghClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Armagh GAA clubs imported successfully',
      source: 'ArmaghGAA.ie / Wikipedia',
      totalImported: armaghClubs.length,
      totalArmaghClubs: parseInt(totalArmaghClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Armagh clubs:', error);
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