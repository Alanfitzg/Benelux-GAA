import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Irish University/College GAA teams compiled from GAA Higher Education competitions
const universityTeams = [
  // From Sigerson Cup (Football)
  {
    name: "TUS Midlands GAA",
    location: "Athlone, Ireland",
    fullName: "Technological University of the Shannon: Midlands",
  },
  {
    name: "MTU Kerry GAA",
    location: "Tralee, Ireland",
    fullName: "Munster Technological University Kerry",
  },
  {
    name: "TU Dublin GAA",
    location: "Dublin, Ireland",
    fullName: "Technological University Dublin",
  },
  {
    name: "DKIT GAA",
    location: "Dundalk, Ireland",
    fullName: "Dundalk Institute of Technology",
  },
  {
    name: "Ulster University GAA",
    location: "Jordanstown, Ireland",
    fullName: "Ulster University",
  },
  {
    name: "DCU Dóchas Éireann",
    location: "Dublin, Ireland",
    fullName: "Dublin City University",
  },
  {
    name: "St Mary's University College GAA",
    location: "Belfast, Ireland",
    fullName: "St Mary's University College Belfast",
  },
  {
    name: "Maynooth University GAA",
    location: "Maynooth, Ireland",
    fullName: "Maynooth University",
  },
  {
    name: "MTU Cork GAA",
    location: "Cork, Ireland",
    fullName: "Munster Technological University Cork",
  },
  {
    name: "University of Limerick GAA",
    location: "Limerick, Ireland",
    fullName: "University of Limerick",
  },
  {
    name: "UCD GAA",
    location: "Dublin, Ireland",
    fullName: "University College Dublin",
  },
  {
    name: "ATU Galway GAA",
    location: "Galway, Ireland",
    fullName: "Atlantic Technological University Galway",
  },
  {
    name: "Queen's University Belfast GAA",
    location: "Belfast, Ireland",
    fullName: "Queen's University Belfast",
  },
  {
    name: "University of Galway GAA",
    location: "Galway, Ireland",
    fullName: "University of Galway",
  },
  {
    name: "ATU Sligo GAA",
    location: "Sligo, Ireland",
    fullName: "Atlantic Technological University Sligo",
  },
  {
    name: "UCC GAA",
    location: "Cork, Ireland",
    fullName: "University College Cork",
  },

  // From Fitzgibbon Cup (Hurling) - additional teams
  {
    name: "Mary Immaculate College Limerick GAA",
    location: "Limerick, Ireland",
    fullName: "Mary Immaculate College Limerick",
  },
  {
    name: "SETU Waterford GAA",
    location: "Waterford, Ireland",
    fullName: "South East Technological University Waterford",
  },
  {
    name: "Garda College GAA",
    location: "Templemore, Ireland",
    fullName: "Garda College",
  },
  {
    name: "TUS Midwest GAA",
    location: "Limerick, Ireland",
    fullName: "Technological University of the Shannon: Midwest",
  },

  // From Ryan Cup - additional teams
  {
    name: "Mary Immaculate College Thurles GAA",
    location: "Thurles, Ireland",
    fullName: "Mary Immaculate College Thurles",
  },
  {
    name: "SETU Carlow GAA",
    location: "Carlow, Ireland",
    fullName: "South East Technological University Carlow",
  },
  {
    name: "Trinity College Dublin GAA",
    location: "Dublin, Ireland",
    fullName: "Trinity College Dublin",
  },

  // From Trench Cup - additional teams
  {
    name: "ATU Donegal GAA",
    location: "Letterkenny, Ireland",
    fullName: "Atlantic Technological University Donegal",
  },
  {
    name: "South West College GAA",
    location: "Omagh, Ireland",
    fullName: "South West College",
  },

  // From Corn CA - additional teams
  {
    name: "Inchicore College GAA",
    location: "Dublin, Ireland",
    fullName: "Inchicore College of Further Education",
  },
  {
    name: "Southern Regional College GAA",
    location: "Newry, Ireland",
    fullName: "Southern Regional College",
  },
  {
    name: "DIFE GAA",
    location: "Drogheda, Ireland",
    fullName: "Drogheda Institute of Further Education",
  },
  {
    name: "ATU Connemara GAA",
    location: "Connemara, Ireland",
    fullName: "Atlantic Technological University Connemara",
  },
  {
    name: "Monaghan Institute GAA",
    location: "Monaghan, Ireland",
    fullName: "Monaghan Institute",
  },
];

async function importUniversityTeams() {
  console.log("Starting university teams import...\n");

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const team of universityTeams) {
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
          dataSource: "GAA_HE_IMPORT",
          bio: team.fullName,
          region: "Ireland",
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
  console.log("Import Summary:");
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors.length}`);
  console.log("========================================\n");

  if (errors.length > 0) {
    console.log("Errors:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }
}

importUniversityTeams()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
