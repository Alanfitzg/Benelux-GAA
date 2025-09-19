import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCanadaUnit() {
  try {
    console.log('Creating Canada as International Unit...');
    
    // Check if Canada international unit already exists
    const existingCanada = await prisma.internationalUnit.findFirst({
      where: { code: 'CANADA' }
    });

    if (existingCanada) {
      console.log('Canada international unit already exists:', existingCanada.name);
      return existingCanada;
    }

    // Get the highest display order to add Canada after
    const lastUnit = await prisma.internationalUnit.findFirst({
      orderBy: { displayOrder: 'desc' }
    });

    const nextOrder = lastUnit ? lastUnit.displayOrder + 1 : 10;

    // Create Canada International Unit
    const canadaUnit = await prisma.internationalUnit.create({
      data: {
        code: 'CANADA',
        name: 'Canada',
        displayOrder: nextOrder
      }
    });

    console.log(`✅ Created Canada International Unit: ${canadaUnit.name} (order: ${canadaUnit.displayOrder})`);

    // Create Canada as country under this unit
    const canadaCountry = await prisma.country.create({
      data: {
        code: 'CA',
        name: 'Canada',
        hasRegions: true,
        internationalUnitId: canadaUnit.id,
        displayOrder: 1
      }
    });

    console.log(`✅ Created Canada Country: ${canadaCountry.name}`);

    console.log('\n=== Canada Unit Structure Created ===');
    console.log(`International Unit: ${canadaUnit.name}`);
    console.log(`  └─ Country: ${canadaCountry.name} (${canadaCountry.code})`);

    return { unit: canadaUnit, country: canadaCountry };

  } catch (error) {
    console.error('Error creating Canada unit:', error);
    throw error;
  }
}

// Run the creation
createCanadaUnit()
  .then(() => {
    console.log('\n🍁 Canada International Unit created successfully!');
  })
  .finally(() => {
    prisma.$disconnect();
  });