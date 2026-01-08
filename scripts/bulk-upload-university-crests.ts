import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Directory where crest images should be placed
const CRESTS_DIR = path.join(process.cwd(), "public", "crests", "universities");

// Mapping of filename patterns to club names (for fuzzy matching)
const filenameToClubMapping: Record<string, string[]> = {
  // Irish Universities
  dcu: ["DCU Dóchas Éireann"],
  ucd: ["UCD GAA"],
  nuig: ["NUIG GAA"],
  trinity: ["Trinity College Dublin GAA"],
  ul: ["University of Limerick GAA"],
  maynooth: ["Maynooth University GAA"],
  queens: ["Queen's University Belfast GAA"],
  "tu-dublin": ["TU Dublin GAA"],
  "tu-dublin-blanch": ["TU Dublin Blanchardstown GAA"],
  "mtu-cork": ["MTU Cork GAA"],
  "mtu-kerry": ["MTU Kerry GAA"],
  "tus-midlands": ["TUS Midlands GAA"],
  "tus-midwest": ["TUS Midwest GAA"],
  "atu-galway": ["ATU Galway GAA"],
  "atu-sligo": ["ATU Sligo GAA"],
  "atu-donegal": ["ATU Donegal GAA"],
  "atu-connemara": ["ATU Connemara GAA"],
  "setu-waterford": ["SETU Waterford GAA"],
  "setu-carlow": ["SETU Carlow GAA"],
  dkit: ["DKIT GAA"],
  "mic-limerick": ["Mary Immaculate College Limerick GAA"],
  "mic-thurles": ["Mary Immaculate College Thurles GAA"],
  "st-marys-belfast": ["St Mary's University College GAA"],
  ulster: ["Ulster University GAA"],
  "ulster-coleraine": ["Ulster University Coleraine GAA"],
  "ulster-magee": ["Ulster University Magee GAA"],
  garda: ["Garda College GAA"],
  rcsi: ["RCSI GAA"],
  marino: ["Marino Institute of Education GAA"],
  defence: ["Defence Forces GAA"],
  dife: ["DIFE GAA"],
  inchicore: ["Inchicore College GAA"],
  swc: ["South West College GAA"],
  src: ["Southern Regional College GAA"],
  cavan: ["Cavan Institute GAA"],
  monaghan: ["Monaghan Institute GAA"],

  // UK Universities
  glasgow: ["University of Glasgow GAA"],
  edinburgh: ["University of Edinburgh GAA"],
  napier: ["Edinburgh Napier GAA"],
  rgu: ["Robert Gordon University GAA"],
  dundee: ["University of Dundee GAA"],
  abertay: ["University of Abertay GAA"],
  ljmu: ["Liverpool John Moores GAA"],
  "liverpool-hope": ["Liverpool Hope GAA"],
  liverpool: ["University of Liverpool GAA"],
  northumbria: ["Northumbria University GAA"],
  newcastle: ["Newcastle University GAA"],
  manchester: ["University of Manchester GAA"],
  mmu: ["Manchester Metropolitan GAA"],
  leeds: ["University of Leeds GAA"],
  "leeds-beckett": ["Leeds Beckett GAA"],
  sheffield: ["University of Sheffield GAA"],
  "sheffield-hallam": ["Sheffield Hallam GAA"],
  birmingham: ["University of Birmingham GAA"],
  coventry: ["Coventry University GAA"],
  nottingham: ["University of Nottingham GAA"],
  ntu: ["Nottingham Trent GAA"],
  loughborough: ["Loughborough University GAA"],
  "harper-adams": ["Harper Adams GAA"],
  bristol: ["University of Bristol GAA"],
  "st-marys-london": ["St Mary's University GAA"],
  cardiff: ["Cardiff University GAA"],
  swansea: ["Swansea University GAA"],
  bangor: ["Bangor University GAA"],
  oxford: ["University of Oxford GAA"],
  cambridge: ["University of Cambridge GAA"],
};

