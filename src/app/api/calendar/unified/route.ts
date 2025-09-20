import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 });
    }

    // Get all mainland Europe clubs
    const mainlandClubs = await prisma.club.findMany({
      where: { isMainlandEurope: true },
      select: { id: true, name: true }
    });

    const clubIds = mainlandClubs.map(club => club.id);

    // Fetch all events from mainland Europe clubs
    const events = await prisma.calendarEvent.findMany({
      where: {
        clubId: { in: clubIds },
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        club: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    // Fetch aggregated interests
    const interests = await prisma.calendarInterest.findMany({
      where: {
        clubId: { in: clubIds },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Group interests by date
    const aggregatedInterests = interests.reduce((acc, interest) => {
      const dateKey = interest.date.toISOString().split('T')[0];

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalSubmissions: 0,
          uniqueUsers: new Set(),
          clubs: new Set()
        };
      }

      acc[dateKey].totalSubmissions += interest.submissionCount;
      acc[dateKey].uniqueUsers.add(interest.userId);
      acc[dateKey].clubs.add(interest.clubId);

      return acc;
    }, {} as Record<string, { date: string; totalSubmissions: number; uniqueUsers: Set<string>; clubs: Set<string> }>);

    // Format aggregated interests
    const formattedInterests = Object.values(aggregatedInterests).map((item: { date: string; totalSubmissions: number; uniqueUsers: Set<string>; clubs: Set<string> }) => ({
      date: item.date,
      totalSubmissions: item.totalSubmissions,
      uniqueUsers: item.uniqueUsers.size,
      clubCount: item.clubs.size,
    }));

    // Fetch priority weekends
    const priorityWeekends = await prisma.priorityWeekend.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Fetch Irish holidays only
    const holidays = await prisma.holiday.findMany({
      where: {
        country: 'IE',
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    return NextResponse.json({
      events,
      interests: formattedInterests,
      priorityWeekends,
      holidays,
      clubs: mainlandClubs,
    });

  } catch (error) {
    console.error("Error fetching unified calendar data:", error);
    return NextResponse.json(
      { error: "Failed to fetch unified calendar data" },
      { status: 500 }
    );
  }
}