import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Tyrone GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Tyrone clubs
    console.log('🗑️  Clearing existing Tyrone clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'TYR'
    `;

    // Official Tyrone GAA clubs from TyroneGAA.ie / Wikipedia
    const tyroneClubs = [
      'Aghaloo O\'Neills',
      'Aghyaran St Davog\'s',
      'Ardboe O\'Donovan Rossa',
      'Augher St Macartan\'s',
      'Beragh Red Knights',
      'Brackaville Owen Roes',
      'Brocagh Emmetts',
      'Carrickmore St Colmcille\'s',
      'Clann na nGael',
      'Clogher Eire Óg',
      'Clonoe O\'Rahilly\'s',
      'Coalisland Na Fianna',
      'Cookstown Fr Rock\'s',
      'Derrylaughan Kevin Barrys',
      'Derrytresk Fir an Chnoic',
      'Donaghmore St Patrick\'s',
      'Drumquin Wolfe Tones',
      'Dungannon Thomas Clarkes',
      'Edendork St Malachy\'s',
      'Eglish St Patrick\'s',
      'Errigal Ciaran',
      'Eskra Emmetts',
      'Fintona Pearses',
      'Galbally Pearses',
      'Glenelly St Joseph\'s',
      'Gortin St Patrick\'s',
      'Greencastle St Patrick\'s',
      'Kildress Wolfe Tones',
      'Killeeshil St Mary\'s',
      'Killyclogher St Mary\'s',
      'Loughmacrory St Teresa\'s',
      'Moortown St Malachy\'s',
      'Moy Tír na nÓg',
      'Naomh Colmcille (Carrickmore)',
      'Omagh St Enda\'s',
      'Pomeroy Plunkett\'s',
      'Rock St Patrick\'s',
      'Stewartstown Harps',
      'Strabane Sigersons',
      'Tattyreagh St Patrick\'s',
      'Trillick St Macartan\'s',
      'Urney St Columba\'s'
    ];

    const results = [];

    for (const clubName of tyroneClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Tyrone, Ireland', 'TYR', 'TYRONE_GAA_MULTI',
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

    // Count total Tyrone clubs
    const tyroneClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'TYR'
    ` as any[];

    const totalTyroneClubs = tyroneClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Tyrone GAA clubs imported successfully',
      source: 'TyroneGAA.ie / Wikipedia',
      totalImported: tyroneClubs.length,
      totalTyroneClubs: parseInt(totalTyroneClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Tyrone clubs:', error);
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