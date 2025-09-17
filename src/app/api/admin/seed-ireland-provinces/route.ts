import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Setting up Ireland-specific provinces and counties...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // First, let's clear existing Irish regions and create provinces
    await prisma.$executeRaw`
      DELETE FROM "Region" WHERE "countryId" = ${irelandCountryId}
    `;

    // Create the 4 Irish provinces as "regions" 
    const provinces = [
      { code: 'LEINSTER', name: 'Leinster', displayOrder: 1 },
      { code: 'MUNSTER', name: 'Munster', displayOrder: 2 },
      { code: 'CONNACHT', name: 'Connacht', displayOrder: 3 },
      { code: 'ULSTER', name: 'Ulster (ROI)', displayOrder: 4 },
    ];

    const provinceResults = [];
    const provinceIds: { [key: string]: string } = {};

    for (const province of provinces) {
      try {
        const result = await prisma.$executeRaw`
          INSERT INTO "Region" (id, code, name, "countryId", "displayOrder", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${province.code}, ${province.name}, ${irelandCountryId}, ${province.displayOrder}, NOW(), NOW())
          RETURNING id
        `;
        
        // Get the inserted province ID
        const provinceRecord = await prisma.$queryRaw`
          SELECT id FROM "Region" WHERE code = ${province.code} AND "countryId" = ${irelandCountryId}
        ` as any[];
        
        if (provinceRecord.length) {
          provinceIds[province.code] = provinceRecord[0].id;
        }
        
        provinceResults.push({ success: true, province: province.name });
        console.log(`✅ Created province: ${province.name}`);
      } catch (error) {
        provinceResults.push({ 
          success: false, 
          province: province.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with province ${province.name}:`, error);
      }
    }

    // Now we need to create a new model for counties (sub-regions)
    // Since we can't modify schema dynamically, let's use a different approach
    // We'll create counties as a special type of Club with a flag indicating they're administrative units
    
    // Actually, let's create counties using the existing Region table but with a parent structure
    // We'll add counties as regions but reference their province parent in a different way
    
    const counties = [
      // Leinster counties
      { code: 'DUB', name: 'Dublin', province: 'LEINSTER' },
      { code: 'WIC', name: 'Wicklow', province: 'LEINSTER' },
      { code: 'WEX', name: 'Wexford', province: 'LEINSTER' },
      { code: 'CAR', name: 'Carlow', province: 'LEINSTER' },
      { code: 'KIL', name: 'Kilkenny', province: 'LEINSTER' },
      { code: 'LAO', name: 'Laois', province: 'LEINSTER' },
      { code: 'OFF', name: 'Offaly', province: 'LEINSTER' },
      { code: 'KID', name: 'Kildare', province: 'LEINSTER' },
      { code: 'MEA', name: 'Meath', province: 'LEINSTER' },
      { code: 'WES', name: 'Westmeath', province: 'LEINSTER' },
      { code: 'LON', name: 'Longford', province: 'LEINSTER' },
      { code: 'LOU', name: 'Louth', province: 'LEINSTER' },
      
      // Munster counties  
      { code: 'COR', name: 'Cork', province: 'MUNSTER' },
      { code: 'KER', name: 'Kerry', province: 'MUNSTER' },
      { code: 'LIM', name: 'Limerick', province: 'MUNSTER' },
      { code: 'TIP', name: 'Tipperary', province: 'MUNSTER' },
      { code: 'WAT', name: 'Waterford', province: 'MUNSTER' },
      { code: 'CLA', name: 'Clare', province: 'MUNSTER' },
      
      // Connacht counties
      { code: 'GAL', name: 'Galway', province: 'CONNACHT' },
      { code: 'MAY', name: 'Mayo', province: 'CONNACHT' },
      { code: 'SLI', name: 'Sligo', province: 'CONNACHT' },
      { code: 'LEI', name: 'Leitrim', province: 'CONNACHT' },
      { code: 'ROS', name: 'Roscommon', province: 'CONNACHT' },
      
      // Ulster (ROI) counties
      { code: 'DON', name: 'Donegal', province: 'ULSTER' },
      { code: 'CAV', name: 'Cavan', province: 'ULSTER' },
      { code: 'MON', name: 'Monaghan', province: 'ULSTER' },
    ];

    // For now, let's store counties as additional metadata in a JSON field
    // We'll create a mapping of province to counties for the frontend to use
    
    const countyResults = [];

    return NextResponse.json({
      success: true,
      message: 'Ireland provinces created successfully',
      provinceResults,
      provinceIds,
      counties,
      note: 'Counties will be handled dynamically in the frontend for Ireland-specific flow'
    });

  } catch (error) {
    console.error('❌ Error setting up Ireland provinces:', error);
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