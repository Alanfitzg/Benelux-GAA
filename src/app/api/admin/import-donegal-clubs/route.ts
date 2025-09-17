import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Donegal GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Donegal clubs
    console.log('🗑️  Clearing existing Donegal clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'DON'
    `;

    // Official Donegal GAA clubs from DonegalGAA.ie / Wikipedia
    const donegalClubs = [
      'Aodh Ruadh Ballyshannon',
      'Ardara',
      'Buncrana',
      'Bundoran Realt na Mara',
      'Burt',
      'Carndonagh',
      'Cloughaneely',
      'Convoy St Mary\'s',
      'Downings',
      'Dungloe',
      'Fanad Gaels',
      'Four Masters',
      'Gaoth Dobhair',
      'Glenfin',
      'Glenswilly',
      'Kilcar',
      'Killybegs',
      'Letterkenny Gaels',
      'MacCumhaills (Seán MacCumhaill\'s)',
      'Malin',
      'Milford',
      'Moville',
      'Naomh Brid',
      'Naomh Colmcille',
      'Naomh Conaill',
      'Naomh Muire',
      'Naomh Padraig Muff',
      'Naomh Padraig Lifford',
      'Naomh Ultan',
      'Na Rossa',
      'N Conaill (Glenties)',
      'Red Hughs',
      'Robert Emmets',
      'Setanta',
      'St Eunan\'s (Letterkenny)',
      'St Michael\'s',
      'St Naul\'s',
      'Termon',
      'Urris'
    ];

    const results = [];

    for (const clubName of donegalClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Donegal, Ireland', 'DON', 'DONEGAL_GAA_MULTI',
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

    // Count total Donegal clubs
    const donegalClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'DON'
    ` as any[];

    const totalDonegalClubs = donegalClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Donegal GAA clubs imported successfully',
      source: 'DonegalGAA.ie / Wikipedia',
      totalImported: donegalClubs.length,
      totalDonegalClubs: parseInt(totalDonegalClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Donegal clubs:', error);
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