import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Seeding basic countries for Ireland and Britain...');

    // First get the international units
    const irelandUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'IRELAND'
    ` as any[];
    
    const britainUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'BRITAIN'
    ` as any[];

    if (!irelandUnit.length || !britainUnit.length) {
      return NextResponse.json({ error: 'International units not found' }, { status: 400 });
    }

    const irelandUnitId = irelandUnit[0].id;
    const britainUnitId = britainUnit[0].id;

    const countries = [
      { code: 'IE', name: 'Ireland', unitId: irelandUnitId, hasRegions: true, displayOrder: 1 },
    ];

    const results = [];

    for (const country of countries) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Country" (id, code, name, "internationalUnitId", "hasRegions", "displayOrder", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${country.code}, ${country.name}, ${country.unitId}, ${country.hasRegions}, ${country.displayOrder}, NOW(), NOW())
          ON CONFLICT (code)
          DO UPDATE SET 
            name = ${country.name},
            "hasRegions" = ${country.hasRegions},
            "displayOrder" = ${country.displayOrder},
            "updatedAt" = NOW()
        `;
        
        results.push({ success: true, country: country.name, result });
        console.log(`✅ Created/Updated: ${country.name}`);
      } catch (error) {
        results.push({ 
          success: false, 
          country: country.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${country.name}:`, error);
      }
    }

    // Count the records
    const countResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Country"`;
    const count = Array.isArray(countResult) && countResult[0] ? (countResult[0] as any).count : 0;
    
    console.log(`📊 Total countries in database: ${count}`);

    return NextResponse.json({
      success: true,
      message: 'Basic countries seeded successfully',
      results,
      totalCount: parseInt(count)
    });

  } catch (error) {
    console.error('❌ Error seeding countries:', error);
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