import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🗑️ Clearing Kilkenny and Kildare clubs...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear Kilkenny clubs (KIK)
    console.log('🗑️ Clearing Kilkenny (KIK) clubs...');
    const kilkennyDeleted = await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'KIK'
    `;

    // Clear Kildare clubs (KIL)
    console.log('🗑️ Clearing Kildare (KIL) clubs...');
    const kildareDeleted = await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId} AND codes = 'KIL'
    `;

    // Verify both are empty
    const kilkennyCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'KIK'
    ` as any[];

    const kildareCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${irelandCountryId} AND codes = 'KIL'
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'Kilkenny and Kildare clubs cleared successfully',
      deletedCounts: {
        kilkenny: kilkennyDeleted,
        kildare: kildareDeleted
      },
      remainingCounts: {
        kilkenny: parseInt(kilkennyCount[0]?.count || 0),
        kildare: parseInt(kildareCount[0]?.count || 0)
      }
    });

  } catch (error) {
    console.error('❌ Error clearing clubs:', error);
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