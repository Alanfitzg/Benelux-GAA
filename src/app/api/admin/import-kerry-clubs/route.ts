import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Kerry GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Kerry clubs
    console.log('🗑️  Clearing existing Kerry clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'KER'
    `;

    // Official Kerry GAA clubs from KerryGAA.ie / Wikipedia
    const kerryClubs = [
      'Annascaul',
      'An Ghaeltacht',
      'Ardfert',
      'Asdee',
      'Austin Stacks',
      'Ballydonoghue',
      'Ballyduff',
      'Ballylongford',
      'Beale',
      'Beaufort',
      'Brosna',
      'Castlegregory',
      'Churchill',
      'Cordal',
      'Currow',
      'Dingle',
      'Dr Crokes',
      'Duagh',
      'Finuge',
      'Firies',
      'Fossa',
      'Glenbeigh-Glencar',
      'Glenflesk',
      'John Mitchels',
      'Kerins O\'Rahillys',
      'Keel',
      'Kilcummin',
      'Kilgarvan',
      'Killarney Legion',
      'Knocknagoshel',
      'Lispole',
      'Listowel Emmets',
      'Listry',
      'Moyvane',
      'Na Gaeil',
      'Piarsaigh na Dromoda',
      'Renard',
      'Scartaglin',
      'Skellig Rangers',
      'Spa',
      'St Mary\'s Cahersiveen',
      'St Michael\'s Foilmore',
      'St Pat\'s Blennerville',
      'St Senan\'s',
      'Tarbert',
      'Templenoe',
      'Tousist',
      'Waterville'
    ];

    const results = [];

    for (const clubName of kerryClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Kerry, Ireland', 'KER', 'KERRY_GAA_MULTI',
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

    // Count total Kerry clubs
    const kerryClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'KER'
    ` as any[];

    const totalKerryClubs = kerryClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Kerry GAA clubs imported successfully',
      source: 'KerryGAA.ie / Wikipedia',
      totalImported: kerryClubs.length,
      totalKerryClubs: parseInt(totalKerryClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Kerry clubs:', error);
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