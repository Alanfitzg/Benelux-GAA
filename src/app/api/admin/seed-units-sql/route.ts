import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Seeding International Units via SQL...');

    // First, let's try a raw SQL approach
    const units = [
      { code: 'IRELAND', name: 'Republic of Ireland', displayOrder: 1 },
      { code: 'BRITAIN', name: 'Britain', displayOrder: 2 },
      { code: 'EUROPE', name: 'Europe', displayOrder: 3 },
      { code: 'NORTH_AMERICA', name: 'North America', displayOrder: 4 },
      { code: 'AUSTRALASIA', name: 'Australasia', displayOrder: 5 },
      { code: 'ASIA', name: 'Asia', displayOrder: 6 },
      { code: 'MIDDLE_EAST', name: 'Middle East', displayOrder: 7 },
      { code: 'AFRICA', name: 'Africa', displayOrder: 8 },
      { code: 'REST_WORLD', name: 'Rest of World', displayOrder: 9 },
    ];

    const results = [];

    for (const unit of units) {
      try {
        // Use raw SQL to insert or update
        const result = await prisma.$executeRaw`
          INSERT INTO "InternationalUnit" (id, code, name, "displayOrder", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${unit.code}, ${unit.name}, ${unit.displayOrder}, NOW(), NOW())
          ON CONFLICT (code)
          DO UPDATE SET 
            name = ${unit.name},
            "displayOrder" = ${unit.displayOrder},
            "updatedAt" = NOW()
        `;
        
        results.push({ success: true, unit: unit.name, result });
        console.log(`✅ Created/Updated: ${unit.name}`);
      } catch (error) {
        results.push({ 
          success: false, 
          unit: unit.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${unit.name}:`, error);
      }
    }

    // Count the records
    const countResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "InternationalUnit"`;
    const count = Array.isArray(countResult) && countResult[0] ? (countResult[0] as any).count : 0;
    
    console.log(`📊 Total international units in database: ${count}`);

    return NextResponse.json({
      success: true,
      message: 'International units seeded successfully via SQL',
      results,
      totalCount: parseInt(count)
    });

  } catch (error) {
    console.error('❌ Error seeding international units:', error);
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