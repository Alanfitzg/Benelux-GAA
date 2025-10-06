import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function encodeS3Url(url: string): string {
  if (!url.includes("s3.")) {
    return url;
  }

  const parts = url.split("/");
  const filename = parts[parts.length - 1];

  const encodedFilename = encodeURIComponent(filename)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/'/g, "%27");

  parts[parts.length - 1] = encodedFilename;

  return parts.join("/");
}

async function fixS3UrlEncoding() {
  console.log("Fixing S3 URL encoding for club crests...\n");

  const clubsWithS3Urls = await prisma.club.findMany({
    where: {
      imageUrl: {
        contains: "s3.",
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  console.log(`Found ${clubsWithS3Urls.length} clubs with S3 URLs\n`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const club of clubsWithS3Urls) {
    try {
      if (!club.imageUrl) {
        skippedCount++;
        continue;
      }

      const originalUrl = club.imageUrl;
      const fixedUrl = encodeS3Url(originalUrl);

      if (originalUrl === fixedUrl) {
        skippedCount++;
        continue;
      }

      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: fixedUrl },
      });

      console.log(`✅ Fixed: ${club.name}`);
      console.log(`   Before: ${originalUrl}`);
      console.log(`   After:  ${fixedUrl}\n`);
      fixedCount++;
    } catch (error) {
      console.error(`❌ Error fixing ${club.name}:`, error);
      errorCount++;
    }
  }

  console.log("\n=== Fix Complete ===");
  console.log(`✅ Successfully fixed: ${fixedCount}`);
  console.log(`⏭️  Skipped (already encoded): ${skippedCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);

  await prisma.$disconnect();
}

fixS3UrlEncoding().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
