import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Limerick GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Limerick clubs
    console.log('🗑️  Clearing existing Limerick clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'LIM'
    `;

    // Official Limerick GAA clubs from LimerickGAA.ie / Wikipedia
    const limerickClubs = [
      'Adare',
      'Ahane',
      'Askeaton',
      'Athea',
      'Ballybrown',
      'Ballysteen',
      'Ballybricken-Bohermore',
      'Blackrock (Limerick)',
      'Bruree',
      'Caherline',
      'Cappamore',
      'Castletown-Ballyagran',
      'Claughaun',
      'Claughaun Gaels',
      'Crecora-Manister',
      'Croagh-Kilfinny',
      'Dromcollogher-Broadford',
      'Doon',
      'Effin',
      'Fedamore',
      'Fr Caseys',
      'Galtee Gaels',
      'Garryspillane',
      'Glin',
      'Granagh-Ballingarry',
      'Hospital-Herbertstown',
      'Kildimo-Pallaskenry',
      'Killeedy',
      'Kilfinane',
      'Knockainey',
      'Knockaderry',
      'Mungret St Pauls',
      'Monaleen',
      'Mungret',
      'Murroe-Boher',
      'Na Piarsaigh (Limerick)',
      'Newcastle West',
      'Old Christians',
      'Oola',
      'Pallasgreen',
      'Patrickswell',
      'Pallas',
      'Rathkeale',
      'South Liberties',
      'St Kierans',
      'St Patricks (Limerick)',
      'St Senans (Foynes)',
      'Tournafulla'
    ];

    const results = [];

    for (const clubName of limerickClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Limerick, Ireland', 'LIM', 'LIMERICK_GAA_MULTI',
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

    // Count total Limerick clubs
    const limerickClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'LIM'
    ` as any[];

    const totalLimerickClubs = limerickClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Limerick GAA clubs imported successfully',
      source: 'LimerickGAA.ie / Wikipedia',
      totalImported: limerickClubs.length,
      totalLimerickClubs: parseInt(totalLimerickClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Limerick clubs:', error);
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