import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";

const EUROPEAN_COUNTRIES = [
  "Germany",
  "France",
  "Spain",
  "Netherlands",
  "Belgium",
  "Austria",
  "Switzerland",
  "Italy",
  "Czech Republic",
  "Poland",
  "Hungary",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Portugal",
  "Luxembourg",
  "Slovakia",
  "Croatia",
  "Slovenia",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Romania",
  "Bulgaria",
  "Greece",
  "Cyprus",
  "Malta",
];

const UK_IRELAND_COUNTRIES = [
  "Ireland",
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
];

const NORTH_AMERICA_COUNTRIES = ["United States", "Canada", "USA", "Mexico"];

const ASIA_PACIFIC_COUNTRIES = [
  "Australia",
  "New Zealand",
  "Japan",
  "China",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "Thailand",
  "Vietnam",
  "Malaysia",
  "Philippines",
  "Indonesia",
  "India",
];

const MIDDLE_EAST_AFRICA_COUNTRIES = [
  "United Arab Emirates",
  "Dubai",
  "Abu Dhabi",
  "Qatar",
  "Bahrain",
  "Saudi Arabia",
  "Kuwait",
  "Oman",
  "South Africa",
  "Kenya",
  "Nigeria",
  "Egypt",
  "Morocco",
];

export async function GET() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count clubs with admins in each region
    const clubsWithAdmins = await prisma.club.findMany({
      where: {
        admins: {
          some: {},
        },
      },
      select: {
        id: true,
        location: true,
        country: {
          select: {
            name: true,
          },
        },
        admins: {
          select: {
            id: true,
          },
        },
      },
    });

    const countByRegion = (countryList: string[]) => {
      return clubsWithAdmins.filter((club) => {
        const countryName = club.country?.name || "";
        const location = club.location || "";
        return countryList.some(
          (c) =>
            countryName.toLowerCase().includes(c.toLowerCase()) ||
            location.toLowerCase().includes(c.toLowerCase())
        );
      }).length;
    };

    const groups = [
      {
        id: "mainland-europe",
        name: "Mainland Europe",
        description: "All clubs in continental Europe",
        clubCount: countByRegion(EUROPEAN_COUNTRIES),
      },
      {
        id: "uk-ireland",
        name: "UK & Ireland",
        description: "Clubs in United Kingdom and Ireland",
        clubCount: countByRegion(UK_IRELAND_COUNTRIES),
      },
      {
        id: "north-america",
        name: "North America",
        description: "Clubs in USA and Canada",
        clubCount: countByRegion(NORTH_AMERICA_COUNTRIES),
      },
      {
        id: "asia-pacific",
        name: "Asia Pacific",
        description: "Clubs in Asia, Australia, and New Zealand",
        clubCount: countByRegion(ASIA_PACIFIC_COUNTRIES),
      },
      {
        id: "middle-east-africa",
        name: "Middle East & Africa",
        description: "Clubs in Middle East and Africa",
        clubCount: countByRegion(MIDDLE_EAST_AFRICA_COUNTRIES),
      },
      {
        id: "all-clubs",
        name: "All Clubs",
        description: "Every club in the system with admins",
        clubCount: clubsWithAdmins.length,
      },
    ];

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching distribution groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch distribution groups" },
      { status: 500 }
    );
  }
}
