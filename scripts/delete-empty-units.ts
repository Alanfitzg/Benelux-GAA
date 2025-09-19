#!/usr/bin/env npx tsx
import { prisma } from '../src/lib/prisma';

async function deleteEmptyUnits() {
  const emptyUnitIds = [
    'cmfp3j7g600008obhdf4tx9k4', // IRELAND
    'cmfp3j7hk00018obhrb6zhv7k', // BRITAIN
    'cmfp3j7j000028obh78spaeyf', // EUROPE
    'cmfp3j7ke00038obhdxecxu7t', // NORTH_AMERICA
    'cmfp3j7lq00048obhugkg9s2r', // AUSTRALASIA
    'cmfp3j7oj00068obh40dcdn4a', // MIDDLE_EAST
    'cmfp3j7px00078obh1p0j7lsj', // AFRICA
    'cmfp3j7rc00088obhgj7tew6m', // REST_WORLD
    'cmfphjanh0000r3bllmw1p4sw', // CANADA
    'cmfr8c8pc000tr3haa11zly3d'  // CAN
  ];

  try {
    const result = await prisma.internationalUnit.deleteMany({
      where: {
        id: {
          in: emptyUnitIds
        }
      }
    });

    console.log(`Deleted ${result.count} empty international units`);

    // Show remaining units
    const remaining = await prisma.internationalUnit.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    console.log('\nRemaining International Units:');
    remaining.forEach(unit => {
      console.log(`${unit.displayOrder}: ${unit.code} - ${unit.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteEmptyUnits();