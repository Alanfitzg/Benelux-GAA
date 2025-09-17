import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇲🇽 Adding Mexico City GAA club...');

    // Get USA GAA international unit
    const usaGaaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'USA_GAA'
    ` as any[];

    if (!usaGaaUnit.length) {
      return NextResponse.json({ error: 'USA GAA international unit not found' }, { status: 400 });
    }

    const usaGaaUnitId = usaGaaUnit[0].id;

    // Check if Mexico country exists under USA GAA, if not create it
    let mexicoCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${usaGaaUnitId} AND code = 'MX'
    ` as any[];

    if (!mexicoCountry.length) {
      // Create Mexico country under USA GAA unit
      console.log('Creating Mexico country under USA GAA unit...');
      await prisma.$executeRaw`
        INSERT INTO "Country" (
          id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), 'MX', 'Mexico', false, ${usaGaaUnitId}, 2, NOW(), NOW()
        )
      `;
      
      // Get the newly created Mexico country
      mexicoCountry = await prisma.$queryRaw`
        SELECT id FROM "Country" WHERE "internationalUnitId" = ${usaGaaUnitId} AND code = 'MX'
      ` as any[];
    }

    const mexicoCountryId = mexicoCountry[0].id;

    // Check if Mexico City GAA already exists
    const existingClub = await prisma.$queryRaw`
      SELECT id FROM "Club" WHERE "countryId" = ${mexicoCountryId} AND name = 'Mexico City GAA'
    ` as any[];

    if (existingClub.length) {
      return NextResponse.json({ 
        success: true,
        message: 'Mexico City GAA already exists',
        existingClub: existingClub[0]
      });
    }

    // Add Mexico City GAA club
    await prisma.$executeRaw`
      INSERT INTO "Club" (
        id, name, "countryId", location, codes, "dataSource", 
        status, "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), 'Mexico City GAA', ${mexicoCountryId},
        'Mexico City, Mexico', 'MX', 'FEDERACION_GAELICO_MEXICO_GAA',
        'APPROVED', NOW(), NOW()
      )
    `;

    // Get the newly created club
    const newClub = await prisma.$queryRaw`
      SELECT id, name FROM "Club" WHERE "countryId" = ${mexicoCountryId} AND name = 'Mexico City GAA'
    ` as any[];

    // Count total Mexico clubs
    const mexicoClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${mexicoCountryId}
    ` as any[];

    const totalMexicoClubs = mexicoClubCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: 'Mexico City GAA added successfully',
      source: 'Federación de Gaélico en México / GAA',
      newClub: newClub[0],
      totalMexicoClubs: parseInt(totalMexicoClubs),
      note: 'Mexico now available as separate country under USA GAA'
    });

  } catch (error) {
    console.error('❌ Error adding Mexico City GAA:', error);
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