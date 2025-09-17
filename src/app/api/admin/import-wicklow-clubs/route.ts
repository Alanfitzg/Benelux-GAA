import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Wicklow GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Wicklow clubs
    console.log('🗑️  Clearing existing Wicklow clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'WIC'
    `;

    // Official Wicklow GAA clubs from WicklowGAA.ie / Wikipedia
    const wicklowClubs = [
      'An Tóchar',
      'Arklow Geraldines-Ballymoney',
      'Ashford',
      'Avondale',
      'Aughrim',
      'Baltinglass',
      'Barndarrig',
      'Blessington',
      'Bray Emmets',
      'Carnew Emmets',
      'Coolkenno',
      'Donard-The Glen',
      'Eire Og Greystones',
      'Enniskerry',
      'Hollywood',
      'Kilcoole',
      'Kilmacanogue',
      'Kiltegan',
      'Lacken-Kilbride',
      'Laragh',
      'Newtownmountkennedy',
      'Rathnew',
      'Roundwood',
      'Shillelagh-Coolboy',
      'St Patricks (Wicklow Town)',
      'Stratford Grangecon',
      'Tinahely',
      'Valleymount'
    ];

    const results = [];

    for (const clubName of wicklowClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Wicklow, Ireland', 'WIC', 'WICKLOW_GAA_MULTI',
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

    // Count total Wicklow clubs
    const wicklowClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'WIC'
    ` as any[];

    const totalWicklowClubs = wicklowClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Wicklow GAA clubs imported successfully',
      source: 'WicklowGAA.ie / Wikipedia',
      totalImported: wicklowClubs.length,
      totalWicklowClubs: parseInt(totalWicklowClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Wicklow clubs:', error);
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