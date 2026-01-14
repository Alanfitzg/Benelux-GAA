import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get calendar interests
    const calendarInterests = await prisma.calendarInterest.findMany({
      select: {
        id: true,
        date: true,
        preferredLocation: true,
        submissionCount: true,
        createdAt: true,
        club: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get tournament interests
    const tournamentInterests = await prisma.tournamentInterest.findMany({
      select: {
        id: true,
        interestType: true,
        specificDate: true,
        monthYear: true,
        dateRangeStart: true,
        dateRangeEnd: true,
        teamSize: true,
        flexibility: true,
        createdAt: true,
        club: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get blocked weekends
    const blockedWeekends = await prisma.blockedWeekend.findMany({
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Get calendar watches (email subscriptions)
    const calendarWatches = await prisma.calendarWatch.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Calculate interest by month
    const monthInterest: Record<string, number> = {};
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    monthNames.forEach((m) => {
      monthInterest[m] = 0;
    });

    // From calendar interests
    calendarInterests.forEach((ci) => {
      if (ci.date) {
        const month = new Date(ci.date).toLocaleString("default", {
          month: "long",
        });
        monthInterest[month] =
          (monthInterest[month] || 0) + (ci.submissionCount || 1);
      }
    });

    // From tournament interests
    tournamentInterests.forEach((ti) => {
      if (ti.specificDate) {
        const month = new Date(ti.specificDate).toLocaleString("default", {
          month: "long",
        });
        monthInterest[month] = (monthInterest[month] || 0) + 1;
      }
      if (ti.monthYear) {
        const month = new Date(ti.monthYear).toLocaleString("default", {
          month: "long",
        });
        monthInterest[month] = (monthInterest[month] || 0) + 1;
      }
      if (ti.dateRangeStart) {
        const month = new Date(ti.dateRangeStart).toLocaleString("default", {
          month: "long",
        });
        monthInterest[month] = (monthInterest[month] || 0) + 1;
      }
    });

    // Calculate interest by day of week
    const dayOfWeekInterest: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };
    calendarInterests.forEach((ci) => {
      if (ci.date) {
        const day = new Date(ci.date).toLocaleString("default", {
          weekday: "long",
        });
        dayOfWeekInterest[day] =
          (dayOfWeekInterest[day] || 0) + (ci.submissionCount || 1);
      }
    });

    // Location preferences
    const locationCounts: Record<string, number> = {};
    calendarInterests.forEach((ci) => {
      if (ci.preferredLocation) {
        locationCounts[ci.preferredLocation] =
          (locationCounts[ci.preferredLocation] || 0) + 1;
      }
    });

    // Lead time analysis (how far in advance are people interested)
    const leadTimes: number[] = [];
    calendarInterests.forEach((ci) => {
      if (ci.date && ci.createdAt) {
        const interestDate = new Date(ci.date);
        const submissionDate = new Date(ci.createdAt);
        if (interestDate > submissionDate) {
          const daysDiff = Math.floor(
            (interestDate.getTime() - submissionDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          leadTimes.push(daysDiff);
        }
      }
    });
    const avgLeadTime =
      leadTimes.length > 0
        ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length)
        : 0;
    const leadTimeRanges = {
      "Under 1 month": leadTimes.filter((d) => d < 30).length,
      "1-3 months": leadTimes.filter((d) => d >= 30 && d < 90).length,
      "3-6 months": leadTimes.filter((d) => d >= 90 && d < 180).length,
      "6+ months": leadTimes.filter((d) => d >= 180).length,
    };

    // Most requested specific dates
    const dateCounts: Record<string, number> = {};
    calendarInterests.forEach((ci) => {
      if (ci.date) {
        const dateStr = new Date(ci.date).toISOString().split("T")[0];
        dateCounts[dateStr] =
          (dateCounts[dateStr] || 0) + (ci.submissionCount || 1);
      }
    });
    tournamentInterests.forEach((ti) => {
      if (ti.specificDate) {
        const dateStr = new Date(ti.specificDate).toISOString().split("T")[0];
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    // Blocked dates summary
    const blockedByMonth: Record<string, number> = {};
    blockedWeekends.forEach((bw) => {
      if (bw.startDate) {
        const month = new Date(bw.startDate).toLocaleString("default", {
          month: "long",
        });
        blockedByMonth[month] = (blockedByMonth[month] || 0) + 1;
      }
    });

    // Blocked reasons
    const blockedReasons: Record<string, number> = {};
    blockedWeekends.forEach((bw) => {
      if (bw.reason) {
        blockedReasons[bw.reason] = (blockedReasons[bw.reason] || 0) + 1;
      }
    });

    // Top clubs by calendar interest
    const clubInterestCounts: Record<
      string,
      { name: string; country: string | null; count: number }
    > = {};
    [...calendarInterests, ...tournamentInterests].forEach((i) => {
      if (i.club) {
        if (!clubInterestCounts[i.club.id]) {
          clubInterestCounts[i.club.id] = {
            name: i.club.name,
            country: i.club.country?.name || null,
            count: 0,
          };
        }
        clubInterestCounts[i.club.id].count++;
      }
    });

    const report = {
      summary: {
        totalCalendarInterests: calendarInterests.length,
        totalTournamentInterests: tournamentInterests.length,
        totalBlockedWeekends: blockedWeekends.length,
        totalCalendarWatches: calendarWatches.length,
        avgLeadTimeDays: avgLeadTime,
      },
      monthlyDemand: monthNames.map((month) => ({
        month,
        count: monthInterest[month] || 0,
      })),
      dayOfWeekDemand: Object.entries(dayOfWeekInterest).map(
        ([day, count]) => ({ day, count })
      ),
      leadTimeDistribution: Object.entries(leadTimeRanges).map(
        ([range, count]) => ({ range, count })
      ),
      topRequestedDates: Object.entries(dateCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      locationPreferences: Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      blockedDatesByMonth: Object.entries(blockedByMonth)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
        }),
      blockedReasons: Object.entries(blockedReasons)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count),
      topInterestedClubs: Object.values(clubInterestCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating calendar patterns report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
