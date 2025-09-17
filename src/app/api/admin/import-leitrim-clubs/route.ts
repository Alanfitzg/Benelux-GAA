import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Leitrim GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Leitrim clubs
    console.log('🗑️  Clearing existing Leitrim clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'LEI'
    `;

    // Official Leitrim GAA clubs from LeitrimGAA.ie / Wikipedia
    const leitrimClubs = [
      'Allen Gaels',
      'Annaduff',
      'Aughavas',
      'Aughnasheelin',
      'Ballinaglera',
      'Ballinamore Sean O\'Heslins',
      'Bornacoola',
      'Carrigallen',
      'Cloone',
      'Drumkeerin',
      'Drumreilly',
      'Dromahair',
      'Eslin',
      'Fenagh St Caillin\'s',
      'Glenfarne Kiltyclogher',
      'Gortletteragh',
      'Kiltubrid',
      'Leitrim Gaels',
      'Melvin Gaels',
      'Mohill',
      'St Mary\'s Kiltoghert',
      'St Osnat\'s Glencar-Manorhamilton'
    ];

    const results = [];

    for (const clubName of leitrimClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Leitrim, Ireland', 'LEI', 'LEITRIM_GAA_MULTI',
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

    // Count total Leitrim clubs
    const leitrimClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'LEI'
    ` as any[];

    const totalLeitrimClubs = leitrimClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Leitrim GAA clubs imported successfully',
      source: 'LeitrimGAA.ie / Wikipedia',
      totalImported: leitrimClubs.length,
      totalLeitrimClubs: parseInt(totalLeitrimClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Leitrim clubs:', error);
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