import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function getCountriesHandlerSQL(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    let countries;

    if (unitId) {
      console.log("Fetching countries for unitId:", unitId);
      countries = await prisma.$queryRaw`
        SELECT id, code, name, "hasRegions", "internationalUnitId", "displayOrder"
        FROM "Country"
        WHERE "internationalUnitId" = ${unitId}::text
        ORDER BY "displayOrder" ASC
      `;
      console.log("Found countries:", countries);
    } else {
      countries = await prisma.$queryRaw`
        SELECT id, code, name, "hasRegions", "internationalUnitId", "displayOrder"
        FROM "Country"
        ORDER BY "displayOrder" ASC
      `;
    }

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries via SQL:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(
  RATE_LIMITS.PUBLIC_API,
  getCountriesHandlerSQL
);
