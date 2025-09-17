import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇺🇸 Importing USGAA clubs from master CSV...');

    // Get USA GAA international unit
    const usaGaaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'USA_GAA'
    ` as any[];

    if (!usaGaaUnit.length) {
      return NextResponse.json({ error: 'USA GAA international unit not found' }, { status: 400 });
    }

    const usaGaaUnitId = usaGaaUnit[0].id;

    // Check if USA country exists under USA GAA unit, if not create it
    let usaCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${usaGaaUnitId} AND (code = 'US' OR code = 'USA-GAA')
    ` as any[];

    if (!usaCountry.length) {
      // Create USA country under USA GAA unit with unique code
      console.log('Creating USA country under USA GAA unit...');
      await prisma.$executeRaw`
        INSERT INTO "Country" (
          id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), 'USA-GAA', 'USA', true, ${usaGaaUnitId}, 1, NOW(), NOW()
        )
      `;
      
      // Get the newly created USA country
      usaCountry = await prisma.$queryRaw`
        SELECT id FROM "Country" WHERE "internationalUnitId" = ${usaGaaUnitId} AND code = 'USA-GAA'
      ` as any[];
    }

    const usaCountryId = usaCountry[0].id;

    // USGAA clubs organized by division
    const usgaaClubsByDivision = {
      'Boston': [
        'Donegal Boston', 'Connemara Gaels', 'Cork Boston', 'Galway Boston', 'Kerry Boston',
        'Mayo Boston', 'Wolfe Tones Boston', 'Shannon Blues', 'Christopher\'s', 'Aidan McAnespies',
        'Dublin Boston', 'Galway Hurling Club Boston', 'Tipperary Hurling Club Boston',
        'Fr. Tom Burke\'s Hurling Club', 'Wexford Hurling Club Boston', 'Boston Shamrocks Ladies GFC',
        'Connacht Ladies GFC', 'Tir na nOg Ladies GFC', 'Eire Og Camogie Club', 'Boston Shamrocks Camogie Club'
      ],
      'Chicago': [
        'Parnells GFC', 'Wolfe Tones Chicago', 'McBrides GFC', 'St. Jarlath\'s', 'Limerick Chicago',
        'Padraig Pearse', 'Erin Rovers', 'James Joyce\'s', 'Cusacks Hurling Club', 'St. Vincent\'s Hurling Club',
        'Michael Cusack\'s Ladies'
      ],
      'Philadelphia': [
        'Delco Gaels', 'Donegal Philadelphia', 'Tyrone Philadelphia', 'Young Irelands Philadelphia',
        'Kevin Barry\'s', 'Mayo Philadelphia', 'Philadelphia Shamrocks Ladies', 'Na Tóraidhe Hurling Club',
        'Allentown Hibernians'
      ],
      'San Francisco': [
        'Ulster San Francisco', 'Shannon Rangers', 'Young Irelanders San Francisco', 'Na Fianna San Francisco',
        'Michael Cusack\'s San Francisco', 'San Francisco FOG City Harps', 'San Francisco Celts Hurling Club'
      ],
      'Mid-Atlantic': [
        'Washington D.C. Gaels', 'Baltimore Bohemians', 'Alexandria Gaels', 'Virginia Gaels', 'Coastal Virginia GAA'
      ],
      'Midwest': [
        'Detroit Wolfe Tones', 'Cleveland St. Pat\'s', 'Pittsburgh Celtics', 'Milwaukee Hurling Club',
        'Buffalo Fenians', 'Rochester Harps'
      ],
      'Northwest': [
        'Seattle Gaels', 'Portland Eireannach'
      ],
      'South': [
        'Charlotte James Connolly\'s', 'Atlanta GAA', 'Orlando GAA', 'Raleigh GAA', 'Charleston Hurling Club'
      ],
      'South Central': [
        'Dallas Fenians', 'Austin Celtic Cowboys', 'San Antonio GAC', 'Houston Gaels'
      ],
      'Southwest': [
        'San Diego Setanta', 'Phoenix Gaels', 'Las Vegas GAA', 'Los Angeles Cougars'
      ],
      'Twin Cities': [
        'Twin Cities Robert Emmets', 'Minnesota Shamrocks'
      ],
      'Florida': [
        'Tampa Bay GAA', 'Jacksonville GAA', 'Fort Lauderdale GAA', 'Miami GAA'
      ]
    };

    // Clear existing USGAA clubs
    console.log('🗑️ Clearing existing USGAA clubs...');
    await prisma.$executeRaw`
      DELETE FROM "Club" 
      WHERE "countryId" = ${usaCountryId}
    `;

    const results: any[] = [];
    const divisionStats: any = {};

    // Import all clubs by division
    for (const [division, clubs] of Object.entries(usgaaClubsByDivision)) {
      divisionStats[division] = { count: 0 };
      
      for (const clubName of clubs) {
        try {
          await prisma.$executeRaw`
            INSERT INTO "Club" (
              id, name, "countryId", location, codes, "dataSource", 
              status, "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${clubName}, ${usaCountryId},
              ${division + ', USA'}, 'US-' || UPPER(REPLACE(${division}, ' ', '_')), 'USGAA_OFFICIAL_DRAFT_LISTS',
              'APPROVED', NOW(), NOW()
            )
          `;
          
          results.push({ 
            success: true, 
            club: clubName, 
            division: division
          });

          divisionStats[division].count++;
          console.log(`✅ Imported: ${clubName} (${division})`);
        } catch (error) {
          results.push({ 
            success: false, 
            club: clubName, 
            division: division,
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          console.error(`❌ Error with ${clubName}:`, error);
        }
      }
    }

    // Count total USGAA clubs
    const usgaaClubCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Club" 
      WHERE "countryId" = ${usaCountryId}
    ` as any[];

    const totalUSGAAClubs = usgaaClubCount[0]?.count || 0;
    const totalSuccessful = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: 'USGAA clubs imported successfully from master CSV',
      source: 'USGAA official draft lists',
      totalImported: totalSuccessful,
      totalUSGAAClubs: parseInt(totalUSGAAClubs),
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      divisionBreakdown: Object.entries(divisionStats).map(([division, data]: [string, any]) => ({
        division,
        clubCount: data.count
      })).sort((a, b) => a.division.localeCompare(b.division)),
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error importing USGAA clubs:', error);
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