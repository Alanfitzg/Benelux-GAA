import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Clear duplicates to rename: DB name -> USGAA official name
const renames = [
  { dbName: "Parnells GFC GAA", usgaaName: "Parnell's GFC" },
  { dbName: "Connacht Ladies GFC GAA", usgaaName: "Connacht Ladies LGFC" },
  { dbName: "Tir na nOg Ladies GFC GAA", usgaaName: "Tir Na Nog LGFC" },
  {
    dbName: "Fionn MacCumhaill's, Dallas",
    usgaaName: "Dallas Fionn Mac Cumhaills",
  },
  { dbName: "San Francisco FOG City Harps GAA", usgaaName: "Fog City Harps" },
  { dbName: "St Joseph's HurlingClub", usgaaName: "St. Joseph's Hurling Club" },
  { dbName: "Twin Cities Gaelic Football Club", usgaaName: "Twin Cities GFC" },
  {
    dbName: "Wexford Hurling Club Boston GAA",
    usgaaName: "Wexford Boston Hurling Club",
  },
  { dbName: "Wolfe Tones Chicago GAA", usgaaName: "Wolfe Tones Chicago" },
  {
    dbName: "Limerick Chicago GAA",
    usgaaName: "Limerick Hurling Club Chicago",
  },
  { dbName: "Eire Og Greystones GAA", usgaaName: "Eire Og San Francisco" },
];

async function renameDuplicates() {
  console.log("=== Renaming DB Clubs to Match USGAA Names ===\n");

  let renamed = 0;
  let notFound = 0;

  for (const { dbName, usgaaName } of renames) {
    const club = await prisma.club.findFirst({
      where: {
        name: dbName,
        internationalUnit: { name: "North America" },
      },
    });

    if (club) {
      await prisma.club.update({
        where: { id: club.id },
        data: { name: usgaaName },
      });
      console.log(`  ✓ "${dbName}" -> "${usgaaName}"`);
      renamed++;
    } else {
      console.log(`  ✗ NOT FOUND: "${dbName}"`);
      notFound++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Renamed: ${renamed}`);
  console.log(`Not found: ${notFound}`);
}

renameDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
