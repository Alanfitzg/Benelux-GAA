import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Clare GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Clare clubs
    console.log('🗑️  Clearing existing Clare clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'CLA'
    `;

    // Official Clare GAA clubs from ClareGAA.ie / Wikipedia
    const clareClubs = [
      'Ballyea',
      'Banner',
      'Bodyke',
      'Broadford',
      'Clarecastle',
      'Clondegad',
      'Clooney-Quin',
      'Coolmeen',
      'Corofin (Clare)',
      'Crusheen',
      'Doonbeg',
      'Doora-Barefield',
      'Eire Óg Ennis',
      'Feakle',
      'Inagh-Kilnamona',
      'Kilfenora',
      'Kilkee',
      'Kilkishen',
      'Kilmaley',
      'Kilnamona',
      'Kilmihil',
      'Kilmurry-Ibrickane',
      'Killanena',
      'Labasheeda',
      'Lissycasey',
      'Meelick',
      'Michael Cusacks',
      'Miltown Malbay',
      'Newmarket-on-Fergus',
      'O\'Callaghans Mills',
      'O\'Curry\'s',
      'Parteen',
      'Ruan',
      'Scariff',
      'Shannon Gaels (Clare)',
      'Sixmilebridge',
      'Smith O\'Briens',
      'St Breckans',
      'St Josephs Doora-Barefield',
      'St Josephs Miltown Malbay',
      'Tubber',
      'Whitegate',
      'Wolf Tones (Shannon)'
    ];

    const results = [];

    for (const clubName of clareClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Clare, Ireland', 'CLA', 'CLARE_GAA_MULTI',
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

    // Count total Clare clubs
    const clareClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'CLA'
    ` as any[];

    const totalClareClubs = clareClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Clare GAA clubs imported successfully',
      source: 'ClareGAA.ie / Wikipedia',
      totalImported: clareClubs.length,
      totalClareClubs: parseInt(totalClareClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Clare clubs:', error);
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