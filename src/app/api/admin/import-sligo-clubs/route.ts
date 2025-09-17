import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Sligo GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Sligo clubs
    console.log('🗑️  Clearing existing Sligo clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'SLI'
    `;

    // Official Sligo GAA clubs from SligoGAA.ie / Wikipedia
    const sligoClubs = [
      'Achonry',
      'Ballymote',
      'Bunninadden',
      'Calry/St Joseph\'s',
      'Castleconnor',
      'Cloonacool',
      'Coolaney/Mullinabreena',
      'Drumcliffe/Rosses Point',
      'Easkey',
      'Eastern Harps',
      'Enniscrone/Kilglass',
      'Geevagh',
      'Maugherow',
      'Owenmore Gaels',
      'Shamrock Gaels',
      'St Farnan\'s',
      'St John\'s',
      'St Mary\'s',
      'St Michael\'s',
      'St Molaise Gaels',
      'Tourlestrane'
    ];

    const results = [];

    for (const clubName of sligoClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Sligo, Ireland', 'SLI', 'SLIGO_GAA_MULTI',
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

    // Count total Sligo clubs
    const sligoClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'SLI'
    ` as any[];

    const totalSligoClubs = sligoClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Sligo GAA clubs imported successfully',
      source: 'SligoGAA.ie / Wikipedia',
      totalImported: sligoClubs.length,
      totalSligoClubs: parseInt(totalSligoClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Sligo clubs:', error);
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