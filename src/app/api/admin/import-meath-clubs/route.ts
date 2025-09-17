import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Meath GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Meath clubs
    console.log('🗑️  Clearing existing Meath clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'MEA'
    `;

    // Official Meath GAA clubs from MeathGAA.ie / Wikipedia
    const meathClubs = [
      'Ashbourne (Donaghmore/Ashbourne)',
      'Ballinabrackey',
      'Ballinlough',
      'Ballinacree',
      'Ballivor',
      'Bective',
      'Boardsmill',
      'Carnaross',
      'Castletown',
      'Clann na nGael (Meath)',
      'Clonard',
      'Cortown',
      'Curraha',
      'Dunderry',
      'Dunboyne',
      'Duleek/Bellewstown',
      'Drumbaragh',
      'Drumconrath',
      'Dunsany',
      'Dunshaughlin',
      'Gaeil Colmcille (Kells)',
      'Kilbride (Meath)',
      'Kildalkey',
      'Kilmessan',
      'Kilmainham',
      'Kilmainhamwood',
      'Longwood',
      'Moylagh',
      'Moynalty',
      'Moynalvey',
      'Navan O\'Mahoneys',
      'Nobber',
      'Oldcastle',
      'Rathkenny',
      'Ratoath',
      'Seneschalstown',
      'Simonstown Gaels',
      'Skryne',
      'Slane',
      'St Brigids (Ballinacree)',
      'St Colmcilles (East Meath)',
      'St Marys (Donore)',
      'St Michaels',
      'St Patricks (Stamullen)',
      'St Pauls (Clonee)',
      'Summerhill',
      'Syddan',
      'Trim',
      'Walterstown',
      'Wolfe Tones'
    ];

    const results = [];

    for (const clubName of meathClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Meath, Ireland', 'MEA', 'MEATH_GAA_MULTI',
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

    // Count total Meath clubs
    const meathClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'MEA'
    ` as any[];

    const totalMeathClubs = meathClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Meath GAA clubs imported successfully',
      source: 'MeathGAA.ie / Wikipedia',
      totalImported: meathClubs.length,
      totalMeathClubs: parseInt(totalMeathClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Meath clubs:', error);
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