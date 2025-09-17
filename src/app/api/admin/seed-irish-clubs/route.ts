import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Creating sample Irish clubs with county data...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // Clear existing test clubs for Ireland
    await prisma.$executeRaw`
      DELETE FROM "Club" WHERE "countryId" = ${irelandCountryId}
    `;

    // Create sample clubs across different counties
    const clubs = [
      // Dublin clubs
      { 
        name: 'Kilmacud Crokes', 
        location: 'Stillorgan, Dublin',
        county: 'DUB',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football']
      },
      { 
        name: 'St. Vincents', 
        location: 'Marino, Dublin',
        county: 'DUB',
        sportsSupported: ['Gaelic Football', 'Hurling']
      },
      { 
        name: 'Ballyboden St. Endas', 
        location: 'Rathfarnham, Dublin',
        county: 'DUB',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football']
      },
      { 
        name: 'Cuala', 
        location: 'Dalkey, Dublin',
        county: 'DUB',
        sportsSupported: ['Gaelic Football', 'Hurling']
      },
      
      // Cork clubs
      { 
        name: 'Glen Rovers', 
        location: 'Blackpool, Cork',
        county: 'COR',
        sportsSupported: ['Hurling', 'Camogie']
      },
      { 
        name: 'Nemo Rangers', 
        location: 'Trabeg, Cork',
        county: 'COR',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      { 
        name: 'St. Finbarrs', 
        location: 'Togher, Cork',
        county: 'COR',
        sportsSupported: ['Gaelic Football', 'Hurling', 'Camogie', 'Ladies Football']
      },
      
      // Kerry clubs
      { 
        name: 'Dr. Crokes', 
        location: 'Killarney, Kerry',
        county: 'KER',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      { 
        name: 'Austin Stacks', 
        location: 'Tralee, Kerry',
        county: 'KER',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      
      // Galway clubs
      { 
        name: 'Corofin', 
        location: 'Corofin, Galway',
        county: 'GAL',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      { 
        name: 'Loughrea', 
        location: 'Loughrea, Galway',
        county: 'GAL',
        sportsSupported: ['Hurling', 'Camogie']
      },
      
      // Tipperary clubs
      { 
        name: 'Thurles Sarsfields', 
        location: 'Thurles, Tipperary',
        county: 'TIP',
        sportsSupported: ['Hurling', 'Camogie']
      },
      { 
        name: 'Clonmel Commercials', 
        location: 'Clonmel, Tipperary',
        county: 'TIP',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      
      // Mayo clubs
      { 
        name: 'Castlebar Mitchels', 
        location: 'Castlebar, Mayo',
        county: 'MAY',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      { 
        name: 'Ballintubber', 
        location: 'Ballintubber, Mayo',
        county: 'MAY',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
      
      // Kilkenny clubs
      { 
        name: 'Ballyhale Shamrocks', 
        location: 'Ballyhale, Kilkenny',
        county: 'KIL',
        sportsSupported: ['Hurling', 'Camogie']
      },
      
      // Donegal clubs
      { 
        name: 'Gaoth Dobhair', 
        location: 'Gweedore, Donegal',
        county: 'DON',
        sportsSupported: ['Gaelic Football', 'Ladies Football']
      },
    ];

    const clubResults = [];

    for (const club of clubs) {
      try {
        // Store county info in the codes field for now (we can use this for filtering)
        const result = await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, "sportsSupported", codes,
            "dataSource", status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${club.name}, ${irelandCountryId}, 
            ${club.location}, ${club.sportsSupported}::text[], ${club.county},
            'SEED_DATA', 'APPROVED', NOW(), NOW()
          )
        `;
        
        clubResults.push({ success: true, club: club.name, county: club.county });
        console.log(`✅ Created club: ${club.name} (${club.county})`);
      } catch (error) {
        clubResults.push({ 
          success: false, 
          club: club.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with club ${club.name}:`, error);
      }
    }

    // Count clubs by county
    const clubsByCounty = clubs.reduce((acc, club) => {
      acc[club.county] = (acc[club.county] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return NextResponse.json({
      success: true,
      message: 'Irish clubs created successfully',
      clubResults,
      totalClubs: clubs.length,
      clubsByCounty,
      successCount: clubResults.filter(r => r.success).length
    });

  } catch (error) {
    console.error('❌ Error creating Irish clubs:', error);
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