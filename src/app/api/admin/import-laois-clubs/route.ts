import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Importing official Laois GAA clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing Laois clubs
    console.log('🗑️  Clearing existing Laois clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'LAO'
    `;

    // Official Laois GAA clubs from LaoisGAA.ie / Wikipedia
    const laoisClubs = [
      'Abbeyleix',
      'Arles-Killeen',
      'Arles-Kilcruise',
      'Ballinakill',
      'Ballinakill Gaels',
      'Ballinakill-Annagh Hill',
      'Ballinagar',
      'Ballyfin',
      'Ballylinan',
      'Barrowhouse',
      'Camross',
      'Castletown',
      'Clonaslee-St Manmans',
      'Clough-Ballacolla',
      'Colt-Shanahoe',
      'Courtwood',
      'Crettyard',
      'Emo',
      'Graiguecullen',
      'Kilcavan',
      'Kilcotton',
      'Killeshin',
      'Mountmellick',
      'O\'Dempseys',
      'Park-Ratheniska',
      'Portarlington',
      'Portlaoise',
      'Rathdowney-Errill',
      'Rosenallis',
      'St Josephs (Laois)',
      'Stradbally',
      'The Heath',
      'Timahoe',
      'Trumera'
    ];

    const results = [];

    for (const clubName of laoisClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${irelandCountryId}, 
            'Laois, Ireland', 'LAO', 'LAOIS_GAA_MULTI',
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

    // Count total Laois clubs
    const laoisClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'LAO'
    ` as any[];

    const totalLaoisClubs = laoisClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Laois GAA clubs imported successfully',
      source: 'LaoisGAA.ie / Wikipedia',
      totalImported: laoisClubs.length,
      totalLaoisClubs: parseInt(totalLaoisClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing Laois clubs:', error);
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