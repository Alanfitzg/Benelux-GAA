import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Kilkenny GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Kilkenny clubs
    console.log('🗑️  Clearing existing Kilkenny clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'KIK'
    `;

    // Official Kilkenny GAA clubs from KilkennyGAA.ie / Wikipedia
    const kilkennyClubs = [
      'Ballyhale Shamrocks',
      'Bennettsbridge',
      'Carrickshock',
      'Clara',
      'Dicksboro',
      'Erin\'s Own (Castlecomer)',
      'Fenians (Johnstown)',
      'Galmoy',
      'Glenmore',
      'Graigue-Ballycallan',
      'James Stephens',
      'John Locke\'s (Callan)',
      'Lisdowney',
      'Mullinavat',
      'O\'Loughlin Gaels',
      'Piltown',
      'Rower-Inistioge',
      'St Lachtain\'s (Freshford)',
      'St Martin\'s (Muckalee)',
      'Thomastown',
      'Tullaroan',
      'Young Irelands (Gowran)'
    ];

    const results = [];

    for (const clubName of kilkennyClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Kilkenny, Ireland', 'KIK', 'KILKENNY_GAA_MULTI',
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

    // Count total Kilkenny clubs
    const kilkennyClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'KIK'
    ` as any[];

    const totalKilkennyClubs = kilkennyClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Kilkenny GAA clubs imported successfully',
      source: 'KilkennyGAA.ie / Wikipedia',
      totalImported: kilkennyClubs.length,
      totalKilkennyClubs: parseInt(totalKilkennyClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Kilkenny clubs:', error);
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