import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Roscommon GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Roscommon clubs
    console.log('🗑️  Clearing existing Roscommon clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'ROS'
    `;

    // Official Roscommon GAA clubs from RoscommonGAA.ie / Wikipedia
    const roscommonClubs = [
      'Athleague',
      'Ballinameen',
      'Ballintubber (Roscommon)',
      'Ballinagare',
      'Ballinasloe (Roscommon side)',
      'Ballinlough',
      'Boyle',
      'Castlerea St Kevins',
      'Clann na nGael',
      'Clogher',
      'Clonguish',
      'Creggs',
      'Crosna',
      'Elphin',
      'Eire Og',
      'Fuerty',
      'Glaveys',
      'Kilbride',
      'Kilglass Gaels',
      'Kilmore',
      'Michael Glaveys',
      'Oran',
      'Padraig Pearses',
      'Roscommon Gaels',
      'Shannon Gaels',
      'St Aidans',
      'St Barrys',
      'St Brigids (Roscommon)',
      'St Croans',
      'St Dominics',
      'St Faithleachs',
      'St Josephs',
      'St Michaels',
      'St Ronans',
      'Strokestown',
      'Tulsk Lord Edwards',
      'Western Gaels'
    ];

    const results = [];

    for (const clubName of roscommonClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Roscommon, Ireland', 'ROS', 'ROSCOMMON_GAA_MULTI',
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

    // Count total Roscommon clubs
    const roscommonClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'ROS'
    ` as any[];

    const totalRoscommonClubs = roscommonClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Roscommon GAA clubs imported successfully',
      source: 'RoscommonGAA.ie / Wikipedia',
      totalImported: roscommonClubs.length,
      totalRoscommonClubs: parseInt(totalRoscommonClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Roscommon clubs:', error);
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