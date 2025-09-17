import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇺🇸 Setting up USGAA divisions as regions...');

    // Get USA GAA international unit
    const usaGaaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'USA_GAA'
    ` as any[];

    if (!usaGaaUnit.length) {
      return NextResponse.json({ error: 'USA GAA international unit not found' }, { status: 400 });
    }

    // Get USA country under USA GAA
    const usaCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${usaGaaUnit[0].id} AND code = 'USA-GAA'
    ` as any[];

    if (!usaCountry.length) {
      return NextResponse.json({ error: 'USA country not found under USA GAA' }, { status: 400 });
    }

    const usaCountryId = usaCountry[0].id;

    // Define USGAA divisions
    const divisions = [
      { code: 'BOSTON', name: 'Boston', displayOrder: 1 },
      { code: 'CHICAGO', name: 'Chicago', displayOrder: 2 },
      { code: 'PHILADELPHIA', name: 'Philadelphia', displayOrder: 3 },
      { code: 'SAN_FRANCISCO', name: 'San Francisco', displayOrder: 4 },
      { code: 'MID_ATLANTIC', name: 'Mid-Atlantic', displayOrder: 5 },
      { code: 'MIDWEST', name: 'Midwest', displayOrder: 6 },
      { code: 'NORTHWEST', name: 'Northwest', displayOrder: 7 },
      { code: 'SOUTH', name: 'South', displayOrder: 8 },
      { code: 'SOUTH_CENTRAL', name: 'South Central', displayOrder: 9 },
      { code: 'SOUTHWEST', name: 'Southwest', displayOrder: 10 },
      { code: 'TWIN_CITIES', name: 'Twin Cities', displayOrder: 11 },
      { code: 'FLORIDA', name: 'Florida', displayOrder: 12 }
    ];

    // Clear existing regions for USA GAA
    console.log('🗑️ Clearing existing USA GAA regions...');
    await prisma.$executeRaw`
      DELETE FROM "Region" WHERE "countryId" = ${usaCountryId}
    `;

    const results = [];

    // Create regions for each division
    for (const division of divisions) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Region" (
            id, code, name, "countryId", "displayOrder", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${division.code}, ${division.name}, ${usaCountryId}, ${division.displayOrder}, NOW(), NOW()
          )
        `;
        
        results.push({ success: true, division: division.name, code: division.code });
        console.log(`✅ Created division: ${division.name} (${division.code})`);
      } catch (error) {
        results.push({ 
          success: false, 
          division: division.name, 
          code: division.code,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${division.name}:`, error);
      }
    }

    // Count total divisions created
    const divisionCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Region" 
      WHERE "countryId" = ${usaCountryId}
    ` as any[];

    const totalDivisions = divisionCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'USGAA divisions set up successfully as regions',
      totalDivisions: parseInt(totalDivisions),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      divisions: results.filter(r => r.success).map(r => ({ name: r.division, code: r.code })),
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error setting up USGAA divisions:', error);
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