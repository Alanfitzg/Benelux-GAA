import { PrismaClient } from "@prisma/client";
import * as https from "https";

const prisma = new PrismaClient();

interface GGEClub {
  name: string;
  country: string;
  region: string;
  page: number;
}

async function fetchPage(pageNumber: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://gaelicgameseurope.com/clubs/page/${pageNumber}/`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function parseClubsFromHTML(html: string, pageNumber: number): GGEClub[] {
  const clubs: GGEClub[] = [];

  // Match club entries - looking for patterns in the HTML
  // This is a simplified parser - may need adjustment based on actual HTML structure
  const clubPattern = /<h3[^>]*>([^<]+)<\/h3>/g;
  const countryPattern =
    /<span[^>]*class="[^"]*country[^"]*"[^>]*>([^<]+)<\/span>/g;

  let clubMatch;
  const clubNames: string[] = [];
  while ((clubMatch = clubPattern.exec(html)) !== null) {
    clubNames.push(clubMatch[1].trim());
  }

  let countryMatch;
  const countries: string[] = [];
  while ((countryMatch = countryPattern.exec(html)) !== null) {
    countries.push(countryMatch[1].trim());
  }

  // Match clubs with their countries
  for (let i = 0; i < clubNames.length; i++) {
    clubs.push({
      name: clubNames[i],
      country: countries[i] || "Unknown",
      region: "Europe",
      page: pageNumber,
    });
  }

  return clubs;
}

async function scrapeAllGGEClubs() {
  console.log("🌐 Scraping Gaelic Games Europe clubs directory...\n");

  const allClubs: GGEClub[] = [];
  const totalPages = 10;

  for (let page = 1; page <= totalPages; page++) {
    try {
      console.log(`📄 Fetching page ${page}/${totalPages}...`);
      const html = await fetchPage(page);
      const clubs = parseClubsFromHTML(html, page);
      allClubs.push(...clubs);
      console.log(`   Found ${clubs.length} clubs on page ${page}`);

      // Wait 1 second between requests to be polite
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error fetching page ${page}:`, error);
    }
  }

  console.log(`\n📊 Total clubs scraped: ${allClubs.length}`);
  console.log(`\n🔍 Checking against existing database...`);

  let newClubs = 0;
  let existingClubs = 0;
  const toImport: GGEClub[] = [];

  for (const ggeClub of allClubs) {
    const searchName = ggeClub.name.split(" ")[0];

    const existing = await prisma.club.findFirst({
      where: {
        OR: [
          { name: { contains: searchName, mode: "insensitive" } },
          { name: { contains: ggeClub.name, mode: "insensitive" } },
        ],
        location: { contains: ggeClub.country, mode: "insensitive" },
        status: "APPROVED",
      },
    });

    if (existing) {
      existingClubs++;
    } else {
      newClubs++;
      toImport.push(ggeClub);
    }
  }

  console.log(`\n✅ Already in database: ${existingClubs}`);
  console.log(`🆕 New clubs to import: ${newClubs}`);

  // Save to JSON file for review
  const fs = await import("fs");
  const outputPath = "./gge-clubs-scraped.json";
  fs.writeFileSync(outputPath, JSON.stringify(toImport, null, 2));
  console.log(`\n💾 Saved new clubs to: ${outputPath}`);
  console.log(
    `\n💡 Review the file and run import script to add them to database`
  );
}

scrapeAllGGEClubs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
