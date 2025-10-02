import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function getIrishClubsHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countyCode = searchParams.get("countyCode");

    if (!countyCode) {
      return NextResponse.json(
        { error: "countyCode is required" },
        { status: 400 }
      );
    }

    // Get Ireland international unit ID to include both Republic of Ireland and Northern Ireland
    const irelandUnit = (await prisma.$queryRaw`
      SELECT id FROM "InternationalUnit" WHERE code = 'IRE'
    `) as { id: string }[];

    if (!irelandUnit.length) {
      return NextResponse.json(
        { error: "Ireland international unit not found" },
        { status: 400 }
      );
    }

    const irelandUnitId = irelandUnit[0].id;

    // Get clubs for the specific county from both Republic of Ireland and Northern Ireland
    // This includes clubs with countryId = null (Republic) and clubs with UK countryId (Northern Ireland)
    const clubs = await prisma.$queryRaw`
      SELECT id, name, location, "sportsSupported", "verificationStatus", "dataSource", "imageUrl", codes as county
      FROM "Club"
      WHERE "internationalUnitId" = ${irelandUnitId}
        AND codes = ${countyCode}
        AND status = 'APPROVED'
      ORDER BY name ASC
      LIMIT 100
    `;

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching Irish clubs by county:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getIrishClubsHandler);
