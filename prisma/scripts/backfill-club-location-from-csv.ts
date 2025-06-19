import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(__dirname, '../../europe-clubs-info.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let updated = 0;
  for (const row of records) {
    const name = row['Club Name']?.trim();
    const location = [row['City']?.trim(), row['Country']?.trim()].filter(Boolean).join(', ');
    if (!name || !location) continue;
    const club = await prisma.club.findFirst({ where: { name } });
    if (club && (!club.location || club.location === '-')) {
      await prisma.club.update({ where: { id: club.id }, data: { location } });
      updated++;
      console.log(`Updated ${name} with location: ${location}`);
    }
  }
  console.log(`Backfill complete. Updated ${updated} clubs.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 