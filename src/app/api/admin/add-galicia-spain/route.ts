import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇪🇸 Adding Galicia - Spain as separate country...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    const europeUnitId = europeUnit[0].id;

    // Check if Galicia - Spain already exists
    const existingGalicia = await prisma.$queryRaw`
      SELECT id FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'ES-GA'
    ` as any[];

    if (existingGalicia.length) {
      return NextResponse.json({ message: 'Galicia - Spain already exists', existingId: existingGalicia[0].id });
    }

    // Add Galicia - Spain as a separate country
    const result = await prisma.$executeRaw`
      INSERT INTO "Country" (
        id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 'ES-GA', 'Galicia - Spain', false, ${europeUnitId}, 15, NOW(), NOW()
      )
    `;

    // Get the newly created Galicia country
    const galiciaCountry = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} AND code = 'ES-GA'
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
      message: 'Galicia - Spain added successfully as separate country',
      galiciaCountry: galiciaCountry[0],
      totalEuropeCountries: parseInt(totalEuropeCountries),
      note: 'Spain and Galicia - Spain now exist as separate countries under Europe'
    });

  } catch (error) {
    console.error('❌ Error adding Galicia - Spain:', error);
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