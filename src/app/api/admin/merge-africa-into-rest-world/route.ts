import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Merging Africa into Rest of World...');

    // Get Africa and Rest of World international units
    const africaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'AFRICA'
    ` as any[];

    const restWorldUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'REST_WORLD'
    ` as any[];

    if (!africaUnit.length) {
      return NextResponse.json({ error: 'Africa international unit not found' }, { status: 400 });
    }

    if (!restWorldUnit.length) {
      return NextResponse.json({ error: 'Rest of World international unit not found' }, { status: 400 });
    }

    const africaUnitId = africaUnit[0].id;
    const restWorldUnitId = restWorldUnit[0].id;

    // Get all African countries
    const africanCountries = await prisma.$queryRaw`
      SELECT id, code, name, "displayOrder" FROM "Country" 
      WHERE "internationalUnitId" = ${africaUnitId}
      ORDER BY "displayOrder" ASC
    ` as any[];

    // Get current Rest of World countries to know the next display order
    const restWorldCountries = await prisma.$queryRaw`
      SELECT MAX("displayOrder") as max_order FROM "Country" 
      WHERE "internationalUnitId" = ${restWorldUnitId}
    ` as any[];

    const nextDisplayOrder = (restWorldCountries[0]?.max_order || 0) + 1;

    console.log(`📦 Found ${africanCountries.length} African countries to merge`);

    // Move all African countries to Rest of World
    let movedCountries = 0;
    let movedClubs = 0;

    for (let i = 0; i < africanCountries.length; i++) {
      const country = africanCountries[i];
      const newDisplayOrder = nextDisplayOrder + i;

      // Count clubs in this country before moving
      const clubCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Club" WHERE "countryId" = ${country.id}
      ` as any[];

      // Move country to Rest of World
      await prisma.$executeRaw`
        UPDATE "Country" 
        SET "internationalUnitId" = ${restWorldUnitId}, 
            "displayOrder" = ${newDisplayOrder},
            "updatedAt" = NOW()
        WHERE id = ${country.id}
      `;

      movedCountries++;
      movedClubs += parseInt(clubCount[0]?.count || 0);
      console.log(`✅ Moved ${country.name} (${clubCount[0]?.count || 0} clubs) to Rest of World`);
    }

    // Delete the Africa international unit
    console.log('🗑️ Deleting Africa international unit...');
    await prisma.$executeRaw`
      DELETE FROM "InternationalUnit" WHERE id = ${africaUnitId}
    `;

    // Update display orders for remaining international units (shift everything after Africa down by 1)
    console.log('📊 Updating international unit display orders...');
    await prisma.$executeRaw`
      UPDATE "InternationalUnit" 
      SET "displayOrder" = "displayOrder" - 1, "updatedAt" = NOW()
      WHERE "displayOrder" > 10
    `;

    // Verify the merge
    const finalRestWorldCountries = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Country" 
      WHERE "internationalUnitId" = ${restWorldUnitId}
    ` as any[];

    const finalRestWorldClubs = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Club" c
      JOIN "Country" co ON c."countryId" = co.id
      WHERE co."internationalUnitId" = ${restWorldUnitId}
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'Africa successfully merged into Rest of World',
      details: {
        movedCountries,
        movedClubs,
        finalRestWorldCountries: parseInt(finalRestWorldCountries[0]?.count || 0),
        finalRestWorldClubs: parseInt(finalRestWorldClubs[0]?.count || 0)
      },
      africanCountriesMoved: africanCountries.map(c => ({
        name: c.name,
        code: c.code
      })),
      note: 'Africa international unit has been deleted and all countries/clubs moved to Rest of World'
    });

  } catch (error) {
    console.error('❌ Error merging Africa into Rest of World:', error);
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