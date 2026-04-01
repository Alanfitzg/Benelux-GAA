import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clubSocialUpdates: {
  name: string;
  facebook: string | null;
  instagram: string;
  twitter: string | null;
}[] = [
  {
    name: "Aachen Gaels",
    facebook: "https://www.facebook.com/AachenGaels",
    instagram: "https://www.instagram.com/aachengaels/",
    twitter: null,
  },
  {
    name: "Amsterdam GAC",
    facebook: "https://www.facebook.com/AmsterdamGAC",
    instagram: "https://www.instagram.com/amsterdamgac/",
    twitter: "https://x.com/AmsterdamGAC",
  },
  {
    name: "An Craobh Rua",
    facebook: "https://www.facebook.com/brusselscraobhrua",
    instagram: "https://www.instagram.com/belgiumgaa/",
    twitter: "https://x.com/BelgiumGAA",
  },
  {
    name: "CLG Den Haag",
    facebook: "https://www.facebook.com/DenHaagGAA",
    instagram: "https://www.instagram.com/denhaaggaa/",
    twitter: "https://x.com/denhaaggaa",
  },
  {
    name: "Cologne Celtics",
    facebook: "https://www.facebook.com/CologneGAA",
    instagram: "https://www.instagram.com/cologneceltics/",
    twitter: "https://x.com/cologneceltics",
  },
  {
    name: "Darmstadt GAA",
    facebook: "https://www.facebook.com/DarmstadtGAA",
    instagram: "https://www.instagram.com/darmstadtgaa/",
    twitter: "https://x.com/darmstadtgaa",
  },
  {
    name: "Dusseldorf GFC",
    facebook: "https://www.facebook.com/Dusseldorf_Gaelic",
    instagram: "https://www.instagram.com/duesseldorf_gaa/",
    twitter: "https://x.com/duesseldorfgaa",
  },
  {
    name: "Earls of Leuven",
    facebook: "https://www.facebook.com/LeuvenEarls",
    instagram: "https://www.instagram.com/leuvengaa/",
    twitter: "https://x.com/LeuvenEarls",
  },
  {
    name: "Eindhoven Shamrocks GAA",
    facebook: "https://www.facebook.com/EindhovenShamrocks",
    instagram: "https://www.instagram.com/eindhovengaa/",
    twitter: "https://x.com/EindhovenShams",
  },
  {
    name: "Eintracht Frankfurt GAA",
    facebook: "https://www.facebook.com/FrankfurtGAA",
    instagram: "https://www.instagram.com/frankfurtgaa/",
    twitter: "https://x.com/FrankfurtGAA",
  },
  {
    name: "Gaelic Sports Club Luxembourg",
    facebook: "https://www.facebook.com/LuxembourgGAA",
    instagram: "https://www.instagram.com/luxgaa/",
    twitter: "https://x.com/LuxembourgGAA",
  },
  {
    name: "Groningen Gaels",
    facebook: "https://www.facebook.com/GroningenGaels",
    instagram: "https://www.instagram.com/groningengaels/",
    twitter: "https://x.com/groningengaels",
  },
  {
    name: "Hamburg GAA",
    facebook: "https://www.facebook.com/HamburgGAA",
    instagram: "https://www.instagram.com/hamburggaa/",
    twitter: "https://x.com/HamburgGAA",
  },
  {
    name: "Maastricht Gaels",
    facebook: "https://www.facebook.com/MaastrichtGaels",
    instagram: "https://www.instagram.com/maastrichtgaels/",
    twitter: "https://x.com/maastrichtgaels",
  },
  {
    name: "Nijmegen GFC",
    facebook: "https://www.facebook.com/NijmegenGaelic",
    instagram: "https://www.instagram.com/nijmegengfc/",
    twitter: "https://x.com/nijmegengfc",
  },
];

async function main() {
  console.log("Updating Benelux club social links from PDF...\n");

  for (const club of clubSocialUpdates) {
    const result = await prisma.club.updateMany({
      where: { name: club.name },
      data: {
        facebook: club.facebook,
        instagram: club.instagram,
        twitter: club.twitter,
      },
    });

    if (result.count > 0) {
      console.log(`  ${club.name}: updated`);
    } else {
      console.log(`  ${club.name}: NOT FOUND`);
    }
  }

  console.log("\nDone!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  prisma.$disconnect();
  process.exit(1);
});
