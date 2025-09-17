import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Longford GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Longford clubs
    console.log('🗑️  Clearing existing Longford clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'LON'
    `;

    // Official Longford GAA clubs from LongfordGAA.ie / Wikipedia
    const longfordClubs = [
      'Abbeylara',
      'Ardagh Moydow',
      'Ballymahon',
      'Ballymore',
      'Carrickedmond',
      'Cashel',
      'Clonguish',
      'Colmcille',
      'Dromard',
      'Fr Manning Gaels',
      'Grattan Óg',
      'Kenagh',
      'Killoe Young Emmets',
      'Legan Sarsfields',
      'Longford Slashers',
      'Mostrim (Edgeworthstown)',
      'Mullinalaghta St Columbas',
      'Rathcline',
      'Seán Connollys',
      'Shroid Slashers',
      'St Brigids (Killashee)',
      'St Marys Granard',
      'St Patricks Ardagh',
      'Young Grattans'
    ];

    const results = [];

    for (const clubName of longfordClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Longford, Ireland', 'LON', 'LONGFORD_GAA_MULTI',
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

    // Count total Longford clubs
    const longfordClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'LON'
    ` as any[];

    const totalLongfordClubs = longfordClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Longford GAA clubs imported successfully',
      source: 'LongfordGAA.ie / Wikipedia',
      totalImported: longfordClubs.length,
      totalLongfordClubs: parseInt(totalLongfordClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Longford clubs:', error);
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