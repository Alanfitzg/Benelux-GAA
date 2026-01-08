import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Additional Irish University/College GAA teams found from further scraping
const additionalTeams = [
  // From Fergal Maher Cup & Corn Na Mac Leinn
  {
    name: "RCSI GAA",
    location: "Dublin, Ireland",
    fullName: "Royal College of Surgeons in Ireland",
  },
  {
    name: "Marino Institute of Education GAA",
    location: "Dublin, Ireland",
    fullName: "Marino Institute of Education",
  },
  {
    name: "Ulster University Coleraine GAA",
    location: "Coleraine, Ireland",
    fullName: "Ulster University Coleraine Campus",
  },
  {
    name: "Ulster University Magee GAA",
    location: "Derry, Ireland",
    fullName: "Ulster University Magee Campus",
  },
  {
    name: "Cavan Institute GAA",
    location: "Cavan, Ireland",
    fullName: "Cavan Institute of Further Education",
  },
  {
    name: "TU Dublin Blanchardstown GAA",
    location: "Dublin, Ireland",
    fullName: "Technological University Dublin Blanchardstown Campus",
  },
  {
    name: "Defence Forces GAA",
    location: "Dublin, Ireland",
    fullName: "Irish Defence Forces (Cadets)",
  },
];

async function updateUniversityTeams() {
  console.log("Starting university teams update...\n");

  // First, fix University of Galway to NUIG
  console.log("Step 1: Fixing University of Galway name to NUIG...\n");

  const uogClub = await prisma.club.findFirst({
    where: {
      name: { contains: "University of Galway", mode: "insensitive" },
      clubType: "UNIVERSITY",
    },
  });

  if (uogClub) {
    await prisma.club.update({
      where: { id: uogClub.id },
      data: {
        name: "NUIG GAA",
        bio: "National University of Ireland, Galway",
      },
    });
    console.log(`✅ Updated: "University of Galway GAA" -> "NUIG GAA"`);
  } else {
    console.log(`⚠️  University of Galway not found in database`);
  }

  // Now add additional teams
  console.log("\nStep 2: Adding additional teams...\n");

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const team of additionalTeams) {
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
  console.log("Update Summary:");
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

updateUniversityTeams()
  .catch((e) => {
    console.error("Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
