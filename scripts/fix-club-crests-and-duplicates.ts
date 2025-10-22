import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CREST_FIXES = [
  { name: "Milan Shamrocks", crest: "/club-crests/milano-gaa.jpg" },
  { name: "SS Lazio Calcio Gaelico", crest: "/club-crests/lazio-logo.png" },
  { name: "Rome Hibernia GAA", crest: "/club-crests/rome-hibernia.png" },
  { name: "Valencia GAA", crest: "/club-crests/valencia.webp" },
  { name: "Zaragoza GAA", crest: "/club-crests/zaragoza.png" },
];

async function fixCrestsAndDuplicates() {
  console.log("🔧 Fixing Club Crests and Removing Duplicates...\n");

  // 1. Fix missing/wrong crests
  console.log("📸 Step 1: Fixing club crests...");
  let crestsFix = 0;

  for (const fix of CREST_FIXES) {
    const clubs = await prisma.club.findMany({
      where: {
        name: { contains: fix.name.split(" ")[0], mode: "insensitive" },
        status: "APPROVED",
      },
    });

    for (const club of clubs) {
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: fix.crest },
      });
      console.log(`  ✅ Updated crest: ${club.name}`);
      crestsFix++;
    }
  }

  // 2. Find and remove duplicates
  console.log("\n🔍 Step 2: Finding duplicates...");

  const allClubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "asc" }, // Keep oldest
  });

  const seen = new Map();
  const duplicates = [];

  for (const club of allClubs) {
    const key = `${club.name.toLowerCase()}-${club.location?.toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push({ id: club.id, name: club.name, older: seen.get(key) });
    } else {
      seen.set(key, club.id);
    }
  }

  console.log(`  Found ${duplicates.length} duplicate clubs`);

  for (const dup of duplicates) {
    await prisma.club.delete({ where: { id: dup.id } });
    console.log(`  🗑️  Removed duplicate: ${dup.name} (kept original)`);
  }

  // 3. Final count
  console.log("\n📊 Final Status:");
  const europeanCountries = [
    "France",
    "Romania",
    "Denmark",
    "Croatia",
    "Poland",
    "Germany",
    "Italy",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Luxembourg",
    "Spain",
    "Gibraltar",
    "Sweden",
    "Finland",
    "Russia",
    "Norway",
    "Portugal",
    "Slovenia",
  ];

  const finalClubs = await prisma.club.findMany({
    where: { status: "APPROVED" },
  });
  const european = finalClubs.filter((c) => {
    const country = c.location?.split(",").pop()?.trim() || "";
    return europeanCountries.includes(country);
  });

  const withImages = european.filter((c) => c.imageUrl);

  console.log(`  Total European clubs: ${european.length}`);
  console.log(
    `  With crests: ${withImages.length} (${Math.round((withImages.length / european.length) * 100)}%)`
  );
  console.log(`  Crests fixed: ${crestsFix}`);
  console.log(`  Duplicates removed: ${duplicates.length}`);
}

fixCrestsAndDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
