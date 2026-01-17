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

const IRELAND_COUNTRIES = ["Ireland", "Northern Ireland"];

const BRITAIN_COUNTRIES = [
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
  "Britain",
  "Great Britain",
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
    // Count clubs that are APPROVED and have at least one CLUB_ADMIN
    // This ensures only "activated" clubs (where a club admin has joined) are included
    const clubsWithAdmins = await prisma.club.findMany({
      where: {
        status: "APPROVED",
        admins: {
          some: {
            role: "CLUB_ADMIN",
          },
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
          where: {
            role: "CLUB_ADMIN",
          },
          select: {
            id: true,
            email: true,
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
        id: "ireland",
        name: "Ireland",
        description: "Clubs in Ireland (32 counties)",
        clubCount: countByRegion(IRELAND_COUNTRIES),
      },
      {
        id: "britain",
        name: "Britain",
        description: "Clubs in England, Scotland, and Wales",
        clubCount: countByRegion(BRITAIN_COUNTRIES),
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
