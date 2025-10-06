import { PrismaClient } from "@prisma/client";
import https from "https";
import http from "http";

const prisma = new PrismaClient();

async function checkUrlExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, (response) => {
      resolve(response.statusCode === 200);
      response.resume(); // Consume response data to free up memory
    });

    request.on("error", () => {
      resolve(false);
    });

    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function verifyCrests() {
  console.log("Verifying club crests are accessible...\n");

  // Sample European clubs to test
  const europeanClubs = await prisma.club.findMany({
    where: {
      AND: [
        {
          OR: [
            { location: { contains: "Switzerland" } },
            { location: { contains: "Germany" } },
            { location: { contains: "France" } },
            { location: { contains: "Spain" } },
            { location: { contains: "Netherlands" } },
          ],
        },
        {
          imageUrl: { not: null },
        },
      ],
    },
    select: {
      name: true,
      location: true,
      imageUrl: true,
    },
    take: 20,
  });

  console.log(`Testing ${europeanClubs.length} European club crests...\n`);

  let workingCount = 0;
  let brokenCount = 0;
  const brokenUrls: Array<{ name: string; url: string }> = [];

  for (const club of europeanClubs) {
    if (!club.imageUrl) continue;

    const isAccessible = await checkUrlExists(club.imageUrl);

    if (isAccessible) {
      console.log(`✅ ${club.name} - WORKING`);
      workingCount++;
    } else {
      console.log(`❌ ${club.name} - BROKEN`);
      console.log(`   URL: ${club.imageUrl}`);
      brokenCount++;
      brokenUrls.push({ name: club.name, url: club.imageUrl });
    }
  }

  console.log("\n=== Verification Summary ===");
  console.log(`✅ Working crests: ${workingCount}`);
  console.log(`❌ Broken crests: ${brokenCount}`);

  if (brokenUrls.length > 0) {
    console.log("\n=== Broken URLs ===");
    brokenUrls.forEach(({ name, url }) => {
      console.log(`${name}: ${url}`);
    });
  }

  // Check overall stats
  const totalWithCrests = await prisma.club.count({
    where: { imageUrl: { not: null } },
  });

  const europeanWithCrests = await prisma.club.count({
    where: {
      AND: [
        {
          OR: [
            { location: { contains: "Switzerland" } },
            { location: { contains: "Germany" } },
            { location: { contains: "France" } },
            { location: { contains: "Spain" } },
            { location: { contains: "Italy" } },
            { location: { contains: "Netherlands" } },
            { location: { contains: "Belgium" } },
            { location: { contains: "Austria" } },
            { location: { contains: "Portugal" } },
            { location: { contains: "Sweden" } },
          ],
        },
        { imageUrl: { not: null } },
      ],
    },
  });

  console.log("\n=== Database Stats ===");
  console.log(`Total clubs with crests: ${totalWithCrests}`);
  console.log(`European clubs with crests: ${europeanWithCrests}`);

  await prisma.$disconnect();
}

verifyCrests().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
