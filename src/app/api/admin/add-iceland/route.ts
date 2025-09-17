import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇸 Adding Iceland as European country...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    const europeUnitId = europeUnit[0].id;

    // Check if Iceland already exists
    const existingIceland = await prisma.$queryRaw`
      SELECT id FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'IS'
    ` as any[];

    if (existingIceland.length) {
      return NextResponse.json({ message: 'Iceland already exists', existingId: existingIceland[0].id });
    }

    // Add Iceland as the last European country
    const result = await prisma.$executeRaw`
      INSERT INTO "Country" (
        id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 'IS', 'Iceland', false, ${europeUnitId}, 17, NOW(), NOW()
      )
    `;

    // Get the newly created Iceland country
    const icelandCountry = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'IS'
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
      message: 'Iceland added successfully to Europe',
      icelandCountry: icelandCountry[0],
      totalEuropeCountries: parseInt(totalEuropeCountries),
      note: 'Iceland now available for GAA club registration'
    });

  } catch (error) {
    console.error('❌ Error adding Iceland:', error);
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