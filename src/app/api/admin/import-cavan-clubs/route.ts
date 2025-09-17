import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Cavan GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Cavan clubs
    console.log('🗑️  Clearing existing Cavan clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'CAV'
    `;

    // Official Cavan GAA clubs from CavanGAA.ie / Wikipedia
    const cavanClubs = [
      'Arva',
      'Ballinagh',
      'Ballintemple',
      'Ballyhaise',
      'Ballymachugh',
      'Belturbet Rory O\'Moores',
      'Butlersbridge',
      'Castlerahan',
      'Cavan Gaels',
      'Cootehill Celtic',
      'Corlough',
      'Cornafean',
      'Crosserlough',
      'Cuchulainns',
      'Cuchulainns (Killinkere)',
      'Denn',
      'Drung',
      'Drumlane',
      'Drumalee',
      'Drumgoon',
      'Gowna',
      'Kildallan',
      'Killeshandra Leaguers',
      'Kingscourt Stars',
      'Knockbride',
      'Lacken Celtic',
      'Laragh United',
      'Lavey',
      'Lurgan',
      'Maghera MacFinns',
      'Mountnugent',
      'Mullahoran',
      'Munterconnaught',
      'Ramor United',
      'Redhills',
      'Shannon Gaels',
      'Shercock',
      'Swanlinbar',
      'Templeport St Aidans'
    ];

    const results = [];

    for (const clubName of cavanClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Cavan, Ireland', 'CAV', 'CAVAN_GAA_MULTI',
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

    // Count total Cavan clubs
    const cavanClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'CAV'
    ` as any[];

    const totalCavanClubs = cavanClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Cavan GAA clubs imported successfully',
      source: 'CavanGAA.ie / Wikipedia',
      totalImported: cavanClubs.length,
      totalCavanClubs: parseInt(totalCavanClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Cavan clubs:', error);
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