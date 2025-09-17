import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🇪🇺 Importing complete European GAA clubs from master CSV...');

    // Get Europe international unit
    const europeUnit = await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'EUROPE'
    ` as any[];

    if (!europeUnit.length) {
      return NextResponse.json({ error: 'Europe international unit not found' }, { status: 400 });
    }

    const europeUnitId = europeUnit[0].id;

    // Define country mapping for all countries in the CSV
    const countryMapping = {
      'Spain': { code: 'ES', name: 'Spain' },
      'Galicia, Spain': { code: 'ES-GA', name: 'Galicia - Spain' },
      'France': { code: 'FR', name: 'France' },
      'Brittany - France': { code: 'FR-BR', name: 'Brittany - France' },
      'Denmark': { code: 'DK', name: 'Denmark' },
      'Sweden': { code: 'SE', name: 'Sweden' },
      'Norway': { code: 'NO', name: 'Norway' },
      'Finland': { code: 'FI', name: 'Finland' },
      'Iceland': { code: 'IS', name: 'Iceland' },
      'Germany': { code: 'DE', name: 'Germany' },
      'Belgium': { code: 'BE', name: 'Belgium' },
      'Switzerland': { code: 'CH', name: 'Switzerland' },
      'Italy': { code: 'IT', name: 'Italy' },
      'Netherlands': { code: 'NL', name: 'Netherlands' },
      'Luxembourg': { code: 'LU', name: 'Luxembourg' },
      'Austria': { code: 'AT', name: 'Austria' },
      'Czech Republic': { code: 'CZ', name: 'Czech Republic' },
      'Poland': { code: 'PL', name: 'Poland' },
      'Russia': { code: 'RU', name: 'Russia' },
      'Ukraine': { code: 'UA', name: 'Ukraine' },
      'Gibraltar': { code: 'GI', name: 'Gibraltar' },
      'Guernsey': { code: 'GG', name: 'Guernsey' },
      'Jersey': { code: 'JE', name: 'Jersey' },
      'Croatia': { code: 'HR', name: 'Croatia' },
      'Portugal': { code: 'PT', name: 'Portugal' },
      'Slovakia': { code: 'SK', name: 'Slovakia' }
    };

    // Master club data from CSV
    const masterClubData = [
      // Spain
      { name: 'Barcelona Gaels GAA Club', country: 'Spain' },
      { name: 'Bilbao GAA', country: 'Spain' },
      { name: 'Celta Malaga', country: 'Spain' },
      { name: 'Éire Óg Sevilla', country: 'Spain' },
      { name: 'Madrid Harps', country: 'Spain' },
      { name: 'Madrid Harps Youth', country: 'Spain' },
      { name: 'Mar Menor GAA', country: 'Spain' },
      { name: 'Sitges', country: 'Spain' },
      { name: 'Tolosa Gaels', country: 'Spain' },
      { name: 'Valencia Sant Vicent', country: 'Spain' },
      { name: 'Zaragoza GAA', country: 'Spain' },
      
      // Galicia - Spain
      { name: 'A Coruña Fillos de Breogán', country: 'Galicia, Spain' },
      { name: 'Cambados Gaelico', country: 'Galicia, Spain' },
      { name: 'Irmandinhos A Estrada F. G.', country: 'Galicia, Spain' },
      { name: 'Keltoi Vigo G.A.C.', country: 'Galicia, Spain' },
      { name: 'Lavandeiras de San Simón', country: 'Galicia, Spain' },
      { name: 'Lorchos GAA', country: 'Galicia, Spain' },
      { name: 'LX Celtiberos', country: 'Galicia, Spain' },
      { name: 'Turonia GFG', country: 'Galicia, Spain' },
      { name: 'Lugh GAA', country: 'Galicia, Spain' },
      { name: 'Gróvias GAA', country: 'Galicia, Spain' },
      { name: 'Lume de Beltane', country: 'Galicia, Spain' },
      { name: 'Estrela Vermelha F.G.', country: 'Galicia, Spain' },
      
      // France
      { name: 'Agen', country: 'France' },
      { name: 'Anjou Gaels', country: 'France' },
      { name: 'Azur Gaels', country: 'France' },
      { name: 'Bordeaux Gaelic Football Club', country: 'France' },
      { name: 'Cherbourg Gaels', country: 'France' },
      { name: 'Clermont Gaelic Football Club', country: 'France' },
      { name: 'Football gaélique Le Havre', country: 'France' },
      { name: 'Football Gaélique Mondeville', country: 'France' },
      { name: 'Grenoble Alpes Gaels', country: 'France' },
      { name: 'Le Mans', country: 'France' },
      { name: 'Lille', country: 'France' },
      { name: 'Lugdunum CLG (Lyon)', country: 'France' },
      { name: 'Montpellier', country: 'France' },
      { name: 'Niort Gaels', country: 'France' },
      { name: 'Paris Gaels', country: 'France' },
      { name: 'Pas en Artois GAC', country: 'France' },
      { name: 'Pau Bearn Sports Gaeliques', country: 'France' },
      { name: 'Poitiers Gaels', country: 'France' },
      { name: 'Strasbourg Gaels', country: 'France' },
      
      // Brittany - France
      { name: 'Bro Sant Brieg', country: 'Brittany - France' },
      { name: 'FG Rostrenen', country: 'Brittany - France' },
      { name: 'Football Gaélique Pays de Redon', country: 'Brittany - France' },
      { name: 'Gaelic Football Bro Leon', country: 'Brittany - France' },
      { name: 'Gaelic Football Club Rennes - Ar Gwazi Gouez', country: 'Brittany - France' },
      { name: 'Gwen Rann (Guerande)', country: 'Brittany - France' },
      { name: 'Kerne', country: 'Brittany - France' },
      { name: 'Lorient GAC', country: 'Brittany - France' },
      { name: 'Nantes Football Gaélique', country: 'Brittany - France' },
      { name: 'Saint Coulomb GAA', country: 'Brittany - France' },
      { name: 'Stade Plouërais Football Gaélique', country: 'Brittany - France' },
      { name: 'US Liffre GAA - Entente Gaélique de Haute Bretagne', country: 'Brittany - France' },
      { name: 'Vannes', country: 'Brittany - France' },
      
      // Scandinavia
      { name: 'Aarhus GAA', country: 'Denmark' },
      { name: 'Copenhagen GAA Club', country: 'Denmark' },
      { name: 'Hillerød Wolfe Tones', country: 'Denmark' },
      { name: 'Odense GAA', country: 'Denmark' },
      { name: 'Gävle GAA', country: 'Sweden' },
      { name: 'Sandviken Gaels', country: 'Sweden' },
      { name: 'Stockholm Gaels', country: 'Sweden' },
      { name: 'Oslo GAA', country: 'Norway' },
      { name: 'Helsinki Harps GAA', country: 'Finland' },
      { name: 'Tampere', country: 'Finland' },
      { name: 'Reykjavík Keltar GAA', country: 'Iceland' },
      
      // Germany
      { name: 'Aachen GAA', country: 'Germany' },
      { name: 'Berlin', country: 'Germany' },
      { name: 'Cologne Celtics', country: 'Germany' },
      { name: 'Darmstadt', country: 'Germany' },
      { name: 'Dresden Hurling', country: 'Germany' },
      { name: 'Düsseldorf GFC', country: 'Germany' },
      { name: 'Eintracht Frankfurt GAA', country: 'Germany' },
      { name: 'Hamburg GAA', country: 'Germany' },
      { name: 'München Colmcilles GAA Club', country: 'Germany' },
      { name: 'Setanta Berlin', country: 'Germany' },
      { name: 'Stuttgart GAA', country: 'Germany' },
      { name: 'Augsburg', country: 'Germany' },
      
      // New countries with clubs
      { name: 'Brussels Craobh Rua', country: 'Belgium' },
      { name: 'European Communities Gaelic Club', country: 'Belgium' },
      { name: 'The Earls of Leuven', country: 'Belgium' },
      { name: 'Basel GAA', country: 'Switzerland' },
      { name: 'Bern GAA', country: 'Switzerland' },
      { name: 'Geneva Gaels', country: 'Switzerland' },
      { name: 'Zürich Inneoin GAA Club', country: 'Switzerland' },
      { name: 'Rome Hibernia GAA', country: 'Italy' },
      { name: 'Sant\'Ambrogio Milano GAA', country: 'Italy' },
      { name: 'Amsterdam', country: 'Netherlands' },
      { name: 'Den Haag GAA', country: 'Netherlands' },
      { name: 'Eindhoven Shamrocks', country: 'Netherlands' },
      { name: 'Groningen Gaels', country: 'Netherlands' },
      { name: 'Maastricht Gaels', country: 'Netherlands' },
      { name: 'Nijmegen', country: 'Netherlands' },
      { name: 'Gaelic Sports Club Luxembourg', country: 'Luxembourg' },
      { name: 'Salzburg', country: 'Austria' },
      { name: 'Vienna Gaels GAA Club', country: 'Austria' },
      { name: 'Prague Hibernians GAA', country: 'Czech Republic' },
      { name: 'Píobairí Strakonice GAC', country: 'Czech Republic' },
      { name: 'Cumann Warszawa', country: 'Poland' },
      { name: 'Bydgoszcz', country: 'Poland' },
      { name: 'Olstzyn Gaels', country: 'Poland' },
      { name: 'Wroclaw', country: 'Poland' },
      { name: 'Moscow Shamrocks GAA Club', country: 'Russia' },
      { name: 'Seamus Heaney\'s GAC', country: 'Russia' },
      { name: 'Kyiv Gaels', country: 'Ukraine' },
      { name: 'Gibraltar Gaels', country: 'Gibraltar' },
      { name: 'Guernsey', country: 'Guernsey' },
      { name: 'Jersey Irish GAA', country: 'Jersey' },
      { name: 'Croatian Celts', country: 'Croatia' },
      { name: 'Herdeiros de Dhais F.G.', country: 'Portugal' },
      { name: 'Slovak Shamrocks GFC', country: 'Slovakia' }
    ];

    // Get existing countries
    const existingCountries = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId}
    ` as any[];

    const existingCountryMap = existingCountries.reduce((map: any, country: any) => {
      map[country.code] = { id: country.id, name: country.name };
      return map;
    }, {});

    // Add missing countries
    let newCountriesAdded = 0;
    let maxDisplayOrder = Math.max(...existingCountries.map((c: any) => c.displayOrder || 0));

    for (const [csvCountry, countryInfo] of Object.entries(countryMapping)) {
      if (!existingCountryMap[countryInfo.code]) {
        maxDisplayOrder++;
        try {
          await prisma.$executeRaw`
            INSERT INTO "Country" (
              id, code, name, "hasRegions", "internationalUnitId", "displayOrder", "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), ${countryInfo.code}, ${countryInfo.name}, false, ${europeUnitId}, ${maxDisplayOrder}, NOW(), NOW()
            )
          `;
          newCountriesAdded++;
          console.log(`✅ Added country: ${countryInfo.name} (${countryInfo.code})`);
        } catch (error) {
          console.error(`❌ Error adding country ${countryInfo.name}:`, error);
        }
      }
    }

    // Refresh country map after adding new countries
    const allCountries = await prisma.$queryRaw`
      SELECT id, code, name FROM "Country" 
      WHERE "internationalUnitId" = ${europeUnitId}
    ` as any[];

    const countryMap = allCountries.reduce((map: any, country: any) => {
      map[country.code] = { id: country.id, name: country.name };
      return map;
    }, {});

    // Clear all existing European clubs
    console.log('🗑️ Clearing all existing European clubs...');
    for (const country of allCountries) {
      await prisma.$executeRaw`
        DELETE FROM "Club" WHERE "countryId" = ${country.id}
      `;
    }

    // Import all clubs
    const results: any[] = [];
    const countryStats: any = {};

    for (const clubData of masterClubData) {
      const countryMapping_entry = countryMapping[clubData.country as keyof typeof countryMapping];
      if (!countryMapping_entry) {
        console.error(`❌ No mapping found for country: ${clubData.country}`);
        continue;
      }

      const countryInfo = countryMap[countryMapping_entry.code];
      if (!countryInfo) {
        console.error(`❌ Country not found in database: ${countryMapping_entry.code}`);
        continue;
      }

      try {
        await prisma.$executeRaw`
          INSERT INTO "Club" (
            id, name, "countryId", location, codes, "dataSource", 
            status, "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${clubData.name}, ${countryInfo.id},
            ${countryInfo.name}, ${countryMapping_entry.code}, 'EUROPE_MASTER_CSV_USER_SCREENSHOTS',
            'APPROVED', NOW(), NOW()
          )
        `;
        
        results.push({ 
          success: true, 
          club: clubData.name, 
          country: countryInfo.name,
          countryCode: countryMapping_entry.code
        });

        // Update country stats
        if (!countryStats[countryInfo.name]) {
          countryStats[countryInfo.name] = { code: countryMapping_entry.code, count: 0 };
        }
        countryStats[countryInfo.name].count++;

        console.log(`✅ Imported: ${clubData.name} (${countryInfo.name})`);
      } catch (error) {
        results.push({ 
          success: false, 
          club: clubData.name, 
          country: countryInfo.name,
          countryCode: countryMapping_entry.code,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Error with ${clubData.name}:`, error);
      }
    }

    const totalClubs = results.filter(r => r.success).length;
    const totalCountries = Object.keys(countryStats).length;

    return NextResponse.json({
      success: true,
      message: 'European GAA clubs imported successfully from master CSV',
      source: 'Master CSV - User screenshots',
      newCountriesAdded,
      totalCountries,
      totalClubs,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
      countryBreakdown: Object.entries(countryStats).map(([name, data]: [string, any]) => ({
        country: name,
        code: data.code,
        clubCount: data.count
      })).sort((a, b) => a.country.localeCompare(b.country)),
      errors: results.filter(r => !r.success)
    });

  } catch (error) {
    console.error('❌ Error importing European clubs:', error);
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