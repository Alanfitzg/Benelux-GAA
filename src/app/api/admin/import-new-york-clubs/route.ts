import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🗽 Importing New York GAA clubs...');

    // Get New York international unit
    const newYorkUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'NEW_YORK'
    ` as any[];

    if (!newYorkUnit.length) {
      return NextResponse.json({ error: 'New York international unit not found' }, { status: 400 });
    }

    const newYorkUnitId = newYorkUnit[0].id;

    // Check if USA country exists under New York unit, if not create it
    let usaCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${newYorkUnitId} AND code = 'US'
    ` as any[];

    if (!usaCountry.length) {
      // Create USA country under New York unit
      console.log('Creating USA country under New York unit...');
      await prisma.$executeRaw`
        INSERT INTO "Country" (
          id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), 'US', 'USA', false, ${newYorkUnitId}, 1, NOW(), NOW()
        )
      `;
      
      // Get the newly created USA country
      usaCountry = await prisma.$queryRaw`
        SELECT id FROM "Country" WHERE "internationalUnitId" = ${newYorkUnitId} AND code = 'US'
      ` as any[];
    }

    const usaCountryId = usaCountry[0].id;

    // Clear existing New York clubs
    console.log('🗑️ Clearing existing New York clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${usaCountryId}
    `;

    // New York GAA clubs from official lists & fixtures
    const newYorkClubs = [
      'Donegal NY',
      'Kerry NY',
      'Cavan NY',
      'Leitrim NY',
      'Monaghan NY',
      'Sligo NY',
      'Tyrone NY',
      'Brooklyn Shamrocks',
      'Rangers',
      'Rockland GAA',
      'Westmeath NY',
      'St Barnabas',
      'Manhattan Gaels',
      'Hoboken Guards',
      'Galway NY Hurling Club',
      'Tipperary NY',
      'Offaly NY',
      'Limerick NY',
      'Clare NY',
      'Kilkenny NY',
      'Na Fianna Ladies NY',
      'Cavan Ladies NY',
      'Fermanagh Ladies NY'
    ];

    const results = [];

    for (const clubName of newYorkClubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubName}, ${usaCountryId},
            'New York, USA', 'US-NY', 'NEW_YORK_GAA_OFFICIAL_LISTS_FIXTURES',
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

    // Count total New York clubs
    const newYorkClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${usaCountryId}
    ` as any[];

    const totalNewYorkClubs = newYorkClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'New York GAA clubs imported successfully',
      source: 'New York GAA official lists & fixtures',
      totalImported: newYorkClubs.length,
      totalNewYorkClubs: parseInt(totalNewYorkClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success) // Only show errors
    });

  } catch (error) {
    console.error('❌ Error importing New York clubs:', error);
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