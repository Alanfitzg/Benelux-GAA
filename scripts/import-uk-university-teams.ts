import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// UK University GAA teams compiled from BUGAA/BUCS competitions
const ukUniversityTeams = [
  // Liverpool Area
  {
    name: "Liverpool John Moores GAA",
    location: "Liverpool, UK",
    fullName: "Liverpool John Moores University",
  },
  {
    name: "Liverpool Hope GAA",
    location: "Liverpool, UK",
    fullName: "Liverpool Hope University",
  },
  {
    name: "University of Liverpool GAA",
    location: "Liverpool, UK",
    fullName: "University of Liverpool",
  },

  // Scotland
  {
    name: "University of Glasgow GAA",
    location: "Glasgow, UK",
    fullName: "University of Glasgow",
  },
  {
    name: "Robert Gordon University GAA",
    location: "Aberdeen, UK",
    fullName: "Robert Gordon University",
  },
  {
    name: "University of Edinburgh GAA",
    location: "Edinburgh, UK",
    fullName: "University of Edinburgh",
  },
  {
    name: "Edinburgh Napier GAA",
    location: "Edinburgh, UK",
    fullName: "Edinburgh Napier University",
  },
  {
    name: "University of Dundee GAA",
    location: "Dundee, UK",
    fullName: "University of Dundee",
  },
  {
    name: "University of Abertay GAA",
    location: "Dundee, UK",
    fullName: "Abertay University",
  },

  // North East England
  {
    name: "Northumbria University GAA",
    location: "Newcastle, UK",
    fullName: "Northumbria University",
  },
  {
    name: "Newcastle University GAA",
    location: "Newcastle, UK",
    fullName: "Newcastle University",
  },

  // Manchester Area
  {
    name: "University of Manchester GAA",
    location: "Manchester, UK",
    fullName: "University of Manchester",
  },
  {
    name: "Manchester Metropolitan GAA",
    location: "Manchester, UK",
    fullName: "Manchester Metropolitan University",
  },

  // Leeds Area
  {
    name: "University of Leeds GAA",
    location: "Leeds, UK",
    fullName: "University of Leeds",
  },
  {
    name: "Leeds Beckett GAA",
    location: "Leeds, UK",
    fullName: "Leeds Beckett University",
  },

  // Midlands
  {
    name: "University of Birmingham GAA",
    location: "Birmingham, UK",
    fullName: "University of Birmingham",
  },
  {
    name: "Coventry University GAA",
    location: "Coventry, UK",
    fullName: "Coventry University",
  },
  {
    name: "University of Nottingham GAA",
    location: "Nottingham, UK",
    fullName: "University of Nottingham",
  },
  {
    name: "Nottingham Trent GAA",
    location: "Nottingham, UK",
    fullName: "Nottingham Trent University",
  },
  {
    name: "Loughborough University GAA",
    location: "Loughborough, UK",
    fullName: "Loughborough University",
  },
  {
    name: "Harper Adams GAA",
    location: "Newport, UK",
    fullName: "Harper Adams University",
  },

  // London Area
  {
    name: "St Mary's University GAA",
    location: "London, UK",
    fullName: "St Mary's University Twickenham",
  },

  // Wales
  {
    name: "Swansea University GAA",
    location: "Swansea, UK",
    fullName: "Swansea University",
  },
  {
    name: "Bangor University GAA",
    location: "Bangor, UK",
    fullName: "Bangor University",
  },
  {
    name: "Cardiff University GAA",
    location: "Cardiff, UK",
    fullName: "Cardiff University",
  },

  // Other England
  {
    name: "University of Bristol GAA",
    location: "Bristol, UK",
    fullName: "University of Bristol",
  },
  {
    name: "University of Sheffield GAA",
    location: "Sheffield, UK",
    fullName: "University of Sheffield",
  },
  {
    name: "Sheffield Hallam GAA",
    location: "Sheffield, UK",
    fullName: "Sheffield Hallam University",
  },

  // Oxbridge
  {
    name: "University of Oxford GAA",
    location: "Oxford, UK",
    fullName: "University of Oxford",
  },
  {
    name: "University of Cambridge GAA",
    location: "Cambridge, UK",
    fullName: "University of Cambridge",
  },
];

async function importUKUniversityTeams() {
  console.log("Starting UK university teams import...\n");

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const team of ukUniversityTeams) {
    try {
      // Check if club already exists (by name similarity)
      const existingClub = await prisma.club.findFirst({
        where: {
          OR: [
            {
              name: {
                contains: team.name.replace(" GAA", ""),
                mode: "insensitive",
              },
            },
            { name: { contains: team.fullName, mode: "insensitive" } },
          ],
        },
      });

      if (existingClub) {
        console.log(
          `⏭️  Skipped (already exists): ${team.name} -> Found: ${existingClub.name}`
        );
        skipped++;
        continue;
      }

      // Create the university club
      await prisma.club.create({
        data: {
          name: team.name,
          location: team.location,
          clubType: "UNIVERSITY",
          status: "APPROVED",
          teamTypes: ["Gaelic Football", "Hurling"],
          dataSource: "BUGAA_IMPORT",
          bio: team.fullName,
          region: "Britain",
          isMainlandEurope: false,
        },
      });

      console.log(`✅ Created: ${team.name}`);
      created++;
    } catch (error) {
      const errorMsg = `Failed to create ${team.name}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  console.log("\n========================================");
  console.log("UK University Teams Import Summary:");
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors.length}`);
  console.log("========================================\n");

  if (errors.length > 0) {
    console.log("Errors:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  // Show total count of university teams
  const totalUniversityTeams = await prisma.club.count({
    where: { clubType: "UNIVERSITY" },
  });
  console.log(`\nTotal university teams in database: ${totalUniversityTeams}`);
}

importUKUniversityTeams()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
