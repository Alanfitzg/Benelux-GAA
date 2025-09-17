import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🔄 Reordering Galicia - Spain to appear directly after Spain...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    const europeUnitId = europeUnit[0].id;

    // Update Galicia - Spain to have display order 4 (right after Spain which is 3)
    await prisma.$executeRaw`
      UPDATE "Country" 
      SET "displayOrder" = 4, "updatedAt" = NOW()
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'ES-GA'
    `;

    // Update all countries with displayOrder >= 4 (except Galicia) to move down by 1
    await prisma.$executeRaw`
      UPDATE "Country" 
      SET "displayOrder" = "displayOrder" + 1, "updatedAt" = NOW()
      WHERE "internationalUnitId" = ${europeUnitId} 
      AND "displayOrder" >= 4 
      AND code != 'ES-GA'
    `;

    // Get updated Europe countries to verify the new order
    const updatedCountries = await prisma.$queryRaw`
      SELECT code, name, "displayOrder"
      FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId}
      ORDER BY "displayOrder"
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'Galicia - Spain moved to display directly after Spain',
      updatedOrder: updatedCountries,
      note: 'Spain (order 3) → Galicia - Spain (order 4) → Italy (order 5) etc.'
    });

  } catch (error) {
    console.error('❌ Error reordering Galicia - Spain:', error);
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