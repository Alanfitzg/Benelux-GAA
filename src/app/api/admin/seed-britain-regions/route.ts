import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇬🇧 Setting up Britain regions...');

    // Get Britain international unit ID
    const britainUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'BRITAIN'
    ` as any[];

    if (!britainUnit.length) {
      return NextResponse.json({ error: 'Britain international unit not found' }, { status: 400 });
    }

    const britainUnitId = britainUnit[0].id;

    // Since Britain doesn't have a country layer, we'll create regions directly
    // associated with the Britain unit via a special approach
    
    // First, let's clear existing British regions if any
    await prisma.$executeRaw`
      DELETE FROM "Region" WHERE "countryId" IN (
        SELECT id FROM "Country" WHERE "internationalUnitId" = ${britainUnitId}
      )
    `;

    // Delete Great Britain country if it exists
    await prisma.$executeRaw`
      DELETE FROM "Country" WHERE "internationalUnitId" = ${britainUnitId}
    `;

    // Create a special "Britain" country entry to hold the regions
    // This is needed because the current schema requires regions to have a countryId
    const britainCountryResult = await prisma.$executeRaw`
      INSERT INTO "Country" (id, code, name, "internationalUnitId", "hasRegions", "displayOrder", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'BRITAIN', 'Britain', ${britainUnitId}, true, 1, NOW(), NOW())
      ON CONFLICT (code)
      DO UPDATE SET 
        name = 'Britain',
        "hasRegions" = true,
        "displayOrder" = 1,
        "updatedAt" = NOW()
      RETURNING id
    `;

    // Get the Britain country ID
    const britainCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'BRITAIN'
    ` as any[];

    const britainCountryId = britainCountry[0].id;

    // Create British regions
    const regions = [
      { code: 'LON', name: 'London', displayOrder: 1 },
      { code: 'GLO', name: 'Gloucestershire', displayOrder: 2 },
      { code: 'HER', name: 'Hertfordshire', displayOrder: 3 },
      { code: 'LAN', name: 'Lancashire', displayOrder: 4 },
      { code: 'SCO', name: 'Scotland', displayOrder: 5 },
      { code: 'WAR', name: 'Warwickshire', displayOrder: 6 },
      { code: 'YOR', name: 'Yorkshire', displayOrder: 7 },
    ];

    const results = [];

    for (const region of regions) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Region" (id, code, name, "countryId", "displayOrder", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${region.code}, ${region.name}, ${britainCountryId}, ${region.displayOrder}, NOW(), NOW())
        `;
        
        results.push({ success: true, region: region.name });
        console.log(`✅ Created British region: ${region.name}`);
      } catch (error) {
        results.push({ 
          success: false, 
          region: region.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with region ${region.name}:`, error);
      }
    }

    // Count the records
    const countResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Region" 
      WHERE "countryId" = ${britainCountryId}
    `;
    const count = Array.isArray(countResult) && countResult[0] ? (countResult[0] as any).count : 0;
    
    console.log(`📊 Total British regions in database: ${count}`);

    return NextResponse.json({
      success: true,
      message: 'British regions created successfully',
      results,
      totalCount: parseInt(count)
    });

  } catch (error) {
    console.error('❌ Error setting up British regions:', error);
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