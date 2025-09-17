import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Mayo GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Mayo clubs
    console.log('🗑️  Clearing existing Mayo clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'MAY'
    `;

    // Official Mayo GAA clubs from MayoGAA.ie / Wikipedia
    const mayoClubs = [
      'Achill',
      'Aghamore',
      'Ardagh',
      'Ardnaree Sarsfields',
      'Ballaghaderreen',
      'Ballina Stephenites',
      'Ballinrobe',
      'Ballintubber',
      'Ballycastle',
      'Ballyhaunis',
      'Ballycroy',
      'Ballyglass',
      'Bohola Moy Davitts',
      'Breaffy',
      'Burrishoole',
      'Castlebar Mitchels',
      'Charlestown Sarsfields',
      'Claremorris',
      'Crossmolina Deel Rovers',
      'Davitts (Irishtown)',
      'Eastern Gaels',
      'Erris St Pats',
      'Garrymore',
      'Hollymount Carramore',
      'Islandeady',
      'Kilcommon',
      'Kilfian',
      'Kiltane',
      'Kiltimagh',
      'Knockmore',
      'Lacken',
      'Lahardane MacHales',
      'Louisburgh',
      'Mayo Gaels',
      'Moy Davitts',
      'Parke-Keelogues-Crimlin',
      'Shrule-Glencorrib',
      'Swinford',
      'The Neale',
      'Tourmakeady',
      'Westport'
    ];

    const results = [];

    for (const clubName of mayoClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Mayo, Ireland', 'MAY', 'MAYO_GAA_MULTI',
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

    // Count total Mayo clubs
    const mayoClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'MAY'
    ` as any[];

    const totalMayoClubs = mayoClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Mayo GAA clubs imported successfully',
      source: 'MayoGAA.ie / Wikipedia',
      totalImported: mayoClubs.length,
      totalMayoClubs: parseInt(totalMayoClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Mayo clubs:', error);
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