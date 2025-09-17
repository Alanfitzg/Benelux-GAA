import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇮🇪 Adding all Ulster counties to database...');

    // Get Ireland country ID
    const irelandCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE code = 'IE'
    ` as any[];

    if (!irelandCountry.length) {
      return NextResponse.json({ error: 'Ireland country not found' }, { status: 400 });
    }

    const irelandCountryId = irelandCountry[0].id;

    // All Ulster counties with their codes
    const ulsterCounties = [
      { name: 'Antrim', code: 'ANT' },
      { name: 'Armagh', code: 'ARM' },
      { name: 'Cavan', code: 'CAV' },
      { name: 'Derry', code: 'DER' },
      { name: 'Donegal', code: 'DON' },
      { name: 'Down', code: 'DOW' },
      { name: 'Fermanagh', code: 'FER' },
      { name: 'Monaghan', code: 'MON' },
      { name: 'Tyrone', code: 'TYR' }
    ];

    const results = [];

    for (const county of ulsterCounties) {
      try {
        // Check if county already exists
        const existingCounty = await prisma.$queryRaw`
          SELECT id FROM "County" 
          WHERE name = ${county.name} 
          AND "countryId" = ${irelandCountryId}
        ` as any[];

        if (existingCounty.length > 0) {
          results.push({ 
            success: true, 
            county: county.name, 
            message: 'Already exists',
            code: county.code
          });
          console.log(`✓ County already exists: ${county.name}`);
        } else {
          // Insert new county
          await prisma.$executeRaw`
            INSERT INTO "County" (
              id, name, "countryId", code, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${county.name}, ${irelandCountryId}, 
              ${county.code}, NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            county: county.name, 
            message: 'Added successfully',
            code: county.code
          });
          console.log(`✅ Added county: ${county.name} (${county.code})`);
        }
      } catch (error) {
        results.push({ 
          success: false, 
          county: county.name,
          code: county.code,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${county.name}:`, error);
      }
    }

    // Get all counties for Ireland to verify
    const allIrishCounties = await prisma.$queryRaw`
      SELECT name, code 
      FROM "County" 
      WHERE "countryId" = ${irelandCountryId}
      ORDER BY name
    ` as any[];

    return NextResponse.json({
      success: true,
      message: 'Ulster counties processed successfully',
      results: results,
      totalCountiesInIreland: allIrishCounties.length,
      allIrishCounties: allIrishCounties,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('❌ Error adding Ulster counties:', error);
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