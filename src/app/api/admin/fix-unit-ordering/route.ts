import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🔧 Fixing international unit display ordering...');

    // Define the correct order
    const correctOrder = [
      { code: 'IRELAND', name: 'Republic of Ireland', order: 1 },
      { code: 'BRITAIN', name: 'Britain', order: 2 },
      { code: 'EUROPE', name: 'Europe', order: 3 },
      { code: 'NEW_YORK', name: 'New York', order: 4 },
      { code: 'USA_GAA', name: 'USA GAA', order: 5 },
      { code: 'AUSTRALASIA', name: 'Australasia', order: 6 },
      { code: 'CANADA', name: 'Canada', order: 7 },
      { code: 'ASIA', name: 'Asia', order: 8 },
      { code: 'MIDDLE_EAST', name: 'Middle East', order: 9 },
      { code: 'AFRICA', name: 'Africa', order: 10 },
      { code: 'REST_WORLD', name: 'Rest of World', order: 11 }
    ];

    // Update each unit with correct display order
    for (const unit of correctOrder) {
      await prisma.$executeRaw`
        UPDATE "InternationalUnit" 
        SET "displayOrder" = ${unit.order}, "updatedAt" = NOW()
        WHERE code = ${unit.code}
      `;
    }

    // Get the updated units to verify
    const updatedUnits = await prisma.$queryRaw`
      SELECT code, name, "displayOrder" FROM "InternationalUnit" 
      ORDER BY "displayOrder"
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'International unit display ordering fixed successfully',
      updatedUnits,
      totalUnits: updatedUnits.length
    });

  } catch (error) {
    console.error('❌ Error fixing unit ordering:', error);
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