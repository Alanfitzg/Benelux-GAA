import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ClubFromSeed {
  id: string;
  name: string;
  region: string | null;
  subRegion: string | null;
  map: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  imageUrl: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  teamTypes: string[];
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactCountryCode: string | null;
  isContactWilling: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedBy: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationDetails: string | null;
  lastVerificationCheck: string | null;
  verificationExpiry: string | null;
}

async function importMissingClubs() {
  console.log("Starting import of missing clubs...\n");

  const seedFilePath = path.join(process.cwd(), "prisma/seeds/05-clubs.json");

  if (!fs.existsSync(seedFilePath)) {
    console.error("Error: clubs.json seed file not found at:", seedFilePath);
    process.exit(1);
  }

  const seedData: ClubFromSeed[] = JSON.parse(
    fs.readFileSync(seedFilePath, "utf-8")
  );

  console.log(`Found ${seedData.length} clubs in seed file\n`);

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const seedClub of seedData) {
    try {
      const existingClub = await prisma.club.findFirst({
        where: {
          OR: [
            { name: seedClub.name },
            {
              AND: [
                { name: { contains: seedClub.name.split(" ")[0] } },
                { location: seedClub.location },
              ],
            },
          ],
        },
      });

      if (existingClub) {
        skippedCount++;
        continue;
      }

      await prisma.club.create({
        data: {
          name: seedClub.name,
          region: seedClub.region,
          subRegion: seedClub.subRegion,
          map: seedClub.map,
          facebook: seedClub.facebook,
          instagram: seedClub.instagram,
          website: seedClub.website,
          codes: seedClub.codes,
          imageUrl: seedClub.imageUrl,
          location: seedClub.location,
          latitude: seedClub.latitude,
          longitude: seedClub.longitude,
          teamTypes: seedClub.teamTypes,
          contactFirstName: seedClub.contactFirstName,
          contactLastName: seedClub.contactLastName,
          contactEmail: seedClub.contactEmail,
          contactPhone: seedClub.contactPhone,
          contactCountryCode: seedClub.contactCountryCode,
          isContactWilling: seedClub.isContactWilling,
          status: seedClub.status as "PENDING" | "APPROVED" | "REJECTED",
          verificationStatus: seedClub.verificationStatus as
            | "UNVERIFIED"
            | "VERIFIED"
            | "REJECTED",
        },
      });

      console.log(`✅ Imported: ${seedClub.name} (${seedClub.location})`);
      importedCount++;
    } catch (error) {
      console.error(`❌ Error importing ${seedClub.name}:`, error);
      errorCount++;
    }
  }

  console.log("\n=== Import Complete ===");
  console.log(`✅ Successfully imported: ${importedCount}`);
  console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);

  await prisma.$disconnect();
}

importMissingClubs().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
