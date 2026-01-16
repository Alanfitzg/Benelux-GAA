import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Check if a date clashes with GAA fixtures
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const endDateStr = searchParams.get("endDate");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const eventDate = new Date(dateStr);
    const eventEndDate = endDateStr ? new Date(endDateStr) : eventDate;

    // Find any fixtures that overlap with the event dates
    // A clash occurs if:
    // - Fixture date falls within event range, OR
    // - Event date falls within fixture range (if fixture has endDate)
    const clashingFixtures = await prisma.gAAFixture.findMany({
      where: {
        OR: [
          // Fixture date falls on or between event start and end
          {
            date: {
              gte: eventDate,
              lte: eventEndDate,
            },
          },
          // Event starts on a fixture date
          {
            date: {
              lte: eventDate,
            },
            endDate: {
              gte: eventDate,
            },
          },
          // Event ends on a fixture date
          {
            date: {
              lte: eventEndDate,
            },
            endDate: {
              gte: eventEndDate,
            },
          },
        ],
      },
      orderBy: { impact: "desc" },
    });

    const hasClash = clashingFixtures.length > 0;
    const highestImpact =
      clashingFixtures.length > 0 ? clashingFixtures[0].impact : null;

    return NextResponse.json({
      hasClash,
      fixtures: clashingFixtures,
      highestImpact,
      message: hasClash
        ? `This date clashes with ${clashingFixtures.length} GAA fixture(s). Irish teams are unlikely to travel.`
        : null,
    });
  } catch (error) {
    console.error("Error checking fixture clash:", error);
    return NextResponse.json(
      { error: "Failed to check fixture clash" },
      { status: 500 }
    );
  }
}
