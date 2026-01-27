import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function getInternationalUnitsHandler() {
  try {
    const units = await prisma.internationalUnit.findMany({
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching international units:", error);
    return NextResponse.json(
      { error: "Failed to fetch international units" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(
  RATE_LIMITS.PUBLIC_API,
  getInternationalUnitsHandler
);
