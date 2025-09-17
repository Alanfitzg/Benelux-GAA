import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Kildare GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Kildare clubs
    console.log('🗑️  Clearing existing Kildare clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'KIL'
    `;

    // Official Kildare GAA clubs from KildareGAA.ie / Wikipedia
    const kildareClubs = [
      'Athy',
      'Balyna',
      'Ballykelly',
      'Ballymore Eustace',
      'Ballyteague',
      'Caragh',
      'Carbury',
      'Castledermot',
      'Celbridge',
      'Clane',
      'Confey',
      'Coill Dubh',
      'Crokestown',
      'Eadestown',
      'Ellistown',
      'Grangenolvin',
      'Johnstownbridge',
      'Kilcock',
      'Kilcullen',
      'Kilmeade',
      'Kildangan',
      'Kill',
      'Leixlip',
      'Milltown',
      'Monasterevin',
      'Moorefield',
      'Maynooth',
      'Naas',
      'Nurney',
      'Raheens',
      'Rathangan',
      'Round Towers (Kildare Town)',
      'Sallins',
      'Sarsfields (Newbridge)',
      'St Kevin\'s',
      'St Laurence\'s',
      'St Patrick\'s',
      'Straffan',
      'Two Mile House'
    ];

    const results = [];

    for (const clubName of kildareClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Kildare, Ireland', 'KIL', 'KILDARE_GAA_MULTI',
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

    // Count total Kildare clubs
    const kildareClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'KIL'
    ` as any[];

    const totalKildareClubs = kildareClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Kildare GAA clubs imported successfully',
      source: 'KildareGAA.ie / Wikipedia',
      totalImported: kildareClubs.length,
      totalKildareClubs: parseInt(totalKildareClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Kildare clubs:', error);
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