import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      where: {
        status: "APPROVED",
        isMainlandEurope: true,
        OR: [
          { location: { contains: "Netherlands", mode: "insensitive" } },
          { location: { contains: "Belgium", mode: "insensitive" } },
          { location: { contains: "Luxembourg", mode: "insensitive" } },
          { location: { contains: "Aachen", mode: "insensitive" } },
          { location: { contains: "Cologne", mode: "insensitive" } },
          { location: { contains: "Düsseldorf", mode: "insensitive" } },
          { location: { contains: "Dusseldorf", mode: "insensitive" } },
          { location: { contains: "Darmstadt", mode: "insensitive" } },
          { location: { contains: "Hamburg", mode: "insensitive" } },
          { location: { contains: "Frankfurt", mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        location: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        website: true,
        facebook: true,
        instagram: true,
        twitter: true,
        tiktok: true,
        foundedYear: true,
        sportsSupported: true,
      },
      orderBy: { name: "asc" },
    });

    const clubsWithCountry = clubs.map((club) => {
      let country = "Unknown";
      let countryCode = "XX";

      if (club.location) {
        const loc = club.location.toLowerCase();
        if (
          loc.includes("netherlands") ||
          loc.includes("amsterdam") ||
          loc.includes("den haag") ||
          loc.includes("rotterdam") ||
          loc.includes("nijmegen") ||
          loc.includes("eindhoven") ||
          loc.includes("maastricht") ||
          loc.includes("groningen")
        ) {
          country = "Netherlands";
          countryCode = "NL";
        } else if (
          loc.includes("belgium") ||
          loc.includes("brussels") ||
          loc.includes("antwerp") ||
          loc.includes("leuven")
        ) {
          country = "Belgium";
          countryCode = "BE";
        } else if (loc.includes("luxembourg")) {
          country = "Luxembourg";
          countryCode = "LU";
        } else if (
          loc.includes("germany") ||
          loc.includes("aachen") ||
          loc.includes("cologne") ||
          loc.includes("düsseldorf") ||
          loc.includes("dusseldorf") ||
          loc.includes("darmstadt") ||
          loc.includes("hamburg") ||
          loc.includes("frankfurt")
        ) {
          country = "Germany";
          countryCode = "DE";
        }
      }

      return {
        ...club,
        country,
        countryCode,
      };
    });

    return NextResponse.json(clubsWithCountry);
  } catch (error) {
    console.error("Error fetching Benelux clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}
