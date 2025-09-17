import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🏔️ Importing Scandinavian GAA clubs...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    const europeUnitId = europeUnit[0].id;

    // Get all Scandinavian countries
    const countries = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId} 
      AND code IN ('DK', 'SE', 'NO', 'FI', 'IS')
      ORDER BY code
    ` as any[];

    const countryMap = countries.reduce((map: any, country: any) => {
      map[country.code] = { id: country.id, name: country.name };
      return map;
    }, {});

    // Clear existing clubs from all Scandinavian countries
    console.log('🗑️ Clearing existing Scandinavian clubs...');
    for (const country of countries) {
      await prisma.$executeRaw`
        DELETE FROM "Club" WHERE "countryId" = ${country.id}
      `;
    }

    // Scandinavian GAA clubs by country
    const clubsByCountry = {
      'DK': [
        'Aarhus GAA',
        'Copenhagen GAA Club',
        'Hillerød Wolfe Tones',
        'Odense GAA'
      ],
      'SE': [
        'Gävle GAA',
        'Sandviken Gaels',
        'Stockholm Gaels'
      ],
      'NO': [
        'Oslo GAA'
      ],
      'FI': [
        'Helsinki Harps GAA',
        'Tampere'
      ],
      'IS': [
        'Reykjavík Keltar GAA'
      ]
    };

    const locationMap = {
      'DK': 'Denmark',
      'SE': 'Sweden', 
      'NO': 'Norway',
      'FI': 'Finland',
      'IS': 'Iceland'
    };

    const results: any[] = [];

    // Import clubs for each country
    for (const [countryCode, clubs] of Object.entries(clubsByCountry)) {
      const countryInfo = countryMap[countryCode];
      if (!countryInfo) {
        console.error(`❌ Country not found: ${countryCode}`);
        continue;
      }

      for (const clubName of clubs) {
        try {
          await prisma.$executeRaw`
            INSERT INTO "Club" (
              id, name, "countryId", location, codes, "dataSource", 
              status, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${clubName}, ${countryInfo.id},
              ${locationMap[countryCode]}, ${countryCode}, 'SCANDINAVIA_GAA_USER_SCREENSHOTS',
              'APPROVED', NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            club: clubName, 
            country: countryInfo.name,
            countryCode
          });
          console.log(`✅ Imported: ${clubName} (${countryInfo.name})`);
        } catch (error) {
          results.push({ 
            success: false, 
            club: clubName, 
            country: countryInfo.name,
            countryCode,
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          console.error(`❌ Error with ${clubName}:`, error);
        }
      }
    }

    // Count clubs by country
    const countryStats = [];
    for (const country of countries) {
      const clubCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "Club" 
        WHERE "countryId" = ${country.id}
      ` as any[];
      
      countryStats.push({
        country: country.name,
        code: country.code,
        clubCount: parseInt(clubCount[0]?.count || 0)
      });
    }

    const totalClubs = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: 'Scandinavian GAA clubs imported successfully',
      source: 'User screenshots',
      totalImported: totalClubs,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      countryBreakdown: countryStats,
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error importing Scandinavian clubs:', error);
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