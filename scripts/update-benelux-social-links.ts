import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Verified social media links for Benelux GAA clubs
// These have been researched and verified against official club websites and search results
const clubSocialUpdates = [
  {
    name: "Amsterdam GAC",
    instagram: "https://www.instagram.com/amsterdamgac/",
    facebook: "https://www.facebook.com/amsterdamgac",
    twitter: "https://x.com/AmsterdamGAC",
    website: "https://amsterdamgac.nl/",
  },
  {
    name: "CLG Den Haag",
    instagram: "https://www.instagram.com/denhaaggaa/",
    facebook: null,
    twitter: "https://x.com/denhaaggaa",
    website: "https://denhaaggaa.com/",
  },
  {
    name: "An Craobh Rua",
    instagram: "https://www.instagram.com/brussels_gaa/",
    facebook: "https://www.facebook.com/BrusselsCraobhRua",
    twitter: "https://x.com/BelgiumGAA",
    website: "https://brussels-gaa.com/",
  },
  {
    name: "Earls of Leuven",
    instagram: "https://www.instagram.com/leuvengaa/",
    facebook: "https://www.facebook.com/LeuvenEarls/",
    twitter: "https://x.com/LeuvenEarls",
    tiktok: "https://www.tiktok.com/@earlsofleuvengaa",
    website: "https://www.leuvengaa.com/",
  },
  {
    name: "Eindhoven Shamrocks GAA",
    instagram: "https://www.instagram.com/eindhovengaa/",
    facebook: null,
    twitter: null,
    website: "https://www.eindhovengaa.nl/",
  },
  {
    name: "Groningen Gaels",
    instagram: "https://www.instagram.com/groningengaels/",
    facebook: null,
    twitter: null,
    website: null,
  },
  {
    name: "Maastricht Gaels",
    instagram: "https://www.instagram.com/maastrichtgaels/",
    facebook: null,
    twitter: "https://x.com/MaastrichtGaels",
    website: "https://maastrichtgaels.nl/",
  },
  {
    name: "Nijmegen GFC",
    instagram: "https://www.instagram.com/nijmegengfc/",
    facebook: null,
    twitter: null,
    website: "https://www.nijmegengaa.com/",
  },
  {
    name: "Gaelic Sports Club Luxembourg",
    instagram: "https://www.instagram.com/luxgaa/",
    facebook: null,
    twitter: "https://x.com/luxembourggaa",
    website: "https://luxgaa.lu/",
  },
  {
    name: "Cologne Celtics",
    instagram: "https://www.instagram.com/cologneceltics/",
    facebook: "https://www.facebook.com/CologneCeltics/",
    twitter: "https://x.com/cologneceltics",
    website: "https://cologneceltics.com/",
  },
  {
    name: "Darmstadt GAA",
    instagram: "https://www.instagram.com/darmstadtgaa/",
    facebook: null,
    twitter: null,
    website: "https://darmstadtgaa.de/",
  },
  {
    name: "Dusseldorf GFC",
    instagram: "https://www.instagram.com/duesseldorf_gaa/",
    facebook: null,
    twitter: null,
    website: null,
  },
  {
    name: "Hamburg GAA",
    instagram: "https://www.instagram.com/hamburggaa/",
    facebook: null,
    twitter: "https://x.com/HamburgGAA",
    website: "https://hamburggaa.de/",
  },
  {
    name: "Eintracht Frankfurt GAA",
    instagram: "https://www.instagram.com/frankfurtgaa/",
    facebook: null,
    twitter: null,
    website: null,
  },
  {
    name: "EC Brussels Youth",
    instagram: null,
    facebook: null,
    twitter: null,
    website: "https://www.playgaa.be/",
  },
  // Aachen Gaels - no verified social media found
];

async function updateClubSocialLinks() {
  console.log("Starting Benelux club social media link updates...\n");

  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  for (const clubData of clubSocialUpdates) {
    const club = await prisma.club.findFirst({
      where: {
        name: clubData.name,
        isMainlandEurope: true,
      },
      select: {
        id: true,
        name: true,
        instagram: true,
        facebook: true,
        twitter: true,
        tiktok: true,
        website: true,
      },
    });

    if (!club) {
      console.log(`❌ Club not found: ${clubData.name}`);
      notFound++;
      continue;
    }

    // Build update object - only update fields that have new values
    const updateData: Record<string, string | null> = {};

    if (clubData.instagram && club.instagram !== clubData.instagram) {
      updateData.instagram = clubData.instagram;
    }
    if (clubData.facebook && club.facebook !== clubData.facebook) {
      updateData.facebook = clubData.facebook;
    }
    if (clubData.twitter && club.twitter !== clubData.twitter) {
      updateData.twitter = clubData.twitter;
    }
    if (
      "tiktok" in clubData &&
      clubData.tiktok &&
      club.tiktok !== clubData.tiktok
    ) {
      updateData.tiktok = clubData.tiktok;
    }
    if (clubData.website && club.website !== clubData.website) {
      // Only update website if current one is empty or is a Twitter URL (incorrect)
      if (!club.website || club.website.includes("twitter.com")) {
        updateData.website = clubData.website;
      }
    }

    if (Object.keys(updateData).length === 0) {
      console.log(`⏭️  ${club.name}: No updates needed`);
      skipped++;
      continue;
    }

    await prisma.club.update({
      where: { id: club.id },
      data: updateData,
    });

    console.log(
      `✅ ${club.name}: Updated ${Object.keys(updateData).join(", ")}`
    );
    updated++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no changes): ${skipped}`);
  console.log(`Not found: ${notFound}`);
}

updateClubSocialLinks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
