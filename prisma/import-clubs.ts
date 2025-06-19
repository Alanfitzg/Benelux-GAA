import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path, { dirname } from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const csvPath = path.join(__dirname, '../europe-clubs-info.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for (const row of records) {
    await prisma.club.create({
      data: {
        name: row['Club Name']?.trim() || '',
        region: row['Region']?.trim() || null,
        subRegion: row['Sub-region']?.trim() || null,
        map: row['Map']?.trim() || null,
        location: [row['City']?.trim(), row['Country']?.trim()].filter(Boolean).join(', ') || null,
        facebook: row['Facebook']?.trim() || null,
        instagram: row['Instagram']?.trim() || null,
        website: row['Website']?.trim() || null,
        codes: row['Codes']?.trim() || null,
      },
    });
  }

  console.log('Club data import complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 