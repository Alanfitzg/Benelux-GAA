import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Seeding test data (regions and clubs)...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Add a few key Irish counties as regions
    const regions = [
      { code: 'DUB', name: 'Dublin', countryId: irelandCountryId, displayOrder: 1 },
      { code: 'COR', name: 'Cork', countryId: irelandCountryId, displayOrder: 2 },
      { code: 'GAL', name: 'Galway', countryId: irelandCountryId, displayOrder: 3 },
      { code: 'KER', name: 'Kerry', countryId: irelandCountryId, displayOrder: 4 },
      { code: 'MAY', name: 'Mayo', countryId: irelandCountryId, displayOrder: 5 },
    ];

    const regionResults = [];

    for (const region of regions) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Region" (id, code, name, "countryId", "displayOrder", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${region.code}, ${region.name}, ${region.countryId}, ${region.displayOrder}, NOW(), NOW())
          ON CONFLICT ("countryId", code)
          DO UPDATE SET 
            name = ${region.name},
            "displayOrder" = ${region.displayOrder},
            "updatedAt" = NOW()
        `;
        
        regionResults.push({ success: true, region: region.name, result });
        console.log(`✅ Created/Updated region: ${region.name}`);
      } catch (error) {
        regionResults.push({ 
          success: false, 
          region: region.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with region ${region.name}:`, error);
      }
    }

    // Get the Dublin region ID for sample clubs
    const dublinRegion = await prisma.$queryRaw`
      SELECT id FROM "Region" WHERE code = 'DUB' AND "countryId" = ${irelandCountryId}
    ` as any[];

    let dublinRegionId = null;
    if (dublinRegion.length) {
      dublinRegionId = dublinRegion[0].id;
    }

    // Add some sample clubs
    const clubs = [
      { 
        name: 'Kilmacud Crokes', 
        countryId: irelandCountryId, 
        regionId: dublinRegionId,
        location: 'Stillorgan, Dublin',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'],
        dataSource: 'USER_SUBMITTED'
      },
      { 
        name: 'St. Vincents', 
        countryId: irelandCountryId, 
        regionId: dublinRegionId,
        location: 'Marino, Dublin',
        sportsSupported: ['Gaelic Football', 'Hurling'],
        dataSource: 'USER_SUBMITTED'
      },
      { 
        name: 'Ballyboden St. Endas', 
        countryId: irelandCountryId, 
        regionId: dublinRegionId,
        location: 'Rathfarnham, Dublin',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football'],
        dataSource: 'USER_SUBMITTED'
      },
    ];

    const clubResults = [];

    for (const club of clubs) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, "sportsSupported", 
            "dataSource", status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${club.name}, ${club.countryId}, ${club.regionId}, 
            ${club.location}, ${club.sportsSupported}::text[], ${club.dataSource}, 
            'APPROVED', NOW(), NOW()
          )
          ON CONFLICT (name)
          DO UPDATE SET 
            location = ${club.location},
            "sportsSupported" = ${club.sportsSupported}::text[],
            "updatedAt" = NOW()
        `;
        
        clubResults.push({ success: true, club: club.name, result });
        console.log(`✅ Created/Updated club: ${club.name}`);
      } catch (error) {
        clubResults.push({ 
          success: false, 
          club: club.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with club ${club.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully',
      regionResults,
      clubResults,
    });

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
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