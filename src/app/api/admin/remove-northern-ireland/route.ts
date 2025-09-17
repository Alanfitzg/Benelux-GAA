import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🗑️ Removing Northern Ireland from countries...');

    // Delete Northern Ireland from the database
    const result = await prisma.$executeRaw`
      DELETE FROM "Country" WHERE code = 'NI'
    `;

    console.log(`✅ Deleted Northern Ireland. Rows affected: ${result}`);

    // Count remaining countries for Britain
    const britainCountries = await prisma.$queryRaw`
      SELECT c.code, c.name 
      FROM "Country" c
      JOIN "InternationalUnit" iu ON c."internationalUnitId" = iu.id
      WHERE iu.code = 'BRITAIN'
      ORDER BY c."displayOrder"
    ` as any[];

    console.log('📊 Remaining countries for Britain:', britainCountries);

    return NextResponse.json({
      success: true,
      message: 'Northern Ireland removed successfully',
      rowsDeleted: result,
      remainingBritainCountries: britainCountries
    });

  } catch (error) {
    console.error('❌ Error removing Northern Ireland:', error);
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