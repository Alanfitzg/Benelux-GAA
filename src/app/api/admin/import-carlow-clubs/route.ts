import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Carlow GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Carlow clubs
    console.log('🗑️  Clearing existing Carlow clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'CAR'
    `;

    // Official Carlow GAA clubs from CarlowGAA.ie / Wikipedia
    const carlowClubs = [
      'Askea',
      'Ballinabranna',
      'Ballinkillen',
      'Bagenalstown Gaels',
      'Clonmore',
      'Éire Óg Carlow',
      'Fenagh',
      'Grange',
      'Kildavin-Clonegal',
      'Leighlinbridge',
      'Mount Leinster Rangers',
      'Naomh Bríd',
      'O\'Hanrahans',
      'Palatine',
      'Rathvilly',
      'St Andrews',
      'St Mullins',
      'Tinryland'
    ];

    const results = [];

    for (const clubName of carlowClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Carlow, Ireland', 'CAR', 'CARLOW_GAA_MULTI',
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

    // Count total Carlow clubs
    const carlowClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'CAR'
    ` as any[];

    const totalCarlowClubs = carlowClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Carlow GAA clubs imported successfully',
      source: 'CarlowGAA.ie / Wikipedia',
      totalImported: carlowClubs.length,
      totalCarlowClubs: parseInt(totalCarlowClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Carlow clubs:', error);
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