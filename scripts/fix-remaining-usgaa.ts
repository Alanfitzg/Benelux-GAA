import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Remaining 21 USGAA clubs not matched - identify DB duplicates to remove/rename
const fixes = [
  // Central Division
  {
    usgaa: "Wolfe Tones",
    dbDupe: "Wolfe Tones Chicago",
    action: "rename",
    newName: "Wolfe Tones",
  },
  {
    usgaa: "Limerick Hurling Club",
    dbDupe: "Limerick Hurling Club Chicago",
    action: "rename",
    newName: "Limerick Hurling Club",
  },

  // Heartland Division
  {
    usgaa: "Hurling Club of Madison",
    dbDupe: "Madison GAA",
    action: "rename",
    newName: "Hurling Club of Madison",
  },
  {
    usgaa: "Robert Emmets Hurling",
    dbDupe: "Twin Cities Robert Emmets GAA",
    action: "keep_both",
  }, // Different clubs

  // Midwest Division
  {
    usgaa: "Pittsburgh GAA",
    dbDupe: "Pittsburgh Celtics GAA",
    action: "rename",
    newName: "Pittsburgh GAA",
  },

  // Northeast Division
  {
    usgaa: "Boston Shamrocks",
    dbDupe: "Boston Shamrocks Ladies GFC GAA",
    action: "keep_both",
  }, // Ladies team
  {
    usgaa: "Fr. Tom Burke's Hurling Club",
    dbDupe: "Fr. Tom Burke's Hurling Club GAA",
    action: "rename",
    newName: "Fr. Tom Burke's Hurling Club",
  },
  { usgaa: "Portland Hurling Club", dbDupe: null, action: "add" },
  { usgaa: "Offaly Boston Hurling Club", dbDupe: null, action: "add" },
  {
    usgaa: "Tipperary Boston Hurling Club",
    dbDupe: "Tipperary Hurling Club Boston GAA",
    action: "rename",
    newName: "Tipperary Boston Hurling Club",
  },

  // Philadelphia Division
  {
    usgaa: "Shamrocks",
    dbDupe: "Philadelphia Shamrocks Ladies GAA",
    action: "keep_both",
  }, // Ladies team
  {
    usgaa: "Young Irelanders GFC",
    dbDupe: "Young Irelands Philadelphia GAA",
    action: "rename",
    newName: "Young Irelanders GFC Philadelphia",
  },
  { usgaa: "Jersey Shore GAA Club", dbDupe: null, action: "add" },

  // Southeast Division
  {
    usgaa: "Cayman Islands GFC",
    dbDupe: "Cayman Islands GFC",
    action: "already_added",
  }, // Should already exist
  {
    usgaa: "Red Wolves Hurling Club",
    dbDupe: "Red Wolves Hurling Club GAA",
    action: "rename",
    newName: "Red Wolves Hurling Club",
  },

  // Southwest Division
  {
    usgaa: "Los Angeles Hurling Club",
    dbDupe: "Los Angeles Cougars GAA",
    action: "keep_both",
  }, // Different clubs
  {
    usgaa: "Los San Patricios GAA Club, Mexico City",
    dbDupe: null,
    action: "add_mexico",
  },
  {
    usgaa: "San Antonio GAC",
    dbDupe: "San Antonio GAC GAA",
    action: "rename",
    newName: "San Antonio GAC",
  },
  { usgaa: "San Diego Na Fianna", dbDupe: null, action: "add" },

  // Western Division
  {
    usgaa: "Cú Chulainn Camogie",
    dbDupe: "Cu Chulainn Camogie",
    action: "rename",
    newName: "Cú Chulainn Camogie",
  },
  {
    usgaa: "Eire Og",
    dbDupe: "Eire Og San Francisco",
    action: "rename",
    newName: "Eire Og",
  },
];

async function fixRemaining() {
  console.log("=== Fixing Remaining USGAA Matches ===\n");

  const northAmerica = await prisma.internationalUnit.findFirst({
    where: { name: "North America" },
  });

  const usa = await prisma.country.findFirst({
    where: { name: "United States" },
  });

  const mexico = await prisma.country.findFirst({
    where: { name: "Mexico" },
  });

  if (!northAmerica || !usa) {
    console.error("Required records not found");
    return;
  }

  let renamed = 0;
  let added = 0;
  let skipped = 0;

  for (const fix of fixes) {
    if (fix.action === "rename" && fix.dbDupe && fix.newName) {
      const club = await prisma.club.findFirst({
        where: {
          name: fix.dbDupe,
          internationalUnitId: northAmerica.id,
        },
      });

      if (club) {
        await prisma.club.update({
          where: { id: club.id },
          data: { name: fix.newName },
        });
        console.log(`  ✓ RENAMED: "${fix.dbDupe}" -> "${fix.newName}"`);
        renamed++;
      } else {
        console.log(`  ? NOT FOUND for rename: "${fix.dbDupe}"`);
      }
    } else if (fix.action === "add") {
      // Check if already exists
      const existing = await prisma.club.findFirst({
        where: {
          name: fix.usgaa,
          internationalUnitId: northAmerica.id,
        },
      });

      if (!existing) {
        await prisma.club.create({
          data: {
            name: fix.usgaa,
            location: "USA",
            region: "USGAA",
            internationalUnitId: northAmerica.id,
            countryId: usa.id,
            clubType: "CLUB",
          },
        });
        console.log(`  ✓ ADDED: "${fix.usgaa}"`);
        added++;
      } else {
        console.log(`  - SKIP (exists): "${fix.usgaa}"`);
        skipped++;
      }
    } else if (fix.action === "add_mexico" && mexico) {
      const existing = await prisma.club.findFirst({
        where: {
          name: fix.usgaa,
          internationalUnitId: northAmerica.id,
        },
      });

      if (!existing) {
        await prisma.club.create({
          data: {
            name: fix.usgaa,
            location: "Mexico City, Mexico",
            region: "Southwest Division",
            internationalUnitId: northAmerica.id,
            countryId: mexico.id,
            clubType: "CLUB",
          },
        });
        console.log(`  ✓ ADDED (Mexico): "${fix.usgaa}"`);
        added++;
      } else {
        console.log(`  - SKIP (exists): "${fix.usgaa}"`);
        skipped++;
      }
    } else if (fix.action === "keep_both") {
      console.log(
        `  - KEEP BOTH: "${fix.usgaa}" and "${fix.dbDupe}" are different clubs`
      );
      skipped++;
    } else if (fix.action === "already_added") {
      console.log(`  - ALREADY EXISTS: "${fix.usgaa}"`);
      skipped++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Renamed: ${renamed}`);
  console.log(`Added: ${added}`);
  console.log(`Skipped/Keep Both: ${skipped}`);
}

fixRemaining()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
