import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// UTF-8 mojibake fix mappings
const replacements: [string, string][] = [
  ["Ã©", "é"],
  ["Ã³", "ó"],
  ["Ã¡", "á"],
  ["Ã­", "í"],
  ["Ãº", "ú"],
  ["Ã‰", "É"],
  ['Ã"', "Ó"],
  ["Ã", "Á"],
  ["Ãš", "Ú"],
  ["Ã±", "ñ"],
  ["Ã§", "ç"],
  ["Ã¨", "è"],
  ["Ã¼", "ü"],
  ["Ã¶", "ö"],
  ["Ã¤", "ä"],
  ["Ã¢", "â"],
  ["Ã®", "î"],
  ["Ã´", "ô"],
  ["Ã»", "û"],
  ["â€™", "'"],
  ['â€"', "–"],
  ['â€"', "—"],
  ["Â", ""],
];

function fixEncoding(text: string): string {
  let fixed = text;
  for (const [bad, good] of replacements) {
    fixed = fixed.split(bad).join(good);
  }
  return fixed;
}

async function main() {
  const clubs = await prisma.club.findMany({
    where: {
      OR: [
        { name: { contains: "Ã" } },
        { name: { contains: "â€" } },
        { name: { contains: "Â" } },
      ],
    },
    select: { id: true, name: true },
  });

  console.log("Fixing", clubs.length, "clubs...\n");

  let updated = 0;
  for (const club of clubs) {
    const fixedName = fixEncoding(club.name);
    if (fixedName !== club.name) {
      console.log("  " + club.name);
      console.log("  → " + fixedName + "\n");

      await prisma.club.update({
        where: { id: club.id },
        data: { name: fixedName },
      });
      updated++;
    }
  }

  console.log("\nUpdated", updated, "club names");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
