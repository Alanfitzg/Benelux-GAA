import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Louth GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Louth clubs
    console.log('🗑️  Clearing existing Louth clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'LOU'
    `;

    // Official Louth GAA clubs from LouthGAA.ie / Wikipedia
    const louthClubs = [
      'Ardee St Marys',
      'Cooley Kickhams',
      'Dreadnots',
      'Dundalk Gaels',
      'Dundalk Young Irelands',
      'Dundalk St Patricks',
      'Dundalk Clan na Gael',
      'Dundalk Sean O\'Mahonys',
      'Geraldines',
      'Glyde Rangers',
      'Hunterstown Rovers',
      'Kilkerley Emmets',
      'Lann Léire',
      'Mattock Rangers',
      'Naomh Fionnbarra',
      'Na Piarsaigh (Dundalk)',
      'Newtown Blues',
      'O\'Connells',
      'Oliver Plunketts (Louth)',
      'Roche Emmets',
      'Seán McDermotts',
      'Seán O\'Mahonys',
      'St Brides',
      'St Fechins',
      'St Josephs',
      'St Kevins',
      'St Mochtas',
      'St Nicholas',
      'St Patricks (Lordship)',
      'Stabannon Parnells',
      'Tallanstown',
      'Westerns'
    ];

    const results = [];

    for (const clubName of louthClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Louth, Ireland', 'LOU', 'LOUTH_GAA_MULTI',
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

    // Count total Louth clubs
    const louthClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'LOU'
    ` as any[];

    const totalLouthClubs = louthClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Louth GAA clubs imported successfully',
      source: 'LouthGAA.ie / Wikipedia',
      totalImported: louthClubs.length,
      totalLouthClubs: parseInt(totalLouthClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Louth clubs:', error);
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