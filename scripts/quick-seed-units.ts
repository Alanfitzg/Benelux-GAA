// Quick script to seed international units directly
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickSeedUnits() {
  console.log('🌍 Quick seeding International Units...');

  try {
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
      try {
        await prisma.internationalUnit.upsert({
          where: { code: unit.code },
          update: unit,
          create: unit,
        });
        console.log(`✅ Created/Updated: ${unit.name}`);
      } catch (error) {
        console.error(`❌ Error with ${unit.name}:`, error);
      }
    }

    console.log('🎉 International Units seeded successfully!');
    
    // Verify the data
    const count = await prisma.internationalUnit.count();
    console.log(`📊 Total international units in database: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding international units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeedUnits();