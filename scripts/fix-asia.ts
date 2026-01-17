import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAsia() {
  console.log("=== Fixing Asia Clubs ===\n");

  const asia = await prisma.internationalUnit.findFirst({
    where: { name: "Asia" },
  });
  if (!asia) {
    console.log("Asia unit not found");
    return;
  }

  // Get or create countries with codes
  const countryData: { name: string; code: string }[] = [
    { name: "China", code: "CN" },
    { name: "Hong Kong", code: "HK" },
    { name: "Japan", code: "JP" },
    { name: "South Korea", code: "KR" },
    { name: "Vietnam", code: "VN" },
    { name: "Thailand", code: "TH" },
    { name: "Singapore", code: "SG" },
    { name: "Malaysia", code: "MY" },
    { name: "Indonesia", code: "ID" },
    { name: "Myanmar", code: "MM" },
    { name: "Taiwan", code: "TW" },
    { name: "Cambodia", code: "KH" },
    { name: "Philippines", code: "PH" },
    { name: "India", code: "IN" },
  ];

  const countries: Record<string, { id: string }> = {};
  for (const c of countryData) {
    let country = await prisma.country.findFirst({
      where: { name: c.name, internationalUnitId: asia.id },
    });
    if (!country) {
      country = await prisma.country.create({
        data: { name: c.name, code: c.code, internationalUnitId: asia.id },
      });
      console.log(`Created country: ${c.name}`);
    }
    countries[c.name] = country;
  }

  // Fix typo: "Signapore" -> "Singapore"
  const badSingapore = await prisma.country.findFirst({
    where: { name: "Signapore", internationalUnitId: asia.id },
  });
  const goodSingapore = await prisma.country.findFirst({
    where: { name: "Singapore", internationalUnitId: asia.id },
  });

  if (badSingapore && goodSingapore) {
    // Move clubs from misspelled to correct
    await prisma.club.updateMany({
      where: { countryId: badSingapore.id },
      data: { countryId: goodSingapore.id },
    });
    // Move regions from misspelled to correct
    await prisma.region.updateMany({
      where: { countryId: badSingapore.id },
      data: { countryId: goodSingapore.id },
    });
    // Now safe to delete
    await prisma.country.delete({ where: { id: badSingapore.id } });
    console.log("Fixed typo: Signapore -> Singapore");
    countries["Singapore"] = goodSingapore;
  } else if (badSingapore && !goodSingapore) {
    // Just rename it
    await prisma.country.update({
      where: { id: badSingapore.id },
      data: { name: "Singapore", code: "SG" },
    });
    countries["Singapore"] = badSingapore;
    console.log("Fixed typo: Signapore -> Singapore (renamed)");
  }

  console.log("\n--- Assigning Countries ---\n");

  // Assignments based on location
  const assignments: {
    name: string;
    country: string;
    newName?: string;
    location?: string;
  }[] = [
    // China
    { name: "Beijing GAA", country: "China", location: "Beijing, China" },
    {
      name: "Shanghai GAA",
      country: "China",
      newName: "Shanghai Gaelic Football Club",
      location: "Shanghai, China",
    },
    {
      name: "Shenzhen Celts GAA",
      country: "China",
      newName: "Shenzhen Celts",
      location: "Shenzhen, China",
    },
    {
      name: "Suzhou Éire Óg GAA",
      country: "China",
      newName: "Suzhou Eire Og",
      location: "Suzhou, China",
    },
    // Hong Kong
    { name: "Hong Kong GAA", country: "Hong Kong", location: "Hong Kong" },
    // Japan
    { name: "Japan GAA", country: "Japan", location: "Tokyo, Japan" },
    // South Korea
    {
      name: "Seoul Gaels GAA",
      country: "South Korea",
      newName: "Seoul Gaels",
      location: "Seoul, South Korea",
    },
    {
      name: "Daegu Fianna",
      country: "South Korea",
      location: "Daegu, South Korea",
    },
    {
      name: "Laochra Busan",
      country: "South Korea",
      location: "Busan, South Korea",
    },
    // Vietnam
    {
      name: "Saigon Gaels GAA",
      country: "Vietnam",
      newName: "Saigon Gaels",
      location: "Ho Chi Minh City, Vietnam",
    },
    {
      name: "Na Fianna Ho Chi Minh ",
      country: "Vietnam",
      newName: "Na Fianna Ho Chi Minh",
      location: "Ho Chi Minh City, Vietnam",
    },
    {
      name: "Viet Celts Hanoi",
      country: "Vietnam",
      newName: "Vietnam Celts",
      location: "Hanoi, Vietnam",
    },
    // Thailand
    {
      name: "Thailand GAA",
      country: "Thailand",
      location: "Bangkok, Thailand",
    },
    // Singapore
    {
      name: "Singapore Gaelic Lions",
      country: "Singapore",
      location: "Singapore",
    },
    // Malaysia
    {
      name: "Orang Eire",
      country: "Malaysia",
      location: "Kuala Lumpur, Malaysia",
    },
    {
      name: "Johor Bahru GFC",
      country: "Malaysia",
      newName: "Johor",
      location: "Johor Bahru, Malaysia",
    },
    // Indonesia
    {
      name: "Jakarta Dragonflies",
      country: "Indonesia",
      newName: "Jakarta Dragon Flies",
      location: "Jakarta, Indonesia",
    },
    // Myanmar
    { name: "Myanmar Celts", country: "Myanmar", location: "Yangon, Myanmar" },
    // Taiwan
    { name: "Taiwan Celts", country: "Taiwan", location: "Taipei, Taiwan" },
    // Cambodia
    {
      name: "Cairde Khmer GAA Club",
      country: "Cambodia",
      newName: "Cambodia GAA",
      location: "Phnom Penh, Cambodia",
    },
  ];

  let updated = 0;
  let renamed = 0;
  let locationFixed = 0;

  for (const a of assignments) {
    const club = await prisma.club.findFirst({
      where: { name: a.name, internationalUnitId: asia.id },
    });

    if (club) {
      const updateData: {
        countryId: string;
        name?: string;
        location?: string;
      } = {
        countryId: countries[a.country].id,
      };

      if (a.newName && a.newName !== club.name) {
        updateData.name = a.newName;
        renamed++;
      }

      if (a.location && club.location !== a.location) {
        updateData.location = a.location;
        locationFixed++;
      }

      await prisma.club.update({
        where: { id: club.id },
        data: updateData,
      });

      console.log(
        `✓ ${a.name} -> ${a.country}${a.newName ? ` (renamed to "${a.newName}")` : ""}${updateData.location ? " (location fixed)" : ""}`
      );
      updated++;
    } else {
      console.log(`? NOT FOUND: ${a.name}`);
    }
  }

  // Check for clubs missing from official list
  console.log("\n--- Checking for missing clubs in official list ---\n");

  // Official list from Asian County Board
  const officialClubs = [
    "Thailand GAA",
    "Beijing GAA",
    "Daegu Fianna",
    "Dalian Wolfhounds",
    "Hong Kong GAA",
    "India Wolfhounds",
    "Jakarta Dragon Flies",
    "Japan GAA",
    "Laochra Busan",
    "Myanmar Celts",
    "Orang Eire",
    "Saigon Gaels",
    "Seoul Gaels",
    "Shanghai Gaelic Football Club",
    "Shenzhen Celts",
    "Singapore Gaelic Lions",
    "Suzhou Eire Og",
    "Taiwan Celts",
    "Vietnam Celts",
    "Cambodia GAA",
    "Manilla GAA",
    "Shunde Gaels",
    "South Africa Gaels",
    "Na Fianna Ho Chi Minh",
    "Johor",
  ];

  const dbClubs = await prisma.club.findMany({
    where: { internationalUnitId: asia.id },
    select: { name: true },
  });
  const dbClubNames = dbClubs.map((c) => c.name);

  // Clubs in official list but not in DB
  const missing = officialClubs.filter((name) => !dbClubNames.includes(name));
  if (missing.length > 0) {
    console.log("Missing from database (in official list):");
    missing.forEach((m) => console.log(`  - ${m}`));
  }

  // Clubs in DB but not in official list
  const extra = dbClubNames.filter((name) => !officialClubs.includes(name));
  if (extra.length > 0) {
    console.log("\nExtra in database (not in official list):");
    extra.forEach((e) => console.log(`  - ${e}`));
  }

  console.log("\n=== Summary ===");
  console.log(`Updated: ${updated}`);
  console.log(`Renamed: ${renamed}`);
  console.log(`Locations fixed: ${locationFixed}`);

  // Final count by country
  const final = await prisma.club.groupBy({
    by: ["countryId"],
    where: { internationalUnitId: asia.id },
    _count: true,
  });

  console.log("\nBy Country:");
  for (const f of final) {
    if (f.countryId) {
      const country = await prisma.country.findUnique({
        where: { id: f.countryId },
      });
      console.log(`  ${country?.name}: ${f._count}`);
    } else {
      console.log(`  No country: ${f._count}`);
    }
  }

  const total = await prisma.club.count({
    where: { internationalUnitId: asia.id },
  });
  console.log(`\nTotal Asia clubs: ${total}`);
}

fixAsia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
