import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇺🇸 Updating North America to New York and USA GAA...');

    // Get the current North America unit
    const northAmericaUnit = await prisma.$queryRaw`
      SELECT id, "displayOrder" FROM "InternationalUnit" WHERE code = 'NORTH_AMERICA'
    ` as any[];

    if (!northAmericaUnit.length) {
      return NextResponse.json({ error: 'North America international unit not found' }, { status: 400 });
    }

    const currentDisplayOrder = northAmericaUnit[0].displayOrder;
    const northAmericaId = northAmericaUnit[0].id;

    // Update the existing North America unit to become "New York"
    await prisma.$executeRaw`
      UPDATE "InternationalUnit" 
      SET code = 'NEW_YORK', name = 'New York', "updatedAt" = NOW()
      WHERE id = ${northAmericaId}
    `;

    // Add "USA GAA" as a new international unit right after New York
    await prisma.$executeRaw`
      INSERT INTO "InternationalUnit" (
        id, code, name, "displayOrder", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 'USA_GAA', 'USA GAA', ${currentDisplayOrder + 1}, NOW(), NOW()
      )
    `;

    // Update display orders for all units that come after (shift them down by 1)
    await prisma.$executeRaw`
      UPDATE "InternationalUnit" 
      SET "displayOrder" = "displayOrder" + 1, "updatedAt" = NOW()
      WHERE "displayOrder" > ${currentDisplayOrder + 1}
    `;

    // Get the updated units
    const updatedUnits = await prisma.$queryRaw`
      SELECT id, code, name, "displayOrder" FROM "InternationalUnit" 
      WHERE code IN ('NEW_YORK', 'USA_GAA')
      ORDER BY "displayOrder"
    ` as any[];

    // Count total international units
    const totalUnits = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "InternationalUnit"
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'Successfully updated North America to New York and USA GAA',
      updatedUnits,
      totalInternationalUnits: parseInt(totalUnits[0]?.count || 0),
      changes: {
        'North America': 'Renamed to New York',
        'USA GAA': 'Added as new international unit'
      },
      note: 'All countries and clubs previously under North America are now under New York'
    });

  } catch (error) {
    console.error('❌ Error updating North America units:', error);
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