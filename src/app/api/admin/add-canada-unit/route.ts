import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇨🇦 Adding Canada as new international unit...');

    // Check if Canada already exists
    const existingCanada = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'CANADA'
    ` as any[];

    if (existingCanada.length) {
      return NextResponse.json({ message: 'Canada international unit already exists', existingId: existingCanada[0].id });
    }

    // Get current max display order
    const maxDisplayOrder = await prisma.$queryRaw`
      SELECT MAX("displayOrder") as max_order FROM "InternationalUnit"
    ` as any[];

    const nextDisplayOrder = (maxDisplayOrder[0]?.max_order || 0) + 1;

    // Add Canada as new international unit
    const result = await prisma.$executeRaw`
      INSERT INTO "InternationalUnit" (
        id, code, name, "displayOrder", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 'CANADA', 'Canada', ${nextDisplayOrder}, NOW(), NOW()
      )
    `;

    // Get the newly created Canada unit
    const canadaUnit = await prisma.$queryRaw`
      SELECT id, code, name, "displayOrder" FROM "InternationalUnit" 
      WHERE code = 'CANADA'
    ` as any[];

    // Count total international units
    const totalUnits = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "InternationalUnit"
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'Canada added successfully as new international unit',
      canadaUnit: canadaUnit[0],
      totalInternationalUnits: parseInt(totalUnits[0]?.count || 0),
      displayOrder: nextDisplayOrder,
      note: 'Canada now available for country and club registration'
    });

  } catch (error) {
    console.error('❌ Error adding Canada international unit:', error);
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