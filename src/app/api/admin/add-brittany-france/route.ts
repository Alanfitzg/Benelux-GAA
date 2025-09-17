import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇫🇷 Adding Brittany - France as separate country...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    const europeUnitId = europeUnit[0].id;

    // Check if Brittany - France already exists
    const existingBrittany = await prisma.$queryRaw`
      SELECT id FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'FR-BR'
    ` as any[];

    if (existingBrittany.length) {
      return NextResponse.json({ message: 'Brittany - France already exists', existingId: existingBrittany[0].id });
    }

    // Add Brittany - France as a separate country (right after France which is displayOrder 1)
    const result = await prisma.$executeRaw`
      INSERT INTO "Country" (
        id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 'FR-BR', 'Brittany - France', false, ${europeUnitId}, 2, NOW(), NOW()
      )
    `;

    // Update all countries with displayOrder >= 2 (except Brittany) to move down by 1
    await prisma.$executeRaw`
      UPDATE "Country" 
      SET "displayOrder" = "displayOrder" + 1, "updatedAt" = NOW()
      WHERE "internationalUnitId" = ${europeUnitId} 
      AND "displayOrder" >= 2 
      AND code != 'FR-BR'
    `;

    // Get the newly created Brittany country
    const brittanyCountry = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'FR-BR'
    ` as any[];

    // Count total Europe countries
    const europeCountryCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId}
    ` as any[];

    const totalEuropeCountries = europeCountryCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Brittany - France added successfully as separate country',
      brittanyCountry: brittanyCountry[0],
      totalEuropeCountries: parseInt(totalEuropeCountries),
      note: 'France and Brittany - France now exist as separate countries under Europe'
    });

  } catch (error) {
    console.error('❌ Error adding Brittany - France:', error);
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