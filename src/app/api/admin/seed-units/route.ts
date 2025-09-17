import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Seeding International Units via API...');

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
        const result = await prisma.internationalUnit.upsert({
          where: { code: unit.code },
          update: unit,
          create: unit,
        });
        results.push({ success: true, unit: unit.name, id: result.id });
        console.log(`✅ Created/Updated: ${unit.name}`);
      } catch (error) {
        results.push({ success: false, unit: unit.name, error: error instanceof Error ? error.message : 'Unknown error' });
        console.error(`❌ Error with ${unit.name}:`, error);
      }
    }

    // Verify the data
    const count = await prisma.internationalUnit.count();
    console.log(`📊 Total international units in database: ${count}`);

    return NextResponse.json({
      success: true,
      message: 'International units seeded successfully',
      results,
      totalCount: count
    });

  } catch (error) {
    console.error('❌ Error seeding international units:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}