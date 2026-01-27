import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function getCountriesHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    const where = unitId ? { internationalUnitId: unitId } : {};

    const countries = await prisma.country.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        hasRegions: true,
        internationalUnitId: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getCountriesHandler);
