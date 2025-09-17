import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌍 Seeding all countries for all International Units...');

    // Get all international units
    const units = await prisma.$queryRaw`
      SELECT id, code, name FROM "InternationalUnit" ORDER BY "displayOrder"
    ` as any[];

    const unitMap: { [key: string]: string } = {};
    units.forEach((unit: any) => {
      unitMap[unit.code] = unit.id;
    });

    // Comprehensive list of countries by international unit
    const countries = [
      // Ireland
      { code: 'IE', name: 'Ireland', unit: 'IRELAND', hasRegions: true, displayOrder: 1 },
      
      // Britain
      { code: 'GB', name: 'Great Britain', unit: 'BRITAIN', hasRegions: true, displayOrder: 1 },
      { code: 'NI', name: 'Northern Ireland', unit: 'BRITAIN', hasRegions: true, displayOrder: 2 },
      
      // Europe
      { code: 'FR', name: 'France', unit: 'EUROPE', hasRegions: false, displayOrder: 1 },
      { code: 'DE', name: 'Germany', unit: 'EUROPE', hasRegions: false, displayOrder: 2 },
      { code: 'ES', name: 'Spain', unit: 'EUROPE', hasRegions: false, displayOrder: 3 },
      { code: 'IT', name: 'Italy', unit: 'EUROPE', hasRegions: false, displayOrder: 4 },
      { code: 'NL', name: 'Netherlands', unit: 'EUROPE', hasRegions: false, displayOrder: 5 },
      { code: 'BE', name: 'Belgium', unit: 'EUROPE', hasRegions: false, displayOrder: 6 },
      { code: 'CH', name: 'Switzerland', unit: 'EUROPE', hasRegions: false, displayOrder: 7 },
      { code: 'AT', name: 'Austria', unit: 'EUROPE', hasRegions: false, displayOrder: 8 },
      { code: 'LU', name: 'Luxembourg', unit: 'EUROPE', hasRegions: false, displayOrder: 9 },
      { code: 'PT', name: 'Portugal', unit: 'EUROPE', hasRegions: false, displayOrder: 10 },
      { code: 'NO', name: 'Norway', unit: 'EUROPE', hasRegions: false, displayOrder: 11 },
      { code: 'SE', name: 'Sweden', unit: 'EUROPE', hasRegions: false, displayOrder: 12 },
      { code: 'DK', name: 'Denmark', unit: 'EUROPE', hasRegions: false, displayOrder: 13 },
      { code: 'FI', name: 'Finland', unit: 'EUROPE', hasRegions: false, displayOrder: 14 },
      
      // North America
      { code: 'US', name: 'United States', unit: 'NORTH_AMERICA', hasRegions: true, displayOrder: 1 },
      { code: 'CA', name: 'Canada', unit: 'NORTH_AMERICA', hasRegions: true, displayOrder: 2 },
      { code: 'MX', name: 'Mexico', unit: 'NORTH_AMERICA', hasRegions: false, displayOrder: 3 },
      
      // Australasia
      { code: 'AU', name: 'Australia', unit: 'AUSTRALASIA', hasRegions: true, displayOrder: 1 },
      { code: 'NZ', name: 'New Zealand', unit: 'AUSTRALASIA', hasRegions: false, displayOrder: 2 },
      
      // Asia
      { code: 'JP', name: 'Japan', unit: 'ASIA', hasRegions: false, displayOrder: 1 },
      { code: 'CN', name: 'China', unit: 'ASIA', hasRegions: false, displayOrder: 2 },
      { code: 'KR', name: 'South Korea', unit: 'ASIA', hasRegions: false, displayOrder: 3 },
      { code: 'SG', name: 'Singapore', unit: 'ASIA', hasRegions: false, displayOrder: 4 },
      { code: 'HK', name: 'Hong Kong', unit: 'ASIA', hasRegions: false, displayOrder: 5 },
      { code: 'TH', name: 'Thailand', unit: 'ASIA', hasRegions: false, displayOrder: 6 },
      { code: 'MY', name: 'Malaysia', unit: 'ASIA', hasRegions: false, displayOrder: 7 },
      { code: 'IN', name: 'India', unit: 'ASIA', hasRegions: false, displayOrder: 8 },
      { code: 'PH', name: 'Philippines', unit: 'ASIA', hasRegions: false, displayOrder: 9 },
      { code: 'ID', name: 'Indonesia', unit: 'ASIA', hasRegions: false, displayOrder: 10 },
      { code: 'VN', name: 'Vietnam', unit: 'ASIA', hasRegions: false, displayOrder: 11 },
      
      // Middle East
      { code: 'AE', name: 'United Arab Emirates', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 1 },
      { code: 'SA', name: 'Saudi Arabia', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 2 },
      { code: 'QA', name: 'Qatar', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 3 },
      { code: 'KW', name: 'Kuwait', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 4 },
      { code: 'OM', name: 'Oman', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 5 },
      { code: 'BH', name: 'Bahrain', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 6 },
      { code: 'IL', name: 'Israel', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 7 },
      { code: 'JO', name: 'Jordan', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 8 },
      { code: 'LB', name: 'Lebanon', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 9 },
      { code: 'IR', name: 'Iran', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 10 },
      { code: 'TR', name: 'Turkey', unit: 'MIDDLE_EAST', hasRegions: false, displayOrder: 11 },
      
      // Africa
      { code: 'ZA', name: 'South Africa', unit: 'AFRICA', hasRegions: false, displayOrder: 1 },
      { code: 'NG', name: 'Nigeria', unit: 'AFRICA', hasRegions: false, displayOrder: 2 },
      { code: 'KE', name: 'Kenya', unit: 'AFRICA', hasRegions: false, displayOrder: 3 },
      { code: 'EG', name: 'Egypt', unit: 'AFRICA', hasRegions: false, displayOrder: 4 },
      { code: 'MA', name: 'Morocco', unit: 'AFRICA', hasRegions: false, displayOrder: 5 },
      { code: 'GH', name: 'Ghana', unit: 'AFRICA', hasRegions: false, displayOrder: 6 },
      { code: 'TZ', name: 'Tanzania', unit: 'AFRICA', hasRegions: false, displayOrder: 7 },
      { code: 'UG', name: 'Uganda', unit: 'AFRICA', hasRegions: false, displayOrder: 8 },
      { code: 'RW', name: 'Rwanda', unit: 'AFRICA', hasRegions: false, displayOrder: 9 },
      { code: 'ET', name: 'Ethiopia', unit: 'AFRICA', hasRegions: false, displayOrder: 10 },
      
      // Rest of World
      { code: 'AR', name: 'Argentina', unit: 'REST_WORLD', hasRegions: false, displayOrder: 1 },
      { code: 'BR', name: 'Brazil', unit: 'REST_WORLD', hasRegions: false, displayOrder: 2 },
      { code: 'CL', name: 'Chile', unit: 'REST_WORLD', hasRegions: false, displayOrder: 3 },
      { code: 'CO', name: 'Colombia', unit: 'REST_WORLD', hasRegions: false, displayOrder: 4 },
      { code: 'PE', name: 'Peru', unit: 'REST_WORLD', hasRegions: false, displayOrder: 5 },
      { code: 'UY', name: 'Uruguay', unit: 'REST_WORLD', hasRegions: false, displayOrder: 6 },
      { code: 'PY', name: 'Paraguay', unit: 'REST_WORLD', hasRegions: false, displayOrder: 7 },
      { code: 'EC', name: 'Ecuador', unit: 'REST_WORLD', hasRegions: false, displayOrder: 8 },
      { code: 'BO', name: 'Bolivia', unit: 'REST_WORLD', hasRegions: false, displayOrder: 9 },
      { code: 'VE', name: 'Venezuela', unit: 'REST_WORLD', hasRegions: false, displayOrder: 10 },
    ];

    const results = [];

    for (const country of countries) {
      try {
        const unitId = unitMap[country.unit];
        if (!unitId) {
          results.push({ 
            success: false, 
            country: country.name, 
            error: `International unit ${country.unit} not found` 
          });
          continue;
        }

        const result = await prisma.$executeRaw`
          INSERT INTO "Country" (id, code, name, "internationalUnitId", "hasRegions", "displayOrder", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${country.code}, ${country.name}, ${unitId}, ${country.hasRegions}, ${country.displayOrder}, NOW(), NOW())
          ON CONFLICT (code)
          DO UPDATE SET 
            name = ${country.name},
            "internationalUnitId" = ${unitId},
            "hasRegions" = ${country.hasRegions},
            "displayOrder" = ${country.displayOrder},
            "updatedAt" = NOW()
        `;
        
        results.push({ success: true, country: country.name, result });
        console.log(`✅ Created/Updated: ${country.name} (${country.unit})`);
      } catch (error) {
        results.push({ 
          success: false, 
          country: country.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${country.name}:`, error);
      }
    }

    // Count the records
    const countResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Country"`;
    const count = Array.isArray(countResult) && countResult[0] ? (countResult[0] as any).count : 0;
    
    console.log(`📊 Total countries in database: ${count}`);

    return NextResponse.json({
      success: true,
      message: 'All countries seeded successfully',
      results,
      totalCount: parseInt(count),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('❌ Error seeding countries:', error);
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