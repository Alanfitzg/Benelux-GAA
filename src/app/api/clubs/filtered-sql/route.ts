import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function getFilteredClubsHandlerSQL(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");
    const regionId = searchParams.get("regionId");
    const search = searchParams.get("search");

    if (!countryId) {
      return NextResponse.json(
        { error: "countryId is required" },
        { status: 400 }
      );
    }

    let clubs;

    if (regionId) {
      // Filter by both country and region
      if (search && search.length >= 2) {
        clubs = await prisma.$queryRaw`
          SELECT id, name, location, "sportsSupported", "verificationStatus", "dataSource", "imageUrl", "countryId", "regionId"
          FROM "Club"
          WHERE "countryId" = ${countryId}
            AND "regionId" = ${regionId}
            AND status = 'APPROVED'
            AND (name ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"})
          ORDER BY name ASC
          LIMIT 100
        `;
      } else {
        clubs = await prisma.$queryRaw`
          SELECT id, name, location, "sportsSupported", "verificationStatus", "dataSource", "imageUrl", "countryId", "regionId"
          FROM "Club"
          WHERE "countryId" = ${countryId}
            AND "regionId" = ${regionId}
            AND status = 'APPROVED'
          ORDER BY name ASC
          LIMIT 100
        `;
      }
    } else {
      // Filter by country only
      if (search && search.length >= 2) {
        clubs = await prisma.$queryRaw`
          SELECT id, name, location, "sportsSupported", "verificationStatus", "dataSource", "imageUrl", "countryId", "regionId"
          FROM "Club"
          WHERE "countryId" = ${countryId}
            AND status = 'APPROVED'
            AND (name ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"})
          ORDER BY name ASC
          LIMIT 100
        `;
      } else {
        clubs = await prisma.$queryRaw`
          SELECT id, name, location, "sportsSupported", "verificationStatus", "dataSource", "imageUrl", "countryId", "regionId"
          FROM "Club"
          WHERE "countryId" = ${countryId}
            AND status = 'APPROVED'
          ORDER BY name ASC
          LIMIT 100
        `;
      }
    }

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching filtered clubs via SQL:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(
  RATE_LIMITS.PUBLIC_API,
  getFilteredClubsHandlerSQL
);
