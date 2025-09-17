import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Westmeath GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Westmeath clubs
    console.log('🗑️  Clearing existing Westmeath clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'WES'
    `;

    // Official Westmeath GAA clubs from WestmeathGAA.ie / Wikipedia
    const westmeathClubs = [
      'Athlone',
      'Ballinagore',
      'Ballycomoyle',
      'Ballymore',
      'Ballynacargy',
      'Brownstown',
      'Bunbrosna',
      'Castledaly',
      'Castlepollard',
      'Castletown Finea Coole Whitehall',
      'Castletown Geoghegan',
      'Caulry',
      'Clonkill',
      'Coralstown-Kinnegad',
      'Crookedwood',
      'Cullion',
      'Delvin',
      'Fr Daltons',
      'Garrycastle',
      'Kilbeggan Shamrocks',
      'Killucan',
      'Lough Lene Gaels',
      'Loughnavalley',
      'Maryland',
      'Milltown',
      'Milltownpass',
      'Moate All Whites',
      'Mullingar Shamrocks',
      'Multyfarnham',
      'Raharney',
      'Ringtown',
      'Rosemount',
      'Shandonagh',
      'Southern Gaels',
      'St Joseph\'s',
      'St Loman\'s Mullingar',
      'St Malachy\'s',
      'St Mary\'s Rochfortbridge',
      'St Paul\'s',
      'St Brigid\'s',
      'St Oliver Plunkett\'s',
      'Tang',
      'The Downs',
      'Tubberclair',
      'Turin',
      'Tyrrellspass'
    ];

    const results = [];

    for (const clubName of westmeathClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Westmeath, Ireland', 'WES', 'WESTMEATH_GAA_MULTI',
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

    // Count total Westmeath clubs
    const westmeathClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'WES'
    ` as any[];

    const totalWestmeathClubs = westmeathClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Westmeath GAA clubs imported successfully',
      source: 'WestmeathGAA.ie / Wikipedia',
      totalImported: westmeathClubs.length,
      totalWestmeathClubs: parseInt(totalWestmeathClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Westmeath clubs:', error);
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