function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function findClubByFilename(filename: string): Promise<string | null> {
  const normalized = normalizeFilename(filename);

  // Check direct mapping first
  for (const [pattern, clubNames] of Object.entries(filenameToClubMapping)) {
    if (normalized.includes(pattern)) {
      // Find the club in database
      for (const clubName of clubNames) {
        const club = await prisma.club.findFirst({
          where: {
            name: {
              contains: clubName.replace(" GAA", ""),
              mode: "insensitive",
            },
            clubType: "UNIVERSITY",
          },
          select: { id: true, name: true },
        });
        if (club) return club.id;
      }
    }
  }

  // Fuzzy match against all university clubs
  const allUnis = await prisma.club.findMany({
    where: { clubType: "UNIVERSITY" },
    select: { id: true, name: true },
  });

  for (const uni of allUnis) {
    const uniNormalized = uni.name
      .toLowerCase()
      .replace(/\s+gaa$/i, "")
      .replace(/[^a-z0-9]/g, "");

    if (
      normalized.includes(uniNormalized) ||
      uniNormalized.includes(normalized)
    ) {
      return uni.id;
    }
  }

  return null;
}

async function bulkUploadCrests() {
  console.log("Starting bulk crest upload...\n");
  console.log(`Looking for images in: ${CRESTS_DIR}\n`);

  // Check if directory exists
  if (!fs.existsSync(CRESTS_DIR)) {
    console.log(`Creating directory: ${CRESTS_DIR}`);
    fs.mkdirSync(CRESTS_DIR, { recursive: true });
    console.log(
      "\nDirectory created. Please add crest images and run this script again."
    );
    console.log(
      "See docs/UNIVERSITY_CREST_SOURCES.md for image naming conventions.\n"
    );
    return;
  }

  // Get all image files
  const files = fs
    .readdirSync(CRESTS_DIR)
    .filter((f) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));

  if (files.length === 0) {
    console.log("No image files found in directory.");
    console.log(
      "Add images with names like: dcu.png, ucd.png, liverpool-john-moores.png"
    );
    console.log(
      "See docs/UNIVERSITY_CREST_SOURCES.md for full naming guide.\n"
    );
    return;
  }

  console.log(`Found ${files.length} image(s)\n`);

  let updated = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const file of files) {
    const clubId = await findClubByFilename(file);

    if (!clubId) {
      console.log(`⚠️  No match found for: ${file}`);
      unmatched.push(file);
      skipped++;
      continue;
    }

    // Get club details
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, imageUrl: true },
    });

    if (!club) continue;

    // Construct the public URL path
    const imageUrl = `/crests/universities/${file}`;

    // Update the club
    await prisma.club.update({
      where: { id: clubId },
      data: { imageUrl },
    });

    console.log(`✅ ${club.name} -> ${imageUrl}`);
    updated++;
  }

  console.log("\n========================================");
  console.log("Bulk Upload Summary:");
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log("========================================\n");

  if (unmatched.length > 0) {
    console.log("Unmatched files (rename to match club names):");
    unmatched.forEach((f) => console.log(`  - ${f}`));
    console.log(
      "\nSee docs/UNIVERSITY_CREST_SOURCES.md for naming conventions.\n"
    );
  }

  // Show clubs still missing crests
  const missingCrests = await prisma.club.findMany({
    where: {
      clubType: "UNIVERSITY",
      OR: [{ imageUrl: null }, { imageUrl: "" }],
    },
    select: { name: true },
    orderBy: { name: "asc" },
  });

  if (missingCrests.length > 0) {
    console.log(`\nClubs still missing crests (${missingCrests.length}):`);
    missingCrests.forEach((c) => console.log(`  - ${c.name}`));
  } else {
    console.log("\n All university clubs now have crests!");
  }
}

bulkUploadCrests()
  .catch((e) => {
    console.error("Upload failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
