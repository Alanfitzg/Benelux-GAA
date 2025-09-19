import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInternationalUnits() {
  console.log('🌍 Seeding International Units, Countries, and Regions...');

  try {
    // Create International Units
    const units = [
      { code: 'IRELAND', name: 'Ireland', displayOrder: 1 },
      { code: 'BRITAIN', name: 'Britain', displayOrder: 2 },
      { code: 'EUROPE', name: 'Europe', displayOrder: 3 },
      { code: 'NORTH_AMERICA', name: 'North America', displayOrder: 4 },
      { code: 'AUSTRALASIA', name: 'Australasia', displayOrder: 5 },
      { code: 'ASIA', name: 'Asia', displayOrder: 6 },
      { code: 'MIDDLE_EAST', name: 'Middle East', displayOrder: 7 },
      { code: 'AFRICA', name: 'Africa', displayOrder: 8 },
      { code: 'REST_WORLD', name: 'Rest of World', displayOrder: 9 },
    ];

    for (const unit of units) {
      await prisma.internationalUnit.upsert({
        where: { code: unit.code },
        update: unit,
        create: unit,
      });
    }

    console.log('✅ International Units created');

    // Create Countries
    const countries = [
      // Ireland
      { code: 'IE', name: 'Ireland', unit: 'IRELAND', hasRegions: true },
      
      // Britain
      { code: 'GB', name: 'Great Britain', unit: 'BRITAIN', hasRegions: true },
      { code: 'NI', name: 'Northern Ireland', unit: 'BRITAIN', hasRegions: true },
      
      // Europe
      { code: 'FR', name: 'France', unit: 'EUROPE', hasRegions: false },
      { code: 'DE', name: 'Germany', unit: 'EUROPE', hasRegions: false },
      { code: 'ES', name: 'Spain', unit: 'EUROPE', hasRegions: false },
      { code: 'IT', name: 'Italy', unit: 'EUROPE', hasRegions: false },
      { code: 'NL', name: 'Netherlands', unit: 'EUROPE', hasRegions: false },
      { code: 'BE', name: 'Belgium', unit: 'EUROPE', hasRegions: false },
      { code: 'CH', name: 'Switzerland', unit: 'EUROPE', hasRegions: false },
      { code: 'AT', name: 'Austria', unit: 'EUROPE', hasRegions: false },
      { code: 'LU', name: 'Luxembourg', unit: 'EUROPE', hasRegions: false },
      
      // North America
      { code: 'US', name: 'United States', unit: 'NORTH_AMERICA', hasRegions: true },
      { code: 'CA', name: 'Canada', unit: 'NORTH_AMERICA', hasRegions: true },
      { code: 'MX', name: 'Mexico', unit: 'NORTH_AMERICA', hasRegions: false },
      
      // Australasia
      { code: 'AU', name: 'Australia', unit: 'AUSTRALASIA', hasRegions: true },
      { code: 'NZ', name: 'New Zealand', unit: 'AUSTRALASIA', hasRegions: false },
      
      // Asia
      { code: 'JP', name: 'Japan', unit: 'ASIA', hasRegions: false },
      { code: 'CN', name: 'China', unit: 'ASIA', hasRegions: false },
      { code: 'KR', name: 'South Korea', unit: 'ASIA', hasRegions: false },
      { code: 'SG', name: 'Singapore', unit: 'ASIA', hasRegions: false },
      { code: 'HK', name: 'Hong Kong', unit: 'ASIA', hasRegions: false },
      { code: 'TH', name: 'Thailand', unit: 'ASIA', hasRegions: false },
      { code: 'MY', name: 'Malaysia', unit: 'ASIA', hasRegions: false },
      { code: 'IN', name: 'India', unit: 'ASIA', hasRegions: false },
      
      // Middle East
      { code: 'AE', name: 'United Arab Emirates', unit: 'MIDDLE_EAST', hasRegions: false },
      { code: 'SA', name: 'Saudi Arabia', unit: 'MIDDLE_EAST', hasRegions: false },
      { code: 'QA', name: 'Qatar', unit: 'MIDDLE_EAST', hasRegions: false },
      { code: 'KW', name: 'Kuwait', unit: 'MIDDLE_EAST', hasRegions: false },
      { code: 'OM', name: 'Oman', unit: 'MIDDLE_EAST', hasRegions: false },
      { code: 'BH', name: 'Bahrain', unit: 'MIDDLE_EAST', hasRegions: false },
      
      // Africa
      { code: 'ZA', name: 'South Africa', unit: 'AFRICA', hasRegions: false },
      { code: 'NG', name: 'Nigeria', unit: 'AFRICA', hasRegions: false },
      { code: 'KE', name: 'Kenya', unit: 'AFRICA', hasRegions: false },
      
      // Rest of World
      { code: 'AR', name: 'Argentina', unit: 'REST_WORLD', hasRegions: false },
      { code: 'BR', name: 'Brazil', unit: 'REST_WORLD', hasRegions: false },
      { code: 'CL', name: 'Chile', unit: 'REST_WORLD', hasRegions: false },
    ];

    for (const country of countries) {
      const unit = await prisma.internationalUnit.findUnique({
        where: { code: country.unit },
      });

      if (unit) {
        await prisma.country.upsert({
          where: { code: country.code },
          update: {
            name: country.name,
            hasRegions: country.hasRegions,
            internationalUnitId: unit.id,
          },
          create: {
            code: country.code,
            name: country.name,
            hasRegions: country.hasRegions,
            internationalUnitId: unit.id,
            displayOrder: countries.indexOf(country),
          },
        });
      }
    }

    console.log('✅ Countries created');

    // Create Regions for Ireland (32 counties)
    const irelandRegions = [
      // Leinster
      { code: 'DUB', name: 'Dublin' },
      { code: 'WIC', name: 'Wicklow' },
      { code: 'WEX', name: 'Wexford' },
      { code: 'CAR', name: 'Carlow' },
      { code: 'KIL', name: 'Kilkenny' },
      { code: 'MEA', name: 'Meath' },
      { code: 'LOU', name: 'Louth' },
      { code: 'MON', name: 'Monaghan' },
      { code: 'CAV', name: 'Cavan' },
      { code: 'LON', name: 'Longford' },
      { code: 'WES', name: 'Westmeath' },
      { code: 'OFF', name: 'Offaly' },
      { code: 'LAO', name: 'Laois' },
      { code: 'KID', name: 'Kildare' },
      
      // Munster
      { code: 'COR', name: 'Cork' },
      { code: 'KER', name: 'Kerry' },
      { code: 'LIM', name: 'Limerick' },
      { code: 'CLA', name: 'Clare' },
      { code: 'TIP', name: 'Tipperary' },
      { code: 'WAT', name: 'Waterford' },
      
      // Connacht
      { code: 'GAL', name: 'Galway' },
      { code: 'MAY', name: 'Mayo' },
      { code: 'SLI', name: 'Sligo' },
      { code: 'LEI', name: 'Leitrim' },
      { code: 'ROS', name: 'Roscommon' },
      
      // Ulster (ROI)
      { code: 'DON', name: 'Donegal' },
    ];

    const ireland = await prisma.country.findUnique({
      where: { code: 'IE' },
    });

    if (ireland) {
      for (const region of irelandRegions) {
        await prisma.region.upsert({
          where: { 
            countryId_code: {
              countryId: ireland.id,
              code: region.code,
            }
          },
          update: {
            name: region.name,
            displayOrder: irelandRegions.indexOf(region),
          },
          create: {
            code: region.code,
            name: region.name,
            countryId: ireland.id,
            displayOrder: irelandRegions.indexOf(region),
          },
        });
      }
    }

    // Create Regions for Northern Ireland (6 counties)
    const niRegions = [
      { code: 'ANT', name: 'Antrim' },
      { code: 'ARM', name: 'Armagh' },
      { code: 'DER', name: 'Derry' },
      { code: 'DOW', name: 'Down' },
      { code: 'FER', name: 'Fermanagh' },
      { code: 'TYR', name: 'Tyrone' },
    ];

    const northernIreland = await prisma.country.findUnique({
      where: { code: 'NI' },
    });

    if (northernIreland) {
      for (const region of niRegions) {
        await prisma.region.upsert({
          where: { 
            countryId_code: {
              countryId: northernIreland.id,
              code: region.code,
            }
          },
          update: {
            name: region.name,
            displayOrder: niRegions.indexOf(region),
          },
          create: {
            code: region.code,
            name: region.name,
            countryId: northernIreland.id,
            displayOrder: niRegions.indexOf(region),
          },
        });
      }
    }

    // Create Regions for Great Britain
    const gbRegions = [
      { code: 'LON', name: 'London' },
      { code: 'SCO', name: 'Scotland' },
      { code: 'WAL', name: 'Wales' },
      { code: 'NW', name: 'North West England' },
      { code: 'NE', name: 'North East England' },
      { code: 'YH', name: 'Yorkshire & Humber' },
      { code: 'EM', name: 'East Midlands' },
      { code: 'WM', name: 'West Midlands' },
      { code: 'EE', name: 'East of England' },
      { code: 'SE', name: 'South East England' },
      { code: 'SW', name: 'South West England' },
    ];

    const gb = await prisma.country.findUnique({
      where: { code: 'GB' },
    });

    if (gb) {
      for (const region of gbRegions) {
        await prisma.region.upsert({
          where: { 
            countryId_code: {
              countryId: gb.id,
              code: region.code,
            }
          },
          update: {
            name: region.name,
            displayOrder: gbRegions.indexOf(region),
          },
          create: {
            code: region.code,
            name: region.name,
            countryId: gb.id,
            displayOrder: gbRegions.indexOf(region),
          },
        });
      }
    }

    // Create Regions for USA (states - abbreviated list)
    const usStates = [
      { code: 'NY', name: 'New York' },
      { code: 'CA', name: 'California' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'IL', name: 'Illinois' },
      { code: 'TX', name: 'Texas' },
      { code: 'FL', name: 'Florida' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'OH', name: 'Ohio' },
      { code: 'GA', name: 'Georgia' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'VA', name: 'Virginia' },
      { code: 'MD', name: 'Maryland' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'WA', name: 'Washington' },
      { code: 'OR', name: 'Oregon' },
      { code: 'CO', name: 'Colorado' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
    ];

    const usa = await prisma.country.findUnique({
      where: { code: 'US' },
    });

    if (usa) {
      for (const state of usStates) {
        await prisma.region.upsert({
          where: { 
            countryId_code: {
              countryId: usa.id,
              code: state.code,
            }
          },
          update: {
            name: state.name,
            displayOrder: usStates.indexOf(state),
          },
          create: {
            code: state.code,
            name: state.name,
            countryId: usa.id,
            displayOrder: usStates.indexOf(state),
          },
        });
      }
    }

    // Create Regions for Canada (provinces)
    const canadaProvinces = [
      { code: 'ON', name: 'Ontario' },
      { code: 'QC', name: 'Quebec' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'AB', name: 'Alberta' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'PE', name: 'Prince Edward Island' },
    ];

    const canada = await prisma.country.findUnique({
      where: { code: 'CA' },
    });

    if (canada) {
      for (const province of canadaProvinces) {
        await prisma.region.upsert({
          where: { 
            countryId_code: {
              countryId: canada.id,
              code: province.code,
            }
          },
          update: {
            name: province.name,
            displayOrder: canadaProvinces.indexOf(province),
          },
          create: {
            code: province.code,
            name: province.name,
            countryId: canada.id,
            displayOrder: canadaProvinces.indexOf(province),
          },
        });
      }
    }

    // Create Regions for Australia (states/territories)
    const australiaStates = [
      { code: 'NSW', name: 'New South Wales' },
      { code: 'VIC', name: 'Victoria' },
      { code: 'QLD', name: 'Queensland' },
      { code: 'WA', name: 'Western Australia' },
      { code: 'SA', name: 'South Australia' },
      { code: 'TAS', name: 'Tasmania' },
      { code: 'ACT', name: 'Australian Capital Territory' },
      { code: 'NT', name: 'Northern Territory' },
    ];

    const australia = await prisma.country.findUnique({
      where: { code: 'AU' },
    });

    if (australia) {
      for (const state of australiaStates) {
        await prisma.region.upsert({
          where: { 
            countryId_code: {
              countryId: australia.id,
              code: state.code,
            }
          },
          update: {
            name: state.name,
            displayOrder: australiaStates.indexOf(state),
          },
          create: {
            code: state.code,
            name: state.name,
            countryId: australia.id,
            displayOrder: australiaStates.indexOf(state),
          },
        });
      }
    }

    console.log('✅ Regions created');
    console.log('🎉 Seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedInternationalUnits();