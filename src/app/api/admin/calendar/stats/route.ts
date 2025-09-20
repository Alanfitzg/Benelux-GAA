import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get events by month for the current year
    const currentYear = new Date().getFullYear();
    const eventsByMonth = await prisma.calendarEvent.groupBy({
      by: ['startDate'],
      where: {
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      _count: true,
    });

    // Process events by month
    const monthlyEvents = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' });
      const count = eventsByMonth.filter(event =>
        new Date(event.startDate).getMonth() === i
      ).length;
      return { month, count };
    });

    // Get interest submissions by club
    const interestsByClub = await prisma.calendarInterest.groupBy({
      by: ['clubId'],
      _sum: {
        submissionCount: true,
      },
      _count: true,
    });

    // Get club names for the results
    const clubIds = interestsByClub.map(item => item.clubId);
    const clubs = await prisma.club.findMany({
      where: { id: { in: clubIds } },
      select: { id: true, name: true },
    });

    const interestsByClubWithNames = interestsByClub
      .map(item => {
        const club = clubs.find(c => c.id === item.clubId);
        return {
          clubName: club?.name || 'Unknown Club',
          submissions: item._sum.submissionCount || 0,
        };
      })
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 10); // Top 10 clubs

    // Get upcoming holidays (Irish only)
    const upcomingHolidays = await prisma.holiday.findMany({
      where: {
        country: 'IE',
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Next 90 days
        },
      },
      select: {
        date: true,
        name: true,
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    // Get priority weekends
    const priorityWeekends = await prisma.priorityWeekend.findMany({
      where: {
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Next 6 months
        },
      },
      select: {
        date: true,
        message: true,
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    const formattedHolidays = upcomingHolidays.map(holiday => ({
      date: holiday.date.toISOString().split('T')[0],
      name: holiday.name,
    }));

    const formattedPriorityWeekends = priorityWeekends.map(pw => ({
      date: pw.date.toISOString().split('T')[0],
      message: pw.message,
    }));

    return NextResponse.json({
      eventsByMonth: monthlyEvents,
      interestsByClub: interestsByClubWithNames,
      upcomingHolidays: formattedHolidays,
      priorityWeekends: formattedPriorityWeekends,
    });

  } catch (error) {
    console.error("Error fetching calendar stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar statistics" },
      { status: 500 }
    );
  }
}