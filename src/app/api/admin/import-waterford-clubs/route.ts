import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Waterford GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Waterford clubs
    console.log('🗑️  Clearing existing Waterford clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'WAT'
    `;

    // Official Waterford GAA clubs from WaterfordGAA.ie / Wikipedia
    const waterfordClubs = [
      'Abbeyside',
      'An Rinn',
      'Ballinacourty',
      'Ballyduff Lower',
      'Ballygunner',
      'Ballysaggart',
      'Brickey Rangers',
      'Clashmore-Kinsalebeg',
      'De La Salle',
      'Dungarvan',
      'Erins Own (Waterford)',
      'Ferrybank',
      'Fourmilewater',
      'Gaultier',
      'Geraldines',
      'Kilgobinet',
      'Kill',
      'Mount Sion',
      'Passage',
      'Portlaw',
      'Roanmore',
      'Sacred Heart',
      'St Mary\'s (Waterford)',
      'Stradbally',
      'The Nire',
      'Tallow',
      'Tramore'
    ];

    const results = [];

    for (const clubName of waterfordClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Waterford, Ireland', 'WAT', 'WATERFORD_GAA_MULTI',
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

    // Count total Waterford clubs
    const waterfordClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'WAT'
    ` as any[];

    const totalWaterfordClubs = waterfordClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Waterford GAA clubs imported successfully',
      source: 'WaterfordGAA.ie / Wikipedia',
      totalImported: waterfordClubs.length,
      totalWaterfordClubs: parseInt(totalWaterfordClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Waterford clubs:', error);
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