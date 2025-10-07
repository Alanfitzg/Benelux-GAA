import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// European countries (mainland Europe - excluding UK/Ireland)
const europeanCountries = [
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Poland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Portugal",
  "Greece",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Slovakia",
  "Croatia",
  "Slovenia",
  "Lithuania",
  "Latvia",
  "Estonia",
  "Luxembourg",
  "Bulgaria",
  "Serbia",
  "Iceland",
  "Malta",
  "Cyprus",
  "Russia",
  "Ukraine",
  "Belarus",
  "Albania",
  "Bosnia",
  "Macedonia",
  "Montenegro",
  "Kosovo",
  "Moldova",
  "Georgia",
  "Armenia",
  "Azerbaijan",
  "Turkey",
  "Guernsey",
  "Jersey",
  "Monaco",
  "Liechtenstein",
  "Andorra",
  "San Marino",
  "Vatican",
];

async function fixEuropeFlag() {
  console.log("🔧 Fixing isMainlandEurope flag for European clubs...\n");

  let updated = 0;

  // Update clubs in European countries
  for (const country of europeanCountries) {
    const result = await prisma.club.updateMany({
      where: {
        location: {
          contains: country,
          mode: "insensitive",
        },
        isMainlandEurope: false,
      },
      data: {
        isMainlandEurope: true,
      },
    });

    if (result.count > 0) {
      console.log(`✅ ${country}: ${result.count} clubs`);
      updated += result.count;
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`✅ Successfully flagged ${updated} clubs as mainland Europe`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Show final count
  const totalEurope = await prisma.club.count({
    where: { isMainlandEurope: true },
  });
  console.log(`📊 Total clubs in mainland Europe: ${totalEurope}`);
}

async function main() {
  try {
    await fixEuropeFlag();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
