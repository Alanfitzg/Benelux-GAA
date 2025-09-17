import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌎 Importing Rest of World GAA clubs...');

    // Get Rest of World international unit
    const restWorldUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'REST_WORLD'
    ` as any[];

    if (!restWorldUnit.length) {
      return NextResponse.json({ error: 'Rest of World international unit not found' }, { status: 400 });
    }

    const restWorldUnitId = restWorldUnit[0].id;

    // Club data organized by country
    const clubsByCountry = {
      'South Africa': ['South Africa Gaels', 'Pretoria Harps', 'Durban Gaels', 'Cape Town GAA'],
      'Uganda': ['Kampala Gaels'],
      'Argentina': ['Hurling Club of Buenos Aires', 'St. Brendan\'s Buenos Aires']
    };

    // Get existing countries in Rest of World
    const restWorldCountries = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${restWorldUnitId}
    ` as any[];

    // Create a map of country names to IDs
    const countryMap: any = {};
    restWorldCountries.forEach((country: any) => {
      countryMap[country.name] = country.id;
    });

    // Verify all countries exist
    for (const countryName of Object.keys(clubsByCountry)) {
      if (!countryMap[countryName]) {
        return NextResponse.json({ 
          error: `Country '${countryName}' not found in Rest of World international unit` 
        }, { status: 400 });
      }
    }

    // Clear existing clubs from the countries we're importing
    console.log('🗑️ Clearing existing clubs from target countries...');
    for (const countryName of Object.keys(clubsByCountry)) {
      const countryId = countryMap[countryName];
      await prisma.$executeRaw`
        DELETE FROM "Club" WHERE "countryId" = ${countryId}
      `;
      console.log(`🗑️ Cleared existing clubs from ${countryName}`);
    }

    // Import all clubs
    const results: any[] = [];
    const countryStats: any = {};

    for (const [countryName, clubs] of Object.entries(clubsByCountry)) {
      const countryId = countryMap[countryName];
      countryStats[countryName] = { count: 0 };

      for (const clubName of clubs) {
        try {
          // Get country code for the codes field
          const country = restWorldCountries.find((c: any) => c.name === countryName);
          const countryCode = country?.code || 'ROW';

          await prisma.$executeRaw`
            INSERT INTO "Club" (
              id, name, "countryId", location, codes, "dataSource", 
              status, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${clubName}, ${countryId},
              ${countryName}, ${countryCode}, 
              'GAA_AFRICA_LATIN_AMERICA_CLUB_RECORDS',
              'APPROVED', NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            club: clubName, 
            country: countryName
          });

          countryStats[countryName].count++;
          console.log(`✅ Imported: ${clubName} (${countryName})`);
        } catch (error) {
          results.push({ 
            success: false, 
            club: clubName, 
            country: countryName,
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          console.error(`❌ Error with ${clubName}:`, error);
        }
      }
    }

    const totalClubs = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: 'Rest of World GAA clubs imported successfully',
      source: 'GAA Africa / Latin America club records',
      totalClubs,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      countryBreakdown: Object.entries(countryStats).map(([country, data]: [string, any]) => ({
        country,
        clubCount: data.count
      })).sort((a, b) => a.country.localeCompare(b.country)),
      errors: results.filter(r => !r.success),
      note: 'Imported clubs for South Africa, Uganda, and Argentina'
    });

  } catch (error) {
    console.error('❌ Error importing Rest of World clubs:', error);
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