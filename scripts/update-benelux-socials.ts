import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Only includes links that were verified with high confidence
const clubUpdates: Record<
  string,
  {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    foundedYear?: number;
  }
> = {
  "Amsterdam GAC": {
    website: "https://amsterdamgac.nl/",
    facebook: "https://www.facebook.com/amsterdamGAC/",
    instagram: "https://www.instagram.com/amsterdamgac/",
    twitter: "https://twitter.com/AmsterdamGAC",
    foundedYear: 2003,
  },
  "An Craobh Rua": {
    website: "https://brussels-gaa.com/",
    facebook: "https://www.facebook.com/BrusselsCraobhRua",
    instagram: "https://www.instagram.com/brussels_gaa/",
    twitter: "https://x.com/BelgiumGAA",
    foundedYear: 2003,
  },
  "CLG Den Haag": {
    website: "https://denhaaggaa.com/",
    facebook: "https://www.facebook.com/DenHaagGaa/",
    instagram: "https://www.instagram.com/denhaaggaa/",
    twitter: "https://twitter.com/denhaaggaa",
    foundedYear: 1974,
  },
  "Cologne Celtics": {
    website: "https://cologneceltics.com/",
    facebook: "https://www.facebook.com/CologneCeltics/",
    instagram: "https://www.instagram.com/cologneceltics/",
    twitter: "https://twitter.com/cologneceltics",
    foundedYear: 2012,
  },
  "Darmstadt GAA": {
    website: "https://darmstadtgaa.de/",
    facebook: "https://www.facebook.com/DarmstadtGAA",
    instagram: "https://www.instagram.com/darmstadtgaa/",
    foundedYear: 2015,
  },
  "Dusseldorf GFC": {
    facebook: "https://www.facebook.com/DuesseldorfGAA/",
    instagram: "https://www.instagram.com/duesseldorf_gaa/",
    foundedYear: 1992,
  },
  "Earls of Leuven": {
    website: "https://www.leuvengaa.com/",
    facebook: "https://www.facebook.com/LeuvenEarls/",
    instagram: "https://www.instagram.com/leuvengaa/",
    twitter: "https://twitter.com/leuvenearls",
    foundedYear: 2015,
  },
  "EC Brussels Youth": {
    website: "https://www.playgaa.be/",
    foundedYear: 1980,
  },
  "Eindhoven Shamrocks GAA": {
    website: "https://www.eindhovengaa.nl/",
    facebook: "https://www.facebook.com/EindhovenShamrocks/",
    instagram: "https://www.instagram.com/eindhovengaa/",
    twitter: "https://twitter.com/eindhoven_shams",
    foundedYear: 2013,
  },
  "Groningen Gaels": {
    instagram: "https://www.instagram.com/groningengaels/",
    foundedYear: 2018,
  },
  "Hamburg GAA": {
    website: "https://hamburggaa.de/",
    facebook: "https://www.facebook.com/HamburgGAA/",
    instagram: "https://www.instagram.com/hamburggaa/",
    twitter: "https://twitter.com/HamburgGAA",
    foundedYear: 2015,
  },
  "Luxembourg GAA": {
    website: "https://luxgaa.lu/",
    instagram: "https://www.instagram.com/luxgaa/",
    twitter: "https://twitter.com/luxembourggaa",
    foundedYear: 1978,
  },
  "Gaelic Sports Club Luxembourg": {
    website: "https://luxgaa.lu/",
    instagram: "https://www.instagram.com/luxgaa/",
    twitter: "https://twitter.com/luxembourggaa",
    foundedYear: 1978,
  },
  "Maastricht Gaels": {
    website: "https://maastrichtgaels.nl/",
    instagram: "https://www.instagram.com/maastrichtgaels/",
    twitter: "https://twitter.com/MaastrichtGaels",
    foundedYear: 2004,
  },
  "Nijmegen GFC": {
    website: "https://www.nijmegengaa.com/",
    facebook: "https://www.facebook.com/NijmegenGFC/",
    instagram: "https://www.instagram.com/nijmegengfc/",
    foundedYear: 2021,
  },
  "Aachen Gaels": {
    foundedYear: 2025,
  },
};

async function main() {
  console.log(
    "Updating Benelux club social media links and founded years...\n"
  );

  for (const [clubName, data] of Object.entries(clubUpdates)) {
    try {
      const club = await prisma.club.findFirst({
        where: { name: { equals: clubName, mode: "insensitive" } },
        select: {
          id: true,
          name: true,
          website: true,
          facebook: true,
          instagram: true,
          twitter: true,
          foundedYear: true,
        },
      });

      if (!club) {
        console.log(`  ❌ Club not found: ${clubName}`);
        continue;
      }

      const updateData: Record<string, string | number> = {};

      // Only update fields that are provided and currently empty/null
      if (data.website && !club.website) updateData.website = data.website;
      if (data.facebook && !club.facebook) updateData.facebook = data.facebook;
      if (data.instagram && !club.instagram)
        updateData.instagram = data.instagram;
      if (data.twitter && !club.twitter) updateData.twitter = data.twitter;
      if (data.foundedYear && !club.foundedYear)
        updateData.foundedYear = data.foundedYear;

      // Also update if existing values are placeholder "#"
      if (data.website && club.website === "#")
        updateData.website = data.website;
      if (data.facebook && club.facebook === "#")
        updateData.facebook = data.facebook;
      if (data.instagram && club.instagram === "#")
        updateData.instagram = data.instagram;
      if (data.twitter && club.twitter === "#")
        updateData.twitter = data.twitter;

      if (Object.keys(updateData).length === 0) {
        console.log(`  ✓ ${club.name} - already up to date`);
        continue;
      }

      await prisma.club.update({
        where: { id: club.id },
        data: updateData,
      });

      console.log(
        `  ✅ ${club.name} - updated: ${Object.keys(updateData).join(", ")}`
      );
    } catch (error) {
      console.error(`  ❌ Error updating ${clubName}:`, error);
    }
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
