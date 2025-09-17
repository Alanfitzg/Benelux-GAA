import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Monaghan GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Monaghan clubs
    console.log('🗑️  Clearing existing Monaghan clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'MON'
    `;

    // Official Monaghan GAA clubs from MonaghanGAA.ie / Wikipedia
    const monaghanClubs = [
      'Aughnamullen GFC',
      'Ballybay Pearse Brothers',
      'Blackhill Emeralds',
      'Carrickmacross Emmets',
      'Castleblayney Faughs',
      'Clontibret O\'Neills',
      'Corduff Gaels',
      'Cremartin Shamrocks',
      'Currin',
      'Donaghmoyne',
      'Drumhowan',
      'Emyvale',
      'Inniskeen Grattans',
      'Killeevan Emyvale',
      'Killanny',
      'Latton O\'Rahilly GAA',
      'Magheracloone Mitchells',
      'Monaghan Harps',
      'Oram',
      'Rockcorry',
      'Scotstown',
      'Sean McDermotts',
      'Seans GFC',
      'Toome GFC',
      'Truagh Gaels',
      'Tyholland'
    ];

    const results = [];

    for (const clubName of monaghanClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Monaghan, Ireland', 'MON', 'MONAGHAN_GAA_MULTI',
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

    // Count total Monaghan clubs
    const monaghanClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'MON'
    ` as any[];

    const totalMonaghanClubs = monaghanClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Monaghan GAA clubs imported successfully',
      source: 'MonaghanGAA.ie / Wikipedia',
      totalImported: monaghanClubs.length,
      totalMonaghanClubs: parseInt(totalMonaghanClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Monaghan clubs:', error);
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