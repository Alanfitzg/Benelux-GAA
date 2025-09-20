import { prisma } from "@/lib/prisma";

// List of mainland European countries eligible for calendar feature
export const MAINLAND_EUROPE_COUNTRIES = [
  "Germany",
  "France",
  "Spain",
  "Netherlands",
  "Belgium",
  "Luxembourg",
  "Switzerland",
  "Austria",
  "Italy",
  "Poland",
  "Czech Republic",
  "Slovakia",
  "Hungary",
  "Slovenia",
  "Croatia",
  "Denmark",
  "Sweden",
  "Norway",
  "Finland",
  "Portugal",
  "Lithuania",
  "Latvia",
  "Estonia",
  "Romania",
  "Bulgaria",
];

// Country codes for API integration
export const MAINLAND_EUROPE_COUNTRY_CODES: Record<string, string> = {
  "Germany": "DE",
  "France": "FR",
  "Spain": "ES",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Luxembourg": "LU",
  "Switzerland": "CH",
  "Austria": "AT",
  "Italy": "IT",
  "Poland": "PL",
  "Czech Republic": "CZ",
  "Slovakia": "SK",
  "Hungary": "HU",
  "Slovenia": "SI",
  "Croatia": "HR",
  "Denmark": "DK",
  "Sweden": "SE",
  "Norway": "NO",
  "Finland": "FI",
  "Portugal": "PT",
  "Lithuania": "LT",
  "Latvia": "LV",
  "Estonia": "EE",
  "Romania": "RO",
  "Bulgaria": "BG",
};

// Excluded regions
export const EXCLUDED_REGIONS = [
  "Ireland",
  "Northern Ireland",
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
];

export async function checkMainlandEuropeAccess(clubId: string): Promise<boolean> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      isMainlandEurope: true,
      country: {
        select: { name: true }
      },
      region: true,
      location: true,
    },
  });

  if (!club) return false;

  // First check the flag
  if (club.isMainlandEurope) return true;

  // Check country
  const countryName = club.country?.name || club.region || club.location;
  if (!countryName) return false;

  // Check if in mainland Europe
  const isMainlandEurope = MAINLAND_EUROPE_COUNTRIES.some(country =>
    countryName.toLowerCase().includes(country.toLowerCase())
  );

  // Check if in excluded regions
  const isExcluded = EXCLUDED_REGIONS.some(region =>
    countryName.toLowerCase().includes(region.toLowerCase())
  );

  return isMainlandEurope && !isExcluded;
}

export async function updateClubGeoStatus(clubId: string): Promise<void> {
  const isEligible = await checkMainlandEuropeAccess(clubId);

  await prisma.club.update({
    where: { id: clubId },
    data: { isMainlandEurope: isEligible },
  });
}

export async function updateAllClubsGeoStatus(): Promise<void> {
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      country: {
        select: { name: true }
      },
      region: true,
      location: true,
    },
  });

  for (const club of clubs) {
    const countryName = club.country?.name || club.region || club.location;
    if (!countryName) continue;

    const isMainlandEurope = MAINLAND_EUROPE_COUNTRIES.some(country =>
      countryName.toLowerCase().includes(country.toLowerCase())
    );

    const isExcluded = EXCLUDED_REGIONS.some(region =>
      countryName.toLowerCase().includes(region.toLowerCase())
    );

    await prisma.club.update({
      where: { id: club.id },
      data: { isMainlandEurope: isMainlandEurope && !isExcluded },
    });
  }
}

export function getCountryCode(countryName: string): string | undefined {
  const entry = Object.entries(MAINLAND_EUROPE_COUNTRY_CODES).find(([country]) =>
    countryName.toLowerCase().includes(country.toLowerCase())
  );
  return entry?.[1];
}