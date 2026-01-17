import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as https from "https";

const prisma = new PrismaClient();

// Search patterns and URLs - use partial name matching
const updates: Array<{ search: string; url: string; filename: string }> = [
  {
    search: "St Brigid",
    url: "https://westmeathgaa.ie/wp-content/uploads/2022/10/St-Brid-150x150.png",
    filename: "st-brigids-gaa.png",
  },
  {
    search: "St Joseph",
    url: "https://westmeathgaa.ie/wp-content/uploads/2022/10/St-Josephs-150x150.png",
    filename: "st-josephs-gaa.png",
  },
  {
    search: "St Malachy",
    url: "https://westmeathgaa.ie/wp-content/uploads/2022/10/StMalachysCrest-150x150.jpeg",
    filename: "st-malachys-gaa.jpeg",
  },
  {
    search: "St Oliver",
    url: "https://westmeathgaa.ie/wp-content/uploads/2022/10/St-OP-150x150.png",
    filename: "st-oliver-plunketts-gaa.png",
  },
  {
    search: "St Paul",
    url: "https://westmeathgaa.ie/wp-content/uploads/2022/10/St-Pauls-150x150.png",
    filename: "st-pauls-gaa.png",
  },
];

const outputDir = "public/club-crests/westmeath";

function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve(true);
          });
        } else {
          file.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          resolve(false);
        }
      })
      .on("error", () => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      });
  });
}

async function fix() {
  console.log("=== Fixing Remaining Westmeath Crests ===\n");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let fixed = 0;

  for (const item of updates) {
    const club = await prisma.club.findFirst({
      where: {
        name: { contains: item.search, mode: "insensitive" },
        subRegion: "Westmeath",
      },
    });

    if (!club) {
      console.log(`? ${item.search} - not found in database`);
      continue;
    }

    // Skip if already has a valid crest
    if (club.imageUrl?.startsWith("/club-crests/westmeath/")) {
      console.log(`✓ ${club.name} - already has crest`);
      continue;
    }

    const destPath = `${outputDir}/${item.filename}`;
    const dbPath = `/club-crests/westmeath/${item.filename}`;

    const success = await downloadFile(item.url, destPath);
    if (success) {
      await prisma.club.update({
        where: { id: club.id },
        data: { imageUrl: dbPath },
      });
      console.log(`✓ ${club.name} - downloaded & linked`);
      fixed++;
    } else {
      console.log(`✗ ${club.name} - download failed`);
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nFixed: ${fixed}`);

  const count = await prisma.club.count({
    where: {
      subRegion: "Westmeath",
      imageUrl: { startsWith: "/club-crests/westmeath/" },
    },
  });
  const total = await prisma.club.count({ where: { subRegion: "Westmeath" } });
  console.log(`Westmeath clubs with local crests: ${count}/${total}`);
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
