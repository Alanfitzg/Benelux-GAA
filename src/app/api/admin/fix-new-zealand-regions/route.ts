import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇳🇿 Fixing New Zealand hasRegions flag...');

    // Update New Zealand to have hasRegions: true
    await prisma.$executeRaw`
      UPDATE "Country" 
      SET "hasRegions" = true, "updatedAt" = NOW()
      WHERE code = 'NZ' AND name = 'New Zealand'
    `;

    // Verify the fix
    const newZealandCountry = await prisma.$queryRaw`
      SELECT id, code, name, "hasRegions" FROM "Country" 
      WHERE code = 'NZ' AND name = 'New Zealand'
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'New Zealand hasRegions flag fixed successfully',
      country: newZealandCountry[0],
      note: 'New Zealand regions should now be accessible in the cascading selector'
    });

  } catch (error) {
    console.error('❌ Error fixing New Zealand regions:', error);
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