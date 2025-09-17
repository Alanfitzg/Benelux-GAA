import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Antrim GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Antrim clubs
    console.log('🗑️  Clearing existing Antrim clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'ANT'
    `;

    // Official Antrim GAA clubs from AntrimGAA.ie / Wikipedia
    const antrimClubs = [
      'All Saints',
      'Ardoyne Kickhams',
      'Ballycastle McQuillans',
      'Ballymena All Saints',
      'Ballymoney Rasharkin',
      'Ballycran',
      'Ballygalget',
      'Ballymena Sarsfields',
      'Carey Faughs',
      'Cargin',
      'Carrickmore',
      'Creggan Kickhams',
      'Cushendall Ruairí Óg',
      'Cushendun Emmets',
      'Davitts',
      'Dunloy Cúchullains',
      'Erin\'s Own (Glenravel)',
      'Glenavy St Joseph\'s',
      'Gort na Móna',
      'Kickhams Ardoyne',
      'Lámh Dhearg',
      'Loch Mór Dál gCais',
      'Moneyglass St Ergnat\'s',
      'Naomh Éanna (Glengormley)',
      'O\'Donovan Rossa (Antrim)',
      'O\'Donnells',
      'Pádraig Sáirséil (Sarsfields)',
      'Rossa',
      'St Brigid\'s (Belfast)',
      'St Gall\'s',
      'St John\'s (Belfast)',
      'St Paul\'s (Belfast)',
      'St Teresa\'s (Belfast)',
      'St Enda\'s (Glengormley)',
      'St Mary\'s (Aghagallon)',
      'St Patrick\'s (Lisburn)',
      'St Paul\'s (Ahoghill)',
      'Tir na nÓg (Randalstown)'
    ];

    const results = [];

    for (const clubName of antrimClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Antrim, Ireland', 'ANT', 'ANTRIM_GAA_MULTI',
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

    // Count total Antrim clubs
    const antrimClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'ANT'
    ` as any[];

    const totalAntrimClubs = antrimClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Antrim GAA clubs imported successfully',
      source: 'AntrimGAA.ie / Wikipedia',
      totalImported: antrimClubs.length,
      totalAntrimClubs: parseInt(totalAntrimClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Antrim clubs:', error);
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