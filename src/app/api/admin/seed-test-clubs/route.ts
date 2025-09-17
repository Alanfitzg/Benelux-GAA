import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Seeding test clubs...');

    // Get Ireland country ID and Dublin region ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

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
        location: 'Stillorgan, Dublin',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football']
      },
      { 
        name: 'St. Vincents', 
        location: 'Marino, Dublin',
        sportsSupported: ['Gaelic Football', 'Hurling']
      },
      { 
        name: 'Ballyboden St. Endas', 
        location: 'Rathfarnham, Dublin',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football']
      },
    ];

    const clubResults = [];

    for (const club of clubs) {
      try {
        // Simple insert without conflict resolution
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", "regionId", location, "sportsSupported", 
            "dataSource", status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${club.name}, ${irelandCountryId}, ${dublinRegionId}, 
            ${club.location}, ${club.sportsSupported}::text[], 'USER_SUBMITTED', 
            'APPROVED', NOW(), NOW()
          )
        `;
        
        clubResults.push({ success: true, club: club.name, result });
        console.log(`✅ Created club: ${club.name}`);
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
      message: 'Test clubs seeded successfully',
      clubResults,
    });

  } catch (error) {
    console.error('❌ Error seeding test clubs:', error);
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