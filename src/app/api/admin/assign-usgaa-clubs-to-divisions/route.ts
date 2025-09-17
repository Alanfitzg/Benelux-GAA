import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🏟️ Assigning USGAA clubs to their divisions...');

    // Get USA GAA country
    const usaGaaUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'USA_GAA'
    ` as any[];

    if (!usaGaaUnit.length) {
      return NextResponse.json({ error: 'USA GAA international unit not found' }, { status: 400 });
    }

    const usaCountry = await prisma.$queryRaw`
      SELECT id FROM "Country" WHERE "internationalUnitId" = ${usaGaaUnit[0].id} AND code = 'USA-GAA'
    ` as any[];

    if (!usaCountry.length) {
      return NextResponse.json({ error: 'USA country not found under USA GAA' }, { status: 400 });
    }

    const usaCountryId = usaCountry[0].id;

    // Get all regions (divisions)
    const regions = await prisma.$queryRaw`
      SELECT id, code, name FROM "Region" WHERE "countryId" = ${usaCountryId}
    ` as any[];

    const regionMap = regions.reduce((map: any, region: any) => {
      map[region.code] = { id: region.id, name: region.name };
      return map;
    }, {});

    // Define club to division mapping based on location patterns
    const clubDivisionMapping = [
      // Boston Division
      { pattern: /Boston|Gaelic|Connemara|Cork Boston|Galway Boston|Kerry Boston|Mayo Boston|Wolfe Tones Boston|Shannon Blues|Christopher's|Aidan McAnespies|Dublin Boston|Tipperary.*Boston|Fr\. Tom Burke|Wexford.*Boston|Connacht Ladies|Tir na nOg|Eire Og Camogie|Shamrocks.*Camogie/, division: 'BOSTON' },
      
      // Chicago Division
      { pattern: /Chicago|Parnells|McBrides|St\. Jarlath|Limerick Chicago|Padraig Pearse|Erin Rovers|James Joyce|Cusacks.*Club|St\. Vincent.*Club|Michael Cusack.*Ladies/, division: 'CHICAGO' },
      
      // Philadelphia Division
      { pattern: /Philadelphia|Delco Gaels|Donegal Philadelphia|Tyrone Philadelphia|Young Irelands Philadelphia|Kevin Barry|Mayo Philadelphia|Shamrocks Ladies|Tóraidhe|Allentown/, division: 'PHILADELPHIA' },
      
      // San Francisco Division
      { pattern: /San Francisco|Ulster San Francisco|Shannon Rangers|Young Irelanders San Francisco|Na Fianna San Francisco|Michael Cusack.*San Francisco|FOG City|Celts Hurling Club/, division: 'SAN_FRANCISCO' },
      
      // Mid-Atlantic Division
      { pattern: /Washington|Baltimore|Alexandria|Virginia|Coastal Virginia/, division: 'MID_ATLANTIC' },
      
      // Midwest Division
      { pattern: /Detroit|Cleveland|Pittsburgh|Milwaukee|Buffalo|Rochester/, division: 'MIDWEST' },
      
      // Northwest Division
      { pattern: /Seattle|Portland/, division: 'NORTHWEST' },
      
      // South Division
      { pattern: /Charlotte|Atlanta|Orlando|Raleigh|Charleston/, division: 'SOUTH' },
      
      // South Central Division
      { pattern: /Dallas|Austin|San Antonio|Houston/, division: 'SOUTH_CENTRAL' },
      
      // Southwest Division
      { pattern: /San Diego|Phoenix|Las Vegas|Los Angeles/, division: 'SOUTHWEST' },
      
      // Twin Cities Division
      { pattern: /Twin Cities|Minnesota/, division: 'TWIN_CITIES' },
      
      // Florida Division
      { pattern: /Tampa Bay|Jacksonville|Fort Lauderdale|Miami/, division: 'FLORIDA' }
    ];

    // Get all USGAA clubs
    const clubs = await prisma.$queryRaw`
      SELECT id, name FROM "Club" WHERE "countryId" = ${usaCountryId}
    ` as any[];

    const results = [];

    // Assign each club to its division
    for (const club of clubs) {
      let assignedDivision = null;
      
      // Find matching division based on club name
      for (const mapping of clubDivisionMapping) {
        if (mapping.pattern.test(club.name)) {
          assignedDivision = mapping.division;
          break;
        }
      }

      if (!assignedDivision) {
        results.push({
          success: false,
          club: club.name,
          error: 'No matching division found'
        });
        continue;
      }

      const regionInfo = regionMap[assignedDivision];
      if (!regionInfo) {
        results.push({
          success: false,
          club: club.name,
          error: `Division ${assignedDivision} not found in regions`
        });
        continue;
      }

      try {
        // Update club with region assignment
        await prisma.$executeRaw`
          UPDATE "Club" 
          SET "regionId" = ${regionInfo.id}, "updatedAt" = NOW()
          WHERE id = ${club.id}
        `;
        
        results.push({
          success: true,
          club: club.name,
          division: regionInfo.name,
          divisionCode: assignedDivision
        });
        console.log(`✅ Assigned: ${club.name} → ${regionInfo.name}`);
      } catch (error) {
        results.push({
          success: false,
          club: club.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Error with ${club.name}:`, error);
      }
    }

    // Count clubs by division
    const divisionStats = [];
    for (const region of regions) {
      const clubCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "Club" 
        WHERE "regionId" = ${region.id}
      ` as any[];
      
      divisionStats.push({
        division: region.name,
        code: region.code,
        clubCount: parseInt(clubCount[0]?.count || 0)
      });
    }

    const totalAssigned = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: 'USGAA clubs assigned to divisions successfully',
      totalClubs: clubs.length,
      totalAssigned,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      divisionBreakdown: divisionStats.sort((a, b) => a.division.localeCompare(b.division)),
      errors: results.filter(r => !r.success),
      assignments: results.filter(r => r.success).slice(0, 10) // Show first 10 assignments
    });

  } catch (error) {
    console.error('❌ Error assigning USGAA clubs to divisions:', error);
